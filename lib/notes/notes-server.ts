import type { SupabaseClient } from "@supabase/supabase-js";

/* ============================================================================
   Accès Supabase à la saisie des notes (`note_entries`, migration 028).
   Cloisonné par établissement via RLS. Modèle dénormalisé aligné sur l'UI de
   notes-bulletins. Helpers best-effort ([]/{ok:false} sans throw) pour un mode
   dual robuste (repli local si Supabase absent ou table non encore appliquée).
   ========================================================================== */

/** Forme consommée par l'UI (notes-bulletins). */
export interface NoteEntryRow {
  id: string;
  studentId: string;
  discipline: string;
  type: string;
  note: number;
  bareme: number;
  coeff: number;
}

/** Données saisies à persister (période + année + établissement en plus). */
export interface NoteEntryInput {
  studentId: string;
  discipline: string;
  type: string;
  note: number;
  bareme: number;
  coeff: number;
  period: number;
  schoolYear: string;
}

interface DbNoteRow {
  id: string;
  student_id: string;
  discipline: string;
  type: string | null;
  note: number | string;
  bareme: number | string;
  coeff: number | string;
}

function mapRow(r: DbNoteRow): NoteEntryRow {
  return {
    id: r.id,
    studentId: r.student_id,
    discipline: r.discipline,
    type: r.type ?? "",
    note: Number(r.note),
    bareme: Number(r.bareme),
    coeff: Number(r.coeff),
  };
}

/** Charge les notes saisies pour une année + période (RLS = établissement). [] si erreur. */
export async function fetchNoteEntries(
  supabase: SupabaseClient,
  schoolYear: string,
  period: number,
): Promise<NoteEntryRow[]> {
  const { data, error } = await supabase
    .from("note_entries")
    .select("id, student_id, discipline, type, note, bareme, coeff")
    .eq("school_year", schoolYear)
    .eq("period", period);
  if (error || !data) return [];
  return (data as DbNoteRow[]).map(mapRow);
}

/** Insère une note saisie (rattachée à l'établissement fourni — exigé par la RLS). */
export async function insertNoteEntry(
  supabase: SupabaseClient,
  input: NoteEntryInput,
  etablissementId: string | null,
  recordedBy?: string | null,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await supabase
    .from("note_entries")
    .insert({
      student_id: input.studentId,
      etablissement_id: etablissementId,
      school_year: input.schoolYear,
      period: input.period,
      discipline: input.discipline,
      type: input.type || null,
      note: input.note,
      bareme: input.bareme,
      coeff: input.coeff,
      recorded_by: recordedBy ?? null,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message };
  return { ok: true, id: (data as { id: string }).id };
}

/** Supprime une note saisie (par id ; RLS = établissement). */
export async function deleteNoteEntry(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await supabase.from("note_entries").delete().eq("id", id);
  return !error;
}
