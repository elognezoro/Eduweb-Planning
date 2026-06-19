import type { UserRole } from "@/lib/roles";
import type { FormationRole } from "@/lib/formations/formation-roles";

/**
 * Modèle d'inscription aux formations EduWeb Planner.
 *
 * Chaque formation est un cours distinct (séminaire, manuel, ensemble de
 * guides) auquel des utilisateurs peuvent être inscrits. L'accès est
 * contrôlé par cours, ce qui permet à un utilisateur d'avoir accès à un
 * cours mais pas à un autre.
 */

/** Types de formations disponibles. */
export type CourseType = "seminaire" | "manuel" | "guides";

/** Méthodes d'inscription autorisées pour un cours. */
export type EnrollmentMethod =
  /** Inscription nominative par un administrateur. */
  | "individual"
  /** Inscription par cohorte (groupe nommé). */
  | "cohort"
  /** Inscription automatique selon le rôle de l'utilisateur. */
  | "role-auto";

/** Origine d'une inscription effective. */
export type EnrollmentSource = "individual" | "cohort" | "role" | "admin";

/** Définition d'un cours dans le catalogue. */
export interface Course {
  /** Identifiant unique stable (slug). */
  id: string;
  type: CourseType;
  /** Titre complet affiché. */
  title: string;
  /** Titre court pour les chips / cartes compactes. */
  shortTitle: string;
  /** Description marketing courte (1-2 phrases). */
  description: string;
  /** Détail pédagogique plus riche (3-5 phrases). */
  longDescription: string;
  /** Route principale du cours. */
  route: string;
  /** Route d'impression / livret (facultative). */
  livretRoute?: string;
  /** Image d'entête (relative à /public). */
  image?: string;
  /** Couleur d'accent pour la carte / le bandeau. */
  accent: "green" | "purple" | "gold" | "blue";
  /** Durée affichée. */
  duration: string;
  /** Public cible. */
  audience: string;
  /** Niveau pédagogique. */
  level: string;
  /** Méthodes d'inscription autorisées (au moins une). */
  enrollmentMethods: EnrollmentMethod[];
  /** Si role-auto est activé : rôles dont l'inscription est automatique. */
  autoEnrollRoles?: UserRole[];
  /** Ordre d'affichage dans le catalogue. */
  order: number;
}

/** Inscription effective d'un utilisateur à un cours. */
export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  /** ISO timestamp. */
  enrolledAt: string;
  /** Nom de la personne ayant procédé à l'inscription. */
  enrolledBy: string;
  source: EnrollmentSource;
  /** Si source = cohort : référence à la cohorte. */
  cohortId?: string | null;
  /** ISO timestamp ou null = sans limite. */
  expiresAt?: string | null;
  notes?: string;
  /**
   * Rôle de l'utilisateur DANS cette formation (admin/gestionnaire/
   * enseignant/tuteur/etudiant). Optionnel : absent = « etudiant ».
   * Voir lib/formations/formation-roles.ts.
   */
  formationRole?: FormationRole;
}

/**
 * Règle d'accès à un module d'un cours.
 *
 * Si `prerequisiteModuleIds` est non vide, l'utilisateur doit avoir
 * complété tous les modules listés pour pouvoir accéder à ce module.
 * Le critère de complétion (`completionMode`) détermine comment un
 * module est considéré comme terminé :
 *  - `manual` : l'utilisateur clique sur « Marquer comme terminé »
 *  - `auto`   : marqué automatiquement à la première visite
 *  - `quiz`   : nécessite un score minimum à un quiz du module
 *
 * L'administrateur peut configurer ces règles par cours et par module
 * via la page `/systeme/formations` (onglet Conditions d'accès).
 */
export interface ModuleAccessRule {
  id: string;
  courseId: string;
  moduleId: string;
  prerequisiteModuleIds: string[];
  completionMode: "manual" | "auto" | "quiz";
  /** Pour `quiz` : score minimum requis en %. Par défaut 70. */
  minQuizScore?: number;
}

/**
 * Règle de réussite d'un cours dans son ensemble.
 *
 * Définie par l'administrateur, elle décrit la condition à remplir
 * pour qu'un participant soit considéré comme ayant **achevé la
 * formation** — ce qui débloque le téléchargement du livret PDF et
 * la délivrance du certificat.
 *
 * Modes disponibles :
 *  - `all-modules` : tous les modules du cours sont complétés
 *  - `quiz-score` : score minimum atteint sur un quiz désigné
 *  - `all-modules-and-quiz` : combinaison des deux (ET logique)
 *  - `manual-admin` : seul l'administrateur peut prononcer la réussite
 */
export interface CourseCompletionRule {
  id: string;
  courseId: string;
  mode: "all-modules" | "quiz-score" | "all-modules-and-quiz" | "manual-admin";
  /** Pour `quiz-score` ou combiné : score minimum (par défaut 70). */
  minQuizScore?: number;
  /**
   * Module portant le quiz comptant pour la réussite. Une valeur
   * spéciale `"quiz-sommatif"` désigne le quiz global du séminaire.
   */
  quizModuleId?: string | null;
  /** Réservé pour usage futur : délivrer automatiquement un certificat. */
  certificateAuto?: boolean;
}

/** Trace de réussite d'un cours par un utilisateur. */
export interface CourseCompletion {
  id: string;
  userId: string;
  courseId: string;
  /** ISO timestamp. */
  completedAt: string;
  source: "auto-modules" | "quiz" | "manual-admin";
  /** Score atteint si source = quiz (en %). */
  score?: number;
  /** Indique si le certificat a déjà été délivré pour cette réussite. */
  certificateDelivered?: boolean;
}

/** Trace de complétion d'un module par un utilisateur. */
export interface ModuleCompletion {
  id: string;
  userId: string;
  courseId: string;
  moduleId: string;
  /** ISO timestamp. */
  completedAt: string;
  /** Source de l'enregistrement. */
  source: "manual" | "auto" | "quiz" | "admin";
  /** Score atteint si source = quiz (en %). */
  score?: number;
}

/** Cohorte = groupe nommé d'utilisateurs inscrits à un cours. */
export interface CourseCohort {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  /** ISO timestamp de création. */
  createdAt: string;
  createdBy: string;
  /** Liste des userId membres de la cohorte. */
  memberUserIds: string[];
}
