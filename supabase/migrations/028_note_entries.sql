-- ============================================================================
-- 028 — Saisie des notes EN LIGNE (note_entries), cloisonnée par établissement.
--
-- Persiste la saisie de notes-bulletins (une note = un devoir/interro pour un
-- élève dans une matière, à une période). Modèle DÉNORMALISÉ (discipline /
-- type / barème / coef en texte) aligné sur l'UI existante — le modèle
-- normalisé evaluations/grades (001) reste pour un futur référentiel
-- matières/classes/trimestres.
--
-- RLS : lecture = admin OU même établissement ; écriture = rôle habilité
-- (admin / chef d'établissement / enseignant via can_write_school_record) ET
-- même établissement. Idempotent. À appliquer après 025/026 (can_write_school_record).
-- ============================================================================

create table if not exists public.note_entries (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  etablissement_id uuid references public.etablissements(id),
  school_year text not null,
  period smallint not null default 0,
  discipline text not null,
  type text,
  note numeric(5, 2) not null,
  bareme numeric(5, 2) not null default 20,
  coeff numeric(5, 2) not null default 1,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists note_entries_lookup_idx
  on public.note_entries (etablissement_id, school_year, period, student_id);

alter table public.note_entries enable row level security;

drop policy if exists ne_select on public.note_entries;
create policy ne_select on public.note_entries
  for select using (
    public.is_admin() or etablissement_id = public.current_user_etablissement_id()
  );

drop policy if exists ne_write on public.note_entries;
create policy ne_write on public.note_entries
  for all
  using (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  )
  with check (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  );
