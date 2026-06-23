/* ============================================================================
   Matières du livret scolaire CI, par cycle, fidèles au modèle 13 pages
   (livret_scolaire_ci_modele_13_pages_eduweb_planner.pdf).

   - 1er cycle (6e → 3e) : page 6 du modèle.
   - 2e cycle (2nde → Tle) : page 8 du modèle.

   Les coefficients ne figurent pas sur le gabarit officiel : on fournit des
   valeurs par défaut raisonnables (modifiables ultérieurement via la
   configuration de l'établissement). La ligne « Conduite » est une matière du
   tableau mais n'entre PAS dans la moyenne générale (`inAverage: false`).
   ========================================================================== */

export type Cycle = 1 | 2;

export interface LivretSubject {
  /** Clé stable (sert d'identifiant de stockage des notes). */
  key: string;
  /** Libellé affiché, tel que sur le modèle officiel. */
  label: string;
  /** Coefficient par défaut. */
  coef: number;
  /** Compte dans la moyenne générale (faux pour « Conduite »). */
  inAverage: boolean;
}

const s = (key: string, label: string, coef: number, inAverage = true): LivretSubject => ({
  key,
  label,
  coef,
  inAverage,
});

/** Matières du 1er cycle (modèle p.6). */
export const CYCLE1_SUBJECTS: LivretSubject[] = [
  s("compo-francaise", "Composition Française", 4),
  s("ortho-grammaire", "Orthographe et grammaire", 2),
  s("latin", "Latin", 1),
  s("langue-1", "Langue I", 3),
  s("langue-2", "Langue II", 2),
  s("histoire", "Histoire", 1),
  s("geographie", "Géographie", 1),
  s("sciences-naturelles", "Sciences Naturelles", 2),
  s("physique-chimie", "Physique-Chimie", 2),
  s("mathematiques", "Mathématiques", 4),
  s("technologie", "Technologie", 1),
  s("dessin", "Dessin", 1),
  s("dessin-scientifique", "Dessin Scientifique", 1),
  s("musique", "Musique", 1),
  s("eps", "Éducation physique", 1),
  s("edhc", "EDHC", 1),
  s("travaux-manuels", "Travaux manuels", 1),
  s("conduite", "Conduite", 1, false),
];

/** Matières du 2e cycle (modèle p.8). */
export const CYCLE2_SUBJECTS: LivretSubject[] = [
  s("philosophie", "Philosophie", 2),
  s("dissertation-francaise", "Dissertation ou Composition Française", 4),
  s("latin-textes", "Latin ou textes anciens traduits", 1),
  s("anglais", "Anglais", 3),
  s("langue-2", "Langue 2", 2),
  s("histoire-geo", "Histoire et Géographie", 2),
  s("sciences-naturelles", "Sciences Naturelles", 2),
  s("physique-chimie", "Physique-Chimie", 3),
  s("mathematiques", "Mathématiques", 4),
  s("sciences-eco-meca", "Sciences économiques ou construction mécanique", 2),
  s("techno-pratique", "Technologie pratique", 1),
  s("technologie", "Technologie", 1),
  s("dessin", "Dessin", 1),
  s("eps", "Éducation physique", 1),
  s("edhc", "EDHC", 1),
  s("conduite", "Conduite", 1, false),
];

export function subjectsForCycle(cycle: Cycle): LivretSubject[] {
  return cycle === 1 ? CYCLE1_SUBJECTS : CYCLE2_SUBJECTS;
}

/**
 * Détermine le cycle (1 ou 2) à partir du libellé de classe.
 * 1er cycle = 6e/5e/4e/3e ; 2e cycle = 2nde/1ère/Tle (et variantes typographiques).
 */
export function cycleOfClassName(className: string): Cycle {
  const c = (className || "").toLowerCase();
  // 2e cycle : seconde, première, terminale (+ formes « 2nde », « 1ère », « Tle », « T<sup>le</sup> »…).
  if (
    c.startsWith("t") || // Terminale / Tle / Tˡᵉ
    c.includes("2nd") ||
    c.includes("2ⁿ") ||
    c.includes("second") ||
    c.includes("1è") ||
    c.includes("1ʳ") ||
    c.includes("1re") ||
    c.includes("prem")
  ) {
    return 2;
  }
  return 1;
}

/** Liste des étapes (classes-jalon) du suivi médical du modèle (p.4). */
export const MEDICAL_STAGES = ["Classe de 6e", "Classe de 3e", "Classe de 1ère"] as const;
