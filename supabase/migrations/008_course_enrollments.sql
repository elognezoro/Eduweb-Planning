-- ============================================================================
-- 008 — Inscriptions aux cours côté SERVEUR (course_enrollments).
--
-- Rend les inscriptions persistantes et partagées (au lieu du localStorage),
-- pour que les liens d'invitation fonctionnent sur n'importe quel appareil et
-- soient visibles par l'administrateur.
--
-- Source de vérité UNIQUE de la table `course_enrollments` (la doc Wave y
-- renvoie désormais). Schéma aligné sur le flux paiement Wave.
--
-- Auto-inscription par lien : `signUp` transmet les cours du lien dans
-- `raw_user_meta_data.invite_courses` (tableau JSON) ; le trigger
-- `handle_new_user` crée les inscriptions à la création du compte — donc
-- indépendamment du navigateur.
--
-- SÉCURITÉ :
--   • INSERT réservé à l'admin via l'API : l'auto-inscription par lien passe
--     par le trigger (SECURITY DEFINER) et le paiement Wave par le webhook
--     (service-role) — tous deux contournent la RLS. Un utilisateur normal NE
--     PEUT PAS s'auto-attribuer une inscription via l'API (ni rôle élevé, ni
--     cours payant).
--   • Le rôle de formation accordé par auto-inscription est TOUJOURS « etudiant »
--     (formation_role = null) : un jeton non signé ne peut pas conférer un rôle
--     élevé (admin/gestionnaire/enseignant). L'admin assigne les rôles élevés.
--   • Limite assumée : un cours PAYANT ciblé par un lien OFFERT (ou des
--     métadonnées forgées) est inscrit gratuitement — les tarifs ne sont pas
--     encore en base ; la garde de paiement réelle reste le flux Wave.
--
-- Idempotent. À appliquer dans Supabase → SQL Editor.
-- ============================================================================

create table if not exists public.course_enrollments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  course_id      text not null,
  source         text not null default 'admin',
  enrolled_by    text,
  formation_role text,
  expires_at     timestamptz,
  created_at     timestamptz not null default now(),
  unique (user_id, course_id)
);
create index if not exists course_enrollments_user_idx
  on public.course_enrollments (user_id);

alter table public.course_enrollments enable row level security;

-- SELECT : ses propres inscriptions ; tout pour l'admin.
drop policy if exists ce_select on public.course_enrollments;
drop policy if exists "read own enrollments" on public.course_enrollments;
create policy ce_select on public.course_enrollments for select
  using (user_id = auth.uid() or public.is_admin());

-- INSERT : réservé à l'admin via l'API (cf. note sécurité ci-dessus).
drop policy if exists ce_insert on public.course_enrollments;
create policy ce_insert on public.course_enrollments for insert
  with check (public.is_admin());

-- DELETE : ses propres inscriptions ; tout pour l'admin.
drop policy if exists ce_delete on public.course_enrollments;
create policy ce_delete on public.course_enrollments for delete
  using (user_id = auth.uid() or public.is_admin());

-- Trigger de création de profil + auto-inscription depuis le lien d'invitation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, display_name, phone, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    nullif(trim(concat_ws(' ', new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')), ''),
    new.raw_user_meta_data->>'phone',
    'eleve',
    'pending'
  )
  on conflict (id) do nothing;

  -- Auto-inscription aux cours du lien (OFFERT). Le bloc est protégé : une
  -- métadonnée mal formée ne doit JAMAIS faire échouer la création de compte
  -- (l'inscription par lien retombe alors sur le claimer localStorage).
  -- formation_role est forcé à NULL (= « etudiant ») : pas d'élévation.
  begin
    if jsonb_typeof(new.raw_user_meta_data->'invite_courses') = 'array' then
      insert into public.course_enrollments (user_id, course_id, formation_role, source, enrolled_by)
      select new.id, ce.course_id, null, 'admin', 'Lien d''inscription'
      from jsonb_array_elements_text(new.raw_user_meta_data->'invite_courses') as ce(course_id)
      on conflict (user_id, course_id) do nothing;
    end if;
  exception when others then
    null;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
