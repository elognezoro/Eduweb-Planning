-- ============================================================================
-- 043 — Registre d'appel / présences (attendance), cloisonné par établissement.
--
-- Persiste la prise de présence quotidienne saisie par les enseignants/éducateurs
-- (statut P/A/R, motif, historiques d'encadrement/observation/information). La clé
-- naturelle reprend EXACTEMENT la clé du store : `classe|date|séance|élève`.
--
-- RLS P-ETAB : lecture = admin OU même établissement ; écriture = rôle habilité
-- (admin / chef / enseignant via can_write_school_record) ET même établissement.
-- Idempotent. À appliquer après 025/026 (can_write_school_record) et 001.
-- ============================================================================

create table if not exists public.attendance (
  etablissement_id uuid not null references public.etablissements(id) on delete cascade,
  att_key text not null,
  status text,
  motif text not null default '',
  enc jsonb not null default '[]'::jsonb,
  obs jsonb not null default '[]'::jsonb,
  inf jsonb not null default '[]'::jsonb,
  recorded_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  primary key (etablissement_id, att_key)
);

create index if not exists attendance_etab_idx on public.attendance (etablissement_id);

alter table public.attendance enable row level security;

drop policy if exists att_select on public.attendance;
create policy att_select on public.attendance
  for select using (
    public.is_admin() or etablissement_id = public.current_user_etablissement_id()
  );

drop policy if exists att_write on public.attendance;
create policy att_write on public.attendance
  for all
  using (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  )
  with check (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  );
