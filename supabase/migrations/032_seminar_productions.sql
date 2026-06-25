-- ============================================================================
-- 032 — Productions de séminaire GÉNÉRIQUES (sondages, forum, carte mentale, …)
--
-- Table unique pour toutes les productions des participants autres que la
-- matrice (qui a sa table dédiée en 031). Chaque ligne = une production, son
-- TYPE (`kind`) et son contenu complet (`payload` JSON). Les colonnes
-- user_id / course_id / activity_id / kind sont dénormalisées pour la RLS et
-- l'indexation ; le payload porte l'objet métier (PollResponse, ForumPost,
-- MindMapContribution, …) tel quel.
--
-- RLS (réutilise is_course_facilitator de la migration 031) :
--   - SELECT : l'apprenant voit la SIENNE ; un facilitateur du cours
--     (admin global, ou enseignant/tuteur/gestionnaire inscrit à CE cours) voit
--     TOUTES les productions du cours.
--   - INSERT/UPDATE : l'apprenant n'écrit que la sienne (user_id = auth.uid()).
--   - DELETE : la sienne, ou admin.
--
-- NB : les vues sondage/forum/carte mentale affichent déjà l'AGRÉGAT de tous les
-- participants → une fois synchronisées, elles deviennent « réelles » sans UI
-- supplémentaire. Idempotent (drop policy if exists).
-- ============================================================================

-- Helper : l'appelant est-il MEMBRE de ce cours (inscrit, ou admin) ? Utilisé
-- pour autoriser les co-participants à voir les productions COLLABORATIVES
-- (sondage/forum/carte mentale), qui sont par nature des activités de groupe.
create or replace function public.is_course_member(p_course text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
      or exists (
        select 1 from public.course_enrollments ce
        where ce.user_id = auth.uid() and ce.course_id = p_course
      );
$$;

create table if not exists public.seminar_productions (
  id          text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  user_name   text not null default '',
  user_role   text,
  course_id   text not null,
  module_id   text,
  activity_id text not null,
  kind        text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists seminar_productions_course_idx
  on public.seminar_productions (course_id);
create index if not exists seminar_productions_course_kind_idx
  on public.seminar_productions (course_id, kind);

alter table public.seminar_productions enable row level security;

-- SELECT : sa propre production ; OU un facilitateur du cours (toutes) ; OU, pour
-- les types COLLABORATIFS (poll/forum/mindmap), tout membre du cours — afin que
-- l'agrégat de groupe (résultats du sondage, fil du forum, carte mentale) soit
-- visible par les participants. Les types « réflexion » restent privés
-- (apprenant + facilitateur uniquement).
drop policy if exists sp_select on public.seminar_productions;
create policy sp_select on public.seminar_productions
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_course_facilitator(course_id)
    or (
      kind = any (array['poll', 'forum', 'mindmap'])
      and public.is_course_member(course_id)
    )
  );

drop policy if exists sp_insert on public.seminar_productions;
create policy sp_insert on public.seminar_productions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists sp_update on public.seminar_productions;
create policy sp_update on public.seminar_productions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists sp_delete on public.seminar_productions;
create policy sp_delete on public.seminar_productions
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());
