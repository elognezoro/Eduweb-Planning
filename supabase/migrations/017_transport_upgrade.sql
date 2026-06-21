-- ============================================================================
-- 017 — Transport : passage MENSUEL → ANNUEL (upgrade) avec pénalité d'équité.
--
-- ⚠️ Cette migration REDÉFINIT public.confirm_transport_payment (déjà créée en
--    016). Appliquer 017 APRÈS 016, et NE JAMAIS rejouer 016 après 017 (cela
--    régresserait la fonction à la version sans upgrade).
--
-- Équité (garantie CÔTÉ SERVEUR — le client ne fournit plus le montant) :
--   Le crédit des jours restants est valorisé au TARIF ANNUEL journalier
--   (price_year/365), pas au tarif mensuel : ainsi, même à pénalité 0 %,
--   l'upgradeur ne paie jamais moins, à couverture forward identique, qu'un
--   abonné annuel direct (les jours déjà couverts ont été payés au tarif
--   mensuel, plus cher au jour).
--     credit = round(price_year * min(365, jours_restants) / 365)
--     base   = max(0, price_year - credit)
--     total  = base + round(base * penalite% / 100)
--
-- - submit_transport_upgrade : SOUMISSION (calcule le montant en base + valide
--   que l'appelant est un abonné MENSUEL actif + bloque les doublons pending).
-- - confirm_transport_payment : CONFIRMATION (admin) ; pour un upgrade,
--   échéance = greatest(échéance courante, now()+1 an) — ne raccourcit jamais.
--
-- Idempotent. À exécuter dans Supabase → SQL Editor, APRÈS 016.
-- ============================================================================

alter table public.transport_settings
  add column if not exists upgrade_penalty_pct integer not null default 20;

alter table public.transport_payments
  add column if not exists is_upgrade boolean not null default false;

-- Cohérence des paiements (défense en profondeur, indépendante des RPC).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transport_payments_amount_nonneg') then
    alter table public.transport_payments
      add constraint transport_payments_amount_nonneg check (amount_fcfa >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'transport_payments_upgrade_year') then
    alter table public.transport_payments
      add constraint transport_payments_upgrade_year check (not is_upgrade or period = 'year');
  end if;
end $$;

-- Un upgrade ne peut être créé QUE par la RPC submit_transport_upgrade
-- (SECURITY DEFINER, qui contourne la RLS et calcule le montant). Un client ne
-- peut donc pas forger un paiement is_upgrade=true (et un an d'accès) en
-- insérant directement via l'API. Les souscriptions normales restent permises.
drop policy if exists tp_insert on public.transport_payments;
create policy tp_insert on public.transport_payments for insert
  with check (user_id = auth.uid() and is_upgrade = false);

-- ---------------------------------------------------------------------------
-- SOUMISSION d'un upgrade : montant calculé EN BASE (autoritaire).
-- ---------------------------------------------------------------------------
create or replace function public.submit_transport_upgrade(p_reference text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller      uuid := auth.uid();
  v_scope       text;
  v_price_year  integer;
  v_penalty     integer;
  v_period      text;
  v_expires     timestamptz;
  v_days        numeric;
  v_credit      integer;
  v_base        integer;
  v_total       integer;
begin
  if v_caller is null then
    raise exception 'Non authentifié';
  end if;

  -- Précondition : abonné MENSUEL actif (sinon l'upgrade n'a pas de sens).
  select period, expires_at into v_period, v_expires
    from public.transport_subscriptions
   where user_id = v_caller;
  if v_period is distinct from 'month' or v_expires is null or v_expires <= now() then
    raise exception 'Le passage à l''annuel est réservé aux abonnés mensuels actifs';
  end if;

  -- Un seul upgrade en attente à la fois.
  if exists (
    select 1 from public.transport_payments
     where user_id = v_caller and is_upgrade and status = 'pending'
  ) then
    raise exception 'Un passage à l''annuel est déjà en attente de validation';
  end if;

  -- Tarifs du périmètre établissement du parent (repli 'global').
  v_scope := coalesce(
    (select etablissement_id::text from public.profiles where id = v_caller),
    'global'
  );
  select price_year_fcfa, upgrade_penalty_pct
    into v_price_year, v_penalty
    from public.transport_settings where id = v_scope;
  if not found then
    select price_year_fcfa, upgrade_penalty_pct
      into v_price_year, v_penalty
      from public.transport_settings where id = 'global';
  end if;
  v_price_year := coalesce(v_price_year, 0);
  v_penalty := least(100, greatest(0, coalesce(v_penalty, 20)));

  -- Crédit au TARIF ANNUEL journalier (équité) sur les jours restants.
  v_days := least(365, greatest(0,
    ceil(extract(epoch from (v_expires - now())) / 86400.0)));
  v_credit := round(v_price_year::numeric * v_days / 365.0);
  v_base   := greatest(0, v_price_year - v_credit);
  v_total  := v_base + round(v_base::numeric * v_penalty / 100.0);

  insert into public.transport_payments
      (user_id, payer_email, amount_fcfa, period, is_upgrade, method, reference, status)
  select v_caller, lower(u.email), v_total, 'year', true, 'mobile_money',
         nullif(btrim(p_reference), ''), 'pending'
    from auth.users u where u.id = v_caller;

  return v_total;
end;
$$;

revoke all on function public.submit_transport_upgrade(text) from public;
grant execute on function public.submit_transport_upgrade(text) to authenticated;

-- ---------------------------------------------------------------------------
-- CONFIRMATION (admin / super-admin). Upgrade : ne raccourcit jamais l'échéance.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_transport_payment(p_payment_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller       uuid := auth.uid();
  v_caller_role  text;
  v_caller_email text;
  v_super_admins text[] := array['elognezoro@gmail.com'];
  v_user         uuid;
  v_period       text;
  v_is_upgrade   boolean;
  v_current      timestamptz;
  v_new          timestamptz;
begin
  if v_caller is null then
    raise exception 'Non authentifié';
  end if;

  select p.role, lower(coalesce(p.email, ''))
    into v_caller_role, v_caller_email
    from public.profiles p
   where p.id = v_caller;

  if not (coalesce(v_caller_role, '') = 'admin'
          or v_caller_email = any (v_super_admins)) then
    raise exception 'Accès refusé : action réservée aux administrateurs';
  end if;

  select user_id, coalesce(period, 'month'), coalesce(is_upgrade, false)
    into v_user, v_period, v_is_upgrade
    from public.transport_payments
   where id = p_payment_id;

  if v_user is null then
    raise exception 'Paiement introuvable';
  end if;

  update public.transport_payments
     set status = 'confirmed', confirmed_at = now(), confirmed_by = v_caller
   where id = p_payment_id;

  select expires_at into v_current
    from public.transport_subscriptions
   where user_id = v_user;

  if v_is_upgrade then
    -- Année pleine à compter de maintenant, sans jamais raccourcir l'existant.
    v_new := greatest(coalesce(v_current, now()), now() + interval '1 year');
  else
    -- Souscription / renouvellement : prolonge depuis l'échéance en cours.
    v_new := greatest(coalesce(v_current, now()), now())
             + (case when v_period = 'year' then interval '1 year'
                     else interval '1 month' end);
  end if;

  insert into public.transport_subscriptions
      (user_id, active, period, expires_at, created_at)
    values (v_user, true, v_period, v_new, now())
  on conflict (user_id) do update set
    active     = true,
    period     = excluded.period,
    expires_at = excluded.expires_at;

  return v_new;
end;
$$;

revoke all on function public.confirm_transport_payment(uuid) from public;
grant execute on function public.confirm_transport_payment(uuid) to authenticated;
