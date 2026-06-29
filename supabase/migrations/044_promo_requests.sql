-- ============================================================================
-- 044 — Demandes de code promo (promo_requests), PAR UTILISATEUR.
--
-- Workflow multi-acteurs : l'apprenant/parent DÉPOSE une demande, l'admin la
-- traite (approuve avec code, ou refuse avec motif). En localStorage, une demande
-- déposée sur un poste n'arrivait jamais à l'admin sur un autre poste, et la
-- décision ne revenait pas au demandeur. → table per-user sous RLS.
--
-- RLS : lecture = sa propre demande OU admin ; insertion = la sienne
-- (user_id = auth.uid()) ; mise à jour (décision) / suppression = admin.
-- Idempotent.
-- ============================================================================

create table if not exists public.promo_requests (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  requester text,
  requester_role text,
  etablissement text,
  type text,
  pct numeric(5, 2) not null default 0,
  justification text,
  requested_at timestamptz not null default now(),
  status text not null default 'pending',
  code text,
  decided_by text,
  decided_at timestamptz,
  reason text,
  updated_at timestamptz not null default now()
);

create index if not exists promo_requests_user_idx on public.promo_requests (user_id);

alter table public.promo_requests enable row level security;

drop policy if exists pr_select on public.promo_requests;
create policy pr_select on public.promo_requests
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists pr_insert on public.promo_requests;
create policy pr_insert on public.promo_requests
  for insert with check (user_id = auth.uid());

drop policy if exists pr_update on public.promo_requests;
create policy pr_update on public.promo_requests
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists pr_delete on public.promo_requests;
create policy pr_delete on public.promo_requests
  for delete using (public.is_admin());
