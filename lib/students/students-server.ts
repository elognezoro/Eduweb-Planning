import type { SupabaseClient } from "@supabase/supabase-js";

/* ============================================================================
   Accès Supabase au référentiel élèves (`eleves`, migrations 001/002/026).
   La RLS cloisonne déjà par établissement (lecture + écriture chef/etab-admin/
   educateur/admin de l'établissement). On ne filtre donc pas côté client.
   ========================================================================== */

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F" | "";
  birthDate: string; // « AAAA-MM-JJ » ou ""
  birthPlace: string;
  className: string;
  status: string; // 'active' | 'archived'
  etablissementId: string | null;
}

/** Données saisies/importées (sans id ni statut). */
export type StudentInput = {
  matricule: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F" | "";
  birthDate: string;
  birthPlace: string;
  className: string;
};

interface DbEleveRow {
  id: string;
  matricule: string | null;
  first_name: string;
  last_name: string;
  gender: string | null;
  birth_date: string | null;
  birth_place: string | null;
  class_name: string | null;
  status: string | null;
  etablissement_id: string | null;
}

export function mapEleveRow(r: DbEleveRow): Student {
  const g = (r.gender ?? "").toUpperCase();
  return {
    id: r.id,
    matricule: r.matricule ?? "",
    firstName: r.first_name ?? "",
    lastName: r.last_name ?? "",
    gender: g === "M" || g === "F" ? (g as "M" | "F") : "",
    birthDate: r.birth_date ?? "",
    birthPlace: r.birth_place ?? "",
    className: r.class_name ?? "",
    status: r.status ?? "active",
    etablissementId: r.etablissement_id ?? null,
  };
}

function toDbRow(input: StudentInput, etablissementId: string | null) {
  return {
    matricule: input.matricule || null,
    first_name: input.firstName,
    last_name: input.lastName,
    gender: input.gender || null,
    birth_date: input.birthDate || null,
    birth_place: input.birthPlace || null,
    class_name: input.className || null,
    etablissement_id: etablissementId,
  };
}

/** Charge les élèves visibles (RLS = établissement de l'appelant). [] si erreur. */
export async function fetchStudents(supabase: SupabaseClient): Promise<Student[]> {
  const { data, error } = await supabase
    .from("eleves")
    .select("*")
    .order("last_name", { ascending: true });
  if (error || !data) return [];
  return (data as DbEleveRow[]).map(mapEleveRow);
}

/** Crée un élève (rattaché à l'établissement fourni — exigé par la RLS). */
export async function insertStudent(
  supabase: SupabaseClient,
  input: StudentInput,
  etablissementId: string | null,
): Promise<{ ok: boolean; error?: string; student?: Student }> {
  const { data, error } = await supabase
    .from("eleves")
    .insert(toDbRow(input, etablissementId))
    .select("*")
    .single();
  if (error || !data) return { ok: false, error: error?.message };
  return { ok: true, student: mapEleveRow(data as DbEleveRow) };
}

/** Met à jour un élève (par id). */
export async function updateStudent(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<StudentInput>,
): Promise<{ ok: boolean; error?: string }> {
  const db: Record<string, unknown> = {};
  if (patch.matricule !== undefined) db.matricule = patch.matricule || null;
  if (patch.firstName !== undefined) db.first_name = patch.firstName;
  if (patch.lastName !== undefined) db.last_name = patch.lastName;
  if (patch.gender !== undefined) db.gender = patch.gender || null;
  if (patch.birthDate !== undefined) db.birth_date = patch.birthDate || null;
  if (patch.birthPlace !== undefined) db.birth_place = patch.birthPlace || null;
  if (patch.className !== undefined) db.class_name = patch.className || null;
  if (Object.keys(db).length === 0) return { ok: true };
  const { error } = await supabase.from("eleves").update(db).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Archive (status='archived') ou réactive un élève. */
export async function setStudentStatus(
  supabase: SupabaseClient,
  id: string,
  status: "active" | "archived",
): Promise<boolean> {
  const { error } = await supabase.from("eleves").update({ status }).eq("id", id);
  return !error;
}

/** Import en masse : insère les élèves, renvoie le décompte succès/échec. */
export async function bulkInsertStudents(
  supabase: SupabaseClient,
  inputs: StudentInput[],
  etablissementId: string | null,
): Promise<{ inserted: Student[]; failed: number; error?: string }> {
  if (inputs.length === 0) return { inserted: [], failed: 0 };
  const { data, error } = await supabase
    .from("eleves")
    .insert(inputs.map((i) => toDbRow(i, etablissementId)))
    .select("*");
  if (error) return { inserted: [], failed: inputs.length, error: error.message };
  const rows = (data as DbEleveRow[]).map(mapEleveRow);
  return { inserted: rows, failed: inputs.length - rows.length };
}
