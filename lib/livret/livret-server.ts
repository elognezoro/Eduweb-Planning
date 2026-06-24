import type { SupabaseClient } from "@supabase/supabase-js";
import type { LivretGradeEntry, TermIndex } from "./grades";
import type { LivretOverrides, LivretRecord } from "./types";

/* ============================================================================
   Accès Supabase au livret scolaire (migration 025) :
   - `livret_grades`  : moyenne par (élève, année, matière, trimestre).
   - `livret_records` : overrides éditables (JSON) par (élève, année).

   En mode réel, le livret est persisté côté serveur (partagé multi-appareils).
   La synchro descendante (LivretSync) charge ces données dans le store local ;
   les pages écrivent en write-through (store + serveur). RLS : lecture par tout
   utilisateur authentifié, écriture réservée aux rôles habilités (admin / chef
   d'établissement / enseignant) via `can_write_school_record()`.
   ========================================================================== */

interface DbGradeRow {
  id: string;
  student_id: string;
  school_year: string;
  subject_key: string;
  period: number;
  moy: number | string;
  updated_by: string | null;
  updated_at: string | null;
}

interface DbRecordRow {
  id: string;
  student_id: string;
  school_year: string;
  overrides: unknown;
  updated_by: string | null;
  updated_at: string | null;
}

export function mapGradeRow(r: DbGradeRow): LivretGradeEntry {
  return {
    id: r.id,
    studentId: r.student_id,
    schoolYear: r.school_year,
    subjectKey: r.subject_key,
    period: (Math.min(Math.max(Number(r.period), 0), 2) as TermIndex),
    moy: Number(r.moy),
    updatedAt: r.updated_at ?? "",
    updatedBy: r.updated_by ?? null,
  };
}

export function mapRecordRow(r: DbRecordRow): LivretRecord {
  return {
    id: r.id,
    studentId: r.student_id,
    schoolYear: r.school_year,
    overrides: (r.overrides && typeof r.overrides === "object" ? (r.overrides as LivretOverrides) : {}),
    updatedAt: r.updated_at ?? "",
    updatedBy: r.updated_by ?? null,
  };
}

/** Charge toutes les notes de livret visibles (RLS). [] en cas d'erreur. */
export async function fetchLivretGrades(supabase: SupabaseClient): Promise<LivretGradeEntry[]> {
  const { data, error } = await supabase.from("livret_grades").select("*");
  if (error || !data) return [];
  return (data as DbGradeRow[]).map(mapGradeRow);
}

/** Charge tous les overrides de livret visibles (RLS). [] en cas d'erreur. */
export async function fetchLivretRecords(supabase: SupabaseClient): Promise<LivretRecord[]> {
  const { data, error } = await supabase.from("livret_records").select("*");
  if (error || !data) return [];
  return (data as DbRecordRow[]).map(mapRecordRow);
}

/** Crée/met à jour la moyenne d'une matière (clé naturelle élève+année+matière+trimestre). */
export async function upsertLivretGrade(
  supabase: SupabaseClient,
  entry: { studentId: string; schoolYear: string; subjectKey: string; period: TermIndex; moy: number },
  actor?: string,
  etablissementId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("livret_grades").upsert(
    {
      student_id: entry.studentId,
      school_year: entry.schoolYear,
      subject_key: entry.subjectKey,
      period: entry.period,
      moy: entry.moy,
      etablissement_id: etablissementId ?? null,
      updated_by: actor ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,school_year,subject_key,period" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Crée/met à jour les overrides complets d'un élève pour une année. */
export async function upsertLivretRecord(
  supabase: SupabaseClient,
  studentId: string,
  schoolYear: string,
  overrides: LivretOverrides,
  actor?: string,
  etablissementId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("livret_records").upsert(
    {
      student_id: studentId,
      school_year: schoolYear,
      overrides,
      etablissement_id: etablissementId ?? null,
      updated_by: actor ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,school_year" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Supprime les overrides d'un élève pour une année (réinitialisation à l'auto). */
export async function deleteLivretRecord(
  supabase: SupabaseClient,
  studentId: string,
  schoolYear: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("livret_records")
    .delete()
    .eq("student_id", studentId)
    .eq("school_year", schoolYear);
  return !error;
}
