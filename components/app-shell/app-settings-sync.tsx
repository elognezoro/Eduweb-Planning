"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore, type StoreState } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/super-admins";
import { fetchAppSettings, saveAppSetting } from "@/lib/app-settings-server";

const REAL_MODE = isSupabaseConfigured();

/**
 * Réglages GLOBAUX admin persistés dans app_settings (clé = nom du champ de la
 * slice du store) : gouvernance des formations (Lot 2) + registres admin (Lot 5).
 * Tous sont en écriture admin-only (RLS) et lecture authentifiée.
 * EXCLUS volontairement : apfcs/apfcActivities (table dédiée, migr. 021),
 * promoRequests (écriture apprenant), certificates/grantLog (journal/PII).
 */
const GOV_KEYS: readonly (keyof StoreState)[] = [
  // Gouvernance des formations (Lot 2)
  "coursePrices",
  "certificateConfigs",
  "moduleAccessRules",
  "supportAccessRules",
  "courseScheduleRules",
  "courseCompletionRules",
  "paymentSettings",
  // Registres globaux admin (Lot 5)
  "partners",
  "customRegions",
  "roleOverrides",
  "regionalStructures",
  "cafops",
  "cafopModules",
  "cafopFormationYears",
  "userGrants",
];

/**
 * Synchronise les réglages globaux admin (gouvernance des formations) avec
 * Supabase :
 *  - au montage : charge depuis le serveur (AUTORITÉ) → store ;
 *  - write-through : pousse au serveur (débouncé) les slices modifiées, mais
 *    UNIQUEMENT pour un admin et UNIQUEMENT après le chargement (anti-écrasement
 *    de la donnée serveur par le cache local au démarrage). Le RLS reste l'autorité.
 *  - Mode démo (!REAL_MODE) : ne fait rien (localStorage inchangé).
 */
export function AppSettingsSync() {
  const app = useApp();
  const store = useStore();
  const [loaded, setLoaded] = React.useState(false);
  const lastRef = React.useRef<Record<string, string>>({});
  const timersRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const isAdmin = app.realRole === "admin" || isSuperAdminEmail(app.user.email);

  // 1) Chargement (serveur = autorité) une fois l'utilisateur connu.
  React.useEffect(() => {
    if (!REAL_MODE || !app.user.id || loaded) return;
    let active = true;
    (async () => {
      try {
        const remote = await fetchAppSettings(createClient(), [...GOV_KEYS]);
        if (!active) return;
        const partial: Record<string, unknown> = {};
        for (const k of GOV_KEYS) {
          const v = remote[k];
          if (v !== null && v !== undefined) {
            partial[k] = v;
            lastRef.current[k] = JSON.stringify(v);
          }
        }
        if (Object.keys(partial).length) {
          store.applyServerSettings(partial as Partial<StoreState>);
        }
        // Serveur CONFIRMÉ joignable → on autorise le write-through.
        setLoaded(true);
      } catch {
        // Échec réseau/RLS : on NE confirme PAS le serveur → write-through laissé
        // désactivé (anti-écrasement du serveur par le cache local). Réessai au
        // prochain chargement de page.
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.user.id]);

  // 2) Write-through admin (débouncé), après chargement uniquement.
  React.useEffect(() => {
    if (!REAL_MODE || !isAdmin || !loaded) return;
    const rec = store as unknown as Record<string, unknown>;
    for (const k of GOV_KEYS) {
      const value = rec[k];
      // Ne JAMAIS persister une slice nulle/indéfinie (anti-corruption serveur).
      if (value === null || value === undefined) continue;
      const cur = JSON.stringify(value);
      if (cur !== lastRef.current[k]) {
        clearTimeout(timersRef.current[k]);
        timersRef.current[k] = setTimeout(() => {
          void saveAppSetting(createClient(), k, value).then((res) => {
            // lastRef confirmé UNIQUEMENT au succès → réessai au prochain changement.
            if (res.ok) lastRef.current[k] = cur;
          });
        }, 700);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loaded,
    isAdmin,
    store.coursePrices,
    store.certificateConfigs,
    store.moduleAccessRules,
    store.supportAccessRules,
    store.courseScheduleRules,
    store.courseCompletionRules,
    store.paymentSettings,
    store.partners,
    store.customRegions,
    store.roleOverrides,
    store.regionalStructures,
    store.cafops,
    store.cafopModules,
    store.cafopFormationYears,
    store.userGrants,
  ]);

  // Nettoyage des minuteurs au démontage.
  React.useEffect(
    () => () => {
      for (const tmr of Object.values(timersRef.current)) clearTimeout(tmr);
    },
    [],
  );

  return null;
}
