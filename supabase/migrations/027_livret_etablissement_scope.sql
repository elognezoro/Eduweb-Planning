-- ============================================================================
-- 027 — Cloisonnement du livret scolaire PAR ÉTABLISSEMENT.
--
-- Ajoute `etablissement_id` aux tables du livret (025) et restreint la RLS :
--   • lecture  : admin OU livret de SON établissement ;
--   • écriture : rôle habilité (can_write_school_record) ET (admin OU
--                même établissement) — un rédacteur ne peut écrire que pour
--                son établissement.
--
-- Les écritures côté app estampillent `etablissement_id` = établissement de
-- l'utilisateur courant. Les lignes antérieures (etablissement_id NULL) ne sont
-- plus visibles que par l'admin — c'est voulu (cloisonnement). Idempotent.
-- À appliquer dans Supabase → SQL Editor (après 025).
-- ============================================================================

alter table public.livret_grades
  add column if not exists etablissement_id uuid references public.etablissements(id);
alter table public.livret_records
  add column if not exists etablissement_id uuid references public.etablissements(id);

create index if not exists livret_grades_etab_idx on public.livret_grades (etablissement_id);
create index if not exists livret_records_etab_idx on public.livret_records (etablissement_id);

-- -------- Lecture : admin ou même établissement --------
drop policy if exists lg_select on public.livret_grades;
create policy lg_select on public.livret_grades
  for select using (
    public.is_admin() or etablissement_id = public.current_user_etablissement_id()
  );

drop policy if exists lr_select on public.livret_records;
create policy lr_select on public.livret_records
  for select using (
    public.is_admin() or etablissement_id = public.current_user_etablissement_id()
  );

-- -------- Écriture : rôle habilité ET (admin ou même établissement) --------
drop policy if exists lg_write on public.livret_grades;
create policy lg_write on public.livret_grades
  for all
  using (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  )
  with check (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  );

drop policy if exists lr_write on public.livret_records;
create policy lr_write on public.livret_records
  for all
  using (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  )
  with check (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  );
