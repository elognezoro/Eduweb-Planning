-- ============================================================================
-- 019 — Établissements : code DSPS officiel + index.
--
-- La table `etablissements` stocke désormais, en plus du code EduWeb (colonne
-- `code`, unique par pays), le **code DSPS** officiel issu du référentiel du
-- Ministère de l'Éducation nationale (Côte d'Ivoire). Les établissements sont
-- matérialisés à la demande (upsert par (country_id, code)) depuis le
-- référentiel client de 2921 établissements secondaires.
--
-- L'écriture reste réservée à l'admin (policy etab_write_admin, migration 002).
-- Idempotent. À exécuter dans Supabase → SQL Editor.
-- ============================================================================

alter table public.etablissements
  add column if not exists dsps_code text;

create index if not exists etablissements_country_code_idx
  on public.etablissements (country_id, code);
create index if not exists etablissements_dsps_idx
  on public.etablissements (dsps_code);
