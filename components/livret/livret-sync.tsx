"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { fetchLivretGrades, fetchLivretRecords } from "@/lib/livret/livret-server";

/**
 * Synchronisation descendante du livret scolaire (Supabase → store local).
 *
 * En mode réel, charge `livret_grades` + `livret_records` (migration 025) dès
 * que le profil est résolu et les fusionne dans le store — ainsi l'éditeur, le
 * rendu et les exports reflètent les notes et observations partagées, sur
 * n'importe quel appareil. Les écritures se font en write-through (les pages
 * écrivent à la fois dans le store et côté serveur). En mode démo, inerte.
 */
const REAL_MODE = isSupabaseConfigured();

export function LivretSync() {
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
        const client = createClient();
        const [grades, records] = await Promise.all([
          fetchLivretGrades(client),
          fetchLivretRecords(client),
        ]);
        if (grades.length > 0) store.mergeLivretGrades(grades);
        if (records.length > 0) store.mergeLivretRecords(records);
      } catch {
        /* best effort : en cas d'échec on garde le store local */
      }
    })();
  }, [app.user.id, store]);

  return null;
}
