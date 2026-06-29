import type { SupabaseClient } from "@supabase/supabase-js";

/* ============================================================================
   Accès Supabase au registre d'appel (`attendance`, migration 043).
   Cloisonné par établissement via RLS. Best-effort (pas de throw) pour un mode
   dual robuste (repli local si Supabase absent ou table non encore appliquée).
   ========================================================================== */

/** Forme d'une ligne de présence — identique à AttendanceRow du store. */
export interface AttendanceRowData {
  status: "P" | "A" | "R";
  motif: string;
  enc: { text: string; at: string }[];
  obs: { text: string; at: string }[];
  inf: { text: string; acc: string; at: string }[];
}

interface DbAttendanceRow {
  att_key: string;
  status: string | null;
  motif: string | null;
  enc: unknown;
  obs: unknown;
  inf: unknown;
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Charge tout le registre d'appel de l'établissement (RLS) sous forme de
 * Record { att_key → ligne }, prêt à fusionner dans le store. `{}` si erreur.
 */
export async function fetchAttendance(
  supabase: SupabaseClient,
  etablissementId: string,
): Promise<Record<string, AttendanceRowData>> {
  const { data, error } = await supabase
    .from("attendance")
    .select("att_key, status, motif, enc, obs, inf")
    .eq("etablissement_id", etablissementId);
  if (error || !data) return {};
  const out: Record<string, AttendanceRowData> = {};
  for (const r of data as DbAttendanceRow[]) {
    out[r.att_key] = {
      status: (r.status as "P" | "A" | "R") ?? "P",
      motif: r.motif ?? "",
      enc: asArray(r.enc),
      obs: asArray(r.obs),
      inf: asArray(r.inf),
    };
  }
  return out;
}

/** Insère/met à jour une ligne de présence (rattachée à l'établissement — RLS). */
export async function upsertAttendance(
  supabase: SupabaseClient,
  etablissementId: string,
  attKey: string,
  row: AttendanceRowData,
  recordedBy?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("attendance").upsert(
    {
      etablissement_id: etablissementId,
      att_key: attKey,
      status: row.status,
      motif: row.motif ?? "",
      enc: row.enc ?? [],
      obs: row.obs ?? [],
      inf: row.inf ?? [],
      recorded_by: recordedBy ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "etablissement_id,att_key" },
  );
  return { ok: !error, error: error?.message };
}
