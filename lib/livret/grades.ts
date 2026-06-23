/* ============================================================================
   Source de notes PARTAGÉE du livret scolaire.

   Modèle : une note = moyenne d'une matière, pour un (élève, année, matière,
   trimestre). C'est le niveau exploité par le livret (tableaux p.6 / p.8) et le
   niveau auquel la saisie (notes-bulletins) écrira.

   Principe « source partagée + repli auto » :
   - si une note est saisie pour (élève, matière, trimestre) → on l'utilise ;
   - sinon → repli sur une valeur AUTO déterministe (seed) pour que le livret
     reste rempli même sans saisie. Le repli est stable (même valeur à chaque
     rendu/export) et reproductible.

   Aucune dépendance React/Supabase : pur calcul, réutilisable côté UI, store,
   export et tests.
   ========================================================================== */

import { subjectsForCycle, type Cycle } from "./subjects";

export type TermIndex = 0 | 1 | 2;
export const TERMS: TermIndex[] = [0, 1, 2];
export const TERM_LABELS = ["1er Trimestre", "2e Trimestre", "3e Trimestre"] as const;

/** Une moyenne de matière pour (élève, année, matière, trimestre). */
export interface LivretGradeEntry {
  id: string;
  studentId: string;
  /** « AAAA-AAAA » (ex. 2025-2026). */
  schoolYear: string;
  subjectKey: string;
  period: TermIndex;
  /** Moyenne /20. */
  moy: number;
  updatedAt: string;
  updatedBy?: string | null;
}

/** Clé naturelle d'une note (unicité élève+année+matière+trimestre). */
export function gradeKey(
  e: Pick<LivretGradeEntry, "studentId" | "schoolYear" | "subjectKey" | "period">,
): string {
  return `${e.studentId}|${e.schoolYear}|${e.subjectKey}|${e.period}`;
}

const seedOf = (str: string): number =>
  [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Valeur AUTO (repli) déterministe d'une moyenne de matière, 6.0 → 19.5. */
export function seededSubjectMoy(
  studentId: string,
  subjectKey: string,
  period: TermIndex,
): number {
  const sd = seedOf(`${studentId}|${subjectKey}|${period}`);
  return round2(Math.min(19.5, Math.max(6, 8 + (sd % 23) * 0.5)));
}

/**
 * Index des notes saisies par clé naturelle, pour des lectures O(1).
 * `gradeBank(entries)` une fois, puis interrogations multiples.
 */
export function gradeBank(entries: LivretGradeEntry[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of entries) m.set(gradeKey(e), e.moy);
  return m;
}

/** Moyenne d'une matière pour un trimestre : saisie si présente, sinon repli auto. */
export function subjectMoy(
  bank: Map<string, number>,
  studentId: string,
  schoolYear: string,
  subjectKey: string,
  period: TermIndex,
): number {
  const k = gradeKey({ studentId, schoolYear, subjectKey, period });
  const v = bank.get(k);
  return v != null ? v : seededSubjectMoy(studentId, subjectKey, period);
}

/** Moyenne générale (pondérée par coefficients) d'un élève sur un trimestre. */
export function termGeneralAverage(
  bank: Map<string, number>,
  studentId: string,
  schoolYear: string,
  cycle: Cycle,
  period: TermIndex,
): number {
  let num = 0;
  let den = 0;
  for (const subj of subjectsForCycle(cycle)) {
    if (!subj.inAverage) continue;
    const m = subjectMoy(bank, studentId, schoolYear, subj.key, period);
    num += m * subj.coef;
    den += subj.coef;
  }
  return den ? round2(num / den) : 0;
}

/** Moyenne générale ANNUELLE = moyenne des trois trimestres. */
export function annualGeneralAverage(
  bank: Map<string, number>,
  studentId: string,
  schoolYear: string,
  cycle: Cycle,
): number {
  const t = TERMS.map((p) => termGeneralAverage(bank, studentId, schoolYear, cycle, p));
  return round2(t.reduce((a, b) => a + b, 0) / t.length);
}

/**
 * Rang (place) d'un élève dans sa classe pour un trimestre, calculé en comparant
 * sa moyenne générale à celle de tous ses camarades. 1 = meilleur.
 */
export function termClassRank(
  bank: Map<string, number>,
  classmates: { id: string }[],
  studentId: string,
  schoolYear: string,
  cycle: Cycle,
  period: TermIndex,
): number {
  const target = termGeneralAverage(bank, studentId, schoolYear, cycle, period);
  let better = 0;
  for (const c of classmates) {
    if (c.id === studentId) continue;
    if (termGeneralAverage(bank, c.id, schoolYear, cycle, period) > target) better += 1;
  }
  return better + 1;
}

/** Place d'un élève pour une matière donnée et un trimestre (rang sur cette matière). */
export function subjectClassPlace(
  bank: Map<string, number>,
  classmates: { id: string }[],
  studentId: string,
  schoolYear: string,
  subjectKey: string,
  period: TermIndex,
): number {
  const target = subjectMoy(bank, studentId, schoolYear, subjectKey, period);
  let better = 0;
  for (const c of classmates) {
    if (c.id === studentId) continue;
    if (subjectMoy(bank, c.id, schoolYear, subjectKey, period) > target) better += 1;
  }
  return better + 1;
}

/** Rang ANNUEL : moyenne (arrondie) des rangs trimestriels. */
export function annualClassRank(
  bank: Map<string, number>,
  classmates: { id: string }[],
  studentId: string,
  schoolYear: string,
  cycle: Cycle,
): number {
  const r = TERMS.map((p) => termClassRank(bank, classmates, studentId, schoolYear, cycle, p));
  return Math.round(r.reduce((a, b) => a + b, 0) / r.length);
}
