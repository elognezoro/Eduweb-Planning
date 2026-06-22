"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { fetchCohorts } from "@/lib/formations/cohorts-server";

/**
 * Synchronisation descendante des cohortes Supabase vers le store local
 * (table course_cohorts, migration 023). En mode réel, charge les cohortes
 * persistées dès que le profil est résolu et les fusionne dans le store
 * (dédoublonnage par id). La RLS `cc_all` limite la lecture à l'admin ; pour un
 * non-admin la requête renvoie simplement [] (inerte). En mode démo, inerte.
 */
const REAL_MODE = isSupabaseConfigured();

export function CohortsSync() {
  const app = useApp();
  const store = useStore();
  const syncedRef = React.useRef(false);

  React.useEffect(() => {
    if (!REAL_MODE || syncedRef.current) return;
    const userId = app.user.id;
    if (!userId) return;
    syncedRef.current = true;
    (async () => {
      try {
        const rows = await fetchCohorts(createClient());
        if (rows.length > 0) store.mergeCohorts(rows);
      } catch {
        /* best effort : on garde le store local */
      }
    })();
  }, [app.user.id, store]);

  return null;
}
