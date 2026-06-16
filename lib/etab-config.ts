import { getUnCountry, flagUrl } from "@/config/un-countries";

/**
 * Lecture de la configuration d'établissement (saisie sur /parametrage/configuration,
 * persistée dans localStorage) pour alimenter les en-têtes de bulletins et d'exports.
 * Découplé de la page de configuration : on lit seulement les champs utiles.
 */
export interface StoredEtabConfig {
  countryCode?: string;
  slogan?: string;
  schoolYear?: string;
  ministry?: string;
  regionalDirection?: string;
  name?: string;
  type?: string;
  regime?: string;
  sequenceCount?: number;
  code?: string;
  locality?: string;
  headFunction?: string;
  headName?: string;
  logo?: string | null;
  stamp?: string | null;
  signature?: string | null;
  /** Emblème national (armoiries). Si absent, le drapeau du pays est utilisé. */
  nationalEmblem?: string | null;
  /** Plan par défaut du rapport d'établissement (structure : titres/sous-titres). */
  reportPlan?: string;
  /** Présentation par défaut du rapport d'établissement (accordeon | synthese | tableau). */
  reportFormat?: string;
  schedule?: {
    startMorning?: string;
    breakStart?: string;
    breakEnd?: string;
    lunchStart?: string;
    afternoonStart?: string;
    endDay?: string;
  };
  levels?: { id: string; name: string }[];
}

export const ETAB_CONFIG_KEY = "eduweb.etab-config.v1";

export function loadEtabConfig(): StoredEtabConfig {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ETAB_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as StoredEtabConfig) : {};
  } catch {
    return {};
  }
}

export interface EtabExportMeta {
  countryName: string;
  official: string;
  ministry: string;
  slogan: string;
  schoolYear: string;
  institution: string;
  headFunction: string;
  headName: string;
  logo: string | null;
  stamp: string | null;
  signature: string | null;
  /** Emblème national prêt à l'affichage (armoiries uploadées, sinon drapeau du pays). */
  nationalEmblem: string | null;
  regionalDirection: string;
  code: string;
  type: string;
  regimeLabel: string;
  locality: string;
  /** Plan par défaut du rapport d'établissement. */
  reportPlan: string;
  /** Présentation par défaut du rapport d'établissement. */
  reportFormat: string;
}

/** Plans (structures) proposés pour le rapport d'établissement. */
export const REPORT_PLAN_OPTIONS = [
  { id: "officiel", name: "Plan officiel (M.E.N.A.)" },
  { id: "synthetique", name: "Plan synthétique (court)" },
  { id: "detaille", name: "Plan détaillé (par domaines)" },
];

/** Présentations proposées pour le rapport d'établissement. */
export const REPORT_FORMAT_OPTIONS = [
  { id: "accordeon", name: "Accordéon" },
  { id: "synthese", name: "Synthèse (compacte)" },
  { id: "tableau", name: "Vue tableau" },
];

export interface SchedulePeriod {
  label: string;
  start: string;
  end: string;
}

const DEFAULT_SCHED = {
  startMorning: "07:30",
  breakStart: "09:25",
  breakEnd: "09:45",
  lunchStart: "12:00",
  afternoonStart: "14:00",
  endDay: "17:00",
};

/** Créneaux horaires dérivés des horaires journaliers de la configuration. */
export function etabSchedulePeriods(cfg: StoredEtabConfig = loadEtabConfig()): SchedulePeriod[] {
  const s = { ...DEFAULT_SCHED, ...(cfg.schedule ?? {}) };
  return [
    { label: "Matinée — 1", start: s.startMorning, end: s.breakStart },
    { label: "Matinée — 2", start: s.breakEnd, end: s.lunchStart },
    { label: "Après-midi", start: s.afternoonStart, end: s.endDay },
  ];
}

/** Niveaux configurés (pour les sélecteurs de classe). */
export function etabLevels(cfg: StoredEtabConfig = loadEtabConfig()): { id: string; name: string }[] {
  return cfg.levels?.length ? cfg.levels : [];
}

export interface BulletinPeriod {
  label: string;
  short: string;
}

/**
 * Périodes de bulletin dérivées du régime configuré :
 *  - trimestre → Trimestre 1..3
 *  - semestre  → Semestre 1..2
 *  - séquence  → Séquence 1..N (N = nombre de séquences paramétré)
 */
export function etabPeriods(cfg: StoredEtabConfig = loadEtabConfig()): BulletinPeriod[] {
  if (cfg.regime === "semestre") {
    return [1, 2].map((n) => ({ label: `Semestre ${n}`, short: `Sem. ${n}` }));
  }
  if (cfg.regime === "sequence") {
    const n = Math.max(1, Math.min(20, cfg.sequenceCount ?? 6));
    return Array.from({ length: n }, (_, i) => ({ label: `Séquence ${i + 1}`, short: `Séq. ${i + 1}` }));
  }
  return [1, 2, 3].map((n) => ({ label: `Trimestre ${n}`, short: `Trim. ${n}` }));
}

/**
 * Emblèmes nationaux (armoiries) fournis avec l'application, par code pays ISO.
 * À défaut d'armoiries fournies pour un pays, on retombe sur le drapeau.
 */
const NATIONAL_EMBLEMS: Record<string, string> = {
  CI: "/emblems/ci.png",
};

/** Emblème national par défaut d'un pays : armoiries fournies si disponibles, sinon drapeau. */
export function defaultNationalEmblem(code: string): string {
  const c = (code || "CI").toUpperCase();
  return NATIONAL_EMBLEMS[c] ?? flagUrl(c, "large");
}

/** Métadonnées institutionnelles prêtes pour un ReportPayload. */
export function etabExportMeta(cfg: StoredEtabConfig = loadEtabConfig()): EtabExportMeta {
  const country = getUnCountry(cfg.countryCode ?? "CI");
  return {
    countryName: country?.name ?? "Côte d'Ivoire",
    official: country?.official ?? "RÉPUBLIQUE DE CÔTE D'IVOIRE",
    ministry: cfg.ministry ?? country?.ministry ?? "MINISTÈRE DE L'ÉDUCATION NATIONALE",
    slogan: cfg.slogan ?? country?.devise ?? "",
    schoolYear: cfg.schoolYear ?? "2025-2026",
    institution: cfg.name || "Établissement",
    headFunction: cfg.headFunction ?? "",
    headName: cfg.headName ?? "",
    logo: cfg.logo ?? null,
    stamp: cfg.stamp ?? null,
    signature: cfg.signature ?? null,
    nationalEmblem: cfg.nationalEmblem ?? defaultNationalEmblem(cfg.countryCode ?? "CI"),
    regionalDirection: cfg.regionalDirection ?? "",
    code: cfg.code ?? "",
    type: cfg.type ?? "",
    regimeLabel:
      cfg.regime === "semestre"
        ? "Semestriel"
        : cfg.regime === "sequence"
          ? `Séquentiel (${cfg.sequenceCount ?? 6} séquences)`
          : "Trimestriel",
    locality: cfg.locality ?? "",
    reportPlan: cfg.reportPlan ?? "officiel",
    reportFormat: cfg.reportFormat ?? "accordeon",
  };
}
