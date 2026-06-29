"use client";

import * as React from "react";
import {
  matrixSubmissionId,
  matrixReviewId,
  seminarProductionId,
} from "@/lib/seminaires/production-keys";
import {
  USER_DIRECTORY,
  ETABLISSEMENTS,
  LESSON_BOOK_ENTRIES,
  ANNOUNCEMENTS,
  APPOINTMENTS,
  INSPECTIONS,
  CAFOPS_SEED,
  APFCS_SEED,
  APFC_ACTIVITIES_SEED,
  type DirectoryUser,
} from "@/lib/mock-data";
import type {
  Apfc,
  ApfcActivity,
  Cafop,
  Etablissement,
  Inspection,
} from "@/lib/types";
import type { AcademicRegionSeed } from "@/config/countries";
import {
  hasPermission,
  PERMISSION_LABELS,
  type Permission,
} from "@/lib/permissions";
import { generateUserUid } from "@/lib/uid";
import type { UserRole } from "@/lib/roles";
import type {
  CourseCohort,
  CourseCompletion,
  CourseCompletionRule,
  CourseEnrollment,
  CoursePrice,
  CourseScheduleRule,
  ModuleAccessRule,
  ModuleCompletion,
} from "@/lib/formations/types";
import type { FormationRole } from "@/lib/formations/formation-roles";
import type { EnrollmentInviteLink } from "@/lib/formations/enrollment-invite";
import {
  DEFAULT_PAYMENT_SETTINGS,
  type CoursePayment,
  type PaymentSettings,
} from "@/lib/formations/payment";
import type {
  SupportAccessRule,
  SupportKind,
} from "@/lib/formations/support-access";
import type { CertificateConfig } from "@/lib/formations/certificate";
import { getCourseCompletionRule } from "@/lib/formations/course-completion";
import { getCourseModuleList } from "@/lib/formations/module-access";
import { keepEarliestPerBucket } from "@/lib/formations/enrollment";
import type { LivretRecord, LivretOverrides } from "@/lib/livret/types";
import { gradeKey, type LivretGradeEntry } from "@/lib/livret/grades";
import { mergeLivretOverrides } from "@/lib/livret/overrides";

type LessonEntry = (typeof LESSON_BOOK_ENTRIES)[number];
type Announcement = (typeof ANNOUNCEMENTS)[number];
type Appointment = (typeof APPOINTMENTS)[number];

/** Ligne d'appel persistée (registre d'appel) — clé = `${classe}|${date}|${séance}|${élève}`. */
export interface AttendanceRow {
  status: "P" | "A" | "R";
  motif: string;
  enc: { text: string; at: string }[];
  obs: { text: string; at: string }[];
  inf: { text: string; acc: string; at: string }[];
}

/** Structure régionale (DRENA/DRENAET) personnalisable, avec ses indicateurs. */
export interface RegionalStructure {
  id: string;
  name: string;
  etablissements: number;
  eleves: number;
  enseignants: number;
  reussite: number;
}

/** Attribution de permission spécifique et temporaire à un utilisateur. */
export interface UserGrant {
  id: string;
  userId: string;
  permission: Permission;
  grantedAt: string;
  /** ISO ; null = sans limite de durée. */
  expiresAt: string | null;
  /** Activité spécifique visée (ex. « Conseil de classe du 20/06 ») ; null = général. */
  activity?: string | null;
  /** Auteur de l'attribution (traçabilité). */
  grantedBy?: string;
}

/** Entrée du journal des habilitations (traçabilité attribution/révocation). */
export interface GrantLogEntry {
  id: string;
  at: string;
  actor: string;
  action: "grant" | "revoke";
  users: string[];
  permissions: string[];
  activity: string | null;
  justification: string;
  durationLabel?: string;
}

const GRANT_LOG_SEED: GrantLogEntry[] = [
  {
    id: "gl-1",
    at: "2026-06-08T09:12:00Z",
    actor: "ZORO Elogne Guessan",
    action: "grant",
    users: ["Paul Kouassi"],
    permissions: ["Saisir les notes"],
    activity: "Rattrapage des notes — Trimestre 3",
    justification: "Nomination comme correcteur principal.",
    durationLabel: "30 jours",
  },
  {
    id: "gl-2",
    at: "2026-06-01T14:30:00Z",
    actor: "ZORO Elogne Guessan",
    action: "grant",
    users: ["Hélène Brou"],
    permissions: ["Gérer les emplois du temps"],
    activity: null,
    justification: "Intérim de direction.",
    durationLabel: "Fin d'année scolaire",
  },
  {
    id: "gl-3",
    at: "2026-05-21T08:05:00Z",
    actor: "ZORO Elogne Guessan",
    action: "revoke",
    users: ["Service CAFOP"],
    permissions: ["Exporter en Word"],
    activity: null,
    justification: "Fin de la campagne de rapports.",
  },
];

/** Demande de code promo de réduction (Académie Premium). */
export interface PromoRequest {
  id: string;
  requester: string;
  requesterRole: string;
  etablissement: string;
  type: string;
  pct: number;
  justification: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  /** Code généré à l'approbation. */
  code?: string;
  decidedBy?: string;
  decidedAt?: string;
  /** Motif du refus. */
  reason?: string;
}

const PROMO_REQUESTS_SEED: PromoRequest[] = [
  {
    id: "pr-1",
    requester: "KOUADIO Daniel",
    requesterRole: "Parent d'élève",
    etablissement: "LM Cocody",
    type: "IZEN Allocation – Soutien 50%",
    pct: 50,
    justification:
      "Famille bénéficiaire des allocations de la Fondation IZEN — deux enfants scolarisés.",
    requestedAt: "2026-06-10T09:15:00Z",
    status: "pending",
  },
  {
    id: "pr-2",
    requester: "BAMBA Fatoumata",
    requesterRole: "Parent d'élève",
    etablissement: "CM Treichville",
    type: "IZEN Allocation – Soutien complet",
    pct: 100,
    justification: "Étudiante boursière IZEN, dossier n° IZEN-2026-0142.",
    requestedAt: "2026-06-09T14:40:00Z",
    status: "pending",
  },
  {
    id: "pr-3",
    requester: "N'DRI Konan Jean-Baptiste",
    requesterRole: "Chef d'établissement",
    etablissement: "GS La Lumière",
    type: "Groupe 5+ établissements",
    pct: 15,
    justification:
      "Réseau de 6 établissements souhaitant souscrire ensemble à l'Académie Premium.",
    requestedAt: "2026-06-08T11:05:00Z",
    status: "pending",
  },
  {
    id: "pr-4",
    requester: "TRAORÉ Mariam",
    requesterRole: "Chef d'établissement",
    etablissement: "LM Bouaké",
    type: "Abonné E-School EduWeb",
    pct: 20,
    justification:
      "Établissement déjà abonné à E-School EduWeb (contrat 2025-2027).",
    requestedAt: "2026-06-05T08:20:00Z",
    status: "approved",
    code: "ESCHOOL-MK3F7",
    decidedBy: "ZORO Elogne Guessan",
    decidedAt: "2026-06-05T16:02:00Z",
  },
  {
    id: "pr-5",
    requester: "YAO Kouamé",
    requesterRole: "Parent d'élève",
    etablissement: "Collège Saint-Pierre",
    type: "IZEN Allocation – Soutien 50%",
    pct: 50,
    justification: "Demande sans numéro de dossier IZEN.",
    requestedAt: "2026-06-03T10:30:00Z",
    status: "rejected",
    decidedBy: "ZORO Elogne Guessan",
    decidedAt: "2026-06-04T09:10:00Z",
    reason: "Dossier IZEN introuvable — joindre l'attestation d'allocation.",
  },
];

/** Préfixe du code généré selon le type de réduction. */
function promoCodePrefix(r: PromoRequest): string {
  if (/complet/i.test(r.type)) return "IZEN100";
  if (/IZEN/i.test(r.type)) return "IZEN50";
  if (/E-School/i.test(r.type)) return "ESCHOOL";
  if (/Groupe/i.test(r.type)) return "GROUPE5";
  return "PROMO";
}

/** Certificat de fin de formation EduWeb Planner délivré et journalisé. */
export interface DeliveredCertificate {
  id: string;
  /** Numéro officiel du certificat (format ETAB-ANNEE-NNN). */
  number: string;
  beneficiaryName: string;
  beneficiaryRole: string;
  /** Date de délivrance au format `JJ/MM/AAAA`. */
  issueDate: string;
  /** Référence et version du support de formation suivi. */
  formationCode: string;
  formationVersion: string;
  /** Date de fin de validité du support de formation. */
  validUntil: string;
  /** Nom de l'établissement délivrant le certificat. */
  establishment: string;
  /** Code de l'établissement (utilisé pour la séquence). */
  establishmentCode: string;
  /** Nom du formateur ou de l'autorité ayant signé. */
  deliveredBy: string;
  /** Horodatage technique d'enregistrement. */
  registeredAt: string;
  notes?: string;
}

/** Abonnement Académie Premium souscrit (persisté). */
export interface Subscription {
  active: boolean;
  planId: string;
  planName: string;
  capacity: string;
  amountFcfa: number;
  amountEur: number;
  discountCode: string | null;
  discountPct: number;
  paymentMethod: string;
  reference: string;
  startsAt: string;
  expiresAt: string;
}

export interface StoreState {
  users: DirectoryUser[];
  etablissements: Etablissement[];
  /** Régions académiques éditées par pays (override la config statique). */
  customRegions: Record<string, AcademicRegionSeed[]>;
  lessonBook: LessonEntry[];
  announcements: Announcement[];
  appointments: Appointment[];
  inspections: Inspection[];
  attendance: Record<string, AttendanceRow>;
  subscription: Subscription | null;
  smsAlerts: boolean;
  /** Surcharges de la matrice des droits — clé `${role}|${permission}` → autorisé. */
  roleOverrides: Record<string, boolean>;
  /** Permissions spécifiques temporaires accordées aux utilisateurs. */
  userGrants: UserGrant[];
  /** Journal des habilitations (attributions et révocations). */
  grantLog: GrantLogEntry[];
  /** Structures régionales personnalisées ; null = défauts dérivés du pays. */
  regionalStructures: RegionalStructure[] | null;
  /** Prochain numéro de séquence pour les identifiants techniques (EWP-…). */
  uidSeq: number;
  /** Demandes de codes promo de réduction (Académie Premium). */
  promoRequests: PromoRequest[];
  /** Centres CAFOP enregistrés. */
  cafops: Cafop[];
  /** Référentiel des modules CAFOP (réformes pédagogiques) ; null = référentiel par défaut. */
  cafopModules: { name: string; coef: number }[] | null;
  /** Durée de formation CAFOP (en années) par code pays ; défaut : 2 ans. */
  cafopFormationYears: Record<string, number>;
  /** Antennes de la Pédagogie et de la Formation Continue (APFC) enregistrées. */
  apfcs: Apfc[];
  /** Activités de formation continue des APFC (le compteur « Activités » en dérive). */
  apfcActivities: ApfcActivity[];
  /** Journal des certificats de fin de formation délivrés. */
  certificates: DeliveredCertificate[];
  /** Inscriptions nominatives aux formations (séminaires, manuel, guides). */
  courseEnrollments: CourseEnrollment[];
  /** Cohortes nommées d'utilisateurs inscrits à un cours. */
  courseCohorts: CourseCohort[];
  /** Règles d'accès configurées par module (prérequis, mode de complétion). */
  moduleAccessRules: ModuleAccessRule[];
  /** Conditions d'accès aux supports téléchargeables (par cours et support). */
  supportAccessRules: SupportAccessRule[];
  /** Fenêtres d'ouverture / fermeture configurées par cours (date-heure). */
  courseScheduleRules: CourseScheduleRule[];
  /** Liens d'inscription par création de compte (générés par l'admin). */
  enrollmentInviteLinks: EnrollmentInviteLink[];
  /** Tarifs des cours en FCFA (absence / 0 = gratuit). */
  coursePrices: CoursePrice[];
  /** Configuration du certificat par cours (formateur, date, signataire). */
  certificateConfigs: CertificateConfig[];
  /** Réglages globaux du paiement Mobile Money. */
  paymentSettings: PaymentSettings;
  /** Paiements de cours déposés par les utilisateurs. */
  coursePayments: CoursePayment[];
  /** Traces de complétion par utilisateur, cours et module. */
  moduleCompletions: ModuleCompletion[];
  /** Règle de réussite globale du cours (paramétrée par l'admin). */
  courseCompletionRules: CourseCompletionRule[];
  /** Traces de réussite globale du cours par utilisateur. */
  courseCompletions: CourseCompletion[];
  /** Paramètres de sécurité globaux de la plateforme (admin). */
  securitySettings: SecuritySettings;
  /** Réponses aux sondages des activités de formation. */
  pollResponses: PollResponse[];
  /** Messages des forums collaboratifs des activités de formation. */
  forumPosts: ForumPost[];
  /** Contributions aux cartes mentales collaboratives des activités. */
  mindMapContributions: MindMapContribution[];
  /** Soumissions de matrices saisissables (matrice des publics, plans…). */
  matrixSubmissions: MatrixSubmission[];
  /** Critiques rédigées par les formateurs sur les soumissions de matrices. */
  matrixReviews: MatrixReview[];
  /** Notes du livret scolaire (moyenne par élève+année+matière+trimestre). */
  livretGrades: LivretGradeEntry[];
  /** Overrides éditables du livret scolaire (par élève + année). */
  livretRecords: LivretRecord[];
  /** Partenaires affichés sur l'accueil (logo téléversé + description, éditables par l'admin). */
  partners: Partner[];
}

/** Partenaire institutionnel affiché sur la page d'accueil. */
export interface Partner {
  id: string;
  name: string;
  /** Texte court affiché dans le placeholder dégradé (à défaut de logo). */
  short: string;
  description: string;
  /** Dégradé CSS du placeholder (utilisé tant qu'aucun logo n'est téléversé). */
  accent: string;
  /** Logo téléversé (data-URL) ou chemin public ; remplace le placeholder. */
  logoUrl?: string;
}

const DEFAULT_PARTNERS: Partner[] = [
  {
    id: "ong-vie-damour",
    name: "ONG Vie d'Amour",
    short: "Vie d'Amour",
    description:
      "Organisation non gouvernementale engagée pour l'éducation, la protection et l'épanouissement des enfants.",
    accent: "linear-gradient(135deg, #7c3aed 0%, #dc2626 38%, #ea580c 68%, #16a34a 100%)",
  },
  {
    id: "fondation-izen",
    name: "Fondation iZEN",
    short: "iZEN",
    description:
      "Fondation dédiée à la promotion de l'éducation numérique et de l'innovation pédagogique.",
    accent: "linear-gradient(135deg, #062c1b 0%, #176b45 55%, #d99a1e 100%)",
  },
];

/** Réponse à un sondage d'activité (par ex. « 0.1 Sondage d'entrée »). */
export interface PollResponse {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  moduleId: string;
  activityId: string;
  /** Valeur sélectionnée par l'utilisateur (option du sondage). */
  value: string;
  /** ISO timestamp. */
  createdAt: string;
}

/**
 * Soumission d'une matrice / tableau saisissable par un participant
 * (atelier « Matrice des publics », « Plan d'action »…). Persistée par
 * (userId, activityId) et automatiquement enregistrée à chaque édition.
 */
export interface MatrixSubmission {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  courseId: string;
  moduleId: string;
  activityId: string;
  /** En-têtes de colonnes du tableau. */
  headers: string[];
  /** Étiquettes des lignes (lecture seule). */
  rowLabels: string[];
  /** Map `row-col` → contenu de la cellule. */
  cells: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Critique d'une soumission de matrice, rédigée par un formateur/admin.
 * Une critique est rattachée à une soumission précise et possède un état
 * « publiée » qui détermine si le participant peut la voir.
 */
export interface MatrixReview {
  id: string;
  submissionId: string;
  /** Reviewer (formateur, admin, tuteur). */
  reviewerId: string;
  reviewerName: string;
  reviewerRole?: string;
  /** Contenu de la critique (texte multi-ligne). */
  content: string;
  /** Si true : visible par le participant. */
  publishedToLearner: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Contribution à une carte mentale collaborative. */
export interface MindMapContribution {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  moduleId: string;
  activityId: string;
  /** Pôle de la carte mentale (ex. « babel » ou « jerusalem »). */
  pole: string;
  /** Catégorie au sein du pôle (ex. « keywords », « examples », « risks »). */
  category: string;
  content: string;
  /** ISO timestamp. */
  createdAt: string;
}

/** Message d'un forum collaboratif d'activité. */
export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  /** Rôle de l'auteur au moment de la publication (pour l'affichage). */
  userRole?: string;
  courseId: string;
  moduleId: string;
  activityId: string;
  /** Si non nul : ID du message parent (réponse imbriquée). */
  parentId: string | null;
  content: string;
  createdAt: string;
}

/** Paramètres de sécurité — appliqués à tous les utilisateurs. */
export interface SecuritySettings {
  /** Déconnexion automatique après inactivité (toggle on/off). */
  idleLogoutEnabled: boolean;
  /** Durée d'inactivité en minutes avant déconnexion (1 à 240). */
  idleLogoutMinutes: number;
  /** Durée de l'avertissement préventif en secondes (10 à 120). */
  idleWarningSeconds: number;
}

const DEFAULT_SECURITY: SecuritySettings = {
  idleLogoutEnabled: false,
  idleLogoutMinutes: 20,
  idleWarningSeconds: 30,
};

interface DataStore extends StoreState {
  addUser: (u: Omit<DirectoryUser, "id">) => void;
  updateUser: (id: string, patch: Partial<DirectoryUser>) => void;
  setUserStatus: (id: string, status: DirectoryUser["status"]) => void;
  removeUser: (id: string) => void;
  removeUsers: (ids: string[]) => void;
  addEtablissement: (e: Omit<Etablissement, "id">) => void;
  addEtablissements: (list: Omit<Etablissement, "id">[]) => void;
  updateEtablissement: (id: string, patch: Partial<Etablissement>) => void;
  removeEtablissement: (id: string) => void;
  removeEtablissements: (ids: string[]) => void;
  /** Définit la liste des régions académiques d'un pays (édition wilayas/DREN). */
  setCountryRegions: (countryCode: string, regions: AcademicRegionSeed[]) => void;
  addCafop: (c: Omit<Cafop, "id">) => void;
  addCafops: (list: Omit<Cafop, "id">[]) => void;
  removeCafop: (id: string) => void;
  setCafopModules: (list: { name: string; coef: number }[] | null) => void;
  setCafopFormationYears: (country: string, years: number) => void;
  addApfc: (a: Omit<Apfc, "id">) => void;
  addApfcs: (list: Omit<Apfc, "id">[]) => void;
  updateApfc: (id: string, patch: Partial<Apfc>) => void;
  removeApfc: (id: string) => void;
  removeApfcs: (ids: string[]) => void;
  addApfcActivity: (a: Omit<ApfcActivity, "id">) => void;
  removeApfcActivity: (id: string) => void;
  addLessonEntry: (e: Omit<LessonEntry, "id">) => void;
  updateLessonEntry: (id: string, patch: Partial<LessonEntry>) => void;
  addAnnouncement: (a: Omit<Announcement, "id">) => void;
  removeAnnouncement: (id: string) => void;
  addAppointment: (a: Omit<Appointment, "id">) => void;
  addInspection: (i: Omit<Inspection, "id">) => void;
  setAttendance: (key: string, row: AttendanceRow) => void;
  subscribe: (sub: Omit<Subscription, "active">) => void;
  cancelSubscription: () => void;
  setSmsAlerts: (on: boolean) => void;
  toggleRolePermission: (role: UserRole, permission: Permission) => void;
  resetRoleOverrides: () => void;
  /** Attribution groupée : N utilisateurs × M permissions, avec activité, durée et traçabilité. */
  grantPermissions: (input: {
    userIds: string[];
    userNames: string[];
    permissions: Permission[];
    expiresAt: string | null;
    durationLabel?: string;
    activity: string | null;
    actor: string;
    justification: string;
  }) => void;
  /** Révocation d'une habilitation, journalisée. */
  revokeUserGrant: (id: string, actor: string, justification?: string) => void;
  /** Dépose une demande de code promo (statut « en attente »). */
  addPromoRequest: (
    r: Omit<PromoRequest, "id" | "status" | "requestedAt">,
  ) => void;
  /** Approuve une demande de code promo : génère le code et trace la décision. */
  approvePromoRequest: (id: string, actor: string) => void;
  /** Refuse une demande de code promo avec motif. */
  rejectPromoRequest: (id: string, actor: string, reason: string) => void;
  setRegionalStructures: (list: RegionalStructure[] | null) => void;
  /** Enregistre un certificat de fin de formation délivré dans le journal. */
  addCertificate: (
    c: Omit<DeliveredCertificate, "id" | "registeredAt">,
  ) => void;
  /** Supprime une entrée du journal des certificats. */
  removeCertificate: (id: string) => void;
  /** Remplace la liste des partenaires affichés sur l'accueil (admin). */
  setPartners: (list: Partner[]) => void;
  /**
   * Fusionne des slices chargées depuis le serveur (Supabase) dans le store —
   * le serveur fait autorité. Utilisé par les composants Sync (app_settings…).
   */
  applyServerSettings: (partial: Partial<StoreState>) => void;
  /** Inscrit un utilisateur à un cours (méthode nominative ou cohorte). */
  enrollUser: (input: Omit<CourseEnrollment, "id" | "enrolledAt">) => void;
  /** Inscrit plusieurs utilisateurs à un cours en une seule opération. */
  enrollUsers: (
    userIds: string[],
    input: Omit<CourseEnrollment, "id" | "enrolledAt" | "userId">,
  ) => void;
  /** Fusionne des inscriptions venues du serveur (dédoublonné par user+cours). */
  mergeCourseEnrollments: (rows: CourseEnrollment[]) => void;
  /** Fusionne paiements / complétions venus du serveur (dédoublonnés par id). */
  mergeCoursePayments: (rows: CoursePayment[]) => void;
  mergeModuleCompletions: (rows: ModuleCompletion[]) => void;
  mergeCourseCompletions: (rows: CourseCompletion[]) => void;
  /**
   * Normalise les inscriptions sans année (héritées) vers l'année courante puis
   * dédoublonne par (utilisateur, cours, année) en gardant la plus ancienne.
   * Corrige les doublons existants (une ligne « sans année » + une ligne de
   * l'année courante formaient deux entrées distinctes).
   */
  normalizeAndDedupeEnrollments: (currentYear: string) => void;
  /** Supprime une inscription nominative. */
  removeEnrollment: (id: string) => void;
  /** Change le rôle de formation d'une inscription (admin/enseignant/…). */
  setEnrollmentFormationRole: (
    id: string,
    formationRole: FormationRole,
  ) => void;
  /** Crée une cohorte nommée pour un cours. */
  createCohort: (c: Omit<CourseCohort, "id" | "createdAt"> & { id?: string }) => void;
  /** Fusionne des cohortes venues du serveur (dédoublonné par id). */
  mergeCohorts: (rows: CourseCohort[]) => void;
  /** Met à jour la liste des membres d'une cohorte. */
  updateCohortMembers: (cohortId: string, memberUserIds: string[]) => void;
  /** Met à jour le nom / la description d'une cohorte. */
  updateCohort: (
    cohortId: string,
    patch: Partial<Pick<CourseCohort, "name" | "description">>,
  ) => void;
  /** Supprime une cohorte (les inscriptions individuelles restent). */
  removeCohort: (cohortId: string) => void;
  /** Définit ou met à jour la règle d'accès d'un module (upsert). */
  setModuleAccessRule: (rule: Omit<ModuleAccessRule, "id">) => void;
  /** Supprime la règle d'accès d'un module (retour au comportement par défaut). */
  clearModuleAccessRule: (courseId: string, moduleId: string) => void;
  /** Définit ou met à jour la condition d'accès d'un support téléchargeable (upsert). */
  setSupportAccessRule: (rule: Omit<SupportAccessRule, "id">) => void;
  /** Supprime la condition d'accès d'un support (retour à « toujours accessible »). */
  clearSupportAccessRule: (courseId: string, support: SupportKind) => void;
  /** Définit ou met à jour la fenêtre d'ouverture/fermeture d'un cours (upsert). */
  setCourseScheduleRule: (rule: Omit<CourseScheduleRule, "id">) => void;
  /** Supprime la fenêtre d'un cours (retour à « accessible en permanence »). */
  clearCourseScheduleRule: (courseId: string) => void;
  /** Crée un lien d'inscription par création de compte. */
  createEnrollmentInvite: (
    input: Omit<EnrollmentInviteLink, "id" | "createdAt">,
  ) => void;
  /** Supprime un lien d'inscription de la liste (n'invalide pas un lien déjà diffusé : seule l'expiration le fait). */
  removeEnrollmentInvite: (id: string) => void;
  /** Définit ou met à jour le tarif d'un cours (upsert par courseId). */
  setCoursePrice: (rule: Omit<CoursePrice, "id">) => void;
  /** Supprime le tarif d'un cours (retour à « gratuit »). */
  clearCoursePrice: (courseId: string) => void;
  /** Définit ou met à jour la config du certificat d'un cours (upsert). */
  setCertificateConfig: (config: Omit<CertificateConfig, "id">) => void;
  /** Supprime la config du certificat d'un cours (retour aux défauts). */
  clearCertificateConfig: (courseId: string) => void;
  /** Met à jour les réglages du paiement Mobile Money. */
  setPaymentSettings: (patch: Partial<PaymentSettings>) => void;
  /**
   * Dépose un paiement de cours. Selon `paymentSettings.autoValidate`, le
   * paiement est confirmé immédiatement (et l'utilisateur inscrit) ou mis en
   * attente d'une validation administrateur.
   */
  submitCoursePayment: (
    input: Omit<
      CoursePayment,
      "id" | "submittedAt" | "status" | "decidedBy" | "decidedAt"
    >,
  ) => void;
  /** Confirme un paiement en attente et inscrit l'utilisateur au cours. */
  confirmCoursePayment: (id: string, actor: string) => void;
  /** Refuse un paiement en attente (avec motif). */
  rejectCoursePayment: (id: string, actor: string, reason: string) => void;
  /** Annule un paiement déjà confirmé : retire l'inscription correspondante. */
  revertCoursePayment: (id: string, actor: string) => void;
  /** Marque un module comme terminé pour un utilisateur. */
  markModuleCompleted: (
    input: Omit<ModuleCompletion, "id" | "completedAt">,
  ) => void;
  /** Retire toutes les complétions d'un module pour un utilisateur. */
  unmarkModuleCompleted: (
    userId: string,
    courseId: string,
    moduleId: string,
  ) => void;
  /** Définit ou met à jour la règle de réussite d'un cours. */
  setCourseCompletionRule: (rule: Omit<CourseCompletionRule, "id">) => void;
  /** Supprime la règle de réussite d'un cours (retour au défaut). */
  clearCourseCompletionRule: (courseId: string) => void;
  /** Marque un cours comme réussi pour un utilisateur. */
  markCourseCompleted: (
    input: Omit<CourseCompletion, "id" | "completedAt">,
  ) => void;
  /** Retire toutes les traces de réussite d'un cours pour un utilisateur. */
  unmarkCourseCompleted: (userId: string, courseId: string) => void;
  /** Met à jour les paramètres de sécurité (auto-déconnexion, etc.). */
  setSecuritySettings: (patch: Partial<SecuritySettings>) => void;
  /** Soumet ou met à jour la réponse au sondage pour l'activité donnée. */
  submitPollResponse: (input: Omit<PollResponse, "id" | "createdAt">) => void;
  /** Retire la réponse au sondage pour cet utilisateur et cette activité. */
  removePollResponse: (userId: string, activityId: string) => void;
  /** Publie un nouveau message dans le forum d'une activité. */
  postForumMessage: (input: Omit<ForumPost, "id" | "createdAt">) => void;
  /** Supprime un message du forum (l'auteur ou l'admin). */
  removeForumPost: (id: string) => void;
  /** Ajoute une contribution à une carte mentale collaborative. */
  postMindMapContribution: (
    input: Omit<MindMapContribution, "id" | "createdAt">,
  ) => void;
  /** Supprime une contribution (l'auteur ou l'admin). */
  removeMindMapContribution: (id: string) => void;
  /** Crée ou met à jour la soumission de matrice de l'utilisateur. */
  upsertMatrixSubmission: (
    input: Omit<MatrixSubmission, "id" | "createdAt" | "updatedAt">,
  ) => void;
  /** Crée ou met à jour une critique de matrice. */
  upsertMatrixReview: (
    input: Omit<MatrixReview, "id" | "createdAt" | "updatedAt">,
  ) => void;
  /** Bascule l'état de publication d'une critique. */
  setMatrixReviewPublished: (id: string, published: boolean) => void;
  /** Supprime une critique. */
  removeMatrixReview: (id: string) => void;
  /** Fusionne des soumissions de matrice venues de Supabase (migration 031). */
  mergeMatrixSubmissions: (incoming: MatrixSubmission[]) => void;
  /** Fusionne des critiques de matrice venues de Supabase (migration 031). */
  mergeMatrixReviews: (incoming: MatrixReview[]) => void;
  /** Fusionne des productions génériques venues de Supabase (migration 032). */
  mergePollResponses: (incoming: PollResponse[]) => void;
  mergeForumPosts: (incoming: ForumPost[]) => void;
  mergeMindMapContributions: (incoming: MindMapContribution[]) => void;
  /** Notes du livret : crée/met à jour la moyenne (élève+année+matière+trimestre). */
  setLivretGrade: (
    entry: Omit<LivretGradeEntry, "id" | "updatedAt" | "updatedBy">,
    actor?: string,
  ) => void;
  /** Fusionne des champs édités du livret d'un élève (par année). */
  upsertLivretOverrides: (
    studentId: string,
    schoolYear: string,
    patch: LivretOverrides,
    actor?: string,
  ) => void;
  /** Réinitialise le livret d'un élève à l'auto-remplissage (supprime les overrides). */
  resetLivretOverrides: (studentId: string, schoolYear: string) => void;
  /** Fusionne des notes de livret venues du serveur (clé naturelle ; serveur prioritaire). */
  mergeLivretGrades: (rows: LivretGradeEntry[]) => void;
  /** Fusionne des overrides de livret venus du serveur (élève+année ; serveur prioritaire). */
  mergeLivretRecords: (rows: LivretRecord[]) => void;
  reset: () => void;
}

/** Fusionne deux listes d'objets `{id}` : l'entrant (serveur) écrase le local. */
function mergeRowsById<T extends { id: string }>(local: T[], incoming: T[]): T[] {
  const map = new Map(local.map((x) => [x.id, x]));
  for (const r of incoming) map.set(r.id, r);
  return [...map.values()];
}

const DEFAULTS: StoreState = {
  users: USER_DIRECTORY,
  etablissements: ETABLISSEMENTS,
  customRegions: {},
  lessonBook: LESSON_BOOK_ENTRIES,
  announcements: ANNOUNCEMENTS,
  appointments: APPOINTMENTS,
  inspections: INSPECTIONS,
  attendance: {},
  subscription: null,
  smsAlerts: false,
  roleOverrides: {},
  userGrants: [],
  grantLog: GRANT_LOG_SEED,
  regionalStructures: null,
  // Les 22 comptes de démo occupent 1…22 ; les comptes créés démarrent à 1001.
  uidSeq: 1001,
  promoRequests: PROMO_REQUESTS_SEED,
  cafops: CAFOPS_SEED,
  cafopModules: null,
  cafopFormationYears: {},
  apfcs: APFCS_SEED,
  apfcActivities: APFC_ACTIVITIES_SEED,
  partners: DEFAULT_PARTNERS,
  certificates: [],
  courseEnrollments: [],
  courseCohorts: [],
  moduleAccessRules: [],
  supportAccessRules: [],
  courseScheduleRules: [],
  enrollmentInviteLinks: [],
  coursePrices: [],
  certificateConfigs: [],
  paymentSettings: DEFAULT_PAYMENT_SETTINGS,
  coursePayments: [],
  moduleCompletions: [],
  courseCompletionRules: [],
  courseCompletions: [],
  securitySettings: DEFAULT_SECURITY,
  pollResponses: [],
  forumPosts: [],
  mindMapContributions: [],
  matrixSubmissions: [],
  matrixReviews: [],
  livretGrades: [],
  livretRecords: [],
};

// Incrémenter la version à chaque changement de schéma persisté (nouveaux champs/tranches) :
// la fusion `{...DEFAULTS, ...stored}` est superficielle et d'anciennes données pourraient
// masquer des valeurs à jour (ex. utilisateurs sans `phone`). Changer la clé repart proprement.
const STORAGE_KEY = "eduweb.store.v8";
const Ctx = React.createContext<DataStore | null>(null);

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Magasin de données de session : initialisé depuis les données de démonstration,
 * muté par les actions CRUD des pages et persisté dans le navigateur (localStorage).
 * Remplaçable par des appels Supabase sans changer l'API consommée par les pages.
 */
/**
 * Déduplique les inscriptions par (utilisateur, cours, année scolaire) — aligné
 * sur la contrainte serveur `unique(user_id, course_id, school_year)` (024). En
 * cas de doublon, conserve l'inscription la PLUS ANCIENNE (plus petit
 * `enrolledAt`) et supprime les plus récentes ; une année scolaire différente
 * reste un compartiment distinct (réinscription légitime, non fusionnée).
 */
function dedupeEnrollmentsByUserCourse(rows: CourseEnrollment[]): CourseEnrollment[] {
  return keepEarliestPerBucket(rows);
}

/** Instant (ms) d'un updatedAt ISO ; 0 si absent/illisible. Comparaison par
 * instant (et non lexicale) car le client écrit « …Z » et PostgREST « +00:00 ». */
function livretInstant(s?: string | null): number {
  const n = Date.parse(s || "");
  return Number.isNaN(n) ? 0 : n;
}


export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<StoreState>(DEFAULTS);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const merged = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<StoreState>) };
        // Nettoyage : purge les inscriptions en double héritées du localStorage.
        merged.courseEnrollments = dedupeEnrollmentsByUserCourse(merged.courseEnrollments);
        setState(merged);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persistance DEBOUNCÉE : sérialiser tout le magasin à chaque changement
  // d'état est coûteux et bloque le thread (UI « lente à réagir »). On écrit au
  // plus une fois par ~500 ms après le dernier changement, avec un flush
  // immédiat avant masquage/fermeture de l'onglet (anti-perte de données).
  const stateRef = React.useRef(state);
  stateRef.current = state;

  React.useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
      } catch {
        /* ignore */
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [state, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    const flush = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
      } catch {
        /* ignore */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      flush(); // flush au démontage (déconnexion / navigation dure)
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hydrated]);

  const value: DataStore = {
    ...state,
    addUser: (u) =>
      setState((s) => ({
        ...s,
        users: [
          {
            ...u,
            id: generateUserUid({
              country: u.country,
              role: u.role,
              createdAt: u.createdAt,
              seq: s.uidSeq,
            }),
          },
          ...s.users,
        ],
        uidSeq: s.uidSeq + 1,
      })),
    updateUser: (id, patch) =>
      setState((s) => ({
        ...s,
        users: s.users.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    setUserStatus: (id, status) =>
      setState((s) => ({
        ...s,
        users: s.users.map((x) => (x.id === id ? { ...x, status } : x)),
      })),
    removeUser: (id) =>
      setState((s) => ({ ...s, users: s.users.filter((x) => x.id !== id) })),
    removeUsers: (ids) =>
      setState((s) => ({
        ...s,
        users: s.users.filter((x) => !ids.includes(x.id)),
      })),
    addEtablissement: (e) =>
      setState((s) => ({
        ...s,
        etablissements: [{ ...e, id: genId("et") }, ...s.etablissements],
      })),
    addEtablissements: (list) =>
      setState((s) => ({
        ...s,
        etablissements: [
          ...list.map((e) => ({ ...e, id: genId("et") })),
          ...s.etablissements,
        ],
      })),
    updateEtablissement: (id, patch) =>
      setState((s) => ({
        ...s,
        etablissements: s.etablissements.map((x) =>
          x.id === id ? { ...x, ...patch } : x,
        ),
      })),
    removeEtablissement: (id) =>
      setState((s) => ({
        ...s,
        etablissements: s.etablissements.filter((x) => x.id !== id),
      })),
    removeEtablissements: (ids) =>
      setState((s) => ({
        ...s,
        etablissements: s.etablissements.filter((x) => !ids.includes(x.id)),
      })),
    setCountryRegions: (countryCode, regions) =>
      setState((s) => ({
        ...s,
        customRegions: { ...s.customRegions, [countryCode]: regions },
      })),
    addCafop: (c) =>
      setState((s) => ({
        ...s,
        cafops: [{ ...c, id: genId("caf") }, ...s.cafops],
      })),
    addCafops: (list) =>
      setState((s) => ({
        ...s,
        cafops: [...list.map((c) => ({ ...c, id: genId("caf") })), ...s.cafops],
      })),
    removeCafop: (id) =>
      setState((s) => ({ ...s, cafops: s.cafops.filter((x) => x.id !== id) })),
    setCafopModules: (list) => setState((s) => ({ ...s, cafopModules: list })),
    setCafopFormationYears: (country, years) =>
      setState((s) => ({
        ...s,
        cafopFormationYears: { ...s.cafopFormationYears, [country]: years },
      })),
    addApfc: (a) =>
      setState((s) => ({
        ...s,
        apfcs: [{ ...a, id: genId("apfc") }, ...s.apfcs],
      })),
    addApfcs: (list) =>
      setState((s) => ({
        ...s,
        apfcs: [...list.map((a) => ({ ...a, id: genId("apfc") })), ...s.apfcs],
      })),
    updateApfc: (id, patch) =>
      setState((s) => ({
        ...s,
        apfcs: s.apfcs.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    removeApfc: (id) =>
      setState((s) => ({
        ...s,
        apfcs: s.apfcs.filter((x) => x.id !== id),
        apfcActivities: s.apfcActivities.filter((a) => a.apfcId !== id),
      })),
    removeApfcs: (ids) =>
      setState((s) => ({
        ...s,
        apfcs: s.apfcs.filter((x) => !ids.includes(x.id)),
        apfcActivities: s.apfcActivities.filter((a) => !ids.includes(a.apfcId)),
      })),
    addApfcActivity: (a) =>
      setState((s) => ({
        ...s,
        apfcActivities: [{ ...a, id: genId("apfc-act") }, ...s.apfcActivities],
      })),
    removeApfcActivity: (id) =>
      setState((s) => ({
        ...s,
        apfcActivities: s.apfcActivities.filter((a) => a.id !== id),
      })),
    addLessonEntry: (e) =>
      setState((s) => ({
        ...s,
        lessonBook: [{ ...e, id: genId("lb") }, ...s.lessonBook],
      })),
    updateLessonEntry: (id, patch) =>
      setState((s) => ({
        ...s,
        lessonBook: s.lessonBook.map((x) =>
          x.id === id ? { ...x, ...patch } : x,
        ),
      })),
    addAnnouncement: (a) =>
      setState((s) => ({
        ...s,
        announcements: [{ ...a, id: genId("an") }, ...s.announcements],
      })),
    removeAnnouncement: (id) =>
      setState((s) => ({
        ...s,
        announcements: s.announcements.filter((x) => x.id !== id),
      })),
    addAppointment: (a) =>
      setState((s) => ({
        ...s,
        appointments: [{ ...a, id: genId("rdv") }, ...s.appointments],
      })),
    addInspection: (i) =>
      setState((s) => ({
        ...s,
        inspections: [{ ...i, id: genId("ins") }, ...s.inspections],
      })),
    setAttendance: (key, row) =>
      setState((s) => ({ ...s, attendance: { ...s.attendance, [key]: row } })),
    subscribe: (sub) =>
      setState((s) => ({ ...s, subscription: { ...sub, active: true } })),
    cancelSubscription: () => setState((s) => ({ ...s, subscription: null })),
    setSmsAlerts: (on) => setState((s) => ({ ...s, smsAlerts: on })),
    toggleRolePermission: (role, permission) =>
      setState((s) => {
        const key = `${role}|${permission}`;
        const current =
          key in s.roleOverrides
            ? s.roleOverrides[key]
            : hasPermission(role, permission);
        return { ...s, roleOverrides: { ...s.roleOverrides, [key]: !current } };
      }),
    resetRoleOverrides: () => setState((s) => ({ ...s, roleOverrides: {} })),
    grantPermissions: (input) =>
      setState((s) => {
        const now = new Date().toISOString();
        const grants: UserGrant[] = input.userIds.flatMap((uid) =>
          input.permissions.map((p) => ({
            id: genId("grant"),
            userId: uid,
            permission: p,
            grantedAt: now,
            expiresAt: input.expiresAt,
            activity: input.activity,
            grantedBy: input.actor,
          })),
        );
        const log: GrantLogEntry = {
          id: genId("gl"),
          at: now,
          actor: input.actor,
          action: "grant",
          users: input.userNames,
          permissions: input.permissions.map((p) => PERMISSION_LABELS[p] ?? p),
          activity: input.activity,
          justification: input.justification,
          durationLabel: input.durationLabel,
        };
        return {
          ...s,
          userGrants: [...grants, ...s.userGrants],
          grantLog: [log, ...s.grantLog],
        };
      }),
    revokeUserGrant: (id, actor, justification = "") =>
      setState((s) => {
        const g = s.userGrants.find((x) => x.id === id);
        if (!g) return s;
        const log: GrantLogEntry = {
          id: genId("gl"),
          at: new Date().toISOString(),
          actor,
          action: "revoke",
          users: [s.users.find((u) => u.id === g.userId)?.name ?? g.userId],
          permissions: [PERMISSION_LABELS[g.permission] ?? g.permission],
          activity: g.activity ?? null,
          justification,
        };
        return {
          ...s,
          userGrants: s.userGrants.filter((x) => x.id !== id),
          grantLog: [log, ...s.grantLog],
        };
      }),
    setRegionalStructures: (list) =>
      setState((s) => ({ ...s, regionalStructures: list })),
    addCertificate: (c) =>
      setState((s) => ({
        ...s,
        certificates: [
          { ...c, id: genId("cert"), registeredAt: new Date().toISOString() },
          ...s.certificates,
        ],
      })),
    removeCertificate: (id) =>
      setState((s) => ({
        ...s,
        certificates: s.certificates.filter((x) => x.id !== id),
      })),
    setPartners: (list) => setState((s) => ({ ...s, partners: list })),
    applyServerSettings: (partial) => setState((s) => ({ ...s, ...partial })),
    mergeCoursePayments: (rows) =>
      setState((s) => (rows.length === 0 ? s : { ...s, coursePayments: mergeRowsById(s.coursePayments, rows) })),
    mergeModuleCompletions: (rows) =>
      setState((s) => (rows.length === 0 ? s : { ...s, moduleCompletions: mergeRowsById(s.moduleCompletions, rows) })),
    mergeCourseCompletions: (rows) =>
      setState((s) => (rows.length === 0 ? s : { ...s, courseCompletions: mergeRowsById(s.courseCompletions, rows) })),
    addPromoRequest: (r) =>
      setState((s) => ({
        ...s,
        promoRequests: [
          {
            ...r,
            id: genId("pr"),
            status: "pending" as const,
            requestedAt: new Date().toISOString(),
          },
          ...s.promoRequests,
        ],
      })),
    approvePromoRequest: (id, actor) =>
      setState((s) => ({
        ...s,
        promoRequests: s.promoRequests.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "approved" as const,
                code: `${promoCodePrefix(r)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
                decidedBy: actor,
                decidedAt: new Date().toISOString(),
              }
            : r,
        ),
      })),
    rejectPromoRequest: (id, actor, reason) =>
      setState((s) => ({
        ...s,
        promoRequests: s.promoRequests.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "rejected" as const,
                decidedBy: actor,
                decidedAt: new Date().toISOString(),
                reason,
              }
            : r,
        ),
      })),
    enrollUser: (input) =>
      setState((s) => ({
        ...s,
        courseEnrollments: [
          {
            ...input,
            id: genId("enr"),
            enrolledAt: new Date().toISOString(),
          },
          ...s.courseEnrollments,
        ],
      })),
    enrollUsers: (userIds, input) =>
      setState((s) => {
        const now = new Date().toISOString();
        const yr = input.schoolYear ?? "";
        // Anti-doublon : on n'inscrit pas un utilisateur déjà inscrit à CE cours
        // POUR LA MÊME ANNÉE SCOLAIRE (une nouvelle année = réinscription permise).
        // Une inscription héritée SANS année (e.schoolYear vide) est traitée comme
        // l'année courante → elle bloque une nouvelle inscription de cette année
        // (sinon les anciennes lignes « sans année » créaient des doublons).
        const already = new Set(
          s.courseEnrollments
            .filter(
              (e) => e.courseId === input.courseId && (e.schoolYear || yr) === yr,
            )
            .map((e) => e.userId),
        );
        const rows: CourseEnrollment[] = userIds
          .filter((uid) => !already.has(uid))
          .map((uid) => ({
            ...input,
            userId: uid,
            id: genId("enr"),
            enrolledAt: now,
          }));
        if (rows.length === 0) return s;
        return { ...s, courseEnrollments: [...rows, ...s.courseEnrollments] };
      }),
    mergeCourseEnrollments: (rows) =>
      setState((s) => {
        if (rows.length === 0) return s;
        // Fusionne les lignes serveur avec l'état local en gardant, par
        // compartiment (utilisateur, cours, année), l'inscription la PLUS
        // ANCIENNE. L'ordre des compartiments existants est préservé ; les
        // compartiments inédits (côté serveur) sont ajoutés à la fin.
        const merged = keepEarliestPerBucket([...s.courseEnrollments, ...rows]);
        // Aucun changement réel (mêmes ids, même ordre) → éviter un re-render.
        const unchanged =
          merged.length === s.courseEnrollments.length &&
          merged.every((e, i) => e.id === s.courseEnrollments[i].id);
        if (unchanged) return s;
        return { ...s, courseEnrollments: merged };
      }),
    normalizeAndDedupeEnrollments: (currentYear) =>
      setState((s) => {
        const yr = currentYear || "";
        // 1) Rattacher les inscriptions sans année à l'année courante.
        const normalized = s.courseEnrollments.map((e) =>
          e.schoolYear ? e : { ...e, schoolYear: yr },
        );
        // 2) Dédoublonner par (utilisateur, cours, année) — garder la plus ancienne.
        const deduped = keepEarliestPerBucket(normalized);
        const unchanged =
          deduped.length === s.courseEnrollments.length &&
          deduped.every(
            (e, i) =>
              e.id === s.courseEnrollments[i].id &&
              e.schoolYear === s.courseEnrollments[i].schoolYear,
          );
        if (unchanged) return s;
        return { ...s, courseEnrollments: deduped };
      }),
    removeEnrollment: (id) =>
      setState((s) => ({
        ...s,
        courseEnrollments: s.courseEnrollments.filter((x) => x.id !== id),
      })),
    setEnrollmentFormationRole: (id, formationRole) =>
      setState((s) => ({
        ...s,
        courseEnrollments: s.courseEnrollments.map((e) =>
          e.id === id ? { ...e, formationRole } : e,
        ),
      })),
    createCohort: (c) =>
      setState((s) => ({
        ...s,
        courseCohorts: [
          { ...c, id: c.id ?? genId("coh"), createdAt: new Date().toISOString() },
          ...s.courseCohorts,
        ],
      })),
    mergeCohorts: (rows) =>
      setState((s) => {
        const seen = new Set(s.courseCohorts.map((c) => c.id));
        const additions = rows.filter((r) => !seen.has(r.id));
        if (additions.length === 0) return s;
        return { ...s, courseCohorts: [...additions, ...s.courseCohorts] };
      }),
    updateCohortMembers: (cohortId, memberUserIds) =>
      setState((s) => ({
        ...s,
        courseCohorts: s.courseCohorts.map((c) =>
          c.id === cohortId ? { ...c, memberUserIds } : c,
        ),
      })),
    updateCohort: (cohortId, patch) =>
      setState((s) => ({
        ...s,
        courseCohorts: s.courseCohorts.map((c) =>
          c.id === cohortId ? { ...c, ...patch } : c,
        ),
      })),
    removeCohort: (cohortId) =>
      setState((s) => ({
        ...s,
        courseCohorts: s.courseCohorts.filter((c) => c.id !== cohortId),
        courseEnrollments: s.courseEnrollments.map((e) =>
          e.cohortId === cohortId ? { ...e, cohortId: null } : e,
        ),
      })),
    setModuleAccessRule: (rule) =>
      setState((s) => {
        const existing = s.moduleAccessRules.find(
          (r) => r.courseId === rule.courseId && r.moduleId === rule.moduleId,
        );
        if (existing) {
          return {
            ...s,
            moduleAccessRules: s.moduleAccessRules.map((r) =>
              r.id === existing.id ? { ...existing, ...rule } : r,
            ),
          };
        }
        return {
          ...s,
          moduleAccessRules: [
            { ...rule, id: genId("mar") },
            ...s.moduleAccessRules,
          ],
        };
      }),
    clearModuleAccessRule: (courseId, moduleId) =>
      setState((s) => ({
        ...s,
        moduleAccessRules: s.moduleAccessRules.filter(
          (r) => !(r.courseId === courseId && r.moduleId === moduleId),
        ),
      })),
    setSupportAccessRule: (rule) =>
      setState((s) => {
        const existing = s.supportAccessRules.find(
          (r) => r.courseId === rule.courseId && r.support === rule.support,
        );
        if (existing) {
          return {
            ...s,
            supportAccessRules: s.supportAccessRules.map((r) =>
              r.id === existing.id ? { ...rule, id: existing.id } : r,
            ),
          };
        }
        return {
          ...s,
          supportAccessRules: [
            { ...rule, id: genId("sar") },
            ...s.supportAccessRules,
          ],
        };
      }),
    clearSupportAccessRule: (courseId, support) =>
      setState((s) => ({
        ...s,
        supportAccessRules: s.supportAccessRules.filter(
          (r) => !(r.courseId === courseId && r.support === support),
        ),
      })),
    setCourseScheduleRule: (rule) =>
      setState((s) => {
        const existing = s.courseScheduleRules.find(
          (r) => r.courseId === rule.courseId,
        );
        if (existing) {
          return {
            ...s,
            courseScheduleRules: s.courseScheduleRules.map((r) =>
              r.id === existing.id ? { ...rule, id: existing.id } : r,
            ),
          };
        }
        return {
          ...s,
          courseScheduleRules: [
            { ...rule, id: genId("csr") },
            ...s.courseScheduleRules,
          ],
        };
      }),
    clearCourseScheduleRule: (courseId) =>
      setState((s) => ({
        ...s,
        courseScheduleRules: s.courseScheduleRules.filter(
          (r) => r.courseId !== courseId,
        ),
      })),
    createEnrollmentInvite: (input) =>
      setState((s) => ({
        ...s,
        enrollmentInviteLinks: [
          { ...input, id: genId("eik"), createdAt: new Date().toISOString() },
          ...s.enrollmentInviteLinks,
        ],
      })),
    removeEnrollmentInvite: (id) =>
      setState((s) => ({
        ...s,
        enrollmentInviteLinks: s.enrollmentInviteLinks.filter(
          (l) => l.id !== id,
        ),
      })),
    setCoursePrice: (rule) =>
      setState((s) => {
        const existing = s.coursePrices.find(
          (r) => r.courseId === rule.courseId,
        );
        if (existing) {
          return {
            ...s,
            coursePrices: s.coursePrices.map((r) =>
              r.id === existing.id ? { ...rule, id: existing.id } : r,
            ),
          };
        }
        return {
          ...s,
          coursePrices: [{ ...rule, id: genId("price") }, ...s.coursePrices],
        };
      }),
    clearCoursePrice: (courseId) =>
      setState((s) => ({
        ...s,
        coursePrices: s.coursePrices.filter((r) => r.courseId !== courseId),
      })),
    setCertificateConfig: (config) =>
      setState((s) => {
        const existing = s.certificateConfigs.find(
          (r) => r.courseId === config.courseId,
        );
        if (existing) {
          return {
            ...s,
            certificateConfigs: s.certificateConfigs.map((r) =>
              r.id === existing.id ? { ...config, id: existing.id } : r,
            ),
          };
        }
        return {
          ...s,
          certificateConfigs: [
            { ...config, id: genId("certcfg") },
            ...s.certificateConfigs,
          ],
        };
      }),
    clearCertificateConfig: (courseId) =>
      setState((s) => ({
        ...s,
        certificateConfigs: s.certificateConfigs.filter(
          (r) => r.courseId !== courseId,
        ),
      })),
    setPaymentSettings: (patch) =>
      setState((s) => ({
        ...s,
        paymentSettings: { ...s.paymentSettings, ...patch },
      })),
    submitCoursePayment: (input) =>
      setState((s) => {
        const now = new Date().toISOString();
        const auto = s.paymentSettings.autoValidate;
        const payment: CoursePayment = {
          ...input,
          id: genId("pay"),
          submittedAt: now,
          status: auto ? "confirmed" : "pending",
          decidedBy: auto ? "Validation automatique" : undefined,
          decidedAt: auto ? now : undefined,
        };
        let enrollments = s.courseEnrollments;
        if (auto) {
          // Idempotent : retire toute inscription existante (userId, courseId)
          // avant d'en ajouter une — évite les doublons (double-clic, etc.).
          enrollments = [
            {
              id: genId("enr"),
              userId: input.userId,
              courseId: input.courseId,
              enrolledAt: now,
              enrolledBy: "Paiement Mobile Money",
              source: "individual",
            },
            ...enrollments.filter(
              (e) =>
                !(e.userId === input.userId && e.courseId === input.courseId),
            ),
          ];
        }
        return {
          ...s,
          coursePayments: [payment, ...s.coursePayments],
          courseEnrollments: enrollments,
        };
      }),
    confirmCoursePayment: (id, actor) =>
      setState((s) => {
        const pay = s.coursePayments.find((p) => p.id === id);
        if (!pay || pay.status === "confirmed") return s;
        const now = new Date().toISOString();
        const coursePayments = s.coursePayments.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "confirmed" as const,
                decidedBy: actor,
                decidedAt: now,
              }
            : p,
        );
        // Idempotent : une seule inscription (userId, courseId).
        const enrollments = [
          {
            id: genId("enr"),
            userId: pay.userId,
            courseId: pay.courseId,
            enrolledAt: now,
            enrolledBy: "Paiement Mobile Money",
            source: "individual" as const,
          },
          ...s.courseEnrollments.filter(
            (e) => !(e.userId === pay.userId && e.courseId === pay.courseId),
          ),
        ];
        return { ...s, coursePayments, courseEnrollments: enrollments };
      }),
    rejectCoursePayment: (id, actor, reason) =>
      setState((s) => {
        const now = new Date().toISOString();
        return {
          ...s,
          coursePayments: s.coursePayments.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "rejected" as const,
                  decidedBy: actor,
                  decidedAt: now,
                  note: reason,
                }
              : p,
          ),
        };
      }),
    revertCoursePayment: (id, actor) =>
      setState((s) => {
        const pay = s.coursePayments.find((p) => p.id === id);
        if (!pay) return s;
        const now = new Date().toISOString();
        return {
          ...s,
          coursePayments: s.coursePayments.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "rejected" as const,
                  decidedBy: actor,
                  decidedAt: now,
                  note: [p.note, "Inscription annulée après confirmation."]
                    .filter(Boolean)
                    .join(" "),
                }
              : p,
          ),
          // Retire l'inscription issue de ce paiement (pas les inscriptions
          // nominatives/cohortes pour le même cours).
          courseEnrollments: s.courseEnrollments.filter(
            (e) =>
              !(
                e.userId === pay.userId &&
                e.courseId === pay.courseId &&
                e.enrolledBy === "Paiement Mobile Money"
              ),
          ),
        };
      }),
    markModuleCompleted: (input) =>
      setState((s) => {
        const already = s.moduleCompletions.find(
          (c) =>
            c.userId === input.userId &&
            c.courseId === input.courseId &&
            c.moduleId === input.moduleId,
        );
        let moduleCompletions = s.moduleCompletions;
        if (!already) {
          moduleCompletions = [
            {
              ...input,
              id: genId("mco"),
              completedAt: new Date().toISOString(),
            },
            ...s.moduleCompletions,
          ];
        }
        // Auto-détection de la réussite du cours quand tous les modules sont
        // complétés (modes `all-modules` ou `all-modules-and-quiz` — pour ce
        // dernier, le quiz reste à valider, donc on n'enregistre rien tant qu'il
        // n'est pas réussi). Mode `manual-admin` : pas d'auto-détection.
        const rule = getCourseCompletionRule(
          input.courseId,
          s.courseCompletionRules,
        );
        let courseCompletions = s.courseCompletions;
        if (rule.mode === "all-modules") {
          const list = getCourseModuleList(input.courseId);
          if (list.length > 0) {
            const allDone = list.every((m) =>
              moduleCompletions.some(
                (c) =>
                  c.userId === input.userId &&
                  c.courseId === input.courseId &&
                  c.moduleId === m.id,
              ),
            );
            const hasTrace = s.courseCompletions.some(
              (c) => c.userId === input.userId && c.courseId === input.courseId,
            );
            if (allDone && !hasTrace) {
              courseCompletions = [
                {
                  id: genId("cco"),
                  userId: input.userId,
                  courseId: input.courseId,
                  completedAt: new Date().toISOString(),
                  source: "auto-modules",
                },
                ...s.courseCompletions,
              ];
            }
          }
        }
        return { ...s, moduleCompletions, courseCompletions };
      }),
    unmarkModuleCompleted: (userId, courseId, moduleId) =>
      setState((s) => {
        const moduleCompletions = s.moduleCompletions.filter(
          (c) =>
            !(
              c.userId === userId &&
              c.courseId === courseId &&
              c.moduleId === moduleId
            ),
        );
        // Si la règle est `all-modules` (réussite calculée à partir des
        // modules) et qu'on retire un module, on retire aussi les éventuelles
        // traces de réussite auto-modules pour ce cours/utilisateur.
        const rule = getCourseCompletionRule(courseId, s.courseCompletionRules);
        let courseCompletions = s.courseCompletions;
        if (rule.mode === "all-modules") {
          courseCompletions = s.courseCompletions.filter(
            (c) =>
              !(
                c.userId === userId &&
                c.courseId === courseId &&
                c.source === "auto-modules"
              ),
          );
        }
        return { ...s, moduleCompletions, courseCompletions };
      }),
    setCourseCompletionRule: (rule) =>
      setState((s) => {
        const existing = s.courseCompletionRules.find(
          (r) => r.courseId === rule.courseId,
        );
        if (existing) {
          return {
            ...s,
            courseCompletionRules: s.courseCompletionRules.map((r) =>
              r.id === existing.id ? { ...existing, ...rule } : r,
            ),
          };
        }
        return {
          ...s,
          courseCompletionRules: [
            { ...rule, id: genId("ccr") },
            ...s.courseCompletionRules,
          ],
        };
      }),
    clearCourseCompletionRule: (courseId) =>
      setState((s) => ({
        ...s,
        courseCompletionRules: s.courseCompletionRules.filter(
          (r) => r.courseId !== courseId,
        ),
      })),
    markCourseCompleted: (input) =>
      setState((s) => {
        const already = s.courseCompletions.find(
          (c) => c.userId === input.userId && c.courseId === input.courseId,
        );
        if (already) return s;
        return {
          ...s,
          courseCompletions: [
            {
              ...input,
              id: genId("cco"),
              completedAt: new Date().toISOString(),
            },
            ...s.courseCompletions,
          ],
        };
      }),
    unmarkCourseCompleted: (userId, courseId) =>
      setState((s) => ({
        ...s,
        courseCompletions: s.courseCompletions.filter(
          (c) => !(c.userId === userId && c.courseId === courseId),
        ),
      })),
    submitPollResponse: (input) =>
      setState((s) => {
        // Id DÉTERMINISTE (un vote par user+activité) → cohérent inter-appareils
        // avec la persistance Supabase (migration 032).
        const id = seminarProductionId("poll", input.userId, input.activityId);
        const existing = s.pollResponses.find(
          (r) => r.userId === input.userId && r.activityId === input.activityId,
        );
        if (existing) {
          return {
            ...s,
            pollResponses: s.pollResponses.map((r) =>
              r.id === existing.id
                ? { ...existing, ...input, id, createdAt: new Date().toISOString() }
                : r,
            ),
          };
        }
        return {
          ...s,
          pollResponses: [
            { ...input, id, createdAt: new Date().toISOString() },
            ...s.pollResponses,
          ],
        };
      }),
    removePollResponse: (userId, activityId) =>
      setState((s) => ({
        ...s,
        pollResponses: s.pollResponses.filter(
          (r) => !(r.userId === userId && r.activityId === activityId),
        ),
      })),
    postForumMessage: (input) =>
      setState((s) => ({
        ...s,
        forumPosts: [
          { ...input, id: genId("forum"), createdAt: new Date().toISOString() },
          ...s.forumPosts,
        ],
      })),
    removeForumPost: (id) =>
      setState((s) => ({
        ...s,
        // Suppression du message + de ses réponses imbriquées.
        forumPosts: s.forumPosts.filter(
          (p) => p.id !== id && p.parentId !== id,
        ),
      })),
    postMindMapContribution: (input) =>
      setState((s) => ({
        ...s,
        mindMapContributions: [
          { ...input, id: genId("mm"), createdAt: new Date().toISOString() },
          ...s.mindMapContributions,
        ],
      })),
    removeMindMapContribution: (id) =>
      setState((s) => ({
        ...s,
        mindMapContributions: s.mindMapContributions.filter((c) => c.id !== id),
      })),
    // Fusion descendante depuis Supabase (migration 032) : dédup par id, la
    // version la plus récente gagne ; ne supprime jamais de ligne locale.
    mergePollResponses: (incoming) =>
      setState((s) => {
        if (!incoming.length) return s;
        const byId = new Map(s.pollResponses.map((r) => [r.id, r]));
        for (const r of incoming) {
          const ex = byId.get(r.id);
          if (!ex || (r.createdAt ?? "") >= (ex.createdAt ?? "")) byId.set(r.id, r);
        }
        return { ...s, pollResponses: Array.from(byId.values()) };
      }),
    mergeForumPosts: (incoming) =>
      setState((s) => {
        if (!incoming.length) return s;
        const byId = new Map(s.forumPosts.map((p) => [p.id, p]));
        for (const p of incoming) byId.set(p.id, p);
        return { ...s, forumPosts: Array.from(byId.values()) };
      }),
    mergeMindMapContributions: (incoming) =>
      setState((s) => {
        if (!incoming.length) return s;
        const byId = new Map(s.mindMapContributions.map((c) => [c.id, c]));
        for (const c of incoming) byId.set(c.id, c);
        return { ...s, mindMapContributions: Array.from(byId.values()) };
      }),
    upsertMatrixSubmission: (input) =>
      setState((s) => {
        const now = new Date().toISOString();
        const existing = s.matrixSubmissions.find(
          (m) => m.userId === input.userId && m.activityId === input.activityId,
        );
        if (existing) {
          // Normalise vers l'id DÉTERMINISTE : une éventuelle ligne héritée (id
          // aléatoire d'avant la persistance) reçoit l'id stable, cohérent avec
          // le push Supabase → pas de doublon serveur.
          const id = matrixSubmissionId(input.userId, input.activityId);
          return {
            ...s,
            matrixSubmissions: s.matrixSubmissions.map((m) =>
              m.id === existing.id ? { ...existing, ...input, id, updatedAt: now } : m,
            ),
          };
        }
        return {
          ...s,
          matrixSubmissions: [
            {
              ...input,
              id: matrixSubmissionId(input.userId, input.activityId),
              createdAt: now,
              updatedAt: now,
            },
            ...s.matrixSubmissions,
          ],
        };
      }),
    upsertMatrixReview: (input) =>
      setState((s) => {
        const now = new Date().toISOString();
        const existing = s.matrixReviews.find(
          (r) =>
            r.submissionId === input.submissionId &&
            r.reviewerId === input.reviewerId,
        );
        if (existing) {
          const id = matrixReviewId(input.submissionId, input.reviewerId);
          return {
            ...s,
            matrixReviews: s.matrixReviews.map((r) =>
              r.id === existing.id ? { ...existing, ...input, id, updatedAt: now } : r,
            ),
          };
        }
        return {
          ...s,
          matrixReviews: [
            {
              ...input,
              id: matrixReviewId(input.submissionId, input.reviewerId),
              createdAt: now,
              updatedAt: now,
            },
            ...s.matrixReviews,
          ],
        };
      }),
    setMatrixReviewPublished: (id, published) =>
      setState((s) => ({
        ...s,
        matrixReviews: s.matrixReviews.map((r) =>
          r.id === id
            ? {
                ...r,
                publishedToLearner: published,
                updatedAt: new Date().toISOString(),
              }
            : r,
        ),
      })),
    removeMatrixReview: (id) =>
      setState((s) => ({
        ...s,
        matrixReviews: s.matrixReviews.filter((r) => r.id !== id),
      })),
    // Fusion descendante depuis Supabase (migration 031). Dédoublonne par id
    // (déterministe) ; en cas de collision, la version la plus récente gagne.
    mergeMatrixSubmissions: (incoming) =>
      setState((s) => {
        if (!incoming.length) return s;
        const byId = new Map(s.matrixSubmissions.map((m) => [m.id, m]));
        for (const sub of incoming) {
          const ex = byId.get(sub.id);
          if (!ex || (sub.updatedAt ?? "") >= (ex.updatedAt ?? "")) byId.set(sub.id, sub);
        }
        return { ...s, matrixSubmissions: Array.from(byId.values()) };
      }),
    mergeMatrixReviews: (incoming) =>
      setState((s) => {
        if (!incoming.length) return s;
        const byId = new Map(s.matrixReviews.map((r) => [r.id, r]));
        for (const rev of incoming) {
          const ex = byId.get(rev.id);
          if (!ex || (rev.updatedAt ?? "") >= (ex.updatedAt ?? "")) byId.set(rev.id, rev);
        }
        return { ...s, matrixReviews: Array.from(byId.values()) };
      }),
    setLivretGrade: (entry, actor) =>
      setState((s) => {
        const now = new Date().toISOString();
        const k = gradeKey(entry);
        const existing = s.livretGrades.find((g) => gradeKey(g) === k);
        if (existing) {
          return {
            ...s,
            livretGrades: s.livretGrades.map((g) =>
              g.id === existing.id
                ? { ...existing, moy: entry.moy, updatedBy: actor ?? null, updatedAt: now }
                : g,
            ),
          };
        }
        return {
          ...s,
          livretGrades: [
            { ...entry, id: genId("lg"), updatedBy: actor ?? null, updatedAt: now },
            ...s.livretGrades,
          ],
        };
      }),
    upsertLivretOverrides: (studentId, schoolYear, patch, actor) =>
      setState((s) => {
        const now = new Date().toISOString();
        const existing = s.livretRecords.find(
          (r) => r.studentId === studentId && r.schoolYear === schoolYear,
        );
        const overrides = mergeLivretOverrides(existing?.overrides, patch);
        if (existing) {
          return {
            ...s,
            livretRecords: s.livretRecords.map((r) =>
              r.id === existing.id
                ? { ...existing, overrides, updatedBy: actor ?? existing.updatedBy ?? null, updatedAt: now }
                : r,
            ),
          };
        }
        return {
          ...s,
          livretRecords: [
            { id: genId("liv"), studentId, schoolYear, overrides, updatedBy: actor ?? null, updatedAt: now },
            ...s.livretRecords,
          ],
        };
      }),
    resetLivretOverrides: (studentId, schoolYear) =>
      setState((s) => ({
        ...s,
        livretRecords: s.livretRecords.filter(
          (r) => !(r.studentId === studentId && r.schoolYear === schoolYear),
        ),
      })),
    mergeLivretGrades: (rows) =>
      setState((s) => {
        if (rows.length === 0) return s;
        const byKey = new Map(s.livretGrades.map((g) => [gradeKey(g), g]));
        for (const r of rows) {
          const cur = byKey.get(gradeKey(r));
          // Last-write-wins : le serveur l'emporte SAUF si une édition locale est
          // plus récente (non encore persistée) → on ne l'écrase pas.
          if (!cur || livretInstant(r.updatedAt) >= livretInstant(cur.updatedAt)) byKey.set(gradeKey(r), r);
        }
        return { ...s, livretGrades: [...byKey.values()] };
      }),
    mergeLivretRecords: (rows) =>
      setState((s) => {
        if (rows.length === 0) return s;
        const k = (r: LivretRecord) => `${r.studentId}|${r.schoolYear}`;
        const byKey = new Map(s.livretRecords.map((r) => [k(r), r]));
        for (const r of rows) {
          const cur = byKey.get(k(r));
          if (!cur || livretInstant(r.updatedAt) >= livretInstant(cur.updatedAt)) byKey.set(k(r), r);
        }
        return { ...s, livretRecords: [...byKey.values()] };
      }),
    setSecuritySettings: (patch) =>
      setState((s) => {
        const minutes = patch.idleLogoutMinutes;
        const seconds = patch.idleWarningSeconds;
        return {
          ...s,
          securitySettings: {
            ...s.securitySettings,
            ...patch,
            ...(typeof minutes === "number"
              ? {
                  idleLogoutMinutes: Math.max(
                    1,
                    Math.min(240, Math.round(minutes)),
                  ),
                }
              : {}),
            ...(typeof seconds === "number"
              ? {
                  idleWarningSeconds: Math.max(
                    10,
                    Math.min(120, Math.round(seconds)),
                  ),
                }
              : {}),
          },
        };
      }),
    reset: () => setState(DEFAULTS),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): DataStore {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    throw new Error("useStore doit être utilisé dans <DataStoreProvider>");
  return ctx;
}
