"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Crown, Lock, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/app-shell/data-store";
import { cn } from "@/lib/utils";

/** État d'abonnement Premium, réutilisable partout (lit le store). */
export function usePremium() {
  const { subscription } = useStore();
  return { active: !!subscription?.active, subscription: subscription ?? null };
}

/** Pastille « Premium » (actif = vert, sinon or). */
export function PremiumBadge({ active = true, className }: { active?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
        active ? "bg-ew-green-100 text-ew-green-700" : "bg-ew-gold-100 text-ew-gold-600",
        className,
      )}
    >
      <Crown className="h-3 w-3" /> Premium{active ? " · actif" : ""}
    </span>
  );
}

/**
 * Verrouille une fonctionnalité Premium : si l'établissement est abonné, le
 * contenu est rendu normalement (avec un rappel) ; sinon il est grisé/flouté et
 * surmonté d'une bannière invitant à souscrire.
 */
export function PremiumGate({
  feature,
  description,
  children,
}: {
  feature: string;
  description?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { active } = usePremium();

  if (active) {
    return (
      <>
        <div className="flex items-center gap-2 rounded-xl border border-ew-green-600/30 bg-ew-green-50 px-3 py-2 text-sm text-ew-green-900">
          <BadgeCheck className="h-4 w-4 shrink-0 text-ew-green-700" />
          <span>
            <strong>{feature}</strong> — incluse dans votre abonnement Premium actif.
          </span>
        </div>
        {children}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ew-gold-500/40 bg-ew-gold-100/40 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-gold-100 text-ew-gold-600">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-foreground">{feature} — Fonctionnalité Premium</p>
            <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
              {description ?? "Réservé aux établissements abonnés à l'Académie Premium. Souscrivez pour débloquer cette fonctionnalité."}
            </p>
          </div>
        </div>
        <Button className="shrink-0" onClick={() => router.push("/vie-scolaire/academie-premium")}>
          <Crown className="h-4 w-4" /> Souscrire
        </Button>
      </div>
      <div className="pointer-events-none select-none space-y-6 opacity-50 blur-[1.5px]" aria-hidden="true">
        {children}
      </div>
    </>
  );
}
