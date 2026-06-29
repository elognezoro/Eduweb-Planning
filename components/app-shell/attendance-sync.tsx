"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore, type AttendanceRow } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { fetchAttendance, upsertAttendance } from "@/lib/attendance/attendance-server";

const REAL_MODE = isSupabaseConfigured();

/**
 * Persiste le registre d'appel (présences) côté Supabase, cloisonné par
 * établissement (migration 043) → la prise de présence est visible et reprise
 * sur tous les postes d'un même établissement, plus seulement le navigateur de
 * saisie.
 *
 * - Chargement au montage : serveur = autorité (fusionné dans le store).
 * - Write-through par DIFF : seules les lignes modifiées localement sont
 *   ré-écrites (la base de comparaison est le dernier état confirmé, ce qui
 *   évite de ré-uploader les lignes venant du serveur).
 *
 * Utilise l'établissement RÉEL de l'utilisateur (jamais la portée d'aperçu).
 */
export function AttendanceSync() {
  const app = useApp();
  const etablissementId = app.user.etablissementId || null;
  const { attendance, mergeAttendance } = useStore();

  const loadedRef = React.useRef(false);
  const lastRef = React.useRef<Record<string, AttendanceRow>>({});
  const syncKeyRef = React.useRef<string | null>(null);

  // Chargement initial (serveur → store) à la résolution de l'établissement réel.
  React.useEffect(() => {
    if (!REAL_MODE || !app.user.id || !etablissementId) return;
    if (syncKeyRef.current === etablissementId) return;
    syncKeyRef.current = etablissementId;
    loadedRef.current = false;
    (async () => {
      try {
        const remote = await fetchAttendance(createClient(), etablissementId);
        mergeAttendance(remote);
        lastRef.current = { ...remote }; // base = serveur → pas de ré-upload
      } catch {
        /* best effort : on conserve le registre local */
      } finally {
        loadedRef.current = true;
      }
    })();
  }, [app.user.id, etablissementId, mergeAttendance]);

  // Write-through : upsert des lignes réellement modifiées localement.
  React.useEffect(() => {
    if (!REAL_MODE || !etablissementId || !loadedRef.current) return;
    const changed = Object.keys(attendance).filter((k) => attendance[k] !== lastRef.current[k]);
    if (changed.length === 0) return;
    const sb = createClient();
    (async () => {
      for (const key of changed) {
        const row = attendance[key];
        const res = await upsertAttendance(sb, etablissementId, key, row, app.user.id);
        if (res.ok) lastRef.current[key] = row;
      }
    })();
  }, [attendance, etablissementId, app.user.id]);

  return null;
}
