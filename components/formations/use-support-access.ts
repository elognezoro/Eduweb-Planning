"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { useFormationRole } from "@/components/formations/use-formation-role";
import {
  evaluateCourseCompletion,
} from "@/lib/formations/course-completion";
import { getCourseCompletionRule } from "@/lib/formations/course-completion";
import {
  evaluateSupportAccess,
  getSupportCondition,
  type SupportAccessVerdict,
  type SupportKind,
} from "@/lib/formations/support-access";

/**
 * Résout l'accès de l'utilisateur courant aux supports téléchargeables d'un
 * cours, selon les conditions configurées par l'administrateur.
 *
 * Renvoie une fonction `check(support)` qui donne le verdict d'accès.
 * L'administrateur applicatif global passe toujours.
 */
export function useSupportAccess(
  courseId: string,
): (support: SupportKind) => SupportAccessVerdict {
  const app = useApp();
  const store = useStore();
  const formationRole = useFormationRole(courseId);

  const isAdminUser = app.effectiveRole === "admin";

  // Verdict de réussite (pour la condition « après réussite de la formation »).
  const completion = React.useMemo(() => {
    const rule = getCourseCompletionRule(courseId, store.courseCompletionRules);
    return evaluateCourseCompletion(
      app.user.id,
      isAdminUser,
      courseId,
      rule,
      store.moduleCompletions,
      store.courseCompletions,
    );
  }, [
    courseId,
    app.user.id,
    isAdminUser,
    store.courseCompletionRules,
    store.moduleCompletions,
    store.courseCompletions,
  ]);

  return React.useCallback(
    (support: SupportKind) => {
      const condition = getSupportCondition(courseId, support, store.supportAccessRules);
      return evaluateSupportAccess({
        condition,
        isAdminUser,
        formationRole,
        completion,
        now: new Date(),
      });
    },
    [courseId, store.supportAccessRules, isAdminUser, formationRole, completion],
  );
}
