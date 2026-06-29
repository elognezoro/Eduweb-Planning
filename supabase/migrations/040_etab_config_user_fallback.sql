-- ============================================================================
-- 040 — Configuration d'établissement : REPLI PAR UTILISATEUR.
--
-- Problème : un chef d'établissement non encore rattaché à un établissement
-- (profiles.etablissement_id NULL) ne pouvait pas persister sa config (la clé
-- etablissement_id était NULL → écriture locale uniquement, invisible cross-poste).
--
-- Correctif : la clé `etablissement_id` peut désormais être :
--   - l'UUID de l'établissement (cas PARTAGÉ : tous ses membres lisent) ; OU
--   - l'UUID de l'utilisateur (auth.uid()) en REPLI quand il n'a pas
--     d'établissement (config personnelle du chef, visible cross-poste pour LUI).
-- On retire donc la contrainte FK vers etablissements (qui interdisait une clé
-- = user id) et on étend la RLS au cas `etablissement_id = auth.uid()`.
--
-- Idempotente et non destructive.
-- ============================================================================

-- La clé n'est plus forcément un établissement → on enlève la FK.
alter table public.etablissement_config
  drop constraint if exists etablissement_config_etablissement_id_fkey;

-- Lecture : admin ; OU même établissement ; OU sa propre config (repli user).
drop policy if exists ec_select on public.etablissement_config;
create policy ec_select on public.etablissement_config
  for select using (
    public.is_admin()
    or etablissement_id = public.current_user_etablissement_id()
    or etablissement_id = auth.uid()
  );

-- Écriture : admin ; OU chef du même établissement ; OU sa propre config (repli).
drop policy if exists ec_write on public.etablissement_config;
create policy ec_write on public.etablissement_config
  for all
  using (
    public.is_admin()
    or (
      etablissement_id = public.current_user_etablissement_id()
      and public.current_user_role() in ('chef_etablissement', 'etablissements_admin')
    )
    or etablissement_id = auth.uid()
  )
  with check (
    public.is_admin()
    or (
      etablissement_id = public.current_user_etablissement_id()
      and public.current_user_role() in ('chef_etablissement', 'etablissements_admin')
    )
    or etablissement_id = auth.uid()
  );
