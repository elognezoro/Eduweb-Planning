-- ============================================================================
-- 041 — Établissements : persister RÉGION et LOCALITÉ en texte libre.
--
-- Contexte : la table `etablissements` (001) ne stocke la région/localité que par
-- UUID (academic_region_id, locality_id). Or le produit gère ces valeurs en
-- TEXTE libre par pays (RegionPicker, customRegions du store) — il n'existe pas
-- de table mappant un nom de région saisi librement -> academic_regions.id pour
-- un pays arbitraire. Sans colonne texte, la région/localité d'un établissement
-- créé via « Nouvel établissement » serait perdue côté serveur (donc invisible
-- cross-poste, alors même que la ligne devient référençable).
--
-- Correctif : on ajoute deux colonnes texte additives. Elles cohabitent avec les
-- colonnes UUID existantes (qui restent NULL tant qu'aucune résolution n'existe).
--
-- Idempotente, additive et non destructive.
-- ============================================================================

alter table public.etablissements
  add column if not exists region_name text;

alter table public.etablissements
  add column if not exists locality text;

-- Index léger pour le regroupement par région dans les listes admin (optionnel).
create index if not exists idx_etablissements_region_name
  on public.etablissements (country_id, region_name);
