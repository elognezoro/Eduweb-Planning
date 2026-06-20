-- ============================================================================
-- 007 — Suppression DÉFINITIVE d'un compte SANS clé service role.
--
-- Fonction `SECURITY DEFINER` (exécutée avec les privilèges du propriétaire,
-- `postgres`, qui peut supprimer dans `auth.users`). Un administrateur
-- AUTHENTIFIÉ peut ainsi supprimer un compte directement depuis le client,
-- sans exposer la clé service role. Toute l'autorisation est vérifiée DANS la
-- fonction (fail-closed) :
--   • appelant authentifié (auth.uid() non nul) ;
--   • appelant administrateur (profiles.role = 'admin') OU super-admin ;
--   • interdiction de se supprimer soi-même ;
--   • interdiction de supprimer un super-administrateur.
-- La suppression de `auth.users` propage en cascade au profil et aux données
-- liées selon les politiques FK (cf. migration 006).
--
-- Idempotent (create or replace). À appliquer dans Supabase → SQL Editor.
-- ============================================================================

create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller       uuid := auth.uid();
  v_caller_role  text;
  v_caller_email text;
  v_target_email text;
  v_super_admins text[] := array['elognezoro@gmail.com'];
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

  if p_user_id = v_caller then
    raise exception 'Vous ne pouvez pas supprimer votre propre compte';
  end if;

  select lower(coalesce(u.email, ''))
    into v_target_email
    from auth.users u
   where u.id = p_user_id;

  if v_target_email is null then
    raise exception 'Compte introuvable';
  end if;

  if v_target_email = any (v_super_admins) then
    raise exception 'Compte super-administrateur protégé';
  end if;

  delete from auth.users where id = p_user_id;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
