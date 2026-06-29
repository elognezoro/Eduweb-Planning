"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { fetchEtabConfig } from "@/lib/etab-config-server";
import { ETAB_CONFIG_KEY } from "@/lib/etab-config";

const REAL_MODE = isSupabaseConfigured();

/**
 * Hydrate la configuration d'établissement depuis Supabase au montage et l'écrit
 * dans le cache localStorage (`ETAB_CONFIG_KEY`). Ainsi `loadEtabConfig()` /
 * `etabExportMeta()` — synchrones, utilisés par les bulletins, le livret et les
 * certificats — reflètent la config PARTAGÉE sur n'importe quel poste, sans
 * modifier ces fonctions.
 *
 * Utilise l'établissement RÉEL de l'utilisateur (`app.user.etablissementId`) car
 * le RLS serveur s'appuie sur `auth.uid()` réel — surtout pas la portée d'aperçu.
 */
export function EtabConfigSync() {
  const app = useApp();
  const etabId = app.user.etablissementId ?? null;
  const syncedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!REAL_MODE || !app.user.id || !etabId) return;
    if (syncedRef.current === etabId) return;
    syncedRef.current = etabId;
    (async () => {
      try {
        const remote = await fetchEtabConfig(createClient(), etabId);
        if (remote && typeof remote === "object") {
          localStorage.setItem(ETAB_CONFIG_KEY, JSON.stringify(remote));
        }
      } catch {
        /* best effort : on conserve le cache local existant */
      }
    })();
  }, [app.user.id, etabId]);

  return null;
}
