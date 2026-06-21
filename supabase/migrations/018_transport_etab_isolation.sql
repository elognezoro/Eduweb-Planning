-- ============================================================================
-- 018 — Transport : ISOLATION COMPLÈTE par établissement + délégation chef.
--
-- Chaque établissement = espace de config TOTALEMENT indépendant (cars,
-- créneaux, tarifs, conducteurs, paiements, abonnements), en LECTURE comme en
-- ÉCRITURE (RLS étanche, pas seulement côté application).
--   • Super-admin (is_admin) : supervise/configure n'importe quel établissement.
--   • chef_etablissement : UNIQUEMENT le sien.
--   • Conducteur : émet seulement pour un car de SON établissement.
--   • Parent : voit les cars de SON établissement ; la POSITION temps réel exige
--     un abonnement actif (paywall appliqué côté serveur).
--   • Périmètre « Général » (etablissement_id NULL) = ADMIN uniquement.
--
-- Durci après revue adversariale (9 findings : lectures non scopées, fuite du
-- périmètre Général via NULL=NULL, montant de souscription non validé, bypass
-- du paywall, auto-abonnement). Idempotent. Appliquer APRÈS 010→017.
-- ============================================================================

-- 1) Colonnes d'établissement.
alter table public.transport_drivers
  add column if not exists etablissement_id uuid references public.etablissements(id) on delete cascade;
alter table public.transport_payments
  add column if not exists etablissement_id uuid references public.etablissements(id) on delete set null;
alter table public.transport_subscriptions
  add column if not exists etablissement_id uuid references public.etablissements(id) on delete set null;

create index if not exists transport_drivers_etab_idx       on public.transport_drivers (etablissement_id);
create index if not exists transport_payments_etab_idx      on public.transport_payments (etablissement_id);
create index if not exists transport_subscriptions_etab_idx on public.transport_subscriptions (etablissement_id);

-- 2) Helpers (SECURITY DEFINER : un seul point de décision, sans récursion RLS).
create or replace function public.can_manage_transport(p_etab uuid)
returns boolean language sql security definer stable as $$
  select public.is_admin()
      or (
        p_etab is not null
        and public.current_user_role() = 'chef_etablissement'
        and p_etab = public.current_user_etablissement_id()
      );
$$;

create or replace function public.transport_bus_etab(p_bus uuid)
returns uuid language sql security definer stable as $$
  select etablissement_id from public.transport_buses where id = p_bus;
$$;

create or replace function public.has_active_transport_sub(p_user uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.transport_subscriptions s
     where s.user_id = p_user and s.active
       and (s.expires_at is null or s.expires_at > now())
  );
$$;

-- 3) Le paiement porte l'établissement du PAYEUR (anti-forge) ; pour une
--    souscription normale, le MONTANT est recalculé au tarif du périmètre
--    (autoritaire). Les upgrades gardent le montant calculé par leur RPC.
create or replace function public.transport_payment_set_etab()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_scope text;
  v_month integer;
  v_year  integer;
begin
  new.etablissement_id := public.current_user_etablissement_id();
  if not coalesce(new.is_upgrade, false) then
    v_scope := coalesce(new.etablissement_id::text, 'global');
    select price_month_fcfa, price_year_fcfa into v_month, v_year
      from public.transport_settings where id = v_scope;
    if not found then
      select price_month_fcfa, price_year_fcfa into v_month, v_year
        from public.transport_settings where id = 'global';
    end if;
    new.amount_fcfa := case when new.period = 'year' then coalesce(v_year, 0)
                            else coalesce(v_month, 0) end;
  end if;
  return new;
end; $$;
drop trigger if exists transport_payments_set_etab on public.transport_payments;
create trigger transport_payments_set_etab
  before insert on public.transport_payments
  for each row execute function public.transport_payment_set_etab();

-- 4) CARS — lecture + écriture scopées par établissement.
drop policy if exists tb_select on public.transport_buses;
create policy tb_select on public.transport_buses for select
  using (
    public.is_admin()
    or public.can_manage_transport(etablissement_id)
    or (etablissement_id is not null and etablissement_id = public.current_user_etablissement_id())
  );
drop policy if exists tb_write on public.transport_buses;
create policy tb_write on public.transport_buses for all
  using (public.can_manage_transport(etablissement_id))
  with check (public.can_manage_transport(etablissement_id));

-- 5) CRÉNEAUX — idem.
drop policy if exists tsl_select on public.transport_slots;
create policy tsl_select on public.transport_slots for select
  using (
    public.is_admin()
    or public.can_manage_transport(etablissement_id)
    or (etablissement_id is not null and etablissement_id = public.current_user_etablissement_id())
  );
drop policy if exists tsl_write on public.transport_slots;
create policy tsl_write on public.transport_slots for all
  using (public.can_manage_transport(etablissement_id))
  with check (public.can_manage_transport(etablissement_id));

-- 6) RÉGLAGES (id texte = uuid établissement, ou 'global' = admin only).
drop policy if exists ts_select on public.transport_settings;
create policy ts_select on public.transport_settings for select
  using (
    public.is_admin()
    or id = public.current_user_etablissement_id()::text  -- son établissement (tarifs)
  );
drop policy if exists ts_write on public.transport_settings;
create policy ts_write on public.transport_settings for all
  using (
    public.is_admin()
    or (public.current_user_role() = 'chef_etablissement'
        and id = public.current_user_etablissement_id()::text)
  )
  with check (
    public.is_admin()
    or (public.current_user_role() = 'chef_etablissement'
        and id = public.current_user_etablissement_id()::text)
  );

-- 7) CONDUCTEURS — par établissement.
drop policy if exists td_select on public.transport_drivers;
create policy td_select on public.transport_drivers for select
  using (user_id = auth.uid() or public.can_manage_transport(etablissement_id));
drop policy if exists td_write on public.transport_drivers;
create policy td_write on public.transport_drivers for all
  using (public.can_manage_transport(etablissement_id))
  with check (public.can_manage_transport(etablissement_id));

-- 8) PAIEMENTS — le payeur voit les siens ; le gestionnaire de l'établissement aussi.
drop policy if exists tp_select on public.transport_payments;
create policy tp_select on public.transport_payments for select
  using (user_id = auth.uid() or public.can_manage_transport(etablissement_id));
drop policy if exists tp_update on public.transport_payments;
create policy tp_update on public.transport_payments for update
  using (public.can_manage_transport(etablissement_id))
  with check (public.can_manage_transport(etablissement_id));

-- 9) ABONNEMENTS — lecture self/gestionnaire ; écriture réservée au gestionnaire
--    (la création passe par la RPC confirm_transport_payment, SECURITY DEFINER).
drop policy if exists tsub_select on public.transport_subscriptions;
create policy tsub_select on public.transport_subscriptions for select
  using (user_id = auth.uid() or public.can_manage_transport(etablissement_id));
drop policy if exists tsub_write on public.transport_subscriptions;
create policy tsub_write on public.transport_subscriptions for all
  using (public.is_admin() or public.can_manage_transport(etablissement_id))
  with check (public.is_admin() or public.can_manage_transport(etablissement_id));

-- 10) POSITIONS — lecture : gestionnaire, OU parent du MÊME établissement ET
--     ABONNÉ ACTIF (paywall serveur). Émission : conducteur du car (strict).
drop policy if exists bp_select on public.bus_positions;
create policy bp_select on public.bus_positions for select
  using (
    public.is_admin()
    or public.can_manage_transport(public.transport_bus_etab(bus_id))
    or (
      public.transport_bus_etab(bus_id) is not null
      and public.transport_bus_etab(bus_id) = public.current_user_etablissement_id()
      and public.has_active_transport_sub(auth.uid())
    )
  );

drop policy if exists bp_insert on public.bus_positions;
create policy bp_insert on public.bus_positions for insert
  with check (
    public.is_admin()
    or exists (
      select 1 from public.transport_drivers d
       where d.user_id = auth.uid()
         and d.etablissement_id is not distinct from public.transport_bus_etab(bus_id)
    )
  );

drop policy if exists bp_update on public.bus_positions;
create policy bp_update on public.bus_positions for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.transport_drivers d
       where d.user_id = auth.uid()
         and d.etablissement_id is not distinct from public.transport_bus_etab(bus_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.transport_drivers d
       where d.user_id = auth.uid()
         and d.etablissement_id is not distinct from public.transport_bus_etab(bus_id)
    )
  );

-- 11) Confirmation : admin OU gestionnaire de l'établissement du paiement
--     (can_manage_transport refuse NULL → pas de faille « Général » via NULL=NULL).
create or replace function public.confirm_transport_payment(p_payment_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller     uuid := auth.uid();
  v_user       uuid;
  v_period     text;
  v_is_upgrade boolean;
  v_pay_etab   uuid;
  v_current    timestamptz;
  v_new        timestamptz;
begin
  if v_caller is null then
    raise exception 'Non authentifié';
  end if;

  select user_id, coalesce(period, 'month'), coalesce(is_upgrade, false), etablissement_id
    into v_user, v_period, v_is_upgrade, v_pay_etab
    from public.transport_payments
   where id = p_payment_id;
  if v_user is null then
    raise exception 'Paiement introuvable';
  end if;

  if not (public.is_admin() or public.can_manage_transport(v_pay_etab)) then
    raise exception 'Accès refusé : action réservée au gestionnaire de cet établissement';
  end if;

  update public.transport_payments
     set status = 'confirmed', confirmed_at = now(), confirmed_by = v_caller
   where id = p_payment_id;

  select expires_at into v_current
    from public.transport_subscriptions
   where user_id = v_user;

  if v_is_upgrade then
    v_new := greatest(coalesce(v_current, now()), now() + interval '1 year');
  else
    v_new := greatest(coalesce(v_current, now()), now())
             + (case when v_period = 'year' then interval '1 year'
                     else interval '1 month' end);
  end if;

  insert into public.transport_subscriptions
      (user_id, active, period, expires_at, etablissement_id, created_at)
    values (v_user, true, v_period, v_new, v_pay_etab, now())
  on conflict (user_id) do update set
    active           = true,
    period           = excluded.period,
    expires_at       = excluded.expires_at,
    etablissement_id = excluded.etablissement_id;

  return v_new;
end;
$$;

revoke all on function public.confirm_transport_payment(uuid) from public;
grant execute on function public.confirm_transport_payment(uuid) to authenticated;
