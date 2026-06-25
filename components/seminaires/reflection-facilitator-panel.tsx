"use client";

import * as React from "react";
import { Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReflectionSubmission } from "./use-reflection-sync";

/* ============================================================================
   Panneau formateur générique pour les productions « réflexion » privées.
   Liste les productions des AUTRES participants (fournies par la RLS au
   facilitateur) ; chaque production est rendue par la fonction `render` propre
   au type (QCM, auto-évaluation, correction IA…). Réservé aux facilitateurs :
   le composant appelant ne le monte que si `canReview`.
   ========================================================================== */

export function ReflectionFacilitatorPanel<T>({
  title,
  others,
  onRefresh,
  render,
}: {
  title: string;
  others: ReflectionSubmission<T>[];
  onRefresh: () => void;
  render: (payload: T) => React.ReactNode;
}) {
  const [refreshing, setRefreshing] = React.useState(false);
  async function refresh() {
    setRefreshing(true);
    try {
      await Promise.resolve(onRefresh());
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ew-gold-200 bg-ew-gold-50/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-gold-700">
          <Eye aria-hidden className="h-4 w-4" /> Espace formateur — {others.length}{" "}
          production{others.length > 1 ? "s" : ""} · {title}
        </p>
        <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
          <RefreshCw aria-hidden className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Actualisation…" : "Rafraîchir"}
        </Button>
      </div>
      <p className="mt-1 text-[11px] italic text-muted-foreground">
        Réservé à l&apos;administrateur, à l&apos;enseignant ou au tuteur du cours.
      </p>
      {others.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed border-border bg-background/60 p-3 text-xs italic text-muted-foreground">
          Aucune production des participants pour le moment. Cliquez «&nbsp;Rafraîchir&nbsp;»
          dès qu&apos;ils ont répondu.
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {others.map((s) => (
            <details key={s.userId} className="overflow-hidden rounded-lg border border-border bg-card">
              <summary className="cursor-pointer px-3 py-2 text-sm hover:bg-muted/20">
                <span className="rounded-full bg-ew-green-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {s.userName}
                </span>
                {s.userRole ? (
                  <span className="ml-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {s.userRole}
                  </span>
                ) : null}
              </summary>
              <div className="border-t border-border p-3 text-sm leading-relaxed text-foreground/90">
                {render(s.payload)}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
