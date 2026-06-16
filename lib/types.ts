import type { UserRole, AccountStatus } from "./roles";
import type { Permission } from "./permissions";

/** Contexte applicatif courant (pays, région, établissement, année, rôle). */
export interface AppContext {
  countryCode: string;
  academicRegionCode: string | null;
  etablissementId: string | null;
  academicYearId: string;
  locale: "fr" | "en";
}

/** Profil utilisateur (vue UI). */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: AccountStatus;
  countryCode: string;
  etablissementId?: string | null;
  academicRegionCode?: string | null;
  jobTitle?: string;
  preferredLocale: "fr" | "en";
  createdAt: string;
  lastLoginAt?: string;
}

export interface Etablissement {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: string;
  countryCode: string;
  academicRegionCode: string;
  locality: string;
  status: "active" | "suspended" | "archived";
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  attendanceRate: number;
  successRate: number;
  subscriptionPlan: string;
  email?: string;
  phone?: string;
  /** Régime (Public, Privé, Confessionnel…). */
  regime?: string;
  /** Année scolaire d'enregistrement (ex. « 2026-2027 »). */
  schoolYear?: string;
}

export interface Eleve {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F";
  birthDate: string;
  className: string;
  average: number;
  attendanceRate: number;
  status: "active" | "suspended";
}

export interface LessonEntry {
  id: string;
  date: string;
  subject: string;
  className: string;
  title: string;
  status: string;
  teacher: string;
  /** Champs détaillés (fiche de séance) — optionnels. */
  type?: string;
  startTime?: string;
  duration?: number;
  situation?: string;
  subtitles?: string[];
  summary?: string;
  learningActivities?: string[];
  evalActivities?: string[];
  nextDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: string;
  date: string;
  scope?: "pays" | "etablissement" | "classe";
  important?: boolean;
  author?: string;
  authorRole?: string;
  views?: number;
  expiresAt?: string;
  audience?: string;
}

/** Centre d'Animation et de Formation Pédagogique. */
export interface Cafop {
  id: string;
  name: string;
  code: string;
  /** Année de formation (ex. « 2026-2027 »). */
  year: string;
  /** Code pays ISO. */
  country: string;
  region: string;
  locality: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  directorContact: string;
  logo?: string | null;
  stamp?: string | null;
  signature?: string | null;
  promotions: number;
  cohortes: number;
  eleves: number;
}

/** Antenne de la Pédagogie et de la Formation Continue (APFC). */
export interface Apfc {
  id: string;
  name: string;
  code: string;
  /** Code pays ISO. */
  country: string;
  region: string;
  locality: string;
  address: string;
  phone: string;
  email: string;
  /** Chef d'antenne / coordonnateur principal. */
  responsable: string;
  responsableContact: string;
  /** Sous-antennes rattachées. */
  antennes: number;
  /** Coordonnateurs disciplinaires. */
  coordonnateurs: number;
}

/** Activité de formation continue organisée par une APFC (enregistrement daté). */
export interface ApfcActivity {
  id: string;
  /** APFC organisatrice. */
  apfcId: string;
  /** Date de l'activité (ISO « AAAA-MM-JJ »). */
  date: string;
  /** Année scolaire de rattachement (ex. « 2026-2027 »). */
  schoolYear: string;
  /** Type d'activité (Atelier, Séminaire, Journée de formation…). */
  type: string;
  /** Intitulé de l'activité. */
  title: string;
}

export interface Enseignant {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  classesCount: number;
  inspectionScore: number;
  lessonBookRate: number;
  attendanceRate: number;
  status: AccountStatus;
}

export type RecommendationStatus = "open" | "in_progress" | "done" | "overdue";
export type Priority = "low" | "medium" | "high";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: Priority;
  status: RecommendationStatus;
  dueDate: string;
  progress: number;
}

export type InspectionStatus = "planned" | "in_progress" | "completed" | "cancelled";

export interface Inspection {
  id: string;
  teacher: string;
  inspector: string;
  etablissement: string;
  subject: string;
  className: string;
  plannedAt: string;
  status: InspectionStatus;
  globalScore?: number;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
  metadata?: Record<string, string | number>;
}

export interface KpiData {
  label: string;
  value: string | number;
  delta?: number;
  hint?: string;
  tone?: "green" | "blue" | "gold" | "purple" | "red" | "slate";
  icon?: string;
}

/** Surcharges d'habilitation au niveau utilisateur. */
export interface PermissionOverrides {
  granted: Permission[];
  revoked: Permission[];
}
