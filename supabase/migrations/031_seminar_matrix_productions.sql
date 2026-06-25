-- ============================================================================
-- 031 — Productions « matrice » des séminaires + critiques du formateur
--
-- Objectif : rendre la revue des productions par le TUTEUR réelle entre
-- utilisateurs/appareils (jusqu'ici stockée en localStorage par navigateur).
--
--   • matrix_submissions : la matrice remplie par un participant (Matrice des
--     publics, Plan d'action, Plan de communication…). Une par (user, activité).
--   • matrix_reviews     : la critique d'un formateur sur une soumission, avec
--     un drapeau « publiée » qui décide si l'apprenant peut la voir.
--
-- RLS — modèle d'accès :
--   - Soumission : l'apprenant lit/écrit la SIENNE ; un FACILITATEUR du cours
--     (admin global, ou enseignant/tuteur/gestionnaire inscrit à CE cours) lit
--     toutes les soumissions du cours (lecture seule).
--   - Critique : le facilitateur du cours écrit/lit ; l'apprenant lit la
--     critique de SA soumission UNIQUEMENT si elle est publiée.
--
-- Idempotent (drop policy if exists) — ré-exécutable sans erreur.
-- ============================================================================

-- Helper : l'appelant est-il facilitateur de ce cours ?
-- SECURITY DEFINER pour lire course_enrollments sans dépendre de sa RLS.
create or replace function public.is_course_facilitator(p_course text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
      or exists (
        select 1
        from public.course_enrollments ce
        where ce.user_id = auth.uid()
          and ce.course_id = p_course
          and ce.formation_role in ('enseignant', 'tuteur', 'gestionnaire')
      );
$$;

-- ---------------------------------------------------------------------------
-- Table : matrix_submissions
-- ---------------------------------------------------------------------------
create table if not exists public.matrix_submissions (
  id          text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  user_name   text not null default '',
  user_role   text,
  course_id   text not null,
  module_id   text,
  activity_id text not null,
  headers     jsonb not null default '[]'::jsonb,
  row_labels  jsonb not null default '[]'::jsonb,
  cells       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, activity_id)
);
create index if not exists matrix_submissions_course_idx
  on public.matrix_submissions (course_id);

alter table public.matrix_submissions enable row level security;

drop policy if exists ms_select on public.matrix_submissions;
create policy ms_select on public.matrix_submissions
  for select to authenticated
  using (user_id = auth.uid() or public.is_course_facilitator(course_id));

drop policy if exists ms_insert on public.matrix_submissions;
create policy ms_insert on public.matrix_submissions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists ms_update on public.matrix_submissions;
create policy ms_update on public.matrix_submissions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists ms_delete on public.matrix_submissions;
create policy ms_delete on public.matrix_submissions
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Table : matrix_reviews
--   course_id dénormalisé pour des policies simples (sans sous-requête lourde).
-- ---------------------------------------------------------------------------
create table if not exists public.matrix_reviews (
  id                   text primary key,
  submission_id        text not null
                         references public.matrix_submissions (id) on delete cascade,
  course_id            text not null,
  reviewer_id          uuid not null references auth.users (id) on delete cascade,
  reviewer_name        text not null default '',
  reviewer_role        text,
  content              text not null default '',
  published_to_learner boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (submission_id, reviewer_id)
);
create index if not exists matrix_reviews_submission_idx
  on public.matrix_reviews (submission_id);

alter table public.matrix_reviews enable row level security;

-- SELECT : le reviewer, OU un facilitateur du cours, OU l'apprenant si publiée.
drop policy if exists mr_select on public.matrix_reviews;
create policy mr_select on public.matrix_reviews
  for select to authenticated
  using (
    reviewer_id = auth.uid()
    or public.is_course_facilitator(course_id)
    or (
      published_to_learner
      and exists (
        select 1 from public.matrix_submissions ms
        where ms.id = matrix_reviews.submission_id
          and ms.user_id = auth.uid()
      )
    )
  );

-- INSERT : facilitateur du cours, en tant que lui-même ; le course_id
-- dénormalisé DOIT correspondre au cours de la soumission visée (intégrité).
drop policy if exists mr_insert on public.matrix_reviews;
create policy mr_insert on public.matrix_reviews
  for insert to authenticated
  with check (
    reviewer_id = auth.uid()
    and public.is_course_facilitator(course_id)
    and course_id = (
      select ms.course_id from public.matrix_submissions ms
      where ms.id = submission_id
    )
  );

-- UPDATE : sa propre critique, toujours facilitateur du cours, course_id cohérent.
drop policy if exists mr_update on public.matrix_reviews;
create policy mr_update on public.matrix_reviews
  for update to authenticated
  using (reviewer_id = auth.uid() and public.is_course_facilitator(course_id))
  with check (
    reviewer_id = auth.uid()
    and public.is_course_facilitator(course_id)
    and course_id = (
      select ms.course_id from public.matrix_submissions ms
      where ms.id = submission_id
    )
  );

-- DELETE : sa propre critique, ou admin.
drop policy if exists mr_delete on public.matrix_reviews;
create policy mr_delete on public.matrix_reviews
  for delete to authenticated
  using (reviewer_id = auth.uid() or public.is_admin());
