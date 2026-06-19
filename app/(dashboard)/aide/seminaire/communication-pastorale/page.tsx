"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  FileDown,
  FileText,
  Presentation,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ActivityList,
  CommFourVCard,
  CommGlossary,
  CommHero,
  CommObjectives,
  CommRapideCard,
  CommRepères,
  CommSchedule,
  SlideDeck,
} from "@/components/seminaires/comm-pastorale-views";
import { COMMUNICATION_PASTORALE } from "@/lib/seminaires/communication-pastorale";

/**
 * Espace interactif du séminaire « Le numérique au service de la communication
 * éducative et pastorale » — SENEC, 24 juin 2026.
 *
 * Architecture :
 * - Hero avec photo d'entête institutionnelle + KPIs + actions
 * - Présentation, objectifs, compétences
 * - Visionneuse de slides type ePub (14 diapositives)
 * - Activités interactives (diagnostic, QCM, scénario, matrice, plan d'action,
 *   check-list RAPIDE, engagement personnel)
 * - Cartes méthodes : RAPIDE + 4V
 * - Glossaire + 10 repères + déroulé proposé
 * - Message de clôture
 */
export default function CommPastoralePage() {
  const s = COMMUNICATION_PASTORALE;
  return (
    <div className="space-y-6">
      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/aide">
            <ArrowLeft className="h-4 w-4" /> Bibliothèque
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/aide/seminaire/communication-pastorale/livret">
              <FileText className="h-4 w-4" /> Livret imprimable
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="/api/docx/seminaire/communication-pastorale">
              <FileDown className="h-4 w-4" /> Livret Word (.docx)
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={s.pptxAsset} download>
              <Presentation className="h-4 w-4" /> Support PowerPoint
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link href="/aide/certificat">
              <Award className="h-4 w-4" /> Délivrer un certificat
            </Link>
          </Button>
        </div>
      </div>

      <CommHero seminaire={s} />

      {/* Navigation interne */}
      <nav className="sticky top-16 z-10 -mx-4 flex flex-wrap items-center gap-2 border-y border-border bg-card/85 px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground backdrop-blur sm:-mx-6">
        <a href="#presentation" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Présentation
        </a>
        <a href="#objectifs" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Objectifs
        </a>
        <a href="#slides" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Diapositives
        </a>
        <a href="#methodes" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Méthodes
        </a>
        <a href="#ateliers" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Ateliers
        </a>
        <a href="#deroule" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Déroulé
        </a>
        <a href="#reperes" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Repères
        </a>
        <a href="#glossaire" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Glossaire
        </a>
      </nav>

      <section id="presentation" className="scroll-mt-32 space-y-3">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <Sparkles aria-hidden className="h-4 w-4" /> Présentation
        </p>
        <div className="space-y-2 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground/90">
          {s.meta.presentation.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FactCell label="Référence" value={s.meta.reference} />
            <FactCell label="Date" value={s.meta.referenceDate} />
            <FactCell label="Format" value={s.meta.format} />
            <FactCell label="Organisateur" value={s.meta.organiser} />
          </div>
        </div>
      </section>

      <section id="objectifs" className="scroll-mt-32">
        <CommObjectives seminaire={s} />
      </section>

      <section id="slides" className="scroll-mt-32 space-y-3">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <Presentation aria-hidden className="h-4 w-4" /> Présentation contextuelle
          <span className="rounded-full bg-ew-green-100 px-2 py-0.5 text-[10px] font-bold text-ew-green-800">
            Feuilleter comme un livre numérique
          </span>
        </p>
        <SlideDeck slides={s.slides} />
        <p className="text-xs italic text-muted-foreground">
          Astuce : utilisez ← → pour naviguer, F pour le plein écran, N pour afficher les notes du
          formateur, ou cliquez sur une miniature pour aller directement à une diapositive.
        </p>
      </section>

      <section id="methodes" className="scroll-mt-32 grid gap-4 lg:grid-cols-2">
        <CommRapideCard seminaire={s} />
        <CommFourVCard seminaire={s} />
      </section>

      <section id="ateliers" className="scroll-mt-32 space-y-3">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <Sparkles aria-hidden className="h-4 w-4" /> Ateliers interactifs
        </p>
        <ActivityList activities={s.activities} />
      </section>

      <section id="deroule" className="scroll-mt-32">
        <CommSchedule seminaire={s} />
      </section>

      <section id="reperes" className="scroll-mt-32">
        <CommRepères seminaire={s} />
      </section>

      <section id="glossaire" className="scroll-mt-32">
        <CommGlossary seminaire={s} />
      </section>

      {/* Clôture */}
      <section className="rounded-2xl border border-ew-green-200 bg-gradient-to-r from-ew-green-50 via-card to-card p-5">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <Sparkles aria-hidden className="h-4 w-4" /> Message de clôture
        </p>
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/90">
          {s.closingMessage.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}

function FactCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-foreground">{value}</p>
    </div>
  );
}
