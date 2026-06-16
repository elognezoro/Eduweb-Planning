-- ============================================================================
-- EduWeb Planner — 003_seed_ci.sql
-- Données de référence Côte d'Ivoire (pays par défaut).
-- Idempotent : utilise des UPSERT sur les clés naturelles.
-- ============================================================================

insert into currencies (code, name, symbol) values
  ('XOF', 'Franc CFA (BCEAO)', 'FCFA'),
  ('EUR', 'Euro', '€')
on conflict (code) do nothing;

-- Pays
insert into countries (iso2, iso3, name_fr, name_en, currency_code, timezone, default_locale,
  academic_region_label, teacher_training_center_label, continuing_training_antenna_label, is_active)
values
  ('CI', 'CIV', 'Côte d''Ivoire', 'Ivory Coast', 'XOF', 'Africa/Abidjan', 'fr',
   'DRENA / DRENAET', 'CAFOP', 'APFC', true)
on conflict (iso2) do update set
  name_fr = excluded.name_fr,
  academic_region_label = excluded.academic_region_label,
  teacher_training_center_label = excluded.teacher_training_center_label,
  continuing_training_antenna_label = excluded.continuing_training_antenna_label;

-- Régions académiques (DRENA)
insert into academic_regions (country_id, code, name)
select c.id, r.code, r.name
from countries c
cross join (values
  ('ABJ1', 'DRENA Abidjan 1'),
  ('ABJ2', 'DRENA Abidjan 2'),
  ('BKE', 'DRENA Bouaké'),
  ('YAM', 'DRENA Yamoussoukro'),
  ('DAL', 'DRENA Daloa'),
  ('KOR', 'DRENA Korhogo'),
  ('SPD', 'DRENA San-Pédro'),
  ('MAN', 'DRENA Man')
) as r(code, name)
where c.iso2 = 'CI'
on conflict (country_id, code) do nothing;

-- Types d'établissements
insert into institution_types (country_id, code, label, category)
select c.id, t.code, t.label, t.category
from countries c
cross join (values
  ('lycee_public', 'Lycée public', 'secondaire'),
  ('college_public', 'Collège public', 'secondaire'),
  ('prive', 'Établissement privé', 'secondaire'),
  ('confessionnel', 'Établissement confessionnel', 'secondaire'),
  ('cafop', 'Centre de formation (CAFOP)', 'formation')
) as t(code, label, category)
where c.iso2 = 'CI'
on conflict (country_id, code) do nothing;

-- Cycles
insert into education_cycles (country_id, code, label, sort_order)
select c.id, cy.code, cy.label, cy.so
from countries c
cross join (values
  ('prescolaire', 'Préscolaire', 1),
  ('primaire', 'Primaire', 2),
  ('premier_cycle', 'Premier cycle (Collège)', 3),
  ('second_cycle', 'Second cycle (Lycée)', 4)
) as cy(code, label, so)
where c.iso2 = 'CI'
on conflict (country_id, code) do nothing;

-- Niveaux
insert into education_levels (country_id, cycle_id, code, label, sort_order)
select c.id, cyc.id, lv.code, lv.label, lv.so
from countries c
join education_cycles cyc on cyc.country_id = c.id and cyc.code = lv.cycle_code
cross join (values
  ('6e', '6e', 'premier_cycle', 1),
  ('5e', '5e', 'premier_cycle', 2),
  ('4e', '4e', 'premier_cycle', 3),
  ('3e', '3e', 'premier_cycle', 4),
  ('2nde', '2nde', 'second_cycle', 5),
  ('1ere', '1ere', 'second_cycle', 6),
  ('tle', 'Tle', 'second_cycle', 7)
) as lv(code, label, cycle_code, so)
where c.iso2 = 'CI'
on conflict (country_id, code) do nothing;

-- Disciplines
insert into subjects (country_id, code, label, color)
select c.id, s.code, s.label, s.color
from countries c
cross join (values
  ('fr', 'Français', '#2563eb'),
  ('maths', 'Mathématiques', '#176b45'),
  ('pc', 'Physique-Chimie', '#7c3aed'),
  ('svt', 'SVT', '#16a34a'),
  ('hg', 'Histoire-Géographie', '#ea580c'),
  ('ang', 'Anglais', '#dc2626'),
  ('philo', 'Philosophie', '#0891b2'),
  ('edhc', 'EDHC', '#d99a1e'),
  ('eps', 'EPS', '#65a30d'),
  ('esp', 'Espagnol', '#db2777'),
  ('all', 'Allemand', '#475569')
) as s(code, label, color)
where c.iso2 = 'CI'
on conflict (country_id, code) do nothing;

-- Année scolaire courante + trimestres
insert into academic_years (country_id, label, starts_on, ends_on, is_current)
select c.id, '2025 — 2026', date '2025-09-15', date '2026-07-10', true
from countries c where c.iso2 = 'CI'
on conflict do nothing;

insert into terms (academic_year_id, label, starts_on, ends_on, sort_order)
select ay.id, t.label, t.s, t.e, t.so
from academic_years ay
join countries c on c.id = ay.country_id and c.iso2 = 'CI'
cross join (values
  ('1er Trimestre', date '2025-09-15', date '2025-12-19', 1),
  ('2e Trimestre', date '2026-01-06', date '2026-03-27', 2),
  ('3e Trimestre', date '2026-04-06', date '2026-07-10', 3)
) as t(label, s, e, so)
where ay.label = '2025 — 2026'
on conflict do nothing;

-- Plans d'abonnement
insert into subscription_plans (code, name, description, price_amount, currency_code, billing_interval, features)
values
  ('standard', 'Standard', 'Vie scolaire et communication', 600000, 'XOF', 'year',
   '["Vie scolaire","Notes & bulletins","Communication","Jusqu''à 800 élèves"]'::jsonb),
  ('etablissement', 'Établissement', 'Pilotage complet de l''établissement', 1200000, 'XOF', 'year',
   '["Tout Standard","Statistiques avancées","Inspections","Exports illimités"]'::jsonb),
  ('premium', 'Premium', 'Académie Premium et SMS inclus', 1900000, 'XOF', 'year',
   '["Tout Établissement","Académie Premium","Alertes SMS incluses","Support prioritaire"]'::jsonb)
on conflict (code) do nothing;

-- NB : la création du compte administrateur initial se fait via scripts/seed.ts
-- (qui crée l'utilisateur dans auth.users puis le profil avec role='admin').
