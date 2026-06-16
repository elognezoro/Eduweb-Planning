-- ============================================================================
-- EduWeb Planner — 001_init.sql
-- Schéma initial PostgreSQL (Supabase). Multi-pays, multi-établissement.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Référentiels internationaux
-- ----------------------------------------------------------------------------
create table if not exists countries (
  id uuid primary key default gen_random_uuid(),
  iso2 text not null unique,
  iso3 text,
  name_fr text not null,
  name_en text,
  currency_code text,
  timezone text default 'UTC',
  default_locale text default 'fr',
  academic_region_label text,
  teacher_training_center_label text,
  continuing_training_antenna_label text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists currencies (
  code text primary key,
  name text not null,
  symbol text
);

create table if not exists academic_regions (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  code text not null,
  name text not null,
  type text default 'academic_region',
  parent_id uuid references academic_regions(id),
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(country_id, code)
);

create table if not exists administrative_regions (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz default now(),
  unique(country_id, code)
);

create table if not exists localities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  academic_region_id uuid references academic_regions(id),
  name text not null,
  type text,
  created_at timestamptz default now()
);

create table if not exists education_systems (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  code text not null,
  label text not null,
  unique(country_id, code)
);

create table if not exists institution_types (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  code text not null,
  label text not null,
  category text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(country_id, code)
);

create table if not exists institution_structures (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  code text not null,
  label text not null,
  unique(country_id, code)
);

create table if not exists academic_years (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  label text not null,
  starts_on date not null,
  ends_on date not null,
  is_current boolean default false,
  created_at timestamptz default now()
);

create table if not exists terms (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid references academic_years(id) on delete cascade,
  label text not null,
  starts_on date not null,
  ends_on date not null,
  sort_order int default 1
);

create table if not exists education_cycles (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  code text not null,
  label text not null,
  sort_order int default 1,
  unique(country_id, code)
);

create table if not exists education_levels (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  cycle_id uuid references education_cycles(id),
  code text not null,
  label text not null,
  sort_order int default 1,
  unique(country_id, code)
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  code text not null,
  label text not null,
  color text,
  is_active boolean default true,
  unique(country_id, code)
);

-- ----------------------------------------------------------------------------
-- Établissements & profils
-- ----------------------------------------------------------------------------
create table if not exists etablissements (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete restrict,
  academic_region_id uuid references academic_regions(id),
  locality_id uuid references localities(id),
  institution_type_id uuid references institution_types(id),
  code text,
  name text not null,
  short_name text,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(country_id, code)
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  country_id uuid references countries(id),
  etablissement_id uuid references etablissements(id),
  academic_region_id uuid references academic_regions(id),
  first_name text,
  last_name text,
  display_name text,
  email text,
  phone text,
  avatar_url text,
  role text not null default 'eleve',
  status text not null default 'pending',
  preferred_locale text default 'fr',
  job_title text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_role_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  requested_role text not null,
  current_role text,
  reason text,
  status text default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz default now()
);

create table if not exists permission_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  granted jsonb default '[]'::jsonb,
  revoked jsonb default '[]'::jsonb,
  updated_by uuid references profiles(id),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  country_id uuid references countries(id),
  etablissement_id uuid references etablissements(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  severity text default 'info',
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Élèves, classes, enseignants
-- ----------------------------------------------------------------------------
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  etablissement_id uuid references etablissements(id) on delete cascade,
  academic_year_id uuid references academic_years(id),
  level_id uuid references education_levels(id),
  name text not null,
  room text,
  capacity int,
  created_at timestamptz default now()
);

create table if not exists eleves (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  etablissement_id uuid references etablissements(id),
  matricule text,
  first_name text not null,
  last_name text not null,
  gender text,
  birth_date date,
  birth_place text,
  photo_url text,
  status text default 'active',
  created_at timestamptz default now(),
  unique(etablissement_id, matricule)
);

create table if not exists parents_eleves (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid references profiles(id) on delete cascade,
  eleve_id uuid references eleves(id) on delete cascade,
  relation text,
  can_receive_sms boolean default true,
  can_receive_email boolean default true,
  created_at timestamptz default now(),
  unique(parent_profile_id, eleve_id)
);

create table if not exists class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  eleve_id uuid references eleves(id) on delete cascade,
  academic_year_id uuid references academic_years(id),
  status text default 'active',
  created_at timestamptz default now(),
  unique(class_id, eleve_id, academic_year_id)
);

create table if not exists enseignants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  etablissement_id uuid references etablissements(id),
  matricule text,
  specialty text,
  employment_status text,
  created_at timestamptz default now()
);

create table if not exists teacher_subjects (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references enseignants(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  unique(teacher_id, subject_id)
);

-- ----------------------------------------------------------------------------
-- Emplois du temps
-- ----------------------------------------------------------------------------
create table if not exists timetable_slots (
  id uuid primary key default gen_random_uuid(),
  etablissement_id uuid references etablissements(id),
  academic_year_id uuid references academic_years(id),
  class_id uuid references classes(id),
  teacher_id uuid references enseignants(id),
  subject_id uuid references subjects(id),
  room text,
  weekday int not null check (weekday between 1 and 7),
  starts_at time not null,
  ends_at time not null,
  status text default 'active',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Registre d'appel
-- ----------------------------------------------------------------------------
create table if not exists attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  timetable_slot_id uuid references timetable_slots(id),
  class_id uuid references classes(id),
  teacher_id uuid references enseignants(id),
  session_date date not null,
  starts_at time,
  ends_at time,
  topic text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references attendance_sessions(id) on delete cascade,
  eleve_id uuid references eleves(id),
  status text not null default 'present',
  late_minutes int default 0,
  reason text,
  justified boolean default false,
  recorded_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique(session_id, eleve_id)
);

-- ----------------------------------------------------------------------------
-- Cahier de texte
-- ----------------------------------------------------------------------------
create table if not exists lesson_book_entries (
  id uuid primary key default gen_random_uuid(),
  etablissement_id uuid references etablissements(id),
  class_id uuid references classes(id),
  teacher_id uuid references enseignants(id),
  subject_id uuid references subjects(id),
  session_date date not null,
  title text not null,
  objectives text,
  content text,
  homework text,
  resources jsonb default '[]'::jsonb,
  status text default 'draft',
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lesson_book_access_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references profiles(id),
  entry_id uuid references lesson_book_entries(id),
  reason text,
  status text default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Notes, bulletins, livret
-- ----------------------------------------------------------------------------
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  etablissement_id uuid references etablissements(id),
  class_id uuid references classes(id),
  subject_id uuid references subjects(id),
  teacher_id uuid references enseignants(id),
  term_id uuid references terms(id),
  title text not null,
  evaluation_type text,
  coefficient numeric(5,2) default 1,
  max_score numeric(5,2) default 20,
  evaluation_date date,
  created_at timestamptz default now()
);

create table if not exists grades (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid references evaluations(id) on delete cascade,
  eleve_id uuid references eleves(id),
  score numeric(5,2),
  comment text,
  recorded_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(evaluation_id, eleve_id)
);

create table if not exists report_cards (
  id uuid primary key default gen_random_uuid(),
  eleve_id uuid references eleves(id),
  class_id uuid references classes(id),
  term_id uuid references terms(id),
  average numeric(5,2),
  rank int,
  appreciation text,
  status text default 'draft',
  generated_by uuid references profiles(id),
  generated_at timestamptz,
  pdf_url text,
  created_at timestamptz default now()
);

create table if not exists school_records (
  id uuid primary key default gen_random_uuid(),
  eleve_id uuid references eleves(id),
  academic_year_id uuid references academic_years(id),
  summary jsonb default '{}'::jsonb,
  achievements jsonb default '[]'::jsonb,
  conduct_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Communication, RDV, SMS
-- ----------------------------------------------------------------------------
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  etablissement_id uuid references etablissements(id),
  title text not null,
  body text not null,
  audience jsonb default '[]'::jsonb,
  priority text default 'normal',
  published_by uuid references profiles(id),
  published_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id),
  recipient_id uuid references profiles(id),
  subject text,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  etablissement_id uuid references etablissements(id),
  requester_id uuid references profiles(id),
  participant_id uuid references profiles(id),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text default 'pending',
  location text,
  meeting_url text,
  created_at timestamptz default now()
);

create table if not exists sms_notifications (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  etablissement_id uuid references etablissements(id),
  recipient_phone text not null,
  recipient_profile_id uuid references profiles(id),
  message text not null,
  provider text,
  status text default 'queued',
  sent_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Inspection, grilles, rapports, recommandations
-- ----------------------------------------------------------------------------
create table if not exists evaluation_grids (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  title text not null,
  description text,
  target_role text default 'enseignant',
  is_active boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists evaluation_grid_criteria (
  id uuid primary key default gen_random_uuid(),
  grid_id uuid references evaluation_grids(id) on delete cascade,
  domain text not null,
  criterion text not null,
  max_score numeric(5,2) default 5,
  weight numeric(5,2) default 1,
  sort_order int default 1
);

create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  academic_region_id uuid references academic_regions(id),
  etablissement_id uuid references etablissements(id),
  teacher_id uuid references enseignants(id),
  inspector_id uuid references profiles(id),
  grid_id uuid references evaluation_grids(id),
  planned_at timestamptz,
  completed_at timestamptz,
  status text default 'planned',
  subject_id uuid references subjects(id),
  class_id uuid references classes(id),
  created_at timestamptz default now()
);

create table if not exists inspection_scores (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references inspections(id) on delete cascade,
  criterion_id uuid references evaluation_grid_criteria(id),
  score numeric(5,2),
  comment text,
  created_at timestamptz default now(),
  unique(inspection_id, criterion_id)
);

create table if not exists inspection_reports (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references inspections(id) on delete cascade,
  title text,
  strengths text,
  weaknesses text,
  recommendations_text text,
  global_score numeric(5,2),
  status text default 'draft',
  pdf_url text,
  word_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  etablissement_id uuid references etablissements(id),
  inspection_id uuid references inspections(id),
  assigned_to uuid references profiles(id),
  title text not null,
  description text,
  priority text default 'medium',
  status text default 'open',
  due_date date,
  progress int default 0 check (progress between 0 and 100),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- CAFOP & APFC
-- ----------------------------------------------------------------------------
create table if not exists cafop_centers (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  academic_region_id uuid references academic_regions(id),
  name text not null,
  code text,
  logo_url text,
  cover_url text,
  configuration jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists cafop_promotions (
  id uuid primary key default gen_random_uuid(),
  cafop_center_id uuid references cafop_centers(id) on delete cascade,
  label text not null,
  academic_year_id uuid references academic_years(id),
  start_date date,
  end_date date,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists cafop_cohorts (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid references cafop_promotions(id) on delete cascade,
  name text not null,
  moodle_cohort_id text,
  csv_import_id uuid,
  created_at timestamptz default now()
);

create table if not exists apfc_antennas (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  academic_region_id uuid references academic_regions(id),
  name text not null,
  code text,
  head_profile_id uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists apfc_activities (
  id uuid primary key default gen_random_uuid(),
  antenna_id uuid references apfc_antennas(id) on delete cascade,
  title text not null,
  activity_type text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text default 'planned',
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Rapports génériques
-- ----------------------------------------------------------------------------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  academic_region_id uuid references academic_regions(id),
  etablissement_id uuid references etablissements(id),
  report_type text not null,
  title text not null,
  period_start date,
  period_end date,
  content jsonb default '{}'::jsonb,
  status text default 'draft',
  pdf_url text,
  word_url text,
  generated_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Abonnements & paiements
-- ----------------------------------------------------------------------------
create table if not exists subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  price_amount numeric(12,2) not null,
  currency_code text default 'XOF',
  billing_interval text default 'year',
  features jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists abonnements (
  id uuid primary key default gen_random_uuid(),
  etablissement_id uuid references etablissements(id),
  plan_id uuid references subscription_plans(id),
  status text default 'trial',
  starts_at timestamptz,
  ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table if not exists paiements (
  id uuid primary key default gen_random_uuid(),
  abonnement_id uuid references abonnements(id),
  etablissement_id uuid references etablissements(id),
  amount numeric(12,2) not null,
  currency_code text default 'XOF',
  provider text default 'stripe',
  provider_reference text,
  status text default 'pending',
  receipt_url text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Thème & personnalisation
-- ----------------------------------------------------------------------------
create table if not exists theme_settings (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id),
  etablissement_id uuid references etablissements(id),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index utiles
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_etab on profiles(etablissement_id);
create index if not exists idx_etab_country on etablissements(country_id);
create index if not exists idx_audit_created on audit_logs(created_at desc);
create index if not exists idx_attendance_session on attendance_records(session_id);
create index if not exists idx_grades_eval on grades(evaluation_id);
