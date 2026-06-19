import type { UserRole } from "@/lib/roles";

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
