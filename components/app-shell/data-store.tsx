"use client";

import * as React from "react";
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
import type { Apfc, ApfcActivity, Cafop, Etablissement, Inspection } from "@/lib/types";
import { hasPermission, PERMISSION_LABELS, type Permission } from "@/lib/permissions";
import { generateUserUid } from "@/lib/uid";
import type { UserRole } from "@/lib/roles";
import type { CourseCohort, CourseEnrollment } from "@/lib/formations/types";

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
    justification: "Famille bénéficiaire des allocations de la Fondation IZEN — deux enfants scolarisés.",
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
    justification: "Réseau de 6 établissements souhaitant souscrire ensemble à l'Académie Premium.",
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
    justification: "Établissement déjà abonné à E-School EduWeb (contrat 2025-2027).",
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

interface StoreState {
  users: DirectoryUser[];
  etablissements: Etablissement[];
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
}

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
  addPromoRequest: (r: Omit<PromoRequest, "id" | "status" | "requestedAt">) => void;
  /** Approuve une demande de code promo : génère le code et trace la décision. */
  approvePromoRequest: (id: string, actor: string) => void;
  /** Refuse une demande de code promo avec motif. */
  rejectPromoRequest: (id: string, actor: string, reason: string) => void;
  setRegionalStructures: (list: RegionalStructure[] | null) => void;
  /** Enregistre un certificat de fin de formation délivré dans le journal. */
  addCertificate: (c: Omit<DeliveredCertificate, "id" | "registeredAt">) => void;
  /** Supprime une entrée du journal des certificats. */
  removeCertificate: (id: string) => void;
  /** Inscrit un utilisateur à un cours (méthode nominative ou cohorte). */
  enrollUser: (input: Omit<CourseEnrollment, "id" | "enrolledAt">) => void;
  /** Inscrit plusieurs utilisateurs à un cours en une seule opération. */
  enrollUsers: (
    userIds: string[],
    input: Omit<CourseEnrollment, "id" | "enrolledAt" | "userId">,
  ) => void;
  /** Supprime une inscription nominative. */
  removeEnrollment: (id: string) => void;
  /** Crée une cohorte nommée pour un cours. */
  createCohort: (c: Omit<CourseCohort, "id" | "createdAt">) => void;
  /** Met à jour la liste des membres d'une cohorte. */
  updateCohortMembers: (cohortId: string, memberUserIds: string[]) => void;
  /** Met à jour le nom / la description d'une cohorte. */
  updateCohort: (cohortId: string, patch: Partial<Pick<CourseCohort, "name" | "description">>) => void;
  /** Supprime une cohorte (les inscriptions individuelles restent). */
  removeCohort: (cohortId: string) => void;
  reset: () => void;
}

const DEFAULTS: StoreState = {
  users: USER_DIRECTORY,
  etablissements: ETABLISSEMENTS,
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
  certificates: [],
  courseEnrollments: [],
  courseCohorts: [],
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
export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<StoreState>(DEFAULTS);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<StoreState>) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const value: DataStore = {
    ...state,
    addUser: (u) =>
      setState((s) => ({
        ...s,
        users: [
          { ...u, id: generateUserUid({ country: u.country, role: u.role, createdAt: u.createdAt, seq: s.uidSeq }) },
          ...s.users,
        ],
        uidSeq: s.uidSeq + 1,
      })),
    updateUser: (id, patch) =>
      setState((s) => ({ ...s, users: s.users.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    setUserStatus: (id, status) =>
      setState((s) => ({ ...s, users: s.users.map((x) => (x.id === id ? { ...x, status } : x)) })),
    removeUser: (id) => setState((s) => ({ ...s, users: s.users.filter((x) => x.id !== id) })),
    removeUsers: (ids) => setState((s) => ({ ...s, users: s.users.filter((x) => !ids.includes(x.id)) })),
    addEtablissement: (e) =>
      setState((s) => ({ ...s, etablissements: [{ ...e, id: genId("et") }, ...s.etablissements] })),
    addEtablissements: (list) =>
      setState((s) => ({ ...s, etablissements: [...list.map((e) => ({ ...e, id: genId("et") })), ...s.etablissements] })),
    updateEtablissement: (id, patch) =>
      setState((s) => ({ ...s, etablissements: s.etablissements.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    removeEtablissement: (id) => setState((s) => ({ ...s, etablissements: s.etablissements.filter((x) => x.id !== id) })),
    removeEtablissements: (ids) =>
      setState((s) => ({ ...s, etablissements: s.etablissements.filter((x) => !ids.includes(x.id)) })),
    addCafop: (c) => setState((s) => ({ ...s, cafops: [{ ...c, id: genId("caf") }, ...s.cafops] })),
    addCafops: (list) =>
      setState((s) => ({ ...s, cafops: [...list.map((c) => ({ ...c, id: genId("caf") })), ...s.cafops] })),
    removeCafop: (id) => setState((s) => ({ ...s, cafops: s.cafops.filter((x) => x.id !== id) })),
    setCafopModules: (list) => setState((s) => ({ ...s, cafopModules: list })),
    setCafopFormationYears: (country, years) =>
      setState((s) => ({ ...s, cafopFormationYears: { ...s.cafopFormationYears, [country]: years } })),
    addApfc: (a) => setState((s) => ({ ...s, apfcs: [{ ...a, id: genId("apfc") }, ...s.apfcs] })),
    addApfcs: (list) =>
      setState((s) => ({ ...s, apfcs: [...list.map((a) => ({ ...a, id: genId("apfc") })), ...s.apfcs] })),
    updateApfc: (id, patch) =>
      setState((s) => ({ ...s, apfcs: s.apfcs.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
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
      setState((s) => ({ ...s, apfcActivities: [{ ...a, id: genId("apfc-act") }, ...s.apfcActivities] })),
    removeApfcActivity: (id) =>
      setState((s) => ({ ...s, apfcActivities: s.apfcActivities.filter((a) => a.id !== id) })),
    addLessonEntry: (e) => setState((s) => ({ ...s, lessonBook: [{ ...e, id: genId("lb") }, ...s.lessonBook] })),
    updateLessonEntry: (id, patch) =>
      setState((s) => ({ ...s, lessonBook: s.lessonBook.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    addAnnouncement: (a) =>
      setState((s) => ({ ...s, announcements: [{ ...a, id: genId("an") }, ...s.announcements] })),
    removeAnnouncement: (id) => setState((s) => ({ ...s, announcements: s.announcements.filter((x) => x.id !== id) })),
    addAppointment: (a) => setState((s) => ({ ...s, appointments: [{ ...a, id: genId("rdv") }, ...s.appointments] })),
    addInspection: (i) => setState((s) => ({ ...s, inspections: [{ ...i, id: genId("ins") }, ...s.inspections] })),
    setAttendance: (key, row) => setState((s) => ({ ...s, attendance: { ...s.attendance, [key]: row } })),
    subscribe: (sub) => setState((s) => ({ ...s, subscription: { ...sub, active: true } })),
    cancelSubscription: () => setState((s) => ({ ...s, subscription: null })),
    setSmsAlerts: (on) => setState((s) => ({ ...s, smsAlerts: on })),
    toggleRolePermission: (role, permission) =>
      setState((s) => {
        const key = `${role}|${permission}`;
        const current = key in s.roleOverrides ? s.roleOverrides[key] : hasPermission(role, permission);
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
        return { ...s, userGrants: [...grants, ...s.userGrants], grantLog: [log, ...s.grantLog] };
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
        return { ...s, userGrants: s.userGrants.filter((x) => x.id !== id), grantLog: [log, ...s.grantLog] };
      }),
    setRegionalStructures: (list) => setState((s) => ({ ...s, regionalStructures: list })),
    addCertificate: (c) =>
      setState((s) => ({
        ...s,
        certificates: [
          { ...c, id: genId("cert"), registeredAt: new Date().toISOString() },
          ...s.certificates,
        ],
      })),
    removeCertificate: (id) =>
      setState((s) => ({ ...s, certificates: s.certificates.filter((x) => x.id !== id) })),
    addPromoRequest: (r) =>
      setState((s) => ({
        ...s,
        promoRequests: [
          { ...r, id: genId("pr"), status: "pending" as const, requestedAt: new Date().toISOString() },
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
            ? { ...r, status: "rejected" as const, decidedBy: actor, decidedAt: new Date().toISOString(), reason }
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
        const rows: CourseEnrollment[] = userIds.map((uid) => ({
          ...input,
          userId: uid,
          id: genId("enr"),
          enrolledAt: now,
        }));
        return { ...s, courseEnrollments: [...rows, ...s.courseEnrollments] };
      }),
    removeEnrollment: (id) =>
      setState((s) => ({
        ...s,
        courseEnrollments: s.courseEnrollments.filter((x) => x.id !== id),
      })),
    createCohort: (c) =>
      setState((s) => ({
        ...s,
        courseCohorts: [
          { ...c, id: genId("coh"), createdAt: new Date().toISOString() },
          ...s.courseCohorts,
        ],
      })),
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
    reset: () => setState(DEFAULTS),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): DataStore {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useStore doit être utilisé dans <DataStoreProvider>");
  return ctx;
}
