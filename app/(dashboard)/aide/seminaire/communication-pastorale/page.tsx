"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  FileDown,
  FileText,
  Presentation,
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
  FinalSelfEvaluation,
  SlideDeck,
} from "@/components/seminaires/comm-pastorale-views";
import { COMMUNICATION_PASTORALE } from "@/lib/seminaires/communication-pastorale";
import { CourseGate } from "@/components/formations/course-gate";
import { useSupportAccess } from "@/components/formations/use-support-access";
import { GatedSupportButton } from "@/components/formations/gated-support-button";
import { SeminarPdfButton } from "@/components/seminaires/seminar-pdf-button";
import {
  MagnificaBook,
  type BookPage,
} from "@/components/seminaires/magnifica-book";

/**
 * Espace de formation SENEC en mode livre paginé.
 *
 * Une page = une rubrique. L'apprenant tourne les pages comme dans un
 * livre, navigation au clavier (← →, Home, End, F), sommaire cliquable
 * au pied, plein écran.
 *
 * Rubriques (Déroulé placé en tête pour orienter immédiatement
 * l'apprenant sur la durée et le rythme de la session) :
 *   1. Déroulé chronométré
 *   2. Présentation
 *   3. Objectifs & compétences
 *   4. Diapositives (visionneuse ePub des 14 slides)
 *   5. Méthodes (RAPIDE + 4V)
 *   6. Ateliers interactifs
 *   7. Auto-évaluation finale & engagement d'action (grille de compétences)
 *   8. Repères (10 repères + 5 verbes synthèse)
 *   9. Glossaire
 *  10. Clôture
 *
 * Chaque page reçoit un texte de narration (lu par le navigateur via
 * SpeechSynthesis) construit à partir des données du séminaire.
 */
export default function CommPastoralePage() {
  const s = COMMUNICATION_PASTORALE;
  const supportAccess = useSupportAccess("communication-pastorale");

  // Textes de narration audio par page — concaténés depuis les données
  // du séminaire pour rester synchronisés avec le contenu réel.
  const narrations = React.useMemo(() => {
    const presentation = s.meta.presentation.join(" ");
    const objectives =
      `Objectifs pédagogiques. ${s.objectives.join(" ")} ` +
      `Compétences visées. ${s.competences.join(" ")}`;
    const slidesIntro =
      `Présentation contextuelle. ${s.slides.length} diapositives à feuilleter comme un livre numérique. ` +
      `Naviguez avec les flèches gauche et droite, F pour le plein écran, N pour afficher les notes du formateur.`;
    const methods =
      "Méthode RAPIDE pour relire une publication. " +
      (s.rapide ?? []).map((r) => `${r.letter}, ${r.label}.`).join(" ") +
      " Règle des 4 V pour un usage responsable de l'intelligence artificielle. " +
      (s.fourV ?? [])
        .map((v) => `${v.letter}, ${v.label}. ${v.detail}`)
        .join(" ");
    const workshopsIntro =
      `Ateliers interactifs. ${s.activities.length} ateliers pour passer à la pratique. ` +
      s.activities.map((a) => `Atelier ${a.num}, ${a.title}.`).join(" ");
    const schedule =
      `Déroulé proposé pour la session de 2 heures, soit 120 minutes. ` +
      s.schedule.map((row) => `${row.hours}, ${row.activity}.`).join(" ");
    const landmarks =
      "Repères et synthèse de la formation. " +
      s.references10.map((r) => `Repère ${r.num}. ${r.text}`).join(" ");
    const glossary =
      "Glossaire des termes clés. " +
      s.glossary.map((g) => `${g.term}. ${g.definition}`).join(" ");
    const selfEvaluation =
      `Auto-évaluation finale et engagement d'action. Durée ${s.finalSelfEvaluation.durationMin} minutes. ` +
      `Objectif : ${s.finalSelfEvaluation.objective} ` +
      `Pour chaque compétence, cochez votre niveau : ${s.finalSelfEvaluation.levels.join(", ")}. ` +
      `Les compétences évaluées sont les suivantes. ` +
      s.finalSelfEvaluation.competences.map((c) => c).join(" ");
    const closing = s.closingMessage.replace(/\n+/g, " ");
    return {
      presentation,
      objectives,
      slidesIntro,
      methods,
      workshopsIntro,
      schedule,
      landmarks,
      glossary,
      selfEvaluation,
      closing,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages: BookPage[] = React.useMemo(
    () => [
      {
        id: "schedule",
        category: "schedule",
        shortTitle: "Déroulé",
        title: "Déroulé proposé",
        subtitle: "Chronométrage de l'atelier de 120 minutes",
        content: <CommSchedule seminaire={s} />,
        narration: narrations.schedule,
      },
      {
        id: "presentation",
        category: "presentation",
        shortTitle: "Présentation",
        title: s.meta.title,
        subtitle: s.meta.subtitle,
        content: <PresentationPage />,
        narration: narrations.presentation,
      },
      {
        id: "objectives",
        category: "objectives",
        shortTitle: "Objectifs & compétences",
        title: "Objectifs pédagogiques & compétences visées",
        content: <CommObjectives seminaire={s} />,
        narration: narrations.objectives,
      },
      {
        id: "slides",
        category: "slides",
        shortTitle: "Diapositives",
        title: "Présentation contextuelle",
        subtitle: `${s.slides.length} diapositives à feuilleter comme un livre numérique`,
        content: <DiapositivesPage />,
        narration: narrations.slidesIntro,
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
        narration: narrations.methods,
      },
      {
        id: "workshops",
        category: "workshops",
        shortTitle: "Ateliers",
        title: "Ateliers interactifs",
        subtitle: `${s.activities.length} ateliers pour passer à la pratique`,
        content: (
          <ActivityList activities={s.activities} courseId="communication-pastorale" />
        ),
        narration: narrations.workshopsIntro,
      },
      {
        id: "self-evaluation",
        category: "evaluation",
        shortTitle: "Auto-évaluation",
        title: "Auto-évaluation finale & engagement d'action",
        subtitle: `${s.finalSelfEvaluation.durationMin} minutes — vérifiez vos acquis et engagez une action concrète`,
        content: <FinalSelfEvaluation data={s.finalSelfEvaluation} courseId="communication-pastorale" />,
        narration: narrations.selfEvaluation,
      },
      {
        id: "landmarks",
        category: "landmarks",
        shortTitle: "Repères",
        title: "Repères et synthèse",
        subtitle: "Les 10 repères + les 5 verbes de synthèse",
        content: <CommRepères seminaire={s} />,
        narration: narrations.landmarks,
      },
      {
        id: "glossary",
        category: "glossary",
        shortTitle: "Glossaire",
        title: "Glossaire",
        content: <CommGlossary seminaire={s} />,
        narration: narrations.glossary,
      },
      {
        id: "closing",
        category: "closing",
        shortTitle: "Clôture",
        title: "Message de clôture",
        content: <ClosingPage />,
        narration: narrations.closing,
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
          afficher les notes du formateur. Cliquez sur une miniature pour aller
          directement à une diapositive.
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
            <GatedSupportButton
              access={supportAccess("livret")}
              internal
              href="/aide/seminaire/communication-pastorale/livret"
              icon={<FileText className="h-4 w-4" />}
              label="Livret imprimable"
            />
            <GatedSupportButton
              access={supportAccess("livret")}
              href="/api/docx/seminaire/communication-pastorale"
              icon={<FileDown className="h-4 w-4" />}
              label="Livret Word (.docx)"
            />
            <GatedSupportButton
              access={supportAccess("powerpoint")}
              href={s.pptxAsset}
              download
              icon={<Presentation className="h-4 w-4" />}
              label="Support PowerPoint"
            />
            <SeminarPdfButton courseId="communication-pastorale" seminaire={s} />
            <GatedSupportButton
              access={supportAccess("certificat")}
              internal
              primary
              href="/aide/certificat?course=communication-pastorale"
              icon={<Award className="h-4 w-4" />}
              label="Délivrer un certificat"
            />
          </div>
        </div>

        <MagnificaBook pages={pages} courseId="communication-pastorale" />
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
