-- ============================================================================
-- 021 — APFC : ISOLATION par antenne + délégation au Chef d'Antenne.
--
-- Chaque antenne APFC est un espace indépendant, en LECTURE comme en ÉCRITURE
-- (RLS étanche, pas seulement côté application). Clé d'isolation :
-- apfc_antennas.head_profile_id (le profil du Chef d'Antenne responsable).
--   • Super-admin (is_admin) : voit et gère TOUT le réseau.
--   • Admin APFC (apfc_admin) : gère le registre GLOBAL des antennes + toutes
--     les activités (création/édition/suppression d'antennes incluses).
--   • Chef d'Antenne (head_profile_id = auth.uid()) : voit UNIQUEMENT son antenne
--     et gère UNIQUEMENT les activités de son antenne. Il NE peut PAS créer,
--     modifier ni supprimer le registre des antennes (réservé à l'Admin APFC).
--   • Tout autre rôle : aucun accès.
--
-- Calqué sur 018 (isolation transport). Idempotent. Réutilise les helpers
-- is_admin() / current_user_role() définis dans les migrations antérieures.
-- ============================================================================

-- 1) Index sur la clé d'isolation (head_profile_id existe déjà — migration 001).
create index if not exists apfc_antennas_head_idx     on public.apfc_antennas (head_profile_id);
create index if not exists apfc_activities_antenna_idx on public.apfc_activities (antenna_id);

-- 2) Activer RLS (idempotent).
alter table public.apfc_antennas   enable row level security;
alter table public.apfc_activities enable row level security;

-- 3) Helpers (SECURITY DEFINER : un seul point de décision, sans récursion RLS).

-- Gestion GLOBALE du réseau APFC : super-admin ou Admin APFC.
create or replace function public.can_manage_apfc()
returns boolean language sql security definer stable set search_path = '' as $$
  select public.is_admin() or public.current_user_role() = 'apfc_admin';
$$;

-- L'appelant est-il le Chef de l'antenne donnée ?
create or replace function public.is_apfc_antenna_head(p_antenna uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.apfc_antennas a
     where a.id = p_antenna
       and a.head_profile_id = auth.uid()
  );
$$;

-- 4) ANTENNES — lecture : gestion globale OU le chef de l'antenne.
--    Écriture (création/édition/suppression du registre) : gestion globale UNIQUEMENT.
drop policy if exists apfc_antennas_select on public.apfc_antennas;
create policy apfc_antennas_select on public.apfc_antennas for select
  using (
    public.can_manage_apfc()
    or head_profile_id = auth.uid()
  );

drop policy if exists apfc_antennas_write on public.apfc_antennas;
create policy apfc_antennas_write on public.apfc_antennas for all
  using (public.can_manage_apfc())
  with check (public.can_manage_apfc());

-- 5) ACTIVITÉS — lecture + écriture : gestion globale OU le chef de l'antenne
--    porteuse (le chef anime et rend compte des activités de SON antenne).
drop policy if exists apfc_activities_select on public.apfc_activities;
create policy apfc_activities_select on public.apfc_activities for select
  using (
    public.can_manage_apfc()
    or public.is_apfc_antenna_head(antenna_id)
  );

drop policy if exists apfc_activities_write on public.apfc_activities;
create policy apfc_activities_write on public.apfc_activities for all
  using (
    public.can_manage_apfc()
    or public.is_apfc_antenna_head(antenna_id)
  )
  with check (
    public.can_manage_apfc()
    or public.is_apfc_antenna_head(antenna_id)
  );

-- 6) Droits d'exécution des helpers.
revoke all on function public.can_manage_apfc()            from public;
revoke all on function public.is_apfc_antenna_head(uuid)   from public;
grant execute on function public.can_manage_apfc()          to authenticated;
grant execute on function public.is_apfc_antenna_head(uuid) to authenticated;
