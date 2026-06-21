-- ============================================================================
-- 016 — Transport : abonnement MENSUEL ou ANNUEL avec ÉCHÉANCE.
--
-- Le parent choisit une formule (mois / année), paie le tarif correspondant,
-- l'admin confirme → l'abonnement est actif JUSQU'À une date d'échéance
-- (max(maintenant, échéance en cours) + 1 mois / 1 an). Au-delà, l'accès se
-- referme automatiquement.
--
-- Inclut aussi un correctif transverse : `is_admin()` reconnaît désormais le
-- super-admin par e-mail (aligné sur le forçage côté client SUPER_ADMIN_EMAILS),
-- afin que toutes les écritures admin du module transport (cars, créneaux,
-- réglages, validation des paiements) fonctionnent pour le propriétaire même si
-- son rôle en base n'est pas 'admin'.
--
-- Idempotent. Appliquer APRÈS 010/012. À exécuter dans Supabase → SQL Editor.
-- ============================================================================

-- 1) Super-admin reconnu par is_admin() (même liste que la RPC 007).
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select public.current_user_role() = 'admin'
      or coalesce(
           (select lower(u.email) from auth.users u where u.id = auth.uid()),
           ''
         ) = any (array['elognezoro@gmail.com']);
$$;

-- 2) Tarifs par formule (mensuel / annuel).
alter table public.transport_settings
  add column if not exists price_month_fcfa integer,
  add column if not exists price_year_fcfa  integer;

-- Reprise : l'ancien tarif unique devient le tarif mensuel par défaut.
update public.transport_settings
   set price_month_fcfa = coalesce(price_month_fcfa, price_fcfa, 0)
 where price_month_fcfa is null;
update public.transport_settings
   set price_year_fcfa = coalesce(price_year_fcfa, 0)
 where price_year_fcfa is null;

-- 3) Période + échéance sur l'abonnement.
alter table public.transport_subscriptions
  add column if not exists period     text check (period in ('month','year')),
  add column if not exists expires_at  timestamptz;

-- 4) Période sur le paiement (formule choisie par le parent).
alter table public.transport_payments
  add column if not exists period text not null default 'month'
    check (period in ('month','year'));

-- 5) Confirmation atomique : pose le statut + prolonge l'abonnement.
--    SECURITY DEFINER + validation admin / super-admin (fail-closed).
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

  select user_id, coalesce(period, 'month')
    into v_user, v_period
    from public.transport_payments
   where id = p_payment_id;

  if v_user is null then
    raise exception 'Paiement introuvable';
  end if;

  update public.transport_payments
     set status = 'confirmed', confirmed_at = now(), confirmed_by = v_caller
   where id = p_payment_id;

  -- Prolongation depuis l'échéance en cours si elle est dans le futur.
  select expires_at into v_current
    from public.transport_subscriptions
   where user_id = v_user;

  v_new := greatest(coalesce(v_current, now()), now())
           + (case when v_period = 'year' then interval '1 year'
                   else interval '1 month' end);

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
