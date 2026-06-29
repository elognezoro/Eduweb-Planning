-- ============================================================================
-- 037 — Configuration d'établissement PARTAGÉE et persistée côté serveur.
--
-- Problème corrigé : la « Configuration de l'établissement » (logo, cachet,
-- signature, horaires, régime, niveaux, champs enseignants, en-tête bulletin…)
-- était stockée en localStorage → invisible sur un autre poste et non partagée
-- entre les membres de l'établissement. On la persiste désormais en base, en un
-- enregistrement JSONB par établissement.
--
-- Lecture  : admin OU tout membre du même établissement (enseignants, exports…).
-- Écriture : admin OU chef d'établissement (chef_etablissement / etablissements_admin)
--            rattaché à ce même établissement.
--
-- Réutilise les helpers RLS existants : public.is_admin(),
-- public.current_user_etablissement_id(), public.current_user_role().
-- Idempotente et NON destructive.
-- ============================================================================

create table if not exists public.etablissement_config (
  etablissement_id uuid primary key references public.etablissements(id) on delete cascade,
  config_data      jsonb       not null default '{}'::jsonb,
  updated_at       timestamptz not null default now(),
  updated_by       uuid        references auth.users(id) on delete set null
);

alter table public.etablissement_config enable row level security;

-- Lecture : admin ou membre du même établissement.
drop policy if exists ec_select on public.etablissement_config;
create policy ec_select on public.etablissement_config
  for select using (
    public.is_admin()
    or etablissement_id = public.current_user_etablissement_id()
  );

-- Écriture (insert/update/delete) : admin OU chef du même établissement.
drop policy if exists ec_write on public.etablissement_config;
create policy ec_write on public.etablissement_config
  for all
  using (
    public.is_admin()
    or (
      etablissement_id = public.current_user_etablissement_id()
      and public.current_user_role() in ('chef_etablissement', 'etablissements_admin')
    )
  )
  with check (
    public.is_admin()
    or (
      etablissement_id = public.current_user_etablissement_id()
      and public.current_user_role() in ('chef_etablissement', 'etablissements_admin')
    )
  );
