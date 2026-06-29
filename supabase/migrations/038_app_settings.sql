-- ============================================================================
-- 038 — Réglages GLOBAUX admin persistés (clé → JSONB), partagés cross-poste.
--
-- Magasin générique pour toutes les configurations globales éditées par l'admin
-- et lues par tous : tarifs des cours, configs de certificat, règles d'accès aux
-- modules/supports, fenêtres d'ouverture, règles de réussite, paramètres de
-- paiement (Lot 2), puis partenaires/régions/etc. (Lot 5). 1 ligne par clé
-- (= nom de la slice du store) ; la valeur est le blob JSONB de la slice.
--
-- Lecture  : tout utilisateur authentifié (réglages visibles de tous).
-- Écriture : admin uniquement (public.is_admin()).
-- Idempotente et non destructive.
--
-- ⚠️ SÉCURITÉ : ces réglages sont du CONFIG DE GATING lu CÔTÉ CLIENT par tous
-- les utilisateurs (prix d'un cours, fenêtre d'ouverture, NUMÉRO MARCHAND où
-- l'utilisateur paie, règles d'accès, identité du certificat) — d'où la lecture
-- authentifiée pour tous. AUCUN SECRET ne doit être stocké ici (les clés API /
-- jetons Wave restent en variables d'environnement serveur). PaymentSettings ne
-- contient que des données publiques (numéro/nom marchand affichés au payeur).
-- ============================================================================

create table if not exists public.app_settings (
  key        text        primary key,
  value      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid        references auth.users(id) on delete set null
);

alter table public.app_settings enable row level security;

-- Lecture : tout utilisateur authentifié.
drop policy if exists app_settings_select on public.app_settings;
create policy app_settings_select on public.app_settings
  for select using (auth.uid() is not null);

-- Écriture (insert/update/delete) : admin uniquement.
drop policy if exists app_settings_write on public.app_settings;
create policy app_settings_write on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());
