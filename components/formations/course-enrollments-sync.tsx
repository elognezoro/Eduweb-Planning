"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { fetchCourseEnrollments } from "@/lib/formations/enrollments-server";

/**
 * Synchronisation descendante des inscriptions Supabase vers le store local.
 *
 * En mode réel, charge les inscriptions persistées (`course_enrollments`,
 * migration 008) dès que le profil est résolu, et les fusionne dans le store —
 * ainsi « Mes formations », CourseGate et les vues admin reflètent les
 * inscriptions serveur (dont l'auto-inscription par lien d'invitation), sur
 * n'importe quel appareil. Les pages existantes restent inchangées (elles
 * lisent toujours `store.courseEnrollments`).
 *
 * En mode démo, ce composant est inerte.
 */
const REAL_MODE = isSupabaseConfigured();

export function CourseEnrollmentsSync() {
  const app = useApp();
  const store = useStore();
  const syncedRef = React.useRef(false);

  React.useEffect(() => {
    if (!REAL_MODE || syncedRef.current) return;
    const userId = app.user.id;
    if (!userId) return; // attendre le profil
    syncedRef.current = true;
    (async () => {
      try {
        // La RLS limite d'elle-même (les siennes / toutes si admin).
        const rows = await fetchCourseEnrollments(createClient());
        if (rows.length > 0) store.mergeCourseEnrollments(rows);
      } catch {
        /* best effort : en cas d'échec on garde le store local */
      }
    })();
  }, [app.user.id, store]);

  return null;
}
