-- ============================================================================
-- 039 — Progression apprenant persistée PAR UTILISATEUR :
--   - course_payments     : paiements Mobile Money (soumis par l'apprenant,
--                           validés par l'admin) ;
--   - module_completions  : modules terminés ;
--   - course_completions  : réussite globale d'un cours.
--
-- RLS : chacun voit/gère les SIENNES (user_id = auth.uid()) ; l'admin voit/gère
-- tout (is_admin()). Les statuts de paiement (confirmer/refuser) sont réservés à
-- l'admin (écriture). Idempotente et non destructive.
-- `id` est en TEXT (les identifiants sont générés côté client : « pay-… », etc.).
-- ============================================================================

-- ----- Paiements de cours --------------------------------------------------
create table if not exists public.course_payments (
  id           text primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  user_name    text,
  course_id    text not null,
  amount_fcfa  integer not null default 0,
  operator     text,
  reference    text,
  payer_number text,
  status       text not null default 'pending',
  submitted_at timestamptz not null default now(),
  decided_by   text,
  decided_at   timestamptz,
  note         text
);
create index if not exists course_payments_user_idx on public.course_payments(user_id, course_id);
alter table public.course_payments enable row level security;

drop policy if exists cp_select on public.course_payments;
create policy cp_select on public.course_payments
  for select using (user_id = auth.uid() or public.is_admin());
-- Insertion : l'apprenant dépose SON paiement ; l'admin peut aussi.
drop policy if exists cp_insert on public.course_payments;
create policy cp_insert on public.course_payments
  for insert with check (user_id = auth.uid() or public.is_admin());
-- Décision (confirmer / refuser / annuler) : admin uniquement.
drop policy if exists cp_update on public.course_payments;
create policy cp_update on public.course_payments
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists cp_delete on public.course_payments;
create policy cp_delete on public.course_payments
  for delete using (public.is_admin());

-- ----- Complétions de module ----------------------------------------------
create table if not exists public.module_completions (
  id           text primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_id    text not null,
  module_id    text not null,
  completed_at timestamptz not null default now(),
  source       text not null default 'manual',
  score        numeric,
  unique (user_id, course_id, module_id)
);
create index if not exists module_completions_user_idx on public.module_completions(user_id, course_id);
alter table public.module_completions enable row level security;

drop policy if exists mc_select on public.module_completions;
create policy mc_select on public.module_completions
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists mc_write on public.module_completions;
create policy mc_write on public.module_completions
  for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ----- Réussite globale du cours ------------------------------------------
create table if not exists public.course_completions (
  id                    text primary key,
  user_id               uuid not null references auth.users(id) on delete cascade,
  course_id             text not null,
  completed_at          timestamptz not null default now(),
  source                text not null default 'auto-modules',
  score                 numeric,
  certificate_delivered boolean default false,
  unique (user_id, course_id)
);
create index if not exists course_completions_user_idx on public.course_completions(user_id, course_id);
alter table public.course_completions enable row level security;

drop policy if exists cc_select on public.course_completions;
create policy cc_select on public.course_completions
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists cc_write on public.course_completions;
create policy cc_write on public.course_completions
  for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
