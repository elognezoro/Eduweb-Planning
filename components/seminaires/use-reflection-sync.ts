"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useSeminaireActivityContext } from "@/components/seminaires/activity-context";
import { useFormationRole } from "@/components/formations/use-formation-role";
import { isFacilitatorRole } from "@/lib/formations/formation-roles";
import { seminarProductionId } from "@/lib/seminaires/production-keys";
import {
  fetchCourseProductions,
  persistProductions,
  type SeminarProductionRow,
} from "@/lib/seminaires/productions-server";

/* ============================================================================
   Persistance Supabase des productions « réflexion personnelle » de séminaire
   (QCM, scénario de crise, auto-évaluation, correction IA, engagement —
   migration 032, types PRIVÉS). Singleton : une par (user, activité, kind).

   - L'apprenant : sa production est sauvegardée + ré-hydratée au montage (donc
     elle survit au rechargement / change d'appareil).
   - Le facilitateur (admin/enseignant/tuteur du cours) reçoit, via la RLS, les
     productions des AUTRES participants → un panneau formateur peut les afficher.

   `courseId`/`moduleId` viennent du SeminaireActivityProvider ; en leur absence
   (ex. rendu hors séminaire) ou en mode démo, le hook est inerte (comportement
   local inchangé).
   ========================================================================== */

export interface ReflectionSubmission<T> {
  userId: string;
  userName: string;
  userRole?: string;
  payload: T;
}

export interface ReflectionSync<T> {
  courseId: string | null;
  /** L'appelant peut-il consulter les productions des participants ? */
  canReview: boolean;
  /** Ma production (ré-hydratée depuis Supabase), ou null. */
  own: T | null;
  /** true une fois le 1er chargement terminé (pour ne ré-hydrater qu'une fois). */
  loaded: boolean;
  /** Productions des AUTRES participants (réservé au facilitateur via la RLS). */
  others: ReflectionSubmission<T>[];
  /** Persiste ma production (upsert déterministe). Inerte si pas de courseId. */
  save: (payload: T) => void;
  /** Recharge depuis Supabase. */
  refresh: () => void;
}

export function useReflectionSync<T>(
  activityId: string,
  kind: string,
): ReflectionSync<T> {
  const app = useApp();
  const ctx = useSeminaireActivityContext();
  const courseId = ctx?.courseId ?? null;
  const moduleId = ctx?.moduleId ?? "";
  const formationRole = useFormationRole(courseId ?? "");
  const canReview = isFacilitatorRole(formationRole);

  const [rows, setRows] = React.useState<SeminarProductionRow[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!courseId) {
      setLoaded(true);
      return;
    }
    const all = await fetchCourseProductions(courseId);
    if (all) {
      setRows(all.filter((r) => r.kind === kind && r.activityId === activityId));
    }
    setLoaded(true);
  }, [courseId, kind, activityId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const ownRow = rows.find((r) => r.userId === app.user.id);
  const own = (ownRow?.payload as T | undefined) ?? null;
  const others: ReflectionSubmission<T>[] = rows
    .filter((r) => r.userId !== app.user.id)
    .map((r) => ({
      userId: r.userId,
      userName: r.userName,
      userRole: r.userRole,
      payload: r.payload as T,
    }));

  const save = React.useCallback(
    (payload: T) => {
      if (!courseId) return;
      const id = seminarProductionId(kind, app.user.id, activityId);
      const row: SeminarProductionRow = {
        id,
        userId: app.user.id,
        userName: app.user.displayName,
        userRole: app.effectiveRole,
        courseId,
        moduleId,
        activityId,
        kind,
        payload,
      };
      setRows((rs) => [row, ...rs.filter((r) => r.id !== id)]);
      void persistProductions([row]);
    },
    [courseId, moduleId, activityId, kind, app.user.id, app.user.displayName, app.effectiveRole],
  );

  return {
    courseId,
    canReview,
    own,
    loaded,
    others,
    save,
    refresh: () => void load(),
  };
}
