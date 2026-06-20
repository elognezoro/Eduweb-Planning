-- ============================================================================
-- 002 — Politiques référentielles pour la SUPPRESSION DÉFINITIVE d'un compte.
--
-- Contexte : `profiles.id references auth.users(id) on delete cascade`. Supprimer
-- un utilisateur (auth.users) tente donc de supprimer sa ligne `profiles`. Or 25
-- des 28 clés étrangères pointant vers `profiles(id)` étaient en NO ACTION
-- (défaut PostgreSQL) : dès qu'une seule ligne liée existait (une note saisie,
-- un message, une entrée d'audit…), la suppression échouait sur une violation
-- de FK. Cette migration fixe une politique explicite par dépendance pour rendre
-- la suppression possible en exploitation réelle, SANS perte de données métier
-- non voulue.
--
-- Politique :
--   • CASCADE  → données strictement personnelles qui doivent disparaître avec
--                le compte (messages, rendez-vous).
--   • SET NULL → traces historiques / d'audit / d'attribution à CONSERVER mais
--                désattribuer (journaux, notes, bulletins, inspections, etc.),
--                et dissociation du dossier scolaire (eleves/enseignants) de son
--                compte de connexion.
--   (Les 3 FK déjà en CASCADE — user_role_requests.user_id,
--    permission_overrides.user_id, parents_eleves.parent_profile_id — sont
--    inchangées : elles suppriment les lignes strictement liées à l'utilisateur.)
--
-- Toutes les colonnes ciblées par SET NULL sont nullable (vérifié sur 001_init).
-- Idempotent : `drop constraint if exists` + `add constraint` (réexécutable).
-- À appliquer sur la base Supabase de production (SQL Editor ou `supabase db push`).
-- ============================================================================

begin;

-- --- SET NULL : journaux / historique / attributions (préserver la ligne) ---
alter table audit_logs
  drop constraint if exists audit_logs_actor_id_fkey,
  add constraint audit_logs_actor_id_fkey
    foreign key (actor_id) references profiles(id) on delete set null;

alter table user_role_requests
  drop constraint if exists user_role_requests_reviewed_by_fkey,
  add constraint user_role_requests_reviewed_by_fkey
    foreign key (reviewed_by) references profiles(id) on delete set null;

alter table permission_overrides
  drop constraint if exists permission_overrides_updated_by_fkey,
  add constraint permission_overrides_updated_by_fkey
    foreign key (updated_by) references profiles(id) on delete set null;

alter table timetable_slots
  drop constraint if exists timetable_slots_created_by_fkey,
  add constraint timetable_slots_created_by_fkey
    foreign key (created_by) references profiles(id) on delete set null;

alter table attendance_records
  drop constraint if exists attendance_records_recorded_by_fkey,
  add constraint attendance_records_recorded_by_fkey
    foreign key (recorded_by) references profiles(id) on delete set null;

alter table lesson_book_entries
  drop constraint if exists lesson_book_entries_created_by_fkey,
  add constraint lesson_book_entries_created_by_fkey
    foreign key (created_by) references profiles(id) on delete set null;

alter table lesson_book_access_requests
  drop constraint if exists lesson_book_access_requests_requester_id_fkey,
  add constraint lesson_book_access_requests_requester_id_fkey
    foreign key (requester_id) references profiles(id) on delete set null;

alter table lesson_book_access_requests
  drop constraint if exists lesson_book_access_requests_reviewed_by_fkey,
  add constraint lesson_book_access_requests_reviewed_by_fkey
    foreign key (reviewed_by) references profiles(id) on delete set null;

alter table grades
  drop constraint if exists grades_recorded_by_fkey,
  add constraint grades_recorded_by_fkey
    foreign key (recorded_by) references profiles(id) on delete set null;

alter table report_cards
  drop constraint if exists report_cards_generated_by_fkey,
  add constraint report_cards_generated_by_fkey
    foreign key (generated_by) references profiles(id) on delete set null;

alter table announcements
  drop constraint if exists announcements_published_by_fkey,
  add constraint announcements_published_by_fkey
    foreign key (published_by) references profiles(id) on delete set null;

alter table sms_notifications
  drop constraint if exists sms_notifications_recipient_profile_id_fkey,
  add constraint sms_notifications_recipient_profile_id_fkey
    foreign key (recipient_profile_id) references profiles(id) on delete set null;

alter table evaluation_grids
  drop constraint if exists evaluation_grids_created_by_fkey,
  add constraint evaluation_grids_created_by_fkey
    foreign key (created_by) references profiles(id) on delete set null;

alter table inspections
  drop constraint if exists inspections_inspector_id_fkey,
  add constraint inspections_inspector_id_fkey
    foreign key (inspector_id) references profiles(id) on delete set null;

alter table inspection_reports
  drop constraint if exists inspection_reports_created_by_fkey,
  add constraint inspection_reports_created_by_fkey
    foreign key (created_by) references profiles(id) on delete set null;

alter table recommendations
  drop constraint if exists recommendations_assigned_to_fkey,
  add constraint recommendations_assigned_to_fkey
    foreign key (assigned_to) references profiles(id) on delete set null;

alter table recommendations
  drop constraint if exists recommendations_created_by_fkey,
  add constraint recommendations_created_by_fkey
    foreign key (created_by) references profiles(id) on delete set null;

alter table apfc_antennas
  drop constraint if exists apfc_antennas_head_profile_id_fkey,
  add constraint apfc_antennas_head_profile_id_fkey
    foreign key (head_profile_id) references profiles(id) on delete set null;

alter table reports
  drop constraint if exists reports_generated_by_fkey,
  add constraint reports_generated_by_fkey
    foreign key (generated_by) references profiles(id) on delete set null;

-- --- SET NULL : dissocier le dossier scolaire du compte de connexion ---------
-- (on conserve le dossier élève/enseignant ; seul le lien vers le compte saute)
alter table eleves
  drop constraint if exists eleves_profile_id_fkey,
  add constraint eleves_profile_id_fkey
    foreign key (profile_id) references profiles(id) on delete set null;

alter table enseignants
  drop constraint if exists enseignants_profile_id_fkey,
  add constraint enseignants_profile_id_fkey
    foreign key (profile_id) references profiles(id) on delete set null;

-- --- CASCADE : données strictement personnelles à supprimer avec le compte ---
alter table messages
  drop constraint if exists messages_sender_id_fkey,
  add constraint messages_sender_id_fkey
    foreign key (sender_id) references profiles(id) on delete cascade;

alter table messages
  drop constraint if exists messages_recipient_id_fkey,
  add constraint messages_recipient_id_fkey
    foreign key (recipient_id) references profiles(id) on delete cascade;

alter table appointments
  drop constraint if exists appointments_requester_id_fkey,
  add constraint appointments_requester_id_fkey
    foreign key (requester_id) references profiles(id) on delete cascade;

alter table appointments
  drop constraint if exists appointments_participant_id_fkey,
  add constraint appointments_participant_id_fkey
    foreign key (participant_id) references profiles(id) on delete cascade;

commit;
