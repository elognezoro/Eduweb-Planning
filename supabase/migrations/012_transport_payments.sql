-- ============================================================================
-- 012 — Transport : paiement de l'abonnement (Mobile Money, validation manuelle).
--
-- L'utilisateur soumet un paiement (référence Mobile Money) → statut 'pending'.
-- L'admin confirme → l'abonnement (transport_subscriptions) est activé.
-- (Le flux Wave automatique reste une évolution.)
--
-- RLS : l'utilisateur lit/crée SES paiements ; l'admin lit tout et met à jour
-- (confirme/rejette). Helper de 002_rls : public.is_admin().
--
-- Idempotent. À appliquer dans Supabase → SQL Editor.
-- ============================================================================

create table if not exists public.transport_payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  payer_email  text,
  amount_fcfa  integer not null default 0,
  method       text not null default 'mobile_money',
  reference    text,
  status       text not null default 'pending'
               check (status in ('pending','confirmed','rejected')),
  created_at   timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id) on delete set null
);
create index if not exists transport_payments_status_idx
  on public.transport_payments (status);
create index if not exists transport_payments_user_idx
  on public.transport_payments (user_id);

alter table public.transport_payments enable row level security;

-- Lecture : ses paiements / tout pour l'admin.
drop policy if exists tp_select on public.transport_payments;
create policy tp_select on public.transport_payments for select
  using (user_id = auth.uid() or public.is_admin());

-- Création : un utilisateur soumet SON paiement (en attente).
drop policy if exists tp_insert on public.transport_payments;
create policy tp_insert on public.transport_payments for insert
  with check (user_id = auth.uid());

-- Mise à jour (confirmer / rejeter) : admin uniquement.
drop policy if exists tp_update on public.transport_payments;
create policy tp_update on public.transport_payments for update
  using (public.is_admin()) with check (public.is_admin());
