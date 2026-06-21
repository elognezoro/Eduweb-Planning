-- ============================================================================
-- 013 — Transport : CONDUCTEURS désignés (anti-usurpation de position).
--
-- Seuls les conducteurs inscrits (ou l'admin) peuvent émettre une position de
-- car. L'admin gère la liste (par e-mail). Restreint les policies d'écriture de
-- bus_positions (définies en 011) à cette liste.
--
-- Idempotent. Appliquer APRÈS 010/011. À exécuter dans Supabase → SQL Editor.
-- ============================================================================

create table if not exists public.transport_drivers (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.transport_drivers enable row level security;

-- Chacun peut savoir s'il est conducteur (sa ligne) ; l'admin voit/gère tout.
drop policy if exists td_select on public.transport_drivers;
create policy td_select on public.transport_drivers for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists td_write on public.transport_drivers;
create policy td_write on public.transport_drivers for all
  using (public.is_admin()) with check (public.is_admin());

-- Émission de position : RÉSERVÉE aux conducteurs désignés (ou admin).
drop policy if exists bp_insert on public.bus_positions;
create policy bp_insert on public.bus_positions for insert
  with check (
    public.is_admin()
    or exists (select 1 from public.transport_drivers d where d.user_id = auth.uid())
  );

drop policy if exists bp_update on public.bus_positions;
create policy bp_update on public.bus_positions for update
  using (
    public.is_admin()
    or exists (select 1 from public.transport_drivers d where d.user_id = auth.uid())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.transport_drivers d where d.user_id = auth.uid())
  );
