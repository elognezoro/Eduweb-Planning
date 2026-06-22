-- ============================================================================
-- 022 — APFC : champs descriptifs des antennes (parité avec le module démo).
--
-- Ajoute à apfc_antennas les champs d'affichage utilisés par la gestion
-- (localisation, contact, responsable nominatif, compteurs). Le `head_profile_id`
-- (lien vers le COMPTE Chef d'Antenne, migration 001/021) reste la clé d'isolation ;
-- `responsable` n'est qu'un libellé nominatif d'affichage (peut différer du compte).
--
-- Aucune politique RLS à changer : les policies de 021 (écriture réservée à la
-- gestion globale) couvrent déjà ces colonnes. Idempotent.
-- ============================================================================

alter table public.apfc_antennas
  add column if not exists region              text,
  add column if not exists locality            text,
  add column if not exists address             text,
  add column if not exists phone               text,
  add column if not exists email               text,
  add column if not exists responsable         text,
  add column if not exists responsable_contact text,
  add column if not exists sub_antennas        integer default 0,
  add column if not exists coordinators        integer default 0;
