"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import {
  fetchInstalledEstablishments,
  type InstalledEstablishment,
} from "@/lib/etablissements/etablissements-server";
import type { Etablissement } from "@/lib/types";

const REAL_MODE = isSupabaseConfigured();

/**
 * Source UNIQUE du répertoire d'établissements en mode réel.
 *
 * Hydrate le store `etablissements` depuis Supabase au montage : ainsi le tableau,
 * les KPIs et l'accordéon « Établissements installés » affichent EXACTEMENT la même
 * liste sur tous les postes/navigateurs d'un même compte (au lieu d'un répertoire
 * localStorage par-appareil qui divergeait). Les données de démo locales sont
 * remplacées par la vérité serveur. La création/import écrivent déjà côté serveur
 * (upsertEstablishment) puis ajoutent localement l'UUID → cohérence immédiate +
 * cross-poste à la prochaine hydratation.
 *
 * On ne remplace QUE si le serveur renvoie au moins une ligne, pour ne pas vider
 * le store sur une erreur réseau transitoire (fetch best-effort).
 */
function toEtablissement(it: InstalledEstablishment, fallbackCountry: string): Etablissement {
  const name = it.name || "—";
  return {
    id: it.id,
    code: it.code ?? "",
    name,
    shortName: name.split(/\s+/).slice(0, 2).join(" "),
    type: it.type ?? "—",
    countryCode: it.countryCode ?? fallbackCountry,
    academicRegionCode: it.regionName ?? "",
    locality: it.locality ?? "",
    status: "active",
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    attendanceRate: 0,
    successRate: 0,
    subscriptionPlan: "Standard",
    regime: it.regime ?? undefined,
    schoolYear: it.schoolYear ?? undefined,
  };
}

export function EtablissementsSync() {
  const app = useApp();
  const { setEtablissementsFromServer } = useStore();
  const syncedRef = React.useRef(false);

  React.useEffect(() => {
    if (!REAL_MODE || !app.user.id) return;
    if (syncedRef.current) return;
    syncedRef.current = true;
    (async () => {
      try {
        const rows = await fetchInstalledEstablishments(createClient());
        if (rows.length > 0) {
          const fallbackCountry = app.user.countryCode || "CI";
          setEtablissementsFromServer(rows.map((r) => toEtablissement(r, fallbackCountry)));
        }
      } catch {
        /* best effort : on conserve le répertoire local existant */
      }
    })();
  }, [app.user.id, app.user.countryCode, setEtablissementsFromServer]);

  return null;
}
