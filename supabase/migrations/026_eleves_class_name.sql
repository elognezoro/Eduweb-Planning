-- ============================================================================
-- 026 — Référentiel élèves : colonne « classe ».
--
-- La table `eleves` (001) porte déjà l'identité et le rattachement
-- `etablissement_id` (RLS cloisonnée par établissement, 002). Il lui manque la
-- CLASSE, utilisée par le livret, les bulletins et le registre d'appel. On
-- l'ajoute en colonne texte (libre, ex. « 6ème », « 2nde C »).
--
-- Idempotent. À appliquer dans Supabase → SQL Editor (après 001/002).
-- ============================================================================

alter table public.eleves
  add column if not exists class_name text;

-- Recherche/filtre par établissement + classe (listes d'élèves).
create index if not exists eleves_etab_class_idx
  on public.eleves (etablissement_id, class_name);
