import type { FormationRole } from "@/lib/formations/formation-roles";
import { FORMATION_ROLE_META } from "@/lib/formations/formation-roles";
import type { CourseCompletionVerdict } from "@/lib/formations/course-completion";

/* ============================================================================
   Accès conditionné aux SUPPORTS TÉLÉCHARGEABLES d'une formation.

   L'administrateur peut, par cours et par type de support (PowerPoint,
   livret, certificat), définir une CONDITION d'accès. Tant que la condition
   n'est pas remplie pour l'utilisateur courant, le bouton de téléchargement
   est désactivé avec une explication.

   Gating côté interface (l'application fonctionne sur un état client) :
   l'administrateur applicatif global passe toujours.
   ========================================================================== */

/** Types de supports gérables. */
export const SUPPORT_KINDS = ["powerpoint", "livret", "certificat"] as const;
export type SupportKind = (typeof SUPPORT_KINDS)[number];

export const SUPPORT_KIND_LABEL: Record<SupportKind, string> = {
  powerpoint: "Support PowerPoint",
  livret: "Livret (PDF & Word)",
  certificat: "Certificat de fin",
};

/** Condition d'accès à un support (union discriminée). */
export type SupportAccessCondition =
  /** Toujours accessible (valeur par défaut). */
  | { mode: "open" }
  /** Accessible une fois la formation réussie (selon la règle de réussite). */
  | { mode: "on-completion" }
  /** Réservé à certains rôles de formation. */
  | { mode: "roles"; roles: FormationRole[] }
  /** Accessible à partir d'une date (ISO yyyy-mm-dd). */
  | { mode: "after-date"; date: string };

export type SupportAccessMode = SupportAccessCondition["mode"];

export const SUPPORT_MODE_LABEL: Record<SupportAccessMode, string> = {
  open: "Toujours accessible",
  "on-completion": "Après la réussite de la formation",
  roles: "Réservé à certains rôles de formation",
  "after-date": "À partir d'une date",
};

/** Règle persistée : un support d'un cours + sa condition. */
export interface SupportAccessRule {
  id: string;
  courseId: string;
  support: SupportKind;
  condition: SupportAccessCondition;
}

const DEFAULT_CONDITION: SupportAccessCondition = { mode: "open" };

/** Retourne la condition configurée pour (cours, support) ou « open » par défaut. */
export function getSupportCondition(
  courseId: string,
  support: SupportKind,
  rules: SupportAccessRule[],
): SupportAccessCondition {
  return (
    rules.find((r) => r.courseId === courseId && r.support === support)?.condition ??
    DEFAULT_CONDITION
  );
}

export interface SupportAccessVerdict {
  allowed: boolean;
  /** Explication courte si non accessible. */
  reason?: string;
}

/**
 * Évalue l'accès d'un utilisateur à un support selon la condition.
 * L'administrateur applicatif global (ou super-administrateur) passe toujours.
 */
export function evaluateSupportAccess(opts: {
  condition: SupportAccessCondition;
  isAdminUser: boolean;
  formationRole: FormationRole | null;
  completion: CourseCompletionVerdict | null;
  now: Date;
}): SupportAccessVerdict {
  const { condition, isAdminUser, formationRole, completion, now } = opts;
  if (isAdminUser) return { allowed: true };

  switch (condition.mode) {
    case "open":
      return { allowed: true };

    case "on-completion": {
      const ok = !!completion?.completed;
      return ok
        ? { allowed: true }
        : {
            allowed: false,
            reason:
              completion?.reason ??
              "Disponible une fois la formation réussie.",
          };
    }

    case "roles": {
      const ok = !!formationRole && condition.roles.includes(formationRole);
      if (ok) return { allowed: true };
      const labels = condition.roles
        .map((r) => FORMATION_ROLE_META[r]?.label ?? r)
        .join(", ");
      return {
        allowed: false,
        reason: `Réservé aux rôles : ${labels || "—"}.`,
      };
    }

    case "after-date": {
      const target = new Date(condition.date + "T00:00:00");
      const ok = !Number.isNaN(target.getTime()) && now >= target;
      if (ok) return { allowed: true };
      const fmt = Number.isNaN(target.getTime())
        ? condition.date
        : target.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
      return { allowed: false, reason: `Disponible à partir du ${fmt}.` };
    }
  }
}

/** Résumé lisible d'une condition (pour l'admin / les badges). */
export function describeCondition(condition: SupportAccessCondition): string {
  switch (condition.mode) {
    case "open":
      return SUPPORT_MODE_LABEL.open;
    case "on-completion":
      return SUPPORT_MODE_LABEL["on-completion"];
    case "roles":
      return `Rôles : ${condition.roles
        .map((r) => FORMATION_ROLE_META[r]?.short ?? r)
        .join(", ")}`;
    case "after-date":
      return `À partir du ${condition.date}`;
  }
}
