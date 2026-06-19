import { getCourseModuleList } from "./module-access";
import type {
  CourseCompletion,
  CourseCompletionRule,
  ModuleCompletion,
} from "./types";

/**
 * Vérifications de la « réussite du cours » (achèvement de la formation).
 *
 * Indépendantes des règles d'accès aux modules (cf. module-access.ts) :
 * la réussite est un état d'achèvement, pas une garde de lecture.
 *
 * Quand la règle est `all-modules`, l'achèvement est calculé à partir
 * des `ModuleCompletion` existantes. Quand elle est `quiz-score`, il
 * peut être marqué par une `CourseCompletion` explicite (déclenchée
 * par la page Magnifica quand l'utilisateur réussit le quiz sommatif).
 * Le mode `manual-admin` exige une trace explicite ; le mode combiné
 * vérifie les deux conditions.
 */

/** ID spécial désignant le quiz sommatif (multi-banques) du séminaire. */
export const SUMMATIVE_QUIZ_ID = "quiz-sommatif" as const;

/**
 * Retourne la règle de réussite d'un cours ou une règle par défaut.
 * - Cours modulaire (au moins un module) → `all-modules`
 * - Cours sans module (séminaire à diapositives, manuel…) → `manual-admin`
 *   pour éviter qu'un cours non-modulaire reste verrouillé à jamais sous
 *   `all-modules` (0/0 modules ne peut pas valider la formation).
 */
export function getCourseCompletionRule(
  courseId: string,
  rules: CourseCompletionRule[],
): CourseCompletionRule {
  const found = rules.find((r) => r.courseId === courseId);
  if (found) return found;
  const hasModules = getCourseModuleList(courseId).length > 0;
  return {
    id: `default-${courseId}`,
    courseId,
    mode: hasModules ? "all-modules" : "manual-admin",
    minQuizScore: 70,
    quizModuleId: SUMMATIVE_QUIZ_ID,
    certificateAuto: false,
  };
}

/** Progression du cours pour un utilisateur. */
export interface CourseProgress {
  /** Nombre de modules complétés (selon ModuleCompletion). */
  completed: number;
  /** Nombre total de modules dans le cours. */
  total: number;
  /** Ratio 0-1 ; 0 si total = 0. */
  ratio: number;
}

export function getCourseProgress(
  userId: string,
  courseId: string,
  moduleCompletions: ModuleCompletion[],
): CourseProgress {
  const modules = getCourseModuleList(courseId);
  const total = modules.length;
  if (total === 0) return { completed: 0, total: 0, ratio: 0 };
  const completed = modules.filter((m) =>
    moduleCompletions.some(
      (c) => c.userId === userId && c.courseId === courseId && c.moduleId === m.id,
    ),
  ).length;
  return { completed, total, ratio: completed / total };
}

/** Trace de réussite la plus récente, ou undefined. */
export function getCourseCompletion(
  userId: string,
  courseId: string,
  completions: CourseCompletion[],
): CourseCompletion | undefined {
  return completions
    .filter((c) => c.userId === userId && c.courseId === courseId)
    .sort((a, b) => (a.completedAt > b.completedAt ? -1 : 1))[0];
}

/** Verdict d'achèvement détaillé. */
export interface CourseCompletionVerdict {
  /** Le cours est-il considéré comme réussi pour cet utilisateur ? */
  completed: boolean;
  /** Source effective de l'achèvement. */
  source?: "auto-modules" | "quiz" | "manual-admin";
  /** Trace persistée si présente. */
  completion?: CourseCompletion;
  /** Progression modulaire actuelle. */
  progress: CourseProgress;
  /** Si false : explication courte pour l'UI. */
  reason?: string;
}

/**
 * Décide si un cours est achevé par un utilisateur en fonction de la règle.
 *
 * L'administrateur passe toujours (mais on continue d'enregistrer le
 * progrès réel : on retourne `completed: true` sans trace fabriquée).
 */
export function evaluateCourseCompletion(
  userId: string,
  isAdminUser: boolean,
  courseId: string,
  rule: CourseCompletionRule,
  moduleCompletions: ModuleCompletion[],
  courseCompletions: CourseCompletion[],
): CourseCompletionVerdict {
  const progress = getCourseProgress(userId, courseId, moduleCompletions);
  const explicit = getCourseCompletion(userId, courseId, courseCompletions);

  if (isAdminUser) {
    return {
      completed: true,
      source: explicit?.source,
      completion: explicit,
      progress,
    };
  }

  switch (rule.mode) {
    case "all-modules": {
      const ok = progress.total > 0 && progress.completed === progress.total;
      return {
        completed: ok,
        source: ok ? "auto-modules" : undefined,
        completion: explicit,
        progress,
        reason: ok
          ? undefined
          : `Vous avez complété ${progress.completed}/${progress.total} modules.`,
      };
    }
    case "quiz-score": {
      const ok =
        !!explicit &&
        explicit.source === "quiz" &&
        (explicit.score ?? 0) >= (rule.minQuizScore ?? 70);
      return {
        completed: ok,
        source: ok ? "quiz" : undefined,
        completion: explicit,
        progress,
        reason: ok
          ? undefined
          : `Atteignez un score d'au moins ${rule.minQuizScore ?? 70}% au quiz désigné pour valider la formation.`,
      };
    }
    case "all-modules-and-quiz": {
      const modulesOk = progress.total > 0 && progress.completed === progress.total;
      const quizOk =
        !!explicit &&
        explicit.source === "quiz" &&
        (explicit.score ?? 0) >= (rule.minQuizScore ?? 70);
      const ok = modulesOk && quizOk;
      const missing = [
        modulesOk ? null : `${progress.completed}/${progress.total} modules complétés`,
        quizOk ? null : `score quiz minimum ${rule.minQuizScore ?? 70}% à atteindre`,
      ].filter(Boolean);
      return {
        completed: ok,
        source: ok ? "quiz" : undefined,
        completion: explicit,
        progress,
        reason: ok ? undefined : `Pour valider : ${missing.join(" et ")}.`,
      };
    }
    case "manual-admin": {
      const ok = !!explicit && explicit.source === "manual-admin";
      return {
        completed: ok,
        source: ok ? "manual-admin" : undefined,
        completion: explicit,
        progress,
        reason: ok
          ? undefined
          : "La réussite de cette formation est prononcée manuellement par l'administrateur.",
      };
    }
  }
}

/** Libellé FR pour un mode de réussite. */
export function completionRuleModeLabel(
  mode: CourseCompletionRule["mode"],
): string {
  switch (mode) {
    case "all-modules":
      return "Tous les modules complétés";
    case "quiz-score":
      return "Quiz avec score minimum";
    case "all-modules-and-quiz":
      return "Tous les modules + quiz avec score";
    case "manual-admin":
      return "Validation manuelle de l'administrateur";
  }
}

/** Libellé FR pour la source d'une réussite. */
export function completionSourceLabel(
  source: CourseCompletion["source"] | undefined,
): string {
  switch (source) {
    case "auto-modules":
      return "Auto · tous les modules complétés";
    case "quiz":
      return "Quiz sommatif réussi";
    case "manual-admin":
      return "Validé par l'administrateur";
    default:
      return "—";
  }
}
