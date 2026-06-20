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
 * Supprime une inscription (par utilisateur + cours). La RLS `ce_delete`
 * n'autorise que l'admin ou le propriétaire. Renvoie true si OK.
 */
export async function deleteCourseEnrollment(
  supabase: SupabaseClient,
  key: { userId: string; courseId: string },
): Promise<boolean> {
  const { error } = await supabase
    .from("course_enrollments")
    .delete()
    .eq("user_id", key.userId)
    .eq("course_id", key.courseId);
  return !error;
}
