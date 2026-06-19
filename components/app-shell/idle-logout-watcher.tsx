"use client";

import * as React from "react";
import { AlertTriangle, LogOut, Timer } from "lucide-react";
import { useStore } from "@/components/app-shell/data-store";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Surveillance d'inactivité globale : déconnecte automatiquement
 * l'utilisateur après une période d'inactivité configurée par l'admin.
 *
 * - Paramètres lus dans `useStore().securitySettings` (idleLogoutEnabled,
 *   idleLogoutMinutes, idleWarningSeconds).
 * - Événements écoutés : mousemove, mousedown, keydown, touchstart,
 *   wheel, scroll. Chaque événement réinitialise le compteur.
 * - À T - idleWarningSeconds : une boîte de dialogue apparaît, comptant
 *   à rebours. Toute interaction la masque (sauf si « Rester connecté »
 *   est cliqué : le timer reprend immédiatement).
 * - À T = 0 : signOut Supabase (en mode réel) + redirection vers /login.
 *   En mode démo : redirection vers /login (sans signOut, RBAC reste fail-closed).
 *
 * Monté dans le layout dashboard ; ne fait rien si le réglage est désactivé.
 */
export function IdleLogoutWatcher() {
  const settings = useStore().securitySettings;
  const enabled = settings.idleLogoutEnabled;
  const idleMs = settings.idleLogoutMinutes * 60 * 1000;
  const warnMs = settings.idleWarningSeconds * 1000;

  const [phase, setPhase] = React.useState<"idle" | "warning">("idle");
  const [remaining, setRemaining] = React.useState<number>(0);

  // Timers en refs pour éviter de réinitialiser au re-render.
  const idleTimerRef = React.useRef<number | null>(null);
  const warningTimerRef = React.useRef<number | null>(null);
  const countdownTimerRef = React.useRef<number | null>(null);

  const clearAll = React.useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (warningTimerRef.current !== null) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const performLogout = React.useCallback(async () => {
    clearAll();
    setPhase("idle");
    try {
      if (isSupabaseConfigured()) {
        await createClient().auth.signOut();
      }
    } catch {
      /* best effort */
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login?idle=1";
    }
  }, [clearAll]);

  // Réinitialisation complète à partir d'une activité utilisateur.
  const resetTimers = React.useCallback(() => {
    if (!enabled) return;
    clearAll();
    setPhase("idle");
    idleTimerRef.current = window.setTimeout(() => {
      // Entrée en phase d'avertissement avec compte à rebours.
      setPhase("warning");
      const endsAt = Date.now() + warnMs;
      setRemaining(Math.ceil(warnMs / 1000));
      countdownTimerRef.current = window.setInterval(() => {
        const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
        setRemaining(left);
      }, 250);
      warningTimerRef.current = window.setTimeout(() => {
        void performLogout();
      }, warnMs);
    }, Math.max(0, idleMs - warnMs));
  }, [enabled, idleMs, warnMs, clearAll, performLogout]);

  // Hook d'écoute des événements utilisateur.
  React.useEffect(() => {
    if (!enabled) {
      clearAll();
      setPhase("idle");
      return;
    }
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "wheel",
      "scroll",
    ];
    function onActivity() {
      // Pendant la phase d'avertissement, on NE réinitialise PAS automatiquement
      // : l'utilisateur doit cliquer « Rester connecté » pour confirmer sa
      // présence (évite qu'un mouvement involontaire annule la déconnexion sans
      // qu'il en ait conscience).
      if (phase === "warning") return;
      resetTimers();
    }
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    // Démarre le premier compteur dès le montage.
    resetTimers();
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearAll();
    };
  }, [enabled, phase, resetTimers, clearAll]);

  if (!enabled || phase !== "warning") return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="idle-title"
      aria-describedby="idle-desc"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border border-ew-gold-200 bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-700">
            <AlertTriangle aria-hidden className="h-6 w-6" />
          </span>
          <div>
            <p id="idle-title" className="font-display text-lg font-extrabold text-foreground">
              Déconnexion imminente
            </p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Inactivité prolongée détectée
            </p>
          </div>
        </div>
        <p id="idle-desc" className="mt-3 text-sm text-foreground/90">
          Pour votre sécurité, vous allez être déconnecté(e) dans{" "}
          <strong className="text-ew-gold-700">{remaining} seconde{remaining > 1 ? "s" : ""}</strong>.
          Souhaitez-vous rester connecté(e) ?
        </p>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/40"
          aria-hidden
        >
          <div
            className="h-full bg-ew-gold-500 transition-all duration-200"
            style={{
              width: `${Math.max(0, Math.min(100, (remaining / settings.idleWarningSeconds) * 100))}%`,
            }}
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => void performLogout()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/40"
          >
            <LogOut aria-hidden className="h-4 w-4" /> Se déconnecter maintenant
          </button>
          <button
            type="button"
            onClick={() => resetTimers()}
            autoFocus
            className="inline-flex items-center gap-1.5 rounded-lg bg-ew-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-ew-green-800"
          >
            <Timer aria-hidden className="h-4 w-4" /> Rester connecté(e)
          </button>
        </div>
      </div>
    </div>
  );
}
