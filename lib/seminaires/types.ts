/**
 * Architecture de données pour les séminaires de formation EduWeb Planner.
 *
 * Un séminaire est une formation thématique, déclinable en plusieurs formats
 * (autoformation, classes virtuelles, atelier en présentiel), avec des modules
 * pédagogiques, des activités interactives, des quiz, des grilles d'évaluation
 * et des livrables.
 *
 * Ce schéma est volontairement riche pour absorber des contenus académiques
 * complexes (Magnifica Humanitas, etc.) sans perte de structure.
 */

export type SeminaireFamily = "doctrinal" | "pedagogique" | "technique" | "ethique";

export interface SeminaireMeta {
  /** Identifiant URL-safe. */
  slug: string;
  /** Titre principal affiché. */
  title: string;
  /** Sous-titre / accroche. */
  subtitle: string;
  /** Document de référence (encyclique, code, programme, etc.). */
  reference: string;
  /** Date de rédaction ou de publication du document de référence. */
  referenceDate?: string;
  /** Type de cours / format dominant. */
  courseType: string;
  /** Langue principale (code ISO). */
  language: string;
  /** Durée totale conseillée (libellé long). */
  duration: string;
  /** Public cible. */
  audience: string;
  /** Niveau (initiation, perfectionnement, etc.). */
  level: string;
  /** Critères de complétion globaux. */
  completion: string;
  /** Modalité pédagogique dominante (autoformation, classes virtuelles, ateliers). */
  format?: string;
  /** Note d'auteur / portée d'utilisation du support pédagogique. */
  authoringNote?: string;
  /** Famille thématique pour le filtrage dans la bibliothèque. */
  family: SeminaireFamily;
  /** Présentation générale (1-3 paragraphes). */
  presentation: string[];
}

/** Bloc de contenu type d'un module (texte, liste, table, etc.). */
export type SeminaireBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "bulletList"; items: string[]; intro?: string }
  | { kind: "numberedList"; items: string[]; intro?: string }
  | { kind: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { kind: "callout"; label: string; tone: "info" | "warning" | "success" | "spiritual"; text: string }
  | { kind: "principle"; num: number; title: string; description: string; application: string }
  | { kind: "deviation"; num: number; title: string; description: string; risks: string[]; solution: string }
  | { kind: "domain"; num: number; title: string; items: string[] }
  | { kind: "subheading"; level: 2 | 3 | 4; text: string };

/** Activité interactive d'un module. */
export interface SeminaireActivity {
  id: string;
  num: string;
  title: string;
  kind:
    | "survey"
    | "forum"
    | "qcm"
    | "mindmap"
    | "debate"
    | "truefalse"
    | "dragdrop"
    | "case"
    | "collab"
    | "vote"
    | "scenario"
    | "cartography"
    | "audit"
    | "workshop"
    | "charte"
    | "autoeval"
    | "engagement";
  /** Outil LMS / atelier recommandé (Padlet, H5P, Moodle Quiz, etc.). */
  recommendation?: string;
  /** Consigne(s) — texte multi-paragraphes possibles. */
  instructions: string[];
  /** Question principale (survey, qcm). */
  question?: string;
  /** Options de réponse (survey, qcm). */
  options?: string[];
  /** Exploitation pédagogique post-activité (sondage). */
  exploitation?: string;
  /** Banque de QCM auto-corrigée. */
  qcm?: { question: string; options: string[]; correctIdx: number }[];
  /** Affirmations Vrai / Faux. */
  truefalse?: { statement: string; answer: "Vrai" | "Faux"; explanation?: string }[];
  /** Cartes d'association (drag-drop). */
  matchings?: { situation: string; principle: string }[];
  /** Étapes d'un scénario à embranchements. */
  steps?: { num: number; description: string; choices: string[]; bestIdx: number }[];
  /** Étude de cas. */
  caseStudy?: { description: string; questions: string[]; production: string };
  /** Table modèle à remplir (cartographie des risques, audit). */
  tableHeaders?: string[];
  /** Exemple de remplissage attendu. */
  example?: { label: string; content: string }[];
  /** Livrable attendu. */
  deliverable?: string;
  /** Critères de présentation (oral). */
  presentationCriteria?: string[];
}

/** Module pédagogique. */
export interface SeminaireModule {
  id: string;
  num: number;
  /** Titre brut (ex. « Module 1 — Comprendre l'encyclique »). */
  title: string;
  /** Titre affiché (poétique / pédagogique). */
  displayTitle: string;
  /** Durée estimée. */
  duration: string;
  /** Objectif pédagogique global. */
  objective: string;
  /** Message d'accueil (module 0). */
  welcomeMessage?: string;
  /** Résumé pédagogique introductif. */
  resume?: string;
  /** Liste « À retenir ». */
  retain?: string[];
  /** Message central distillé. */
  centralMessage?: string;
  /** Blocs de contenu principal (mix paragraphes / listes / tables). */
  content: SeminaireBlock[];
  /** Activités du module. */
  activities: SeminaireActivity[];
  /** Critères d'achèvement. */
  achievement: string[];
}

/** Quiz d'évaluation globale (banque LMS). */
export interface SeminaireQuiz {
  id: string;
  num: number;
  title: string;
  questions: {
    num: number;
    question: string;
    options: string[];
    correctIdx: number;
    rationale?: string;
  }[];
}

/** Activité H5P recommandée. */
export interface SeminaireH5P {
  id: string;
  num: number;
  toolKind: "course-presentation" | "branching-scenario" | "drag-words" | "dialog-cards";
  title: string;
  displayTitle: string;
  description?: string;
  slides?: string[];
  outcomes?: string[];
  fillInText?: string;
  cards?: string[];
}

/** Engagement de la charte d'usage responsable. */
export interface ChartEngagement {
  num: number;
  title: string;
  description: string;
}

/** Grille d'évaluation projet final. */
export interface EvaluationGrid {
  criteria: { criterion: string; points: number }[];
  totalPoints: number;
  levels: { range: string; label: string }[];
}

/** Badge numérique. */
export interface SeminaireBadge {
  num: number;
  title: string;
  condition: string;
}

/** Programme condensé (1 jour ou 2 jours). */
export interface SeminaireSchedule {
  label: string;
  totalDuration: string;
  days?: { num: number; rows: { hours: string; activity: string }[] }[];
  rows?: { hours: string; activity: string }[];
}

/** Section du guide formateur. */
export interface FormateurGuide {
  before: string[];
  during: string[];
  after: string[];
}

/** Plan d'action post-formation. */
export interface ActionPlan {
  followUpDays: number;
  questions: string[];
  forumTitle: string;
  forumInstruction: string;
}

/** Note d'intégration LMS. */
export interface LmsIntegration {
  platform: string;
  steps: string[];
}

/** Prompt génératif (vidéo, infographie). */
export interface GenerativePrompt {
  kind: "video" | "infographic";
  title: string;
  description: string;
}

/** Synthèse finale (cinq verbes, par exemple). */
export interface SyntheseVerbe {
  num: number;
  verb: string;
  description: string;
}

/** Architecture pédagogique LMS (vue d'ensemble du parcours). */
export interface ArchitectureRow {
  section: string;
  contentType: string;
  activity: string;
  evaluation: string;
}

/** Compétence visée. */
export interface CompetenceCategory {
  category: string;
  items: string[];
}

/** Repère synthèse à retenir. */
export interface Reference10 {
  num: number;
  text: string;
}

/** Entrée glossaire. */
export interface GlossaryEntry {
  term: string;
  definition: string;
}

/** Le séminaire complet, agrégat de tout ce qui précède. */
export interface Seminaire {
  meta: SeminaireMeta;
  objectives: string[];
  competences: CompetenceCategory[];
  architecture: ArchitectureRow[];
  modules: SeminaireModule[];
  quizzes: SeminaireQuiz[];
  h5pActivities: SeminaireH5P[];
  evaluation: EvaluationGrid;
  badges: SeminaireBadge[];
  formateur: FormateurGuide;
  actionPlan: ActionPlan;
  scheduleShort: SeminaireSchedule;
  scheduleLong: SeminaireSchedule;
  achievement: { autoCriteria: string[]; weights: { element: string; weight: string }[] };
  closingMessage: string;
  references10: Reference10[];
  glossary: GlossaryEntry[];
  resources: { kind: "principale" | "pedagogique"; items: string[] }[];
  integrations: LmsIntegration[];
  prompts: GenerativePrompt[];
  charte: {
    preambule: string;
    engagements: ChartEngagement[];
    implementation: string[];
  };
  synthese: SyntheseVerbe[];
}
