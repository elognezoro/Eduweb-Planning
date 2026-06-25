-- ============================================================================
-- 033 — admin_confirm_email : activer la connexion d'un compte SANS clé service
--       role (la nouvelle clé `sb_secret_` est parfois rejetée par l'API admin
--       Auth → « clé incorrecte »).
--
-- Confirme l'e-mail côté Auth (email_confirmed_at) via une fonction SECURITY
-- DEFINER, autorisée au seul administrateur. Même patron que admin_delete_user
-- (migration 007) : l'autorisation est vérifiée DANS la base, l'appel se fait
-- avec la session de l'admin (aucune clé privilégiée nécessaire).
--
-- Idempotent (create or replace).
-- ============================================================================

create or replace function public.admin_confirm_email(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Autorisation : admin authentifié (ou contexte serveur SQL où auth.uid() est nul).
  if not (public.is_admin() or auth.uid() is null) then
    raise exception 'Réservé à l''administrateur';
  end if;

  update auth.users
     set email_confirmed_at = coalesce(email_confirmed_at, now()),
         updated_at = now()
   where id = p_user_id;
end;
$$;

grant execute on function public.admin_confirm_email(uuid) to authenticated;
