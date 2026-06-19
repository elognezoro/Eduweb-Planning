"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Award, FileDown, FileText, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ActivityList,
  CommGlossary,
  CommHero,
  CommObjectives,
  CommRepères,
  CommSchedule,
  FinalSelfEvaluation,
  SlideDeck,
} from "@/components/seminaires/comm-pastorale-views";
import {
  IaFiveV,
  IaPromptMethod,
  IaProtocol,
  IaUsageMap,
} from "@/components/seminaires/ia-communication-views";
import { IA_COMMUNICATION } from "@/lib/seminaires/ia-communication";
import { CourseGate } from "@/components/formations/course-gate";
import { MagnificaBook, type BookPage } from "@/components/seminaires/magnifica-book";

/**
 * Espace de formation « L'intelligence artificielle au service de la
 * communication éducative et pastorale » (SENEC, 2 h 30), en mode livre
 * numérique paginé.
 *
 * Rubriques :
 *   1. Présentation contextuelle
 *   2. Objectifs & compétences
 *   3. Diapositives (visionneuse ePub)
 *   4. Module 1 — Comprendre l'IA et ses usages
 *   5. Module 2 — Bien prompter (méthode P.A.S.T.O.R.A.L.)
 *   6. Module 3 — Éthique, risques & règle des 5 V
 *   7. Ateliers interactifs
 *   8. Auto-évaluation finale & engagement
 *   9. Protocole d'usage responsable de l'IA (livrable)
 *  10. Déroulé chronométré
 *  11. Repères
 *  12. Glossaire
 *  13. Clôture
 *
 * Chaque page reçoit un texte de narration lu par le navigateur (TTS).
 */
export default function IaCommunicationPage() {
  const s = IA_COMMUNICATION;

  const narrations = React.useMemo(() => {
    const presentation = s.meta.presentation.join(" ");
    const objectives =
      `Objectifs pédagogiques. ${s.objectives.join(" ")} ` +
      `Compétences visées. ${s.competences.join(" ")}`;
    const slidesIntro =
      `Présentation contextuelle. ${s.slides.length} diapositives à feuilleter comme un livre numérique. ` +
      `Naviguez avec les flèches gauche et droite, F pour le plein écran, N pour afficher les notes du formateur.`;
    const usages =
      "Module 1 : comprendre l'IA et ses usages. " +
      (s.usageCategories ?? []).map((c) => c.title + ".").join(" ");
    const prompt =
      "Module 2 : bien prompter et produire. Méthode P.A.S.T.O.R.A.L. " +
      (s.promptMethod ?? []).map((p) => `${p.letter}, ${p.label}. ${p.detail}`).join(" ");
    const fiveV =
      "Module 3 : éthique, risques, image et validation. La règle des 5 V. " +
      (s.fiveV ?? []).map((v) => `${v.letter}, ${v.label}. ${v.detail}`).join(" ");
    const workshopsIntro =
      `Ateliers interactifs. ${s.activities.length} ateliers pour passer à la pratique. ` +
      s.activities.map((a) => `Atelier ${a.num}, ${a.title}.`).join(" ");
    const selfEvaluation =
      `Auto-évaluation finale et engagement. Durée ${s.finalSelfEvaluation.durationMin} minutes. ` +
      `Objectif : ${s.finalSelfEvaluation.objective} ` +
      `Pour chaque compétence, cochez votre niveau : ${s.finalSelfEvaluation.levels.join(", ")}. ` +
      s.finalSelfEvaluation.competences.join(" ");
    const protocol =
      "Protocole d'usage responsable de l'intelligence artificielle. " +
      (s.protocol ?? []).map((p) => `${p.num}. ${p.title}. ${p.items.join(", ")}.`).join(" ");
    const schedule =
      `Déroulé proposé pour la session de 2 heures 30 minutes, soit 150 minutes. ` +
      s.schedule.map((row) => `${row.hours}, ${row.activity}.`).join(" ");
    const landmarks =
      "Repères de l'usage de l'IA en communication. " +
      s.references10.map((r) => `Repère ${r.num}. ${r.text}`).join(" ");
    const glossary =
      "Glossaire des termes clés. " +
      s.glossary.map((g) => `${g.term}. ${g.definition}`).join(" ");
    const closing = s.closingMessage.replace(/\n+/g, " ");
    return {
      presentation,
      objectives,
      slidesIntro,
      usages,
      prompt,
      fiveV,
      workshopsIntro,
      selfEvaluation,
      protocol,
      schedule,
      landmarks,
      glossary,
      closing,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages: BookPage[] = React.useMemo(
    () => [
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
        id: "module-usages",
        category: "module",
        shortTitle: "Module 1 — Usages",
        title: "Module 1 — Comprendre l'IA et ses usages",
        subtitle: "Les apports concrets de l'IA pour la communication",
        content: <IaUsageMap seminaire={s} />,
        narration: narrations.usages,
      },
      {
        id: "module-prompt",
        category: "methods",
        shortTitle: "Module 2 — Prompter",
        title: "Module 2 — Bien prompter et produire",
        subtitle: "La méthode P.A.S.T.O.R.A.L.",
        content: <IaPromptMethod seminaire={s} />,
        narration: narrations.prompt,
      },
      {
        id: "module-ethique",
        category: "charte",
        shortTitle: "Module 3 — Éthique & 5 V",
        title: "Module 3 — Éthique, risques, image et validation",
        subtitle: "La règle des 5 V avant toute publication",
        content: <IaFiveV seminaire={s} />,
        narration: narrations.fiveV,
      },
      {
        id: "workshops",
        category: "workshops",
        shortTitle: "Ateliers",
        title: "Ateliers interactifs",
        subtitle: `${s.activities.length} ateliers pour passer à la pratique`,
        content: <ActivityList activities={s.activities} />,
        narration: narrations.workshopsIntro,
      },
      {
        id: "self-evaluation",
        category: "evaluation",
        shortTitle: "Auto-évaluation",
        title: "Auto-évaluation finale & engagement",
        subtitle: `${s.finalSelfEvaluation.durationMin} minutes — vérifiez vos acquis et engagez une action concrète`,
        content: <FinalSelfEvaluation data={s.finalSelfEvaluation} />,
        narration: narrations.selfEvaluation,
      },
      {
        id: "protocol",
        category: "charte",
        shortTitle: "Protocole IA",
        title: "Protocole d'usage responsable de l'IA",
        subtitle: "Le livrable de la formation, en 7 points",
        content: <IaProtocol seminaire={s} />,
        narration: narrations.protocol,
      },
      {
        id: "schedule",
        category: "schedule",
        shortTitle: "Déroulé",
        title: "Déroulé proposé",
        subtitle: "Chronométrage de la session de 150 minutes",
        content: <CommSchedule seminaire={s} />,
        narration: narrations.schedule,
      },
      {
        id: "landmarks",
        category: "landmarks",
        shortTitle: "Repères",
        title: "Repères de l'usage de l'IA",
        subtitle: "Les 10 repères du communicateur catholique face à l'IA",
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
        title: "Formule de clôture",
        content: <ClosingPage />,
        narration: narrations.closing,
      },
    ],
    // Sous-composants en closure sur s (constante de module).
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
            <FactCell label="Durée" value={s.meta.duration} />
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
          Astuce : utilisez ← → à l&apos;intérieur de la visionneuse pour naviguer entre les
          diapositives, F pour le plein écran, N pour afficher les notes du formateur. Cliquez
          sur une miniature pour aller directement à une diapositive.
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
    <CourseGate courseId="ia-communication">
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
              <Link href="/aide/seminaire/ia-communication/livret">
                <FileText className="h-4 w-4" /> Livret imprimable
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="/api/docx/seminaire/ia-communication">
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
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
