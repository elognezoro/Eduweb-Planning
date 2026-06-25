import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { MatrixSubmission, MatrixReview } from "@/components/app-shell/data-store";

/* ============================================================================
   Accès Supabase aux productions « matrice » des séminaires (migration 031).

   En mode réel, les soumissions des participants et les critiques des
   formateurs sont persistées côté serveur → un TUTEUR voit les vraies
   productions des étudiants (cloisonnées par la RLS : il ne voit que celles des
   cours qu'il anime ; l'étudiant ne voit que la sienne + les critiques publiées).

   Toutes les fonctions sont BEST-EFFORT : en mode démo elles sont inertes, et
   tout échec réseau est avalé (on garde le store local). La synchro descendante
   est déclenchée par les composants matrice (fetch au montage + bouton
   « Rafraîchir »).
   ========================================================================== */

const REAL_MODE = isSupabaseConfigured();

interface DbSubmissionRow {
  id: string;
  user_id: string;
  user_name: string | null;
  user_role: string | null;
  course_id: string;
  module_id: string | null;
  activity_id: string;
  headers: unknown;
  row_labels: unknown;
  cells: unknown;
  created_at: string | null;
  updated_at: string | null;
}

interface DbReviewRow {
  id: string;
  submission_id: string;
  course_id: string;
  reviewer_id: string;
  reviewer_name: string | null;
  reviewer_role: string | null;
  content: string | null;
  published_to_learner: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

function mapSubmission(r: DbSubmissionRow): MatrixSubmission {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name ?? "",
    userRole: r.user_role ?? undefined,
    courseId: r.course_id,
    moduleId: r.module_id ?? "",
    activityId: r.activity_id,
    headers: Array.isArray(r.headers) ? (r.headers as string[]) : [],
    rowLabels: Array.isArray(r.row_labels) ? (r.row_labels as string[]) : [],
    cells:
      r.cells && typeof r.cells === "object"
        ? (r.cells as Record<string, string>)
        : {},
    createdAt: r.created_at ?? "",
    updatedAt: r.updated_at ?? r.created_at ?? "",
  };
}

function mapReview(r: DbReviewRow): MatrixReview {
  return {
    id: r.id,
    submissionId: r.submission_id,
    reviewerId: r.reviewer_id,
    reviewerName: r.reviewer_name ?? "",
    reviewerRole: r.reviewer_role ?? undefined,
    content: r.content ?? "",
    publishedToLearner: !!r.published_to_learner,
    createdAt: r.created_at ?? "",
    updatedAt: r.updated_at ?? r.created_at ?? "",
  };
}

/**
 * Charge les productions d'un cours visibles par l'appelant (la RLS cloisonne :
 * apprenant → la sienne + critiques publiées ; facilitateur → toutes).
 * Renvoie null en mode démo ou en cas d'échec.
 */
export async function fetchCourseMatrix(
  courseId: string,
): Promise<{ submissions: MatrixSubmission[]; reviews: MatrixReview[] } | null> {
  if (!REAL_MODE) return null;
  try {
    const supabase = createClient();
    const [subRes, revRes] = await Promise.all([
      supabase.from("matrix_submissions").select("*").eq("course_id", courseId),
      supabase.from("matrix_reviews").select("*").eq("course_id", courseId),
    ]);
    if (subRes.error || revRes.error) return null;
    return {
      submissions: (subRes.data as DbSubmissionRow[]).map(mapSubmission),
      reviews: (revRes.data as DbReviewRow[]).map(mapReview),
    };
  } catch {
    return null;
  }
}

/** Persiste (upsert) une soumission de matrice. Best-effort. */
export async function persistMatrixSubmission(sub: MatrixSubmission): Promise<void> {
  if (!REAL_MODE) return;
  try {
    const supabase = createClient();
    await supabase.from("matrix_submissions").upsert(
      {
        id: sub.id,
        user_id: sub.userId,
        user_name: sub.userName,
        user_role: sub.userRole ?? null,
        course_id: sub.courseId,
        module_id: sub.moduleId ?? null,
        activity_id: sub.activityId,
        headers: sub.headers,
        row_labels: sub.rowLabels,
        cells: sub.cells,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  } catch {
    /* best effort */
  }
}

/** Persiste (upsert) une critique. `courseId` provient de la soumission. */
export async function persistMatrixReview(
  review: MatrixReview,
  courseId: string,
): Promise<void> {
  if (!REAL_MODE) return;
  try {
    const supabase = createClient();
    await supabase.from("matrix_reviews").upsert(
      {
        id: review.id,
        submission_id: review.submissionId,
        course_id: courseId,
        reviewer_id: review.reviewerId,
        reviewer_name: review.reviewerName,
        reviewer_role: review.reviewerRole ?? null,
        content: review.content,
        published_to_learner: review.publishedToLearner,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  } catch {
    /* best effort */
  }
}

/* ============================================================================
   Productions GÉNÉRIQUES (migration 032) — sondages, forum, carte mentale, …
   Table unique `seminar_productions` : colonnes indexées + payload JSON.
   ========================================================================== */

export interface SeminarProductionRow {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  courseId: string;
  moduleId?: string;
  activityId: string;
  kind: string;
  payload: unknown;
}

interface DbProductionRow {
  id: string;
  user_id: string;
  user_name: string | null;
  user_role: string | null;
  course_id: string;
  module_id: string | null;
  activity_id: string;
  kind: string;
  payload: unknown;
  created_at: string | null;
  updated_at: string | null;
}

function mapProduction(r: DbProductionRow): SeminarProductionRow {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name ?? "",
    userRole: r.user_role ?? undefined,
    courseId: r.course_id,
    moduleId: r.module_id ?? undefined,
    activityId: r.activity_id,
    kind: r.kind,
    payload: r.payload,
  };
}

/** Toutes les productions d'un cours visibles par l'appelant (RLS : la sienne /
 *  toutes si facilitateur). Renvoie null en démo ou en cas d'échec. */
export async function fetchCourseProductions(
  courseId: string,
): Promise<SeminarProductionRow[] | null> {
  if (!REAL_MODE) return null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("seminar_productions")
      .select("*")
      .eq("course_id", courseId);
    if (error || !data) return null;
    return (data as DbProductionRow[]).map(mapProduction);
  } catch {
    return null;
  }
}

/** Upsert en lot de productions (chaque ligne porte son objet métier complet
 *  dans `payload`). Best-effort, inerte en démo. */
export async function persistProductions(rows: SeminarProductionRow[]): Promise<void> {
  if (!REAL_MODE || rows.length === 0) return;
  try {
    const supabase = createClient();
    await supabase.from("seminar_productions").upsert(
      rows.map((r) => ({
        id: r.id,
        user_id: r.userId,
        user_name: r.userName,
        user_role: r.userRole ?? null,
        course_id: r.courseId,
        module_id: r.moduleId ?? null,
        activity_id: r.activityId,
        kind: r.kind,
        payload: r.payload,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "id" },
    );
  } catch {
    /* best effort */
  }
}

/** Supprime une production (l'apprenant la sienne, ou admin). Best-effort. */
export async function deleteProductionRemote(id: string): Promise<void> {
  if (!REAL_MODE) return;
  try {
    const supabase = createClient();
    await supabase.from("seminar_productions").delete().eq("id", id);
  } catch {
    /* best effort */
  }
}
