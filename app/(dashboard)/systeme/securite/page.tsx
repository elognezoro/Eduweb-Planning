"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";

/**
 * Page « Sécurité de session » — réservée à l'admin (system:manage_permissions).
 *
 * Permet de configurer la déconnexion automatique par inactivité,
 * appliquée à tous les utilisateurs de la plateforme. Les paramètres
 * sont persistés dans le data-store (localStorage en mode démo, à
 * répliquer dans Supabase en mode réel).
 */
export default function SecuritySettingsPage() {
  return (
    <ModulePage
      title="Sécurité de session"
      description="Paramètres globaux appliqués à tous les utilisateurs de la plateforme."
      icon={ShieldCheck}
      permission="system:manage_permissions"
      showContextBadge={false}
      kpis={[]}
    >
      <SecurityContent />
    </ModulePage>
  );
}

function SecurityContent() {
  const store = useStore();
  const app = useApp();
  const current = store.securitySettings;

  const [enabled, setEnabled] = React.useState<boolean>(current.idleLogoutEnabled);
  const [minutes, setMinutes] = React.useState<number>(current.idleLogoutMinutes);
  const [warnSec, setWarnSec] = React.useState<number>(current.idleWarningSeconds);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    setEnabled(current.idleLogoutEnabled);
    setMinutes(current.idleLogoutMinutes);
    setWarnSec(current.idleWarningSeconds);
  }, [current.idleLogoutEnabled, current.idleLogoutMinutes, current.idleWarningSeconds]);

  const hasChanges =
    enabled !== current.idleLogoutEnabled ||
    minutes !== current.idleLogoutMinutes ||
    warnSec !== current.idleWarningSeconds;

  function save() {
    store.setSecuritySettings({
      idleLogoutEnabled: enabled,
      idleLogoutMinutes: minutes,
      idleWarningSeconds: warnSec,
    });
    setSavedAt(Date.now());
  }

  function reset() {
    store.setSecuritySettings({
      idleLogoutEnabled: false,
      idleLogoutMinutes: 20,
      idleWarningSeconds: 30,
    });
  }

  return (
    <div className="space-y-5">
      <SectionCard
        title="Déconnexion automatique par inactivité"
        description="L'utilisateur est automatiquement déconnecté après la durée d'inactivité définie."
      >
        <div className="space-y-5">
          <div className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3 text-xs">
            <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
              <ShieldCheck aria-hidden className="h-3.5 w-3.5" /> Portée du réglage
            </p>
            <p className="mt-1 text-foreground/90">
              Une fois activée, la déconnexion automatique s&apos;applique à{" "}
              <strong>tous les utilisateurs de la plateforme</strong>, quel que soit
              leur rôle. Un avertissement précède la déconnexion pour permettre à
              l&apos;utilisateur de prolonger sa session.
            </p>
            <p className="mt-1 italic text-muted-foreground">
              Connecté en tant que{" "}
              <strong className="text-ew-green-800">{app.user.email}</strong>
              {app.effectiveRole === "admin" ? " (administrateur système)" : ""}.
            </p>
          </div>

          {/* Toggle activation */}
          <label className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-4 hover:bg-muted/20">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mt-0.5 h-5 w-5 accent-ew-green-700"
              aria-describedby="idle-helper"
            />
            <div className="flex-1">
              <p className="font-display text-sm font-bold text-foreground">
                Activer la déconnexion automatique par inactivité
              </p>
              <p id="idle-helper" className="mt-1 text-xs text-muted-foreground">
                Désactivé par défaut. Activez-le pour fermer automatiquement les
                sessions inactives.
              </p>
            </div>
          </label>

          {/* Durées */}
          <div
            className={`grid gap-4 sm:grid-cols-2 ${!enabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <div className="rounded-xl border border-border bg-card p-4">
              <label
                htmlFor="idle-minutes"
                className="text-xs font-bold uppercase tracking-wide text-ew-green-700"
              >
                Durée d&apos;inactivité avant déconnexion
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="idle-minutes"
                  type="number"
                  min={1}
                  max={240}
                  step={1}
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(Math.max(1, Math.min(240, Number(e.target.value))))
                  }
                  disabled={!enabled}
                  className="h-10 w-24 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
              <p className="mt-2 text-[11px] italic text-muted-foreground">
                Plage autorisée : 1 à 240 minutes. Valeur recommandée : 15 à 30
                minutes pour un usage en établissement scolaire.
              </p>
              {/* Boutons rapides */}
              <div className="mt-2 flex flex-wrap gap-1">
                {[5, 10, 15, 20, 30, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutes(m)}
                    disabled={!enabled}
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                      minutes === m
                        ? "border-ew-green-600 bg-ew-green-100 text-ew-green-900"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <label
                htmlFor="idle-warning"
                className="text-xs font-bold uppercase tracking-wide text-ew-green-700"
              >
                Durée de l&apos;avertissement préventif
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="idle-warning"
                  type="number"
                  min={10}
                  max={120}
                  step={5}
                  value={warnSec}
                  onChange={(e) =>
                    setWarnSec(Math.max(10, Math.min(120, Number(e.target.value))))
                  }
                  disabled={!enabled}
                  className="h-10 w-24 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-sm text-muted-foreground">secondes</span>
              </div>
              <p className="mt-2 text-[11px] italic text-muted-foreground">
                Une boîte de dialogue avec compte à rebours apparaît
                avant la déconnexion ; l&apos;utilisateur peut cliquer «&nbsp;Rester
                connecté(e)&nbsp;» pour prolonger sa session.
              </p>
            </div>
          </div>

          {/* Résumé du comportement */}
          {enabled ? (
            <div className="rounded-xl border-l-4 border-ew-green-500 bg-ew-green-50 px-4 py-3 text-sm">
              <p className="flex items-center gap-2 font-bold text-ew-green-800">
                <CheckCircle2 aria-hidden className="h-4 w-4" /> Aperçu du comportement
              </p>
              <p className="mt-1 text-foreground/90">
                Après <strong>{minutes} minute{minutes > 1 ? "s" : ""}</strong>{" "}
                d&apos;inactivité (aucun mouvement de souris, frappe ou défilement),
                un avertissement apparaît pendant <strong>{warnSec} secondes</strong>.
                Si l&apos;utilisateur n&apos;agit pas, il est{" "}
                <strong>déconnecté automatiquement</strong> et redirigé vers la
                page de connexion.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border-l-4 border-ew-gold-500 bg-ew-gold-50 px-4 py-3 text-sm">
              <p className="flex items-center gap-2 font-bold text-ew-gold-700">
                <AlertTriangle aria-hidden className="h-4 w-4" /> Réglage désactivé
              </p>
              <p className="mt-1 text-foreground/90">
                Les sessions ne se ferment pas automatiquement. Pour les usages en
                établissement (postes partagés, salle informatique), il est
                recommandé d&apos;activer la déconnexion automatique.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {savedAt && !hasChanges ? (
                <span className="text-ew-green-700">
                  ✓ Paramètres enregistrés à{" "}
                  {new Date(savedAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              ) : hasChanges ? (
                <span className="italic">Modifications non enregistrées.</span>
              ) : (
                <span className="italic">Configuration actuelle.</span>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                Réinitialiser
              </Button>
              <Button size="sm" onClick={save} disabled={!hasChanges}>
                <Save className="h-4 w-4" /> Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
