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
  CommGlossary,
  CommHero,
  CommObjectives,
  CommRepères,
  CommSchedule,
  FinalSelfEvaluation,
  SlideDeck,
} from "@/components/seminaires/comm-pastorale-views";
import {
  IaAtelierPratique,
  IaDiagnostic,
  IaFiveV,
  IaPromptMethod,
  IaProtocol,
  IaUsageMap,
} from "@/components/seminaires/ia-communication-views";
import {
  IA_COMMUNICATION,
  IA_CONTENT,
} from "@/lib/seminaires/ia-communication";
import type { CommSeminaireActivity } from "@/lib/seminaires/communication-pastorale";
import { CourseGate } from "@/components/formations/course-gate";
import { useSupportAccess } from "@/components/formations/use-support-access";
import { GatedSupportButton } from "@/components/formations/gated-support-button";
import { SeminarPdfButton } from "@/components/seminaires/seminar-pdf-button";
import {
  MagnificaBook,
  type BookPage,
} from "@/components/seminaires/magnifica-book";

/**
 * Espace de formation « L'intelligence artificielle au service de la
 * communication éducative et pastorale » (SENEC, 2 h 30), en mode livre
 * numérique paginé.
 *
 * Rubriques (déroulé en tête, puis séquences scénarisées) :
 *   1. Déroulé chronométré
 *   2. Présentation contextuelle (Séq. 1)
 *   3. Objectifs & compétences
 *   4. Diapositives (visionneuse ePub)
 *   5. Diagnostic de maturité IA (Séq. 2)
 *   6. Module 1 — Comprendre l'IA et ses usages (Séq. 3)
 *   7. Module 2 — Bien prompter (Séq. 4)
 *   8. Module 3 — Éthique, risques & règle des 5 V (Séq. 5)
 *   9. Atelier pratique (Séq. 6)
 *  10. Auto-évaluation finale & engagement (Séq. 7)
 *  11. Évaluations interactives — QCM
 *  12. Protocole d'usage responsable (livrable)
 *  13. Repères · 14. Glossaire · 15. Clôture
 *
 * Chaque page reçoit un texte de narration lu par le navigateur (TTS).
 */
export default function IaCommunicationPage() {
  const s = IA_COMMUNICATION;
  const supportAccess = useSupportAccess("ia-communication");

  /** Récupère une activité interactive par son identifiant. */
  const act = React.useCallback(
    (id: string): CommSeminaireActivity[] => {
      const found = s.activities.find((a) => a.id === id);
      return found ? [found] : [];
    },
    [s.activities],
  );

  const narrations = React.useMemo(() => {
    const presentation =
      s.meta.presentation.join(" ") +
      " Message clé. " +
      IA_CONTENT.presentationMessage;
    const objectives =
      `Objectifs pédagogiques. ${s.objectives.join(" ")} ` +
      `Compétences visées. ${s.competences.join(" ")}`;
    const slidesIntro =
      `Présentation contextuelle. ${s.slides.length} diapositives à feuilleter comme un livre numérique. ` +
      `Naviguez avec les flèches gauche et droite, F pour le plein écran, N pour afficher les notes du formateur.`;
    const diagnostic =
      `Séquence 2. Diagnostic interactif de maturité IA. ${IA_CONTENT.diagnostic.objective} ` +
      IA_CONTENT.diagnostic.messageCle;
    const usages =
      "Module 1 : comprendre l'IA et ses usages. " +
      IA_CONTENT.module1.narrative.join(" ") +
      " " +
      IA_CONTENT.module1.synthesis;
    const prompt =
      "Module 2 : bien prompter et produire. Méthode P.A.S.T.O.R.A.L. " +
      IA_CONTENT.module2.narrative.join(" ") +
      " " +
      (s.promptMethod ?? [])
        .map((p) => `${p.letter}, ${p.label}. ${p.detail}`)
        .join(" ");
    const fiveV =
      "Module 3 : éthique, risques, image et validation. " +
      IA_CONTENT.module3.narrative.join(" ") +
      " La règle des 5 V. " +
      (s.fiveV ?? [])
        .map((v) => `${v.letter}, ${v.label}. ${v.detail}`)
        .join(" ");
    const atelierPratique =
      "Séquence 6. Atelier pratique : produire, corriger et adapter un message. " +
      IA_CONTENT.atelierPratique.consigne;
    const selfEvaluation =
      `Auto-évaluation finale et engagement. Durée ${s.finalSelfEvaluation.durationMin} minutes. ` +
      `Objectif : ${s.finalSelfEvaluation.objective} ` +
      `Pour chaque compétence, cochez votre niveau : ${s.finalSelfEvaluation.levels.join(", ")}. ` +
      s.finalSelfEvaluation.competences.join(" ");
    const evaluations =
      "Évaluations interactives. Un pré-test de 8 questions à choix multiples, auto-corrigées.";
    const protocol =
      "Protocole d'usage responsable de l'intelligence artificielle. " +
      (s.protocol ?? [])
        .map((p) => `${p.num}. ${p.title}. ${p.items.join(", ")}.`)
        .join(" ");
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
      diagnostic,
      usages,
      prompt,
      fiveV,
      atelierPratique,
      selfEvaluation,
      evaluations,
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
        id: "schedule",
        category: "schedule",
        shortTitle: "Déroulé",
        title: "Déroulé proposé",
        subtitle: "Chronométrage de la session de 150 minutes",
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
        id: "diagnostic",
        category: "diagnostic",
        shortTitle: "Diagnostic IA",
        title: "Diagnostic de maturité IA",
        subtitle: "Séquence 2 — identifiez votre niveau d'usage actuel",
        content: (
          <div className="space-y-6">
            <IaDiagnostic />
            <ActivityList activities={act("diag-ia")} courseId="ia-communication" />
          </div>
        ),
        narration: narrations.diagnostic,
      },
      {
        id: "module-usages",
        category: "module",
        shortTitle: "Module 1 — Usages",
        title: "Module 1 — Comprendre l'IA et ses usages",
        subtitle:
          "Séquence 3 — les apports concrets de l'IA pour la communication",
        content: (
          <div className="space-y-6">
            <IaUsageMap seminaire={s} />
            <ActivityList activities={act("reformuler-ia")} courseId="ia-communication" />
          </div>
        ),
        narration: narrations.usages,
      },
      {
        id: "module-prompt",
        category: "methods",
        shortTitle: "Module 2 — Prompter",
        title: "Module 2 — Bien prompter et produire",
        subtitle: "Séquence 4 — la méthode P.A.S.T.O.R.A.L.",
        content: <IaPromptMethod seminaire={s} />,
        narration: narrations.prompt,
      },
      {
        id: "module-ethique",
        category: "module",
        shortTitle: "Module 3 — Éthique & 5 V",
        title: "Module 3 — Éthique, risques, image et validation",
        subtitle: "Séquence 5 — la règle des 5 V avant toute publication",
        content: <IaFiveV seminaire={s} />,
        narration: narrations.fiveV,
      },
      {
        id: "atelier-pratique",
        category: "workshops",
        shortTitle: "Atelier pratique",
        title: "Atelier pratique — produire, corriger et adapter",
        subtitle: "Séquence 6 — mettre en pratique les acquis de la formation",
        content: (
          <div className="space-y-6">
            <IaAtelierPratique />
            <ActivityList activities={act("corriger-promo-ia")} courseId="ia-communication" />
          </div>
        ),
        narration: narrations.atelierPratique,
      },
      {
        id: "self-evaluation",
        category: "evaluation",
        shortTitle: "Auto-évaluation",
        title: "Auto-évaluation finale & engagement",
        subtitle: `Séquence 7 — ${s.finalSelfEvaluation.durationMin} minutes : vérifiez vos acquis et engagez une action concrète`,
        content: (
          <div className="space-y-6">
            <FinalSelfEvaluation data={s.finalSelfEvaluation} courseId="ia-communication" />
            <ActivityList activities={act("engagement-ia")} courseId="ia-communication" />
          </div>
        ),
        narration: narrations.selfEvaluation,
      },
      {
        id: "evaluations",
        category: "quiz",
        shortTitle: "Évaluations",
        title: "Évaluations interactives",
        subtitle: "Pré-test — 8 QCM rapides auto-corrigés",
        content: <ActivityList activities={act("qcm-ia")} courseId="ia-communication" />,
        narration: narrations.evaluations,
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
        <div className="rounded-2xl border-l-4 border-ew-gold-500 bg-ew-gold-50 px-5 py-4">
          <p className="font-display text-xs font-bold uppercase tracking-wide text-ew-gold-700">
            Message clé
          </p>
          <p className="mt-1 text-base font-medium leading-relaxed text-foreground/90">
            {IA_CONTENT.presentationMessage}
          </p>
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
            <GatedSupportButton
              access={supportAccess("livret")}
              internal
              href="/aide/seminaire/ia-communication/livret"
              icon={<FileText className="h-4 w-4" />}
              label="Livret imprimable"
            />
            <GatedSupportButton
              access={supportAccess("livret")}
              href="/api/docx/seminaire/ia-communication"
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
            <SeminarPdfButton courseId="ia-communication" seminaire={s} />
            <GatedSupportButton
              access={supportAccess("certificat")}
              internal
              primary
              href="/aide/certificat?course=ia-communication"
              icon={<Award className="h-4 w-4" />}
              label="Délivrer un certificat"
            />
          </div>
        </div>

        <MagnificaBook pages={pages} courseId="ia-communication" />
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
