"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, FileDown, Lock, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeminaireLivret } from "@/components/seminaires/seminaire-livret";
import { MAGNIFICA_HUMANITAS } from "@/lib/seminaires/magnifica-humanitas";
import { CourseGate } from "@/components/formations/course-gate";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import {
  evaluateCourseCompletion,
  getCourseCompletionRule,
} from "@/lib/formations/course-completion";

/**
 * Livret académique imprimable du séminaire « Magnifica Humanitas ».
 * Format A4 portrait, prêt à imprimer en PDF via Ctrl+P / Cmd+P.
 *
 * Accessible uniquement après achèvement de la formation (ou pour
 * l'administrateur). Le téléchargement Word est réservé à
 * l'administrateur ; le participant n'a accès qu'à la version PDF
 * (via l'impression du navigateur).
 */
export default function SeminaireMagnificaLivretPage() {
  const s = MAGNIFICA_HUMANITAS;
  return (
    <CourseGate courseId="magnifica-humanitas">
      <LivretGate>
        <div className="space-y-6">
          <LivretActionBar />
          <SeminaireLivret seminaire={s} />
        </div>
      </LivretGate>
    </CourseGate>
  );
}

/* ----- Garde de réussite : seul un participant ayant achevé voit le livret ----- */
function LivretGate({ children }: { children: React.ReactNode }) {
  const app = useApp();
  const store = useStore();
  const courseId = MAGNIFICA_HUMANITAS.meta.slug;
  const isAdmin = app.effectiveRole === "admin";
  const rule = getCourseCompletionRule(courseId, store.courseCompletionRules);
  const verdict = evaluateCourseCompletion(
    app.user.id,
    isAdmin,
    courseId,
    rule,
    store.moduleCompletions,
    store.courseCompletions,
  );

  if (verdict.completed) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-700">
        <Lock aria-hidden className="h-7 w-7" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Livret académique verrouillé
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Le livret du séminaire devient accessible une fois la formation
          achevée avec succès.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-ew-gold-200 bg-ew-gold-50/60 p-5 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-ew-gold-700">
          Pour débloquer le livret
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {verdict.reason ??
            "Terminez tous les modules du parcours pour valider la formation et débloquer le téléchargement."}
        </p>
        {verdict.progress.total > 0 ? (
          <>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-card">
              <div
                className="h-full bg-ew-gold-500 transition-all duration-300"
                style={{ width: `${Math.round(verdict.progress.ratio * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs font-mono font-bold text-ew-gold-700">
              {verdict.progress.completed}/{verdict.progress.total} modules
            </p>
          </>
        ) : null}
      </div>

      <Button asChild variant="outline">
        <Link href="/aide/seminaire/magnifica-humanitas">
          <ArrowLeft className="h-4 w-4" /> Retour au séminaire
        </Link>
      </Button>
    </div>
  );
}

/* ----- Barre d'actions : Word seulement pour admin, PDF pour tous les autorisés ----- */
function LivretActionBar() {
  const app = useApp();
  const isAdmin = app.effectiveRole === "admin";
  const s = MAGNIFICA_HUMANITAS;
  return (
    <div className="no-print sticky top-16 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur sm:-mx-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/aide/seminaire/magnifica-humanitas">
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;espace
          </Link>
        </Button>
        <div>
          <p className="font-display text-base font-bold leading-none text-foreground">
            Livret académique — {s.meta.title.split(":")[0].trim()}
          </p>
          <p className="text-xs text-muted-foreground">
            {s.meta.reference}
            {s.meta.referenceDate ? ` (${s.meta.referenceDate})` : ""} ·{" "}
            {s.modules.length} modules · {s.quizzes.length} quiz · charte · grille d&apos;évaluation
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {isAdmin ? (
          <Button size="sm" variant="outline" asChild>
            <a href="/api/docx/seminaire/magnifica-humanitas">
              <FileDown className="h-4 w-4" /> Télécharger Word
            </a>
          </Button>
        ) : null}
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimer / PDF
        </Button>
      </div>
    </div>
  );
}
