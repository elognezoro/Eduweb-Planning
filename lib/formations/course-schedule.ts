import type { CourseScheduleRule } from "@/lib/formations/types";

/* ============================================================================
   Fenêtre d'ouverture / fermeture d'un cours (fonctions pures).

   L'administrateur fixe une date-heure d'ouverture et/ou de fermeture par
   cours (voir Système → Inscriptions aux formations → « Ouverture / Fermeture »).
   Ces fonctions évaluent, sans effet de bord, si le cours est accessible à un
   instant donné. Le bypass administrateur est géré en amont par CourseGate.
   ========================================================================== */

/** Récupère la fenêtre d'un cours, ou `null` si aucune n'est définie. */
export function getCourseSchedule(
  courseId: string,
  rules: CourseScheduleRule[],
): CourseScheduleRule | null {
  return rules.find((r) => r.courseId === courseId) ?? null;
}

/** État de la fenêtre vis-à-vis de l'instant courant. */
export type ScheduleState = "unscheduled" | "before" | "open" | "after";

export interface CourseScheduleVerdict {
  state: ScheduleState;
  /** `true` si le cours est accessible maintenant (hors bypass admin). */
  accessible: boolean;
  /** Message lisible quand l'accès est refusé (avant / après la fenêtre). */
  reason?: string;
  opensAt?: string | null;
  closesAt?: string | null;
}

/** Parse une chaîne datetime-local en Date locale, ou `null` si invalide. */
function parseLocal(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Formate une date-heure pour l'affichage (français, long + heure:minute). */
export function formatScheduleMoment(value?: string | null): string {
  const d = parseLocal(value);
  if (!d) return "—";
  return d.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

/**
 * Évalue l'accessibilité d'un cours selon sa fenêtre temporelle.
 *
 * - Aucune borne → `unscheduled`, accessible.
 * - Avant l'ouverture → `before`, refusé (avec la date d'ouverture).
 * - Après la fermeture → `after`, refusé (avec la date de fermeture).
 * - Sinon → `open`, accessible.
 */
export function evaluateCourseSchedule(
  rule: CourseScheduleRule | null,
  now: Date = new Date(),
): CourseScheduleVerdict {
  const opensAt = rule?.opensAt ?? null;
  const closesAt = rule?.closesAt ?? null;
  const open = parseLocal(opensAt);
  const close = parseLocal(closesAt);

  if (!open && !close) {
    return { state: "unscheduled", accessible: true, opensAt, closesAt };
  }
  if (open && now < open) {
    return {
      state: "before",
      accessible: false,
      opensAt,
      closesAt,
      reason: `Ce cours ouvrira le ${formatScheduleMoment(opensAt)}.`,
    };
  }
  if (close && now > close) {
    return {
      state: "after",
      accessible: false,
      opensAt,
      closesAt,
      reason: `Ce cours a été clôturé le ${formatScheduleMoment(closesAt)}.`,
    };
  }
  return { state: "open", accessible: true, opensAt, closesAt };
}

/** Résumé lisible de la fenêtre, pour l'aperçu administrateur. */
export function describeSchedule(rule: CourseScheduleRule | null): string {
  const open = rule?.opensAt ?? null;
  const close = rule?.closesAt ?? null;
  if (!open && !close)
    return "Aucune restriction : le cours est accessible en permanence.";
  if (open && close) {
    return `Accessible du ${formatScheduleMoment(open)} au ${formatScheduleMoment(close)}.`;
  }
  if (open)
    return `Ouvre le ${formatScheduleMoment(open)} (sans date de fermeture).`;
  return `Accessible jusqu'au ${formatScheduleMoment(close)} (ouvert d'emblée).`;
}

/** Indique si la fenêtre est incohérente (fermeture avant ouverture). */
export function isScheduleInverted(rule: CourseScheduleRule | null): boolean {
  const open = parseLocal(rule?.opensAt);
  const close = parseLocal(rule?.closesAt);
  return Boolean(open && close && close <= open);
}
