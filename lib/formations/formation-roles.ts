/* ============================================================================
   Rôles propres aux ESPACES DE FORMATION.

   Distincts des rôles applicatifs globaux (lib/roles.ts). Un rôle de
   formation est attribué PAR INSCRIPTION : un même utilisateur peut être
   « enseignant » sur une formation et « étudiant » sur une autre.

   Hiérarchie (degrés de liberté décroissants) :
     Admin > Gestionnaire > Enseignant > Tuteur > Étudiant

   Chaque rôle ouvre un sous-ensemble de capacités (voir CAPABILITY_MATRIX).
   ========================================================================== */

export const FORMATION_ROLES = [
  "admin",
  "gestionnaire",
  "enseignant",
  "tuteur",
  "etudiant",
] as const;

export type FormationRole = (typeof FORMATION_ROLES)[number];

/** Rôle attribué par défaut à une inscription sans rôle explicite. */
export const DEFAULT_FORMATION_ROLE: FormationRole = "etudiant";

/** Rang hiérarchique (plus élevé = plus de liberté d'action). */
export const FORMATION_ROLE_RANK: Record<FormationRole, number> = {
  admin: 5,
  gestionnaire: 4,
  enseignant: 3,
  tuteur: 2,
  etudiant: 1,
};

export interface FormationRoleMeta {
  label: string;
  short: string;
  description: string;
  /** Couleur d'accent (token ew-*). */
  accent: "purple" | "blue" | "green" | "gold" | "gray";
}

export const FORMATION_ROLE_META: Record<FormationRole, FormationRoleMeta> = {
  admin: {
    label: "Administrateur",
    short: "Admin",
    description:
      "Contrôle total de la formation : contenu, conditions d'accès, participants, rôles, validation et certificats.",
    accent: "purple",
  },
  gestionnaire: {
    label: "Gestionnaire",
    short: "Gestion",
    description:
      "Gère les participants et les cohortes, attribue les rôles (jusqu'à enseignant/tuteur), suit la progression et valide la réussite. Ne modifie pas le contenu du cours.",
    accent: "blue",
  },
  enseignant: {
    label: "Enseignant",
    short: "Enseignant",
    description:
      "Anime la formation : consulte et critique les productions des apprenants, publie ses appréciations, valide la réussite et délivre les certificats.",
    accent: "green",
  },
  tuteur: {
    label: "Tuteur",
    short: "Tuteur",
    description:
      "Accompagne les apprenants : consulte et critique leurs productions, publie ses retours. Ne valide pas la réussite.",
    accent: "gold",
  },
  etudiant: {
    label: "Étudiant",
    short: "Étudiant",
    description:
      "Participant apprenant : accède à la formation, réalise les activités et soumet ses productions.",
    accent: "gray",
  },
};

/* -------------------------------------------------------------------------- */
/*  Capacités                                                                  */
/* -------------------------------------------------------------------------- */
export type FormationCapability =
  /** Configurer le cours (contenu, conditions d'accès, identité visuelle). */
  | "configure"
  /** Inscrire / désinscrire des participants, gérer les cohortes. */
  | "manage-participants"
  /** Attribuer des rôles de formation aux participants. */
  | "assign-roles"
  /** Consulter et critiquer les productions des apprenants. */
  | "review-productions"
  /** Publier une appréciation/critique vers l'apprenant concerné. */
  | "publish-review"
  /** Valider la réussite du cours et délivrer un certificat. */
  | "validate-completion"
  /** Accéder à l'espace de formation. */
  | "access";

const CAPABILITY_MATRIX: Record<FormationRole, FormationCapability[]> = {
  admin: [
    "configure",
    "manage-participants",
    "assign-roles",
    "review-productions",
    "publish-review",
    "validate-completion",
    "access",
  ],
  gestionnaire: [
    "manage-participants",
    "assign-roles",
    "review-productions",
    "publish-review",
    "validate-completion",
    "access",
  ],
  enseignant: ["review-productions", "publish-review", "validate-completion", "access"],
  tuteur: ["review-productions", "publish-review", "access"],
  etudiant: ["access"],
};

/** Vrai si le rôle donné possède la capacité demandée. */
export function formationCan(
  role: FormationRole | null | undefined,
  capability: FormationCapability,
): boolean {
  if (!role) return false;
  return CAPABILITY_MATRIX[role]?.includes(capability) ?? false;
}

/** Liste des capacités d'un rôle (pour affichage). */
export function formationCapabilities(role: FormationRole): FormationCapability[] {
  return CAPABILITY_MATRIX[role] ?? [];
}

/** Rôle « animateur » (enseignant/tuteur/gestionnaire/admin) : peut relire les productions. */
export function isFacilitatorRole(role: FormationRole | null | undefined): boolean {
  return formationCan(role, "review-productions");
}

/**
 * Détermine si un acteur (rôle `actor`) peut attribuer le rôle `target`.
 * Règle : il faut posséder la capacité `assign-roles`, et — sauf pour
 * l'administrateur — on ne peut attribuer qu'un rôle strictement inférieur
 * au sien (un gestionnaire ne peut pas créer d'admin ni d'autres
 * gestionnaires).
 */
export function canAssignFormationRole(
  actor: FormationRole | null | undefined,
  target: FormationRole,
): boolean {
  if (!formationCan(actor, "assign-roles")) return false;
  if (actor === "admin") return true;
  return FORMATION_ROLE_RANK[target] < FORMATION_ROLE_RANK[actor!];
}

/** Liste des rôles qu'un acteur peut attribuer (pour peupler un menu). */
export function assignableFormationRoles(
  actor: FormationRole | null | undefined,
): FormationRole[] {
  return FORMATION_ROLES.filter((r) => canAssignFormationRole(actor, r));
}

/**
 * Résout le rôle de formation effectif d'un utilisateur pour un cours.
 * L'administrateur applicatif global (ou le super-administrateur) est
 * toujours considéré comme « admin » de formation (fail-open au sommet).
 */
export function resolveFormationRole(opts: {
  isGlobalAdmin: boolean;
  enrolledRole: FormationRole | null | undefined;
  enrolled: boolean;
}): FormationRole | null {
  if (opts.isGlobalAdmin) return "admin";
  if (opts.enrolledRole) return opts.enrolledRole;
  if (opts.enrolled) return DEFAULT_FORMATION_ROLE;
  return null;
}
