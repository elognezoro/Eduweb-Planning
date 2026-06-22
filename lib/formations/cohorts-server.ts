import type { SupabaseClient } from "@supabase/supabase-js";
import type { CourseCohort } from "./types";

/* ============================================================================
   Accès Supabase aux cohortes de formation (table course_cohorts, migration 023).

   Outil d'administration : la RLS `cc_all` réserve lecture ET écriture à l'admin.
   En mode réel, les cohortes sont persistées en ligne (au lieu du localStorage) ;
   la synchro descendante (<CohortsSync/>) les recharge dans le store.

   L'id de cohorte est généré côté CLIENT (uuid) et réutilisé tel quel comme id de
   ligne : l'id local et l'id serveur sont donc identiques → updates/deletes par id
   robustes, pas de doublon à la synchro (dédoublonnage par id).
   ========================================================================== */

interface DbCohortRow {
  id: string;
  course_id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  member_user_ids: string[] | null;
  created_at: string | null;
}

export function mapCohortRow(r: DbCohortRow): CourseCohort {
  return {
    id: r.id,
    courseId: r.course_id,
    name: r.name,
    description: r.description ?? undefined,
    createdAt: r.created_at ?? "",
    createdBy: r.created_by ?? "",
    memberUserIds: Array.isArray(r.member_user_ids) ? r.member_user_ids : [],
  };
}

/** Charge toutes les cohortes (RLS : admin uniquement). Renvoie [] en cas d'échec. */
export async function fetchCohorts(supabase: SupabaseClient): Promise<CourseCohort[]> {
  const { data, error } = await supabase.from("course_cohorts").select("*");
  if (error || !data) return [];
  return (data as DbCohortRow[]).map(mapCohortRow);
}

/**
 * Crée ou met à jour une cohorte (par id). Couvre création, renommage et
 * changement de membres (on ré-upsert l'objet complet). RLS `cc_all` = admin.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function upsertCohort(
  supabase: SupabaseClient,
  cohort: CourseCohort,
): Promise<{ ok: boolean; error?: string }> {
  // Garde-fou : les colonnes id / member_user_ids sont des uuid. Les cohortes
  // héritées du mode démo (id « coh-… », membres « EWP-… ») ne sont pas
  // synchronisables — on évite un rejet Postgres silencieux par un no-op clair.
  if (!UUID_RE.test(cohort.id) || cohort.memberUserIds.some((m) => !UUID_RE.test(m))) {
    return { ok: false, error: "Cohorte non synchronisable en ligne (identifiants hérités non-UUID)." };
  }
  const { error } = await supabase.from("course_cohorts").upsert(
    {
      id: cohort.id,
      course_id: cohort.courseId,
      name: cohort.name,
      description: cohort.description ?? null,
      created_by: cohort.createdBy || null,
      member_user_ids: cohort.memberUserIds,
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Supprime une cohorte par id (RLS : admin). */
export async function deleteCohort(
  supabase: SupabaseClient,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("course_cohorts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
