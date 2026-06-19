"use client";

import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { getEnrollmentVerdict } from "@/lib/formations/enrollment";
import {
  resolveFormationRole,
  type FormationRole,
} from "@/lib/formations/formation-roles";

/**
 * Résout le rôle de formation de l'utilisateur courant pour un cours donné.
 *
 * - L'administrateur applicatif global (ou super-administrateur) est toujours
 *   « admin » de formation (fail-open au sommet).
 * - Sinon, on lit le rôle porté par son inscription nominative ; à défaut, un
 *   participant inscrit (cohorte, rôle-auto…) est « étudiant ».
 * - Renvoie `null` si l'utilisateur n'est pas inscrit.
 */
export function useFormationRole(courseId: string): FormationRole | null {
  const app = useApp();
  const store = useStore();

  const verdict = getEnrollmentVerdict(
    app.user.id,
    app.effectiveRole,
    courseId,
    store.courseEnrollments,
    store.courseCohorts,
  );

  return resolveFormationRole({
    isGlobalAdmin: app.effectiveRole === "admin",
    enrolledRole: verdict.enrollment?.formationRole,
    enrolled: verdict.enrolled,
  });
}
