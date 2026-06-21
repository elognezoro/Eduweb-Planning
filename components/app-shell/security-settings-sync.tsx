"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { fetchSecuritySettings } from "@/lib/security/security-server";

/**
 * Synchronisation descendante des réglages de sécurité globaux (migration 015)
 * vers le store local.
 *
 * En mode réel, dès que le profil est résolu, charge la configuration de
 * déconnexion automatique définie par le super-admin / l'admin et l'applique au
 * store de CHAQUE utilisateur — de sorte que la durée d'inactivité réglée une
 * seule fois s'impose à tous, sur tous les appareils. `IdleLogoutWatcher` lit
 * ensuite ces valeurs comme avant.
 *
 * En mode démo, ce composant est inerte (les réglages restent locaux).
 */
const REAL_MODE = isSupabaseConfigured();

export function SecuritySettingsSync() {
  const app = useApp();
  const store = useStore();
  const syncedRef = React.useRef(false);

  React.useEffect(() => {
    if (!REAL_MODE || syncedRef.current) return;
    if (!app.user.id) return; // attendre le profil
    syncedRef.current = true;
    (async () => {
      try {
        const remote = await fetchSecuritySettings(createClient());
        if (remote) store.setSecuritySettings(remote);
      } catch {
        /* best effort : on conserve les réglages locaux en cas d'échec */
      }
    })();
  }, [app.user.id, store]);

  return null;
}
