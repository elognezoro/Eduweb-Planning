-- ============================================================================
-- 014 — Transport : périmètre PAR ÉTABLISSEMENT.
--
-- Ajoute `etablissement_id` aux cars et créneaux (NULL = périmètre « Général »,
-- = l'existant). Les réglages (transport_settings) sont déjà clés par `id`
-- texte : on y stocke l'uuid de l'établissement (en texte) ou 'global'.
--
-- v1 : le périmètre est filtré côté application (un parent voit son
-- établissement ; le super-admin choisit l'établissement). L'isolation stricte
-- par RLS est une évolution (la lecture reste authentifiée).
--
-- Idempotent. Appliquer APRÈS 010/011. À exécuter dans Supabase → SQL Editor.
-- ============================================================================

alter table public.transport_buses
  add column if not exists etablissement_id uuid
    references public.etablissements(id) on delete cascade;

alter table public.transport_slots
  add column if not exists etablissement_id uuid
    references public.etablissements(id) on delete cascade;

create index if not exists transport_buses_etab_idx
  on public.transport_buses (etablissement_id);
create index if not exists transport_slots_etab_idx
  on public.transport_slots (etablissement_id);
