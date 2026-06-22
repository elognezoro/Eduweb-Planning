-- ============================================================================
-- 024 — Inscriptions par ANNÉE SCOLAIRE.
--
-- Permet de réinscrire un utilisateur au même cours sur une NOUVELLE année,
-- tout en interdisant le doublon dans la MÊME année. La contrainte d'unicité
-- passe de (user_id, course_id) à (user_id, course_id, school_year).
--
-- Format année : « AAAA-AAAA » (ex. 2025-2026). La fonction current_school_year()
-- sert de valeur par défaut (auto-inscription par lien/webhook) ; l'app envoie
-- l'année courante explicitement pour les inscriptions admin.
--
-- Idempotent. À appliquer dans Supabase → SQL Editor (après 008).
-- ============================================================================

-- Année scolaire courante (sept→août) au format « AAAA-AAAA ».
create or replace function public.current_school_year()
returns text language sql stable as $$
  select case
    when extract(month from now()) >= 9
      then to_char(now(), 'YYYY') || '-' || to_char(now() + interval '1 year', 'YYYY')
      else to_char(now() - interval '1 year', 'YYYY') || '-' || to_char(now(), 'YYYY')
  end;
$$;

alter table public.course_enrollments
  add column if not exists school_year text;

-- Rattacher les inscriptions existantes à l'année scolaire courante.
update public.course_enrollments
   set school_year = public.current_school_year()
 where school_year is null;

alter table public.course_enrollments
  alter column school_year set default public.current_school_year();
alter table public.course_enrollments
  alter column school_year set not null;

-- Remplacer l'unicité (user, cours) par (user, cours, année).
alter table public.course_enrollments
  drop constraint if exists course_enrollments_user_id_course_id_key;
alter table public.course_enrollments
  drop constraint if exists course_enrollments_user_course_year_key;
alter table public.course_enrollments
  add constraint course_enrollments_user_course_year_key
  unique (user_id, course_id, school_year);
