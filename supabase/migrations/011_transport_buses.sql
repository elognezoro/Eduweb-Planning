-- ============================================================================
-- 011 — Transport : PLUSIEURS cars par établissement (multi-terminaux).
--
-- Chaque car a un matricule (numéro caractéristique) et son propre terminal
-- émetteur. La position vue par le parent porte ce matricule.
--
-- - transport_buses : un car = un matricule (+ libellé optionnel).
-- - bus_positions   : restructurée — UNE position PAR car (clé = bus_id), en
--   remplacement du singleton de la migration 010.
--
-- Idempotent. Appliquer APRÈS 010 (ou seul si 010 déjà appliquée). À exécuter
-- dans Supabase → SQL Editor.
-- ============================================================================

create table if not exists public.transport_buses (
  id         uuid primary key default gen_random_uuid(),
  matricule  text not null,
  label      text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.transport_buses enable row level security;

drop policy if exists tb_select on public.transport_buses;
create policy tb_select on public.transport_buses for select
  using (auth.uid() is not null);
drop policy if exists tb_write on public.transport_buses;
create policy tb_write on public.transport_buses for all
  using (public.is_admin()) with check (public.is_admin());

-- Restructure bus_positions : une position PAR car (remplace le singleton 010).
drop table if exists public.bus_positions cascade;
create table public.bus_positions (
  bus_id     uuid primary key references public.transport_buses(id) on delete cascade,
  driver_id  uuid references auth.users(id) on delete set null,
  lat        double precision not null,
  lng        double precision not null,
  heading    double precision,
  speed      double precision,
  direction  text,
  updated_at timestamptz not null default now()
);

alter table public.bus_positions enable row level security;

drop policy if exists bp_select on public.bus_positions;
create policy bp_select on public.bus_positions for select
  using (auth.uid() is not null);
drop policy if exists bp_insert on public.bus_positions;
create policy bp_insert on public.bus_positions for insert
  with check (auth.uid() is not null);
drop policy if exists bp_update on public.bus_positions;
create policy bp_update on public.bus_positions for update
  using (auth.uid() is not null) with check (auth.uid() is not null);
