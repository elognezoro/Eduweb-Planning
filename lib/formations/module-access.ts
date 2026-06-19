import { MAGNIFICA_HUMANITAS } from "@/lib/seminaires/magnifica-humanitas";
import type { ModuleAccessRule, ModuleCompletion } from "./types";

/**
 * Modèle des conditions d'accès par module + helpers de vérification.
 *
 * Le système est conçu pour s'étendre facilement à d'autres cours
 * (manuel, guides, futurs séminaires). Pour l'instant, seuls les cours
 * articulés en modules (Magnifica Humanitas) y sont éligibles.
 */

/** Représentation minimale d'un module pour l'admin et la garde d'accès. */
export interface CourseModuleRef {
  id: string;
  num: number;
  title: string;
  displayTitle?: string;
}

/**
 * Renvoie la liste des modules d'un cours dans son ordre de parcours.
 * Tableau vide si le cours n'est pas modulaire.
 */
export function getCourseModuleList(courseId: string): CourseModuleRef[] {
  if (courseId === MAGNIFICA_HUMANITAS.meta.slug) {
    return MAGNIFICA_HUMANITAS.modules.map((m) => ({
      id: m.id,
      num: m.num,
      title: m.title,
      displayTitle: m.displayTitle,
    }));
  }
  return [];
}

/**
 * Cherche la règle d'accès configurée pour ce module. Renvoie une règle
 * « par défaut » (libre, complétion manuelle) si rien n'est configuré —
 * c'est l'état initial : tout est ouvert.
 */
export function getAccessRule(
  courseId: string,
  moduleId: string,
  rules: ModuleAccessRule[],
): ModuleAccessRule {
  const found = rules.find((r) => r.courseId === courseId && r.moduleId === moduleId);
  if (found) return found;
  return {
    id: `default-${courseId}-${moduleId}`,
    courseId,
    moduleId,
    prerequisiteModuleIds: [],
    completionMode: "manual",
  };
}

/** Un utilisateur a-t-il complété un module donné ? */
export function isModuleCompleted(
  userId: string,
  courseId: string,
  moduleId: string,
  completions: ModuleCompletion[],
): boolean {
  return completions.some(
    (c) => c.userId === userId && c.courseId === courseId && c.moduleId === moduleId,
  );
}

/** Trace de complétion d'un utilisateur pour un module donné (la plus récente). */
export function getModuleCompletion(
  userId: string,
  courseId: string,
  moduleId: string,
  completions: ModuleCompletion[],
): ModuleCompletion | undefined {
  return completions
    .filter(
      (c) => c.userId === userId && c.courseId === courseId && c.moduleId === moduleId,
    )
    .sort((a, b) => (a.completedAt > b.completedAt ? -1 : 1))[0];
}

/**
 * Décision d'accès à un module : accessible ? Si non, prérequis manquants.
 * L'administrateur passe toujours.
 */
export interface AccessVerdict {
  accessible: boolean;
  /** Liste des IDs de modules prérequis non encore complétés. */
  missingPrerequisites: string[];
}

export function checkModuleAccess(
  userId: string,
  isAdminUser: boolean,
  courseId: string,
  moduleId: string,
  rules: ModuleAccessRule[],
  completions: ModuleCompletion[],
): AccessVerdict {
  if (isAdminUser) {
    return { accessible: true, missingPrerequisites: [] };
  }
  const rule = getAccessRule(courseId, moduleId, rules);
  if (!rule.prerequisiteModuleIds || rule.prerequisiteModuleIds.length === 0) {
    return { accessible: true, missingPrerequisites: [] };
  }
  const missing = rule.prerequisiteModuleIds.filter(
    (preId) => !isModuleCompleted(userId, courseId, preId, completions),
  );
  return { accessible: missing.length === 0, missingPrerequisites: missing };
}

/** Libellé FR pour un mode de complétion. */
export function completionModeLabel(mode: ModuleAccessRule["completionMode"]): string {
  switch (mode) {
    case "manual":
      return "Validation manuelle";
    case "auto":
      return "Automatique à la lecture";
    case "quiz":
      return "Quiz avec score minimum";
  }
}
