/**
 * Référentiels pédagogiques par pays : cycles, niveaux, disciplines, périodes.
 * Génériques et configurables — non codés en dur dans le métier.
 */

export interface EducationCycle {
  code: string;
  label: string;
}

export interface EducationLevel {
  code: string;
  label: string;
  cycle: string;
}

export interface SubjectSeed {
  code: string;
  label: string;
  color: string;
}

export interface TermSeed {
  code: string;
  label: string;
}

export interface EducationSystem {
  countryCode: string;
  cycles: EducationCycle[];
  levels: EducationLevel[];
  subjects: SubjectSeed[];
  terms: TermSeed[];
}

export const EDUCATION_SYSTEMS: Record<string, EducationSystem> = {
  CI: {
    countryCode: "CI",
    cycles: [
      { code: "prescolaire", label: "Préscolaire" },
      { code: "primaire", label: "Primaire" },
      { code: "premier_cycle", label: "Premier cycle (Collège)" },
      { code: "second_cycle", label: "Second cycle (Lycée)" },
    ],
    levels: [
      { code: "6e", label: "6ᵉ", cycle: "premier_cycle" },
      { code: "5e", label: "5ᵉ", cycle: "premier_cycle" },
      { code: "4e", label: "4ᵉ", cycle: "premier_cycle" },
      { code: "3e", label: "3ᵉ", cycle: "premier_cycle" },
      { code: "2nde", label: "2ⁿᵈᵉ", cycle: "second_cycle" },
      { code: "1ere", label: "1ʳᵉ", cycle: "second_cycle" },
      { code: "tle", label: "Tˡᵉ", cycle: "second_cycle" },
    ],
    subjects: [
      { code: "fr", label: "Français", color: "#2563eb" },
      { code: "maths", label: "Mathématiques", color: "#176b45" },
      { code: "pc", label: "Physique-Chimie", color: "#7c3aed" },
      { code: "svt", label: "SVT", color: "#16a34a" },
      { code: "hg", label: "Histoire-Géographie", color: "#ea580c" },
      { code: "ang", label: "Anglais", color: "#dc2626" },
      { code: "philo", label: "Philosophie", color: "#0891b2" },
      { code: "edhc", label: "EDHC", color: "#d99a1e" },
      { code: "eps", label: "EPS", color: "#65a30d" },
      { code: "esp", label: "Espagnol", color: "#db2777" },
      { code: "all", label: "Allemand", color: "#475569" },
    ],
    terms: [
      { code: "t1", label: "1ᵉʳ Trimestre" },
      { code: "t2", label: "2ᵉ Trimestre" },
      { code: "t3", label: "3ᵉ Trimestre" },
    ],
  },
};

export function getEducationSystem(countryCode: string): EducationSystem {
  return EDUCATION_SYSTEMS[countryCode] ?? EDUCATION_SYSTEMS.CI;
}
