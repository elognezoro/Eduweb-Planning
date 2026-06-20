/* ============================================================================
   Découpage en MODULES des séminaires SENEC (Communication pastorale,
   IA & communication).

   Ces deux cours sont lus en mode « livre » (composant MagnificaBook) : une
   page = une rubrique. On regroupe ces pages en modules cohérents afin :
   - d'activer la garde d'accès par module (prérequis) et le marquage
     « module terminé » dans le lecteur ;
   - d'alimenter getCourseModuleList(), donc les onglets admin « Conditions
     d'accès » et « Réussite du cours » (condition par défaut : tous les
     modules complétés).

   La structure ci-dessous mappe chaque module à la liste des `id` de pages
   (BookPage) qui le composent, dans l'ordre de parcours. Les pages annexes
   (glossaire, clôture, protocole, repères) restent hors module.
   ========================================================================== */

export interface SenecModule {
  /** Identifiant stable, unique au sein du cours. */
  id: string;
  /** Ordre / numéro affiché. */
  num: number;
  /** Titre complet (admin + en-tête). */
  title: string;
  /** Titre court d'affichage dans le lecteur. */
  displayTitle: string;
  /** `id` des BookPage rattachées à ce module, dans l'ordre. */
  pageIds: string[];
}

/** Communication pastorale (SENEC) — 4 modules. */
export const COMMUNICATION_PASTORALE_MODULES: SenecModule[] = [
  {
    id: "m1",
    num: 1,
    title: "Présentation et objectifs",
    displayTitle: "Cadrer le séminaire et ses objectifs",
    pageIds: ["schedule", "presentation", "objectives"],
  },
  {
    id: "m2",
    num: 2,
    title: "Diapositives et méthodes",
    displayTitle: "Le contenu : diapositives, RAPIDE et 4V",
    pageIds: ["slides", "methods"],
  },
  {
    id: "m3",
    num: 3,
    title: "Ateliers pratiques",
    displayTitle: "Passer à la pratique",
    pageIds: ["workshops"],
  },
  {
    id: "m4",
    num: 4,
    title: "Auto-évaluation et repères",
    displayTitle: "Évaluer ses acquis et retenir l'essentiel",
    pageIds: ["self-evaluation", "landmarks"],
  },
];

/** IA & communication (SENEC) — 5 modules. */
export const IA_COMMUNICATION_MODULES: SenecModule[] = [
  {
    id: "m1",
    num: 1,
    title: "Présentation et diagnostic",
    displayTitle: "Cadrer l'IA et diagnostiquer sa maturité",
    pageIds: ["schedule", "presentation", "objectives", "slides", "diagnostic"],
  },
  {
    id: "m2",
    num: 2,
    title: "Comprendre l'IA et ses usages",
    displayTitle: "Apports et limites de l'IA en communication",
    pageIds: ["module-usages"],
  },
  {
    id: "m3",
    num: 3,
    title: "Bien prompter et produire",
    displayTitle: "La méthode P.A.S.T.O.R.A.L.",
    pageIds: ["module-prompt"],
  },
  {
    id: "m4",
    num: 4,
    title: "Éthique, risques et validation",
    displayTitle: "La règle des 5 V avant publication",
    pageIds: ["module-ethique"],
  },
  {
    id: "m5",
    num: 5,
    title: "Atelier, auto-évaluation et engagement",
    displayTitle: "Mettre en pratique et s'engager",
    pageIds: ["atelier-pratique", "self-evaluation", "evaluations"],
  },
];

/** Table cours → modules. */
export const SENEC_MODULES: Record<string, SenecModule[]> = {
  "communication-pastorale": COMMUNICATION_PASTORALE_MODULES,
  "ia-communication": IA_COMMUNICATION_MODULES,
};

/** Modules d'un cours SENEC (vide si le cours n'en a pas). */
export function senecModules(courseId: string): SenecModule[] {
  return SENEC_MODULES[courseId] ?? [];
}

/** Module auquel appartient une page, ou `undefined` (page annexe). */
export function moduleIdForPage(
  courseId: string,
  pageId: string,
): string | undefined {
  return senecModules(courseId).find((m) => m.pageIds.includes(pageId))?.id;
}

/** Dernière page d'un module ? (pour placer le bouton « terminé »). */
export function isLastPageOfModule(
  courseId: string,
  moduleId: string,
  pageId: string,
): boolean {
  const mod = senecModules(courseId).find((m) => m.id === moduleId);
  if (!mod) return false;
  return mod.pageIds[mod.pageIds.length - 1] === pageId;
}
