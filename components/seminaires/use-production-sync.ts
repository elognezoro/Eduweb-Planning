"use client";

import * as React from "react";
import { useStore } from "@/components/app-shell/data-store";
import type {
  PollResponse,
  ForumPost,
  MindMapContribution,
} from "@/components/app-shell/data-store";
import {
  fetchCourseProductions,
  persistProductions,
  deleteProductionRemote,
  type SeminarProductionRow,
} from "@/lib/seminaires/productions-server";

/* ============================================================================
   Synchronisation Supabase des productions d'activité (sondage / forum / carte
   mentale — migration 032). Rend RÉELLES inter-utilisateurs les vues qui
   affichent déjà l'agrégat de tous les participants :
     - pull du cours au montage + toutes les 20 s (coalescé) ;
     - push des productions de l'utilisateur dès qu'elles changent.
   Inerte en mode démo (les fonctions serveur renvoient null / ne font rien).
   ========================================================================== */

/** Forme minimale commune à toutes les productions synchronisables. */
interface SyncableProduction {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  courseId: string;
  moduleId?: string;
  activityId: string;
}

// Coalescing module-level : évite que plusieurs activités d'une même page ne
// déclenchent des fetchs redondants dans la même fenêtre de 1,5 s.
const lastPull: Record<string, number> = {};

async function pullCourse(courseId: string, store: ReturnType<typeof useStore>) {
  const now = Date.now();
  if (lastPull[courseId] && now - lastPull[courseId] < 1500) return;
  lastPull[courseId] = now;
  const rows = await fetchCourseProductions(courseId);
  if (!rows) return;
  const groups: Record<string, unknown[]> = {};
  for (const r of rows) (groups[r.kind] ??= []).push(r.payload);
  if (groups.poll) store.mergePollResponses(groups.poll as PollResponse[]);
  if (groups.forum) store.mergeForumPosts(groups.forum as ForumPost[]);
  if (groups.mindmap)
    store.mergeMindMapContributions(groups.mindmap as MindMapContribution[]);
}

export function useProductionSync(
  courseId: string,
  kind: string,
  ownItems: SyncableProduction[],
) {
  const store = useStore();

  // Pull du cours au montage + rafraîchissement périodique (sessions live).
  React.useEffect(() => {
    void pullCourse(courseId, store);
    const t = setInterval(() => void pullCourse(courseId, store), 20000);
    return () => clearInterval(t);
  }, [courseId, store]);

  // Push des productions propres dès que leur contenu change (signature).
  const lastSig = React.useRef("");
  React.useEffect(() => {
    const sig = JSON.stringify(ownItems);
    if (sig === lastSig.current) return;
    lastSig.current = sig;
    if (!ownItems.length) return;
    const rows: SeminarProductionRow[] = ownItems.map((it) => ({
      id: it.id,
      userId: it.userId,
      userName: it.userName,
      userRole: it.userRole,
      courseId: it.courseId,
      moduleId: it.moduleId,
      activityId: it.activityId,
      kind,
      payload: it,
    }));
    void persistProductions(rows);
  }, [ownItems, kind]);
}

/** Supprime une production côté serveur (RLS : la sienne, ou admin). Best-effort. */
export function removeProductionRemote(id: string) {
  void deleteProductionRemote(id);
}
