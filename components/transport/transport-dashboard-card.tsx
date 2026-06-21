"use client";

import * as React from "react";
import Link from "next/link";
import { Bus, ArrowRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/app-shell/app-context";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import {
  fetchBusPositions,
  isTransportSubscribed,
} from "@/lib/transport/transport-server";

/* ============================================================================
   Carte « Transport d'élèves » du tableau de bord d'accueil.
   - Abonné / admin : mini-statut (nombre de cars en ligne) + accès à la carte.
   - Non abonné : invitation à s'abonner. Inerte en mode démo.
   ========================================================================== */

const REAL = isSupabaseConfigured();

export function TransportDashboardCard() {
  const app = useApp();
  const isAdmin = app.effectiveRole === "admin";
  const userId = app.user.id;
  const [subscribed, setSubscribed] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!REAL || !userId) {
      setReady(true);
      return;
    }
    let stop = false;
    void (async () => {
      const sb = createClient();
      const sub = await isTransportSubscribed(sb, userId);
      if (stop) return;
      setSubscribed(sub);
      if (sub || isAdmin) {
        const pos = await fetchBusPositions(sb);
        if (!stop) setCount(pos.length);
      }
      if (!stop) setReady(true);
    })();
    return () => {
      stop = true;
    };
  }, [userId, isAdmin]);

  if (!REAL) return null;

  const active = subscribed || isAdmin;
  const title = active
    ? count > 0
      ? `${count} car${count > 1 ? "s" : ""} en ligne`
      : "Suivez le car en temps réel"
    : "Suivez le car de transport en temps réel";

  return (
    <div className="overflow-hidden rounded-2xl border border-ew-green-200 bg-gradient-to-r from-ew-green-50 via-card to-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ew-green-700 text-white">
            <Bus className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ew-green-700">
              Transport d&apos;élèves
            </p>
            <p className="flex items-center gap-1.5 font-display text-lg font-bold text-foreground">
              {active && count > 0 ? (
                <Radio className="h-4 w-4 text-ew-green-600" />
              ) : null}
              {title}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/vie-scolaire/transport">
            {active ? "Ouvrir la carte" : "S'abonner"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      {!active && ready ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Localisez le car à l&apos;aller et au retour, avec alerte sonore.
          Abonnement requis.
        </p>
      ) : null}
    </div>
  );
}
