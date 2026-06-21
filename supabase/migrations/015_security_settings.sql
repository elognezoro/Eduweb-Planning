-- ============================================================================
-- 015 — Réglages de SÉCURITÉ globaux (déconnexion automatique par inactivité).
--
-- Singleton (id = 'global') paramétré par le super-admin / l'admin et appliqué
-- à TOUS les utilisateurs, sur TOUS les appareils (la valeur ne vit plus
-- seulement dans le localStorage de celui qui l'a réglée).
--
-- - security_settings : idle_logout_enabled / idle_logout_minutes /
--   idle_warning_seconds.
-- - Lecture : tout utilisateur authentifié (le watcher client en a besoin).
-- - Écriture : via la fonction `save_security_settings` (SECURITY DEFINER) qui
--   valide l'appelant admin OU super-admin par e-mail — même schéma que la
--   migration 007 (admin_delete_user). Pas d'écriture directe pour le client.
--
-- Idempotent. À appliquer dans Supabase → SQL Editor.
-- ============================================================================

create table if not exists public.security_settings (
  id                   text primary key default 'global',
  idle_logout_enabled  boolean not null default false,
  idle_logout_minutes  integer not null default 20,
  idle_warning_seconds integer not null default 30,
  updated_at           timestamptz not null default now(),
  updated_by           uuid references auth.users(id) on delete set null
);
insert into public.security_settings (id) values ('global')
  on conflict (id) do nothing;

alter table public.security_settings enable row level security;

-- Lecture : tout utilisateur authentifié (le watcher d'inactivité s'en sert).
drop policy if exists ss_select on public.security_settings;
create policy ss_select on public.security_settings for select
  using (auth.uid() is not null);

-- Pas de policy d'écriture directe : l'écriture passe par la RPC ci-dessous.

-- Écriture validée (admin OU super-admin par e-mail), fail-closed.
create or replace function public.save_security_settings(
  p_enabled boolean,
  p_minutes integer,
  p_warning integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller       uuid := auth.uid();
  v_caller_role  text;
  v_caller_email text;
  v_super_admins text[] := array['elognezoro@gmail.com'];
  v_minutes      integer;
  v_warning      integer;
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

  -- Bornage serveur (défense en profondeur, indépendant du client).
  v_minutes := least(240, greatest(1, coalesce(p_minutes, 20)));
  v_warning := least(120, greatest(10, coalesce(p_warning, 30)));

  insert into public.security_settings
      (id, idle_logout_enabled, idle_logout_minutes, idle_warning_seconds,
       updated_at, updated_by)
    values
      ('global', coalesce(p_enabled, false), v_minutes, v_warning, now(), v_caller)
  on conflict (id) do update set
    idle_logout_enabled  = excluded.idle_logout_enabled,
    idle_logout_minutes  = excluded.idle_logout_minutes,
    idle_warning_seconds = excluded.idle_warning_seconds,
    updated_at           = now(),
    updated_by           = v_caller;
end;
$$;

revoke all on function public.save_security_settings(boolean, integer, integer) from public;
grant execute on function public.save_security_settings(boolean, integer, integer) to authenticated;
