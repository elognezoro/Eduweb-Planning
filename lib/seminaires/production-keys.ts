/* ============================================================================
   Identifiants DÉTERMINISTES des productions de séminaire.

   Une soumission est identifiée par (userId, activityId) et une critique par
   (submissionId, reviewerId). En dérivant l'id de ces clés naturelles, l'id est
   le MÊME sur tous les appareils et après toute re-synchronisation Supabase →
   pas de doublon, et une critique référence toujours la bonne soumission.
   ========================================================================== */

const sane = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "_");

/** Id stable d'une soumission de matrice. */
export function matrixSubmissionId(userId: string, activityId: string): string {
  return `ms_${sane(userId)}__${sane(activityId)}`;
}

/** Id stable d'une critique (un reviewer ↦ une critique par soumission). */
export function matrixReviewId(submissionId: string, reviewerId: string): string {
  return `mr_${sane(reviewerId)}__${sane(submissionId)}`;
}

/** Id stable d'une production SINGLETON (une par user+activité) — ex. sondage,
 *  QCM, auto-évaluation. Les productions multiples (forum, carte mentale) gardent
 *  leur id de ligne propre (créé une fois). */
export function seminarProductionId(
  kind: string,
  userId: string,
  activityId: string,
): string {
  return `sp_${sane(kind)}_${sane(userId)}__${sane(activityId)}`;
}
