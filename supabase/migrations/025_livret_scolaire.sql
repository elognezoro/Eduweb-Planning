-- ============================================================================
-- 025 — Livret scolaire EN LIGNE (notes + observations partagées).
--
-- Rend le livret durable et partagé (multi-appareils) au lieu du localStorage :
--   • livret_grades  : moyenne par (élève, année, matière, trimestre) — source
--     de notes partagée alimentée par « Reporter au livret » (notes-bulletins).
--   • livret_records : overrides éditables (JSON) par (élève, année) — identité
--     complémentaire, observations, décisions, médical+photos, parents, etc.
--
-- RLS : lecture par tout utilisateur authentifié (le livret est largement
-- consultable) ; ÉCRITURE réservée aux rôles habilités (admin / chef
-- d'établissement / enseignant), conforme à la permission school_record:write.
--
-- `student_id` est un identifiant TEXTE (aligné sur le référentiel d'élèves de
-- l'app) — pas de FK vers `eleves` pour rester compatible avec les élèves
-- actuels. Idempotent. À appliquer dans Supabase → SQL Editor (après 002).
-- ============================================================================

-- Habilitation d'écriture du livret : admin, chef d'établissement, enseignant.
create or replace function public.can_write_school_record()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin()
      or public.current_user_role() in ('chef_etablissement', 'enseignant');
$$;

-- -------- Notes du livret (moyenne par matière / trimestre) --------
create table if not exists public.livret_grades (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  school_year text not null,
  subject_key text not null,
  period smallint not null check (period between 0 and 2),
  moy numeric(5, 2) not null,
  updated_by text,
  updated_at timestamptz not null default now(),
  unique (student_id, school_year, subject_key, period)
);

-- -------- Overrides éditables du livret (JSON) --------
create table if not exists public.livret_records (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  school_year text not null,
  overrides jsonb not null default '{}'::jsonb,
  updated_by text,
  updated_at timestamptz not null default now(),
  unique (student_id, school_year)
);

alter table public.livret_grades enable row level security;
alter table public.livret_records enable row level security;

-- Lecture : tout utilisateur authentifié.
drop policy if exists lg_select on public.livret_grades;
create policy lg_select on public.livret_grades
  for select using (auth.uid() is not null);

drop policy if exists lr_select on public.livret_records;
create policy lr_select on public.livret_records
  for select using (auth.uid() is not null);

-- Écriture (insert/update/delete) : rôles habilités uniquement.
drop policy if exists lg_write on public.livret_grades;
create policy lg_write on public.livret_grades
  for all using (public.can_write_school_record())
  with check (public.can_write_school_record());

drop policy if exists lr_write on public.livret_records;
create policy lr_write on public.livret_records
  for all using (public.can_write_school_record())
  with check (public.can_write_school_record());
