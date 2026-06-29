"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore, type PromoRequest } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import {
  fetchPromoRequests,
  insertPromoRequest,
  updatePromoDecision,
} from "@/lib/promo/promo-server";

const REAL_MODE = isSupabaseConfigured();

/**
 * Persiste les demandes de code promo (per-utilisateur, migration 044) :
 *  - chargement au montage : le serveur fait autorité (les siennes, ou toutes si
 *    admin via RLS) → REMPLACE les demandes locales (évite la pollution par les
 *    seeds de démo).
 *  - write-through par DIFF, activé après chargement confirmé :
 *      • nouvelle demande locale (apprenant) → INSERT (user_id = soi) ;
 *      • demande déjà connue mais modifiée (décision admin) → UPDATE (sans
 *        toucher user_id).
 *
 * Ainsi une demande déposée sur un poste arrive à l'admin, et la décision revient
 * au demandeur, quel que soit l'appareil.
 */
export function PromoRequestsSync() {
  const app = useApp();
  const { promoRequests, setPromoRequestsFromServer } = useStore();
  const [loaded, setLoaded] = React.useState(false);
  const knownRef = React.useRef<Map<string, PromoRequest>>(new Map());

  // 1) Chargement (serveur = autorité).
  React.useEffect(() => {
    if (!REAL_MODE || !app.user.id || loaded) return;
    let active = true;
    (async () => {
      try {
        const rows = await fetchPromoRequests(createClient());
        if (!active) return;
        setPromoRequestsFromServer(rows);
        knownRef.current = new Map(rows.map((r) => [r.id, r]));
        setLoaded(true);
      } catch {
        /* échec : write-through laissé désactivé (anti-écrasement) */
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.user.id]);

  // 2) Write-through (après chargement confirmé) : insert nouvelles / update décisions.
  React.useEffect(() => {
    if (!REAL_MODE || !loaded) return;
    const sb = createClient();
    const known = knownRef.current;
    for (const r of promoRequests) {
      const prev = known.get(r.id);
      if (!prev) {
        void insertPromoRequest(sb, r).then((res) => {
          if (res.ok) known.set(r.id, r);
        });
      } else if (JSON.stringify(prev) !== JSON.stringify(r)) {
        void updatePromoDecision(sb, r).then((res) => {
          if (res.ok) known.set(r.id, r);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, promoRequests]);

  return null;
}
