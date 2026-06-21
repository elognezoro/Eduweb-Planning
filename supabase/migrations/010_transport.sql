-- ============================================================================
-- 010 — Module « Transport d'élèves » : géolocalisation du car (temps réel).
--
-- v1 : périmètre GLOBAL (un car / un jeu de réglages) + abonnement PAR
-- utilisateur. Le per-établissement est une évolution ultérieure.
--
-- - transport_settings      : réglages globaux (tarif, périodicité du bip, centre carte).
-- - transport_subscriptions : abonnement par utilisateur (accès au module).
-- - transport_slots         : créneaux d'émission flexibles (aller/retour).
-- - bus_positions           : dernière position du car (upsert par le conducteur).
--
-- RLS : lecture des réglages/créneaux/position par tout utilisateur authentifié ;
-- écriture des réglages/créneaux réservée à l'admin ; chaque utilisateur gère
-- SON abonnement ; la position est émise par un utilisateur authentifié
-- (conducteur) — la désignation stricte du conducteur est une évolution.
-- Helper de 002_rls : public.is_admin().
--
-- Idempotent. À appliquer dans Supabase → SQL Editor.
-- ============================================================================

create table if not exists public.transport_settings (
  id                text primary key default 'global',
  price_fcfa        integer not null default 0,
  beep_interval_min integer not null default 5,
  center_lat        double precision,
  center_lng        double precision,
  updated_at        timestamptz not null default now()
);
insert into public.transport_settings (id) values ('global')
  on conflict (id) do nothing;

create table if not exists public.transport_subscriptions (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.transport_slots (
  id         uuid primary key default gen_random_uuid(),
  label      text,
  direction  text not null default 'aller' check (direction in ('aller','retour')),
  days       int[] not null default '{1,2,3,4,5}', -- 1=lundi … 7=dimanche
  start_time time not null,
  end_time   time not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bus_positions (
  id         text primary key default 'global',
  driver_id  uuid references auth.users(id) on delete set null,
  lat        double precision not null,
  lng        double precision not null,
  heading    double precision,
  speed      double precision,
  direction  text,
  updated_at timestamptz not null default now()
);

alter table public.transport_settings      enable row level security;
alter table public.transport_subscriptions enable row level security;
alter table public.transport_slots         enable row level security;
alter table public.bus_positions           enable row level security;

-- Réglages : lecture authentifiée ; écriture admin.
drop policy if exists ts_select on public.transport_settings;
create policy ts_select on public.transport_settings for select
  using (auth.uid() is not null);
drop policy if exists ts_write on public.transport_settings;
create policy ts_write on public.transport_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- Créneaux : lecture authentifiée ; écriture admin.
drop policy if exists tsl_select on public.transport_slots;
create policy tsl_select on public.transport_slots for select
  using (auth.uid() is not null);
drop policy if exists tsl_write on public.transport_slots;
create policy tsl_write on public.transport_slots for all
  using (public.is_admin()) with check (public.is_admin());

-- Abonnements : chacun gère le sien ; l'admin gère tout.
drop policy if exists tsub_select on public.transport_subscriptions;
create policy tsub_select on public.transport_subscriptions for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists tsub_write on public.transport_subscriptions;
create policy tsub_write on public.transport_subscriptions for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Position : lecture authentifiée ; émission par un utilisateur authentifié.
drop policy if exists bp_select on public.bus_positions;
create policy bp_select on public.bus_positions for select
  using (auth.uid() is not null);
drop policy if exists bp_insert on public.bus_positions;
create policy bp_insert on public.bus_positions for insert
  with check (auth.uid() is not null);
drop policy if exists bp_update on public.bus_positions;
create policy bp_update on public.bus_positions for update
  using (auth.uid() is not null) with check (auth.uid() is not null);
