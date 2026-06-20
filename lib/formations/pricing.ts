import type { CoursePrice } from "@/lib/formations/types";

/* ============================================================================
   Tarification des cours (FCFA) et équivalent en euros.

   Le franc CFA (XOF) est arrimé à l'euro à une parité FIXE et légale :
   1 € = 655,957 FCFA. L'équivalent en euros d'un montant en FCFA est donc
   déterministe — aucune table de change ni saisie d'un taux n'est nécessaire.
   ========================================================================== */

/** Parité légale fixe XOF ↔ EUR. */
export const XOF_PER_EUR = 655.957;

/** Récupère le tarif d'un cours, ou `null` si aucun n'est défini. */
export function getCoursePrice(
  courseId: string,
  prices: CoursePrice[],
): CoursePrice | null {
  return prices.find((p) => p.courseId === courseId) ?? null;
}

/** Montant en FCFA d'un cours (0 si gratuit / non tarifé). */
export function coursePriceFcfa(
  courseId: string,
  prices: CoursePrice[],
): number {
  const p = getCoursePrice(courseId, prices);
  return p && p.amountFcfa > 0 ? p.amountFcfa : 0;
}

/** Un cours est payant si un tarif strictement positif est défini. */
export function isCoursePaid(courseId: string, prices: CoursePrice[]): boolean {
  return coursePriceFcfa(courseId, prices) > 0;
}

/** Convertit un montant FCFA en euros (parité fixe). */
export function fcfaToEur(amountFcfa: number): number {
  return amountFcfa / XOF_PER_EUR;
}

/** Formate un montant FCFA (séparateurs de milliers + « FCFA »). */
export function formatFcfa(amountFcfa: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amountFcfa))} FCFA`;
}

/** Formate l'équivalent en euros d'un montant FCFA (préfixe « ≈ »). */
export function formatEurEquivalent(amountFcfa: number): string {
  const eur = fcfaToEur(amountFcfa);
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(eur);
  return `≈ ${formatted}`;
}

/** Libellé combiné « 10 000 FCFA (≈ 15,25 €) ». */
export function formatPrice(amountFcfa: number): string {
  if (amountFcfa <= 0) return "Gratuit";
  return `${formatFcfa(amountFcfa)} (${formatEurEquivalent(amountFcfa)})`;
}
