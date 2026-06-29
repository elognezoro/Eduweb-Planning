-- ============================================================================
-- 042 — Établissements : persister TYPE / RÉGIME / ANNÉE scolaire en texte.
--
-- Suite de 041 (region_name/locality). Pour que le RÉPERTOIRE d'établissements
-- soit COMPLET et IDENTIQUE d'un poste/navigateur à l'autre (source unique =
-- Supabase, plus de répertoire localStorage par-appareil), on persiste aussi le
-- type d'établissement, le régime et l'année scolaire saisis à la création.
--
-- Additive, idempotente, non destructive.
-- ============================================================================

alter table public.etablissements
  add column if not exists institution_type text;

alter table public.etablissements
  add column if not exists regime text;

alter table public.etablissements
  add column if not exists school_year text;
