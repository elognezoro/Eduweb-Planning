-- ============================================================================
-- 036 — Activation AUTOMATIQUE du compte à la confirmation de l'e-mail.
--
-- Avant : un compte auto-inscrit restait « pending » jusqu'à validation MANUELLE
-- par l'administrateur. Désormais, dès que l'utilisateur confirme son e-mail (via
-- le lien envoyé par Resend → /auth/callback → verifyOtp, qui pose
-- email_confirmed_at), son profil passe AUTOMATIQUEMENT à « active ».
--
-- Sûr : seul Supabase pose email_confirmed_at (sur une confirmation valide ou via
-- l'action admin admin_confirm_email) — un utilisateur ne peut pas s'auto-activer.
-- ============================================================================

create or replace function public.activate_on_email_confirm()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles
       set status = 'active', updated_at = now()
     where id = new.id and status is distinct from 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_email_confirmed on auth.users;
create trigger on_auth_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.activate_on_email_confirm();

-- Backfill : comptes déjà confirmés mais restés « en attente » → activés.
update public.profiles p
   set status = 'active', updated_at = now()
from auth.users u
where u.id = p.id
  and p.status = 'pending'
  and u.email_confirmed_at is not null;
