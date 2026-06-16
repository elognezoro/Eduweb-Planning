-- ============================================================================
-- EduWeb Planner — 002_rls.sql
-- Row Level Security : fonctions utilitaires + politiques par rôle/périmètre.
-- Principe : admin = accès total ; régional = sa région ; chef d'établissement
-- = son établissement ; enseignant = ses classes ; parent/élève = leurs données.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Fonctions utilitaires (security definer)
-- ----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_country_id()
returns uuid language sql security definer stable as $$
  select country_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_etablissement_id()
returns uuid language sql security definer stable as $$
  select etablissement_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_region_id()
returns uuid language sql security definer stable as $$
  select academic_region_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select public.current_user_role() = 'admin';
$$;

-- ----------------------------------------------------------------------------
-- Activation RLS sur les tables sensibles
-- ----------------------------------------------------------------------------
alter table profiles            enable row level security;
alter table etablissements      enable row level security;
alter table eleves              enable row level security;
alter table enseignants         enable row level security;
alter table classes             enable row level security;
alter table class_enrollments   enable row level security;
alter table attendance_sessions enable row level security;
alter table attendance_records  enable row level security;
alter table lesson_book_entries enable row level security;
alter table evaluations         enable row level security;
alter table grades              enable row level security;
alter table report_cards        enable row level security;
alter table school_records      enable row level security;
alter table inspections         enable row level security;
alter table inspection_reports  enable row level security;
alter table recommendations     enable row level security;
alter table messages            enable row level security;
alter table appointments        enable row level security;
alter table audit_logs          enable row level security;
alter table reports             enable row level security;
alter table paiements           enable row level security;
alter table abonnements         enable row level security;

-- ----------------------------------------------------------------------------
-- Référentiels publics en lecture (countries, regions, subjects, etc.)
-- ----------------------------------------------------------------------------
alter table countries enable row level security;
create policy "countries_read_all" on countries for select using (true);
create policy "countries_admin_write" on countries for all
  using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- PROFILES : chacun lit/écrit son profil ; admin tout ; chef d'étab. son étab.
-- ----------------------------------------------------------------------------
create policy "profiles_self_read" on profiles for select
  using (id = auth.uid() or public.is_admin()
    or (etablissement_id = public.current_user_etablissement_id()
        and public.current_user_role() in ('chef_etablissement','etablissements_admin')));

create policy "profiles_self_update" on profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_admin_insert" on profiles for insert
  with check (public.is_admin() or id = auth.uid());

-- ----------------------------------------------------------------------------
-- ETABLISSEMENTS : admin tout ; régional sa région ; étab. le sien.
-- ----------------------------------------------------------------------------
create policy "etab_read" on etablissements for select
  using (
    public.is_admin()
    or country_id = public.current_user_country_id()
  );

create policy "etab_write_admin" on etablissements for all
  using (public.is_admin() or public.current_user_role() = 'etablissements_admin')
  with check (public.is_admin() or public.current_user_role() = 'etablissements_admin');

-- ----------------------------------------------------------------------------
-- Données d'établissement (élèves, classes, enseignants…)
-- Lecture limitée à l'établissement de l'utilisateur (ou admin).
-- ----------------------------------------------------------------------------
create policy "eleves_scope" on eleves for select
  using (public.is_admin() or etablissement_id = public.current_user_etablissement_id());

create policy "eleves_write" on eleves for all
  using (public.is_admin()
    or (etablissement_id = public.current_user_etablissement_id()
        and public.current_user_role() in ('chef_etablissement','etablissements_admin','educateur')))
  with check (public.is_admin()
    or (etablissement_id = public.current_user_etablissement_id()
        and public.current_user_role() in ('chef_etablissement','etablissements_admin','educateur')));

create policy "classes_scope" on classes for select
  using (public.is_admin() or etablissement_id = public.current_user_etablissement_id());

create policy "enseignants_scope" on enseignants for select
  using (public.is_admin() or etablissement_id = public.current_user_etablissement_id());

-- ----------------------------------------------------------------------------
-- NOTES : enseignant gère les notes qu'il a saisies ; lecture par périmètre.
-- ----------------------------------------------------------------------------
create policy "grades_read" on grades for select
  using (public.is_admin() or recorded_by = auth.uid()
    or eleve_id in (select id from eleves where etablissement_id = public.current_user_etablissement_id()));

create policy "grades_write" on grades for all
  using (public.is_admin() or recorded_by = auth.uid()
    or public.current_user_role() in ('chef_etablissement','enseignant'))
  with check (public.is_admin() or recorded_by = auth.uid()
    or public.current_user_role() in ('chef_etablissement','enseignant'));

-- ----------------------------------------------------------------------------
-- MESSAGES : émetteur et destinataire uniquement.
-- ----------------------------------------------------------------------------
create policy "messages_participants" on messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_admin());
create policy "messages_send" on messages for insert
  with check (sender_id = auth.uid());

-- ----------------------------------------------------------------------------
-- AUDIT : lecture admin ; insertion par tout utilisateur authentifié (ses actions).
-- Aucune mise à jour / suppression (journal immuable).
-- ----------------------------------------------------------------------------
create policy "audit_read_admin" on audit_logs for select using (public.is_admin());
create policy "audit_insert" on audit_logs for insert with check (actor_id = auth.uid());

-- ----------------------------------------------------------------------------
-- RECOMMANDATIONS, INSPECTIONS, RAPPORTS : périmètre pays/établissement.
-- ----------------------------------------------------------------------------
create policy "reco_read" on recommendations for select
  using (public.is_admin() or country_id = public.current_user_country_id());
create policy "reco_write" on recommendations for all
  using (public.is_admin()
    or public.current_user_role() in ('inspecteur','conseiller_pedagogique','drena','chef_etablissement'))
  with check (public.is_admin()
    or public.current_user_role() in ('inspecteur','conseiller_pedagogique','drena','chef_etablissement'));

create policy "inspections_read" on inspections for select
  using (public.is_admin() or country_id = public.current_user_country_id());
create policy "inspections_write" on inspections for all
  using (public.is_admin() or public.current_user_role() in ('inspecteur','drena'))
  with check (public.is_admin() or public.current_user_role() in ('inspecteur','drena'));

create policy "reports_read" on reports for select
  using (public.is_admin() or country_id = public.current_user_country_id());

-- ----------------------------------------------------------------------------
-- PAIEMENTS / ABONNEMENTS : admin uniquement (facturation).
-- ----------------------------------------------------------------------------
create policy "paiements_admin" on paiements for all
  using (public.is_admin()) with check (public.is_admin());
create policy "abonnements_admin" on abonnements for all
  using (public.is_admin()) with check (public.is_admin());

-- NOTE : les suppressions définitives sont volontairement non couvertes par des
-- policies « delete » → interdites par défaut (soft-delete via colonnes status).
