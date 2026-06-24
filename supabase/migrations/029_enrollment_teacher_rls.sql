-- ============================================================================
-- 029 — Permettre à l'ENSEIGNANT d'inscrire / désinscrire aux cours,
--       CLOISONNÉ PAR ÉTABLISSEMENT (même périmètre que le chef d'établissement).
--
-- Deux verrous RLS à lever pour le rôle enseignant :
--   (A) profiles       : il doit pouvoir LIRE les comptes de SON établissement,
--                        sinon le sélecteur d'utilisateurs et la liste des
--                        inscrits sont vides (useDirectoryUsers lit profiles).
--   (B) course_enrollments : il doit pouvoir lire / insérer / supprimer les
--                        inscriptions des comptes de SON établissement.
--
-- L'admin reste global (is_admin()) ; le propriétaire garde l'accès à sa propre
-- inscription. Le rattachement profiles.etablissement_id des enseignants est un
-- pré-requis (sinon l'enseignant ne voit personne). Idempotent ; après 002/008.
-- ============================================================================

-- (A) Lecture des profils : l'enseignant rejoint le périmètre « son établissement »,
--     aux côtés du chef d'établissement et de l'admin d'établissement.
drop policy if exists "profiles_self_read" on profiles;
create policy "profiles_self_read" on profiles for select
  using (
    id = auth.uid()
    or public.is_admin()
    or (
      etablissement_id = public.current_user_etablissement_id()
      and public.current_user_role() in ('chef_etablissement', 'etablissements_admin', 'enseignant')
    )
  );

-- (B) course_enrollments : un enseignant gère les inscriptions des utilisateurs
--     de SON établissement (vérifié via profiles.etablissement_id).

drop policy if exists ce_select on public.course_enrollments;
create policy ce_select on public.course_enrollments for select
  using (
    user_id = auth.uid()
    or public.is_admin()
    or (
      public.current_user_role() = 'enseignant'
      and exists (
        select 1 from public.profiles p
        where p.id = course_enrollments.user_id
          and p.etablissement_id = public.current_user_etablissement_id()
      )
    )
  );

drop policy if exists ce_insert on public.course_enrollments;
create policy ce_insert on public.course_enrollments for insert
  with check (
    public.is_admin()
    or (
      public.current_user_role() = 'enseignant'
      and exists (
        select 1 from public.profiles p
        where p.id = course_enrollments.user_id
          and p.etablissement_id = public.current_user_etablissement_id()
      )
    )
  );

drop policy if exists ce_delete on public.course_enrollments;
create policy ce_delete on public.course_enrollments for delete
  using (
    user_id = auth.uid()
    or public.is_admin()
    or (
      public.current_user_role() = 'enseignant'
      and exists (
        select 1 from public.profiles p
        where p.id = course_enrollments.user_id
          and p.etablissement_id = public.current_user_etablissement_id()
      )
    )
  );
