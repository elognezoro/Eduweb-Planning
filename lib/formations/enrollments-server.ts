import type { SupabaseClient } from "@supabase/supabase-js";
import type { CourseEnrollment, EnrollmentSource } from "./types";
import type { FormationRole } from "./formation-roles";

/* ============================================================================
   Accès Supabase à la table `course_enrollments` (migration 008).

   En mode réel, les inscriptions sont persistées côté serveur (et non plus
   seulement dans le localStorage). La synchronisation descendante vers le store
   local est faite par <CourseEnrollmentsSync/> pour que les pages existantes
   restent inchangées.

   Note : l'INSERT est réservé à l'admin / au trigger / au webhook (RLS) ; il
   n'y a donc pas de helper d'insertion côté client ici.
   ========================================================================== */

interface DbEnrollmentRow {
  id: string;
  user_id: string;
  course_id: string;
  formation_role: string | null;
  source: string | null;
  enrolled_by: string | null;
  expires_at: string | null;
  school_year: string | null;
  created_at: string | null;
}

/** Ligne Supabase → forme `CourseEnrollment` utilisée par l'app. */
export function mapEnrollmentRow(r: DbEnrollmentRow): CourseEnrollment {
  return {
    id: r.id,
    userId: r.user_id,
    courseId: r.course_id,
    enrolledAt: r.created_at ?? "",
    enrolledBy: r.enrolled_by ?? "",
    source: ((r.source as EnrollmentSource) ?? "admin") as EnrollmentSource,
    formationRole: (r.formation_role as FormationRole | null) ?? undefined,
    expiresAt: r.expires_at ?? null,
    schoolYear: r.school_year ?? null,
  };
}

/**
 * Charge les inscriptions visibles par l'appelant. La RLS (`ce_select`) limite
 * d'elle-même : un utilisateur standard ne reçoit que les siennes, l'admin
 * reçoit toutes. On ne filtre donc PAS côté client (évite toute dépendance au
 * timing de résolution du rôle). Renvoie [] en cas d'erreur.
 */
export async function fetchCourseEnrollments(
  supabase: SupabaseClient,
): Promise<CourseEnrollment[]> {
  const { data, error } = await supabase.from("course_enrollments").select("*");
  if (error || !data) return [];
  return (data as DbEnrollmentRow[]).map(mapEnrollmentRow);
}

/**
 * Inscrit (en masse) des utilisateurs à un cours, côté serveur. La RLS
 * `ce_insert` n'autorise que l'admin (super-admin inclus). Les doublons
 * (user_id, course_id) sont ignorés (ON CONFLICT DO NOTHING) — l'opération
 * est donc idempotente et ne nécessite pas de policy UPDATE.
 */
export async function insertCourseEnrollments(
  supabase: SupabaseClient,
  rows: {
    userId: string;
    courseId: string;
    formationRole?: string | null;
    source?: string;
    enrolledBy?: string | null;
    expiresAt?: string | null;
    schoolYear?: string | null;
  }[],
): Promise<{ ok: boolean; error?: string }> {
  if (rows.length === 0) return { ok: true };
  const payload = rows.map((r) => {
    const row: Record<string, unknown> = {
      user_id: r.userId,
      course_id: r.courseId,
      formation_role: r.formationRole ?? null,
      source: r.source ?? "admin",
      enrolled_by: r.enrolledBy ?? null,
      expires_at: r.expiresAt ?? null,
    };
    // Ne pas envoyer null : laisse le DEFAULT (année courante) s'appliquer.
    if (r.schoolYear) row.school_year = r.schoolYear;
    return row;
  });
  const { error } = await supabase
    .from("course_enrollments")
    .upsert(payload, { onConflict: "user_id,course_id,school_year", ignoreDuplicates: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Change le rôle de formation d'un inscrit (par utilisateur + cours). La RLS
 * `ce_update` (migration 023) n'autorise que l'admin. Mise à jour par clé
 * naturelle (user_id + course_id) : robuste au fait que l'id local ≠ id serveur.
 */
export async function updateEnrollmentRole(
  supabase: SupabaseClient,
  key: { userId: string; courseId: string; formationRole: string; schoolYear?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  let q = supabase
    .from("course_enrollments")
    .update({ formation_role: key.formationRole })
    .eq("user_id", key.userId)
    .eq("course_id", key.courseId);
  // Scoper à l'année si connue (sinon toutes les années de ce user+cours).
  if (key.schoolYear) q = q.eq("school_year", key.schoolYear);
  const { error } = await q;
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Supprime une inscription (par utilisateur + cours, et année si connue). La RLS
 * `ce_delete` n'autorise que l'admin ou le propriétaire. Renvoie true si OK.
 */
export async function deleteCourseEnrollment(
  supabase: SupabaseClient,
  key: { userId: string; courseId: string; schoolYear?: string | null },
): Promise<boolean> {
  let q = supabase
    .from("course_enrollments")
    .delete()
    .eq("user_id", key.userId)
    .eq("course_id", key.courseId);
  if (key.schoolYear) q = q.eq("school_year", key.schoolYear);
  const { error } = await q;
  return !error;
}
