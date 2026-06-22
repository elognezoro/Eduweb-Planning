-- ============================================================================
-- 023 — Inscriptions : changement de rôle de formation EN LIGNE + cohortes.
--
-- 1) Policy UPDATE sur course_enrollments (réservée à l'admin) : permet de
--    changer le rôle de formation (formation_role) d'un inscrit côté serveur.
--    (La 008 n'avait que SELECT/INSERT/DELETE.)
-- 2) Table course_cohorts : groupes nommés d'utilisateurs par cours, persistés
--    en ligne (au lieu du localStorage). Outil d'administration → RLS admin-only.
--    Les membres sont stockés en tableau d'uuid (member_user_ids).
--
-- Idempotent. À appliquer dans Supabase → SQL Editor (après 008).
-- ============================================================================

-- 1) UPDATE des inscriptions (admin) — pour le changement de rôle de formation.
drop policy if exists ce_update on public.course_enrollments;
create policy ce_update on public.course_enrollments for update
  using (public.is_admin())
  with check (public.is_admin());

-- 2) Cohortes de formation.
create table if not exists public.course_cohorts (
  id              uuid primary key default gen_random_uuid(),
  course_id       text not null,
  name            text not null,
  description     text,
  created_by      text,
  member_user_ids uuid[] not null default '{}',
  created_at      timestamptz not null default now()
);
create index if not exists course_cohorts_course_idx on public.course_cohorts (course_id);

alter table public.course_cohorts enable row level security;

-- Outil d'administration : lecture ET écriture réservées à l'admin (super-admin inclus).
drop policy if exists cc_all on public.course_cohorts;
create policy cc_all on public.course_cohorts for all
  using (public.is_admin())
  with check (public.is_admin());
