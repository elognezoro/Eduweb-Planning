-- ============================================================================
-- EduWeb Planner — 005_profile_role_guard.sql
-- Durcissement RBAC : empêche un utilisateur de modifier lui-même son rôle ou
-- son statut (élévation de privilèges). La policy `profiles_self_update` autorise
-- la mise à jour de son propre profil (nom, téléphone, avatar…), mais SEUL un
-- administrateur peut changer `role` ou `status`.
-- À exécuter dans l'éditeur SQL Supabase (idempotent).
-- ============================================================================

create or replace function public.prevent_self_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Les administrateurs peuvent tout modifier.
  if public.is_admin() then
    return new;
  end if;
  -- Pour tout autre utilisateur : rôle et statut figés (pas d'auto-élévation).
  if new.role is distinct from old.role then
    raise exception 'Modification de votre propre rôle non autorisée.';
  end if;
  if new.status is distinct from old.status then
    raise exception 'Modification de votre propre statut non autorisée.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_self_privilege_change on public.profiles;
create trigger trg_prevent_self_privilege_change
  before update on public.profiles
  for each row execute function public.prevent_self_privilege_change();
