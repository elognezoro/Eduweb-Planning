/**
 * Définition centralisée des rôles EduWeb Planner.
 * 13 rôles couvrant l'administration, la supervision, l'établissement et la communauté.
 * Les libellés sont configurables (multi-pays) : DRENA/CAFOP/APFC ne sont pas codés en dur
 * au niveau métier, seulement comme libellés par défaut du système ivoirien.
 */

export const USER_ROLES = [
  "admin",
  "etablissements_admin",
  "cafop_admin",
  "apfc_admin",
  "drena",
  "inspecteur",
  "conseiller_pedagogique",
  "chef_antenne",
  "chef_etablissement",
  "enseignant",
  "educateur",
  "parent",
  "eleve",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type AccountStatus = "pending" | "active" | "suspended" | "archived";

export type RoleFamily = "administration" | "supervision" | "etablissement" | "communaute";

export type BadgeTone = "green" | "blue" | "gold" | "purple" | "red" | "slate" | "teal";

export interface RoleDefinition {
  id: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  family: RoleFamily;
  tone: BadgeTone;
}

export const ROLE_FAMILY_LABELS: Record<RoleFamily, string> = {
  administration: "Administration",
  supervision: "Supervision & Pilotage",
  etablissement: "Vie de l'établissement",
  communaute: "Communauté éducative",
};

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    id: "admin",
    label: "Administrateur Système",
    shortLabel: "Administrateur",
    description:
      "Accès complet à toutes les fonctionnalités : comptes, rôles, établissements et configuration globale.",
    family: "administration",
    tone: "green",
  },
  etablissements_admin: {
    id: "etablissements_admin",
    label: "Admin Établissements",
    shortLabel: "Admin Étab.",
    description: "Gestion administrative des établissements scolaires rattachés.",
    family: "administration",
    tone: "teal",
  },
  cafop_admin: {
    id: "cafop_admin",
    label: "Admin CAFOP",
    shortLabel: "Admin CAFOP",
    description: "Gestion des centres de formation initiale des instituteurs.",
    family: "administration",
    tone: "blue",
  },
  apfc_admin: {
    id: "apfc_admin",
    label: "Admin APFC",
    shortLabel: "Admin APFC",
    description: "Gestion des antennes pédagogiques de formation continue.",
    family: "administration",
    tone: "purple",
  },
  drena: {
    id: "drena",
    label: "DRENA / DRENAET",
    shortLabel: "DRENA",
    description: "Pilotage régional et supervision des établissements de la région.",
    family: "supervision",
    tone: "green",
  },
  inspecteur: {
    id: "inspecteur",
    label: "Inspecteur",
    shortLabel: "Inspecteur",
    description: "Inspection pédagogique, évaluation des enseignants, rapports d'inspection.",
    family: "supervision",
    tone: "blue",
  },
  conseiller_pedagogique: {
    id: "conseiller_pedagogique",
    label: "Conseiller Pédagogique",
    shortLabel: "Conseiller",
    description: "Accompagnement pédagogique et suivi des recommandations.",
    family: "supervision",
    tone: "teal",
  },
  chef_antenne: {
    id: "chef_antenne",
    label: "Chef d'antenne",
    shortLabel: "Chef d'antenne",
    description: "Responsable d'une antenne de formation pédagogique.",
    family: "supervision",
    tone: "purple",
  },
  chef_etablissement: {
    id: "chef_etablissement",
    label: "Chef d'établissement",
    shortLabel: "Chef d'étab.",
    description: "Direction d'établissement : emplois du temps, enseignants, vie scolaire.",
    family: "etablissement",
    tone: "green",
  },
  enseignant: {
    id: "enseignant",
    label: "Enseignant",
    shortLabel: "Enseignant",
    description: "Notes, cahier de texte, absences et emploi du temps.",
    family: "etablissement",
    tone: "blue",
  },
  educateur: {
    id: "educateur",
    label: "Éducateur",
    shortLabel: "Éducateur",
    description: "Vie scolaire : absences, retards, discipline.",
    family: "etablissement",
    tone: "gold",
  },
  parent: {
    id: "parent",
    label: "Parent d'élève",
    shortLabel: "Parent",
    description: "Consultation des notes, absences, emploi du temps et rendez-vous.",
    family: "communaute",
    tone: "slate",
  },
  eleve: {
    id: "eleve",
    label: "Élève",
    shortLabel: "Élève",
    description: "Consultation de son parcours scolaire.",
    family: "communaute",
    tone: "slate",
  },
};

export const ROLE_LIST: RoleDefinition[] = USER_ROLES.map((id) => ROLE_DEFINITIONS[id]);

export function getRole(id: UserRole): RoleDefinition {
  return ROLE_DEFINITIONS[id];
}

export function getRoleLabel(id: UserRole): string {
  return ROLE_DEFINITIONS[id]?.label ?? id;
}

export const ACCOUNT_STATUS: Record<
  AccountStatus,
  { label: string; tone: BadgeTone }
> = {
  pending: { label: "En attente", tone: "gold" },
  active: { label: "Actif", tone: "green" },
  suspended: { label: "Suspendu", tone: "red" },
  archived: { label: "Archivé", tone: "slate" },
};
