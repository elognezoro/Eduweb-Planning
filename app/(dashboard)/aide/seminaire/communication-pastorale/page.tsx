"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  FileDown,
  FileText,
  GraduationCap,
  Lock,
  Presentation,
  Sparkles,
  Target,
  Users,
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
import { CourseGate } from "@/components/formations/course-gate";
import { MagnificaBook, type BookPage } from "@/components/seminaires/magnifica-book";

/**
 * Espace de formation SENEC en mode livre paginé.
 *
 * Une page = une rubrique. L'apprenant tourne les pages comme dans un
 * livre, navigation au clavier (← →, Home, End, F), sommaire cliquable
 * au pied, plein écran.
 *
 * Rubriques :
 *   1. Présentation
 *   2. Objectifs & compétences
 *   3. Diapositives (visionneuse ePub des 14 slides)
 *   4. Méthodes (RAPIDE + 4V)
 *   5. Ateliers interactifs
 *   6. Déroulé chronométré
 *   7. Repères (10 repères + 5 verbes synthèse)
 *   8. Glossaire
 *   9. Clôture
 */
export default function CommPastoralePage() {
  const s = COMMUNICATION_PASTORALE;

  const pages: BookPage[] = React.useMemo(
    () => [
      {
        id: "presentation",
        category: "presentation",
        shortTitle: "Présentation",
        title: s.meta.title,
        subtitle: s.meta.subtitle,
        content: <PresentationPage />,
      },
      {
        id: "objectives",
        category: "objectives",
        shortTitle: "Objectifs & compétences",
        title: "Objectifs pédagogiques & compétences visées",
        content: <CommObjectives seminaire={s} />,
      },
      {
        id: "slides",
        category: "slides",
        shortTitle: "Diapositives",
        title: "Présentation contextuelle",
        subtitle: `${s.slides.length} diapositives à feuilleter comme un livre numérique`,
        content: <DiapositivesPage />,
      },
      {
        id: "methods",
        category: "methods",
        shortTitle: "Méthodes",
        title: "Méthodes — RAPIDE & règle des 4V",
        content: (
          <div className="grid gap-4 lg:grid-cols-2">
            <CommRapideCard seminaire={s} />
            <CommFourVCard seminaire={s} />
          </div>
        ),
      },
      {
        id: "workshops",
        category: "workshops",
        shortTitle: "Ateliers",
        title: "Ateliers interactifs",
        subtitle: `${s.activities.length} ateliers pour passer à la pratique`,
        content: <ActivityList activities={s.activities} />,
      },
      {
        id: "schedule",
        category: "schedule",
        shortTitle: "Déroulé",
        title: "Déroulé proposé",
        subtitle: "Chronométrage de l'atelier de 120 minutes",
        content: <CommSchedule seminaire={s} />,
      },
      {
        id: "landmarks",
        category: "landmarks",
        shortTitle: "Repères",
        title: "Repères et synthèse",
        subtitle: "Les 10 repères + les 5 verbes de synthèse",
        content: <CommRepères seminaire={s} />,
      },
      {
        id: "glossary",
        category: "glossary",
        shortTitle: "Glossaire",
        title: "Glossaire",
        content: <CommGlossary seminaire={s} />,
      },
      {
        id: "closing",
        category: "closing",
        shortTitle: "Clôture",
        title: "Message de clôture",
        content: <ClosingPage />,
      },
    ],
    // Sous-composants en closure sur s.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ----- Sous-composants ----- */
  function PresentationPage() {
    return (
      <div className="space-y-5">
        <CommHero seminaire={s} />
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5 text-base leading-relaxed text-foreground/90">
          {s.meta.presentation.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FactCell label="Référence" value={s.meta.reference} />
            <FactCell label="Date" value={s.meta.referenceDate} />
            <FactCell label="Format" value={s.meta.format} />
            <FactCell label="Organisateur" value={s.meta.organiser} />
          </div>
        </div>
      </div>
    );
  }

  function DiapositivesPage() {
    return (
      <div className="space-y-3">
        <p className="rounded-md border border-ew-green-200 bg-ew-green-50/40 px-3 py-2 text-sm text-foreground/90">
          Astuce : utilisez ← → à l&apos;intérieur de la visionneuse pour
          naviguer entre les diapositives, F pour le plein écran, N pour
          afficher les notes du formateur. Cliquez sur une miniature pour
          aller directement à une diapositive.
        </p>
        <SlideDeck slides={s.slides} />
      </div>
    );
  }

  function ClosingPage() {
    return (
      <div className="rounded-2xl border border-ew-green-200 bg-gradient-to-br from-ew-green-50 via-card to-card p-6">
        <div className="space-y-3 text-base leading-relaxed text-foreground/90">
          {s.closingMessage.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <CourseGate courseId="communication-pastorale">
      <div className="space-y-5">
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

        <MagnificaBook pages={pages} />
      </div>
    </CourseGate>
  );
}

/* ----- Cellule d'identité ----- */
function FactCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
