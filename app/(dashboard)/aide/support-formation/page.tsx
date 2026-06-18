"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Printer, ListTree, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ManuelCover,
  ManuelColophon,
  ManuelForeword,
  ManuelTOC,
  ManuelAbbreviations,
  ManuelSyllabusBlock,
  ManuelModuleBlock,
  ManuelAssessmentBlock,
  ManuelProgressionGrid,
  ManuelGlossary,
  ManuelEnd,
} from "@/components/guides/training-manual";
import { GUIDES } from "@/lib/guides";
import { GUIDE_ICONS } from "@/lib/guides/icons";
import {
  TRAINING_SYLLABUS,
  TRAINING_ASSESSMENTS,
  TRAINING_PROGRESSION,
  TRAINING_ABBREVIATIONS,
} from "@/lib/guides/training-manual-data";

/**
 * Manuel académique imprimable — assemble la couverture, le colophon,
 * l'avant-propos, la table des matières, la liste des abréviations,
 * le syllabus complet, les 8 modules (un par rôle) avec leurs auto-évaluations,
 * et les annexes (grille de progression + glossaire général).
 *
 * Le rendu écran sert d'aperçu. L'utilisateur clique « Imprimer » pour produire
 * le PDF via le navigateur (Ctrl+P → Enregistrer en PDF), conformément à la
 * demande d'un livrable « disponible à part ».
 */
export default function SupportFormationPage() {
  // Modules dans l'ordre stratégique recommandé par la revue d'harmonisation.
  const MODULE_ORDER = React.useMemo(
    () => [
      "admin",
      "chef_etablissement",
      "inspecteur",
      "conseiller_pedagogique",
      "enseignant",
      "educateur",
      "parent",
      "eleve",
    ],
    [],
  );

  // Construction des entrées de table des matières (numérotation calculée).
  const tocEntries: { roman?: string; arabic?: number; label: string; level?: 1 | 2 }[] = React.useMemo(() => {
    const entries: { roman?: string; arabic?: number; label: string; level?: 1 | 2 }[] = [
      { roman: "II", label: "Colophon — Mentions légales", level: 1 },
      { roman: "III", label: "Avant-propos", level: 1 },
      { roman: "IV", label: "Table des matières", level: 1 },
      { roman: "V", label: "Liste des abréviations", level: 1 },
      { arabic: 1, label: "Syllabus académique de la formation", level: 1 },
      { arabic: 5, label: "Identification, public, prérequis", level: 2 },
      { arabic: 6, label: "Objectifs généraux et compétences visées", level: 2 },
      { arabic: 7, label: "Méthodologie et progression horaire", level: 2 },
      { arabic: 8, label: "Évaluation, ressources, charte", level: 2 },
    ];
    // Estimation des pages par module : page de garde + 1 chapitre/page (en moyenne)
    let cursor = 9;
    MODULE_ORDER.forEach((roleKey, i) => {
      const guide = GUIDES[roleKey];
      const ass = TRAINING_ASSESSMENTS[roleKey];
      if (!guide || !ass) return;
      const moduleStart = cursor;
      entries.push({
        arabic: moduleStart,
        label: `${ass.moduleCode} — ${guide.roleLabel}`,
        level: 1,
      });
      const guidePages = 1 + guide.chapters.length;
      const qcmPages = Math.ceil(ass.qcm.length / 5);
      const assessmentPages = 1 + qcmPages + 1 + 1; // pre-test + qcm + exercice + synthèse
      const moduleTotal = guidePages + assessmentPages;
      entries.push({
        arabic: moduleStart + guidePages,
        label: `Auto-évaluation et exercice (${ass.moduleCode})`,
        level: 2,
      });
      cursor += moduleTotal;
    });
    entries.push({ arabic: cursor, label: "Annexe A — Grille de progression", level: 1 });
    entries.push({ arabic: cursor + 1, label: "Annexe B — Glossaire général", level: 1 });
    return entries;
  }, [MODULE_ORDER]);

  // Assemblage des pages dans l'ordre du manuel (séquentiel pour préserver la numérotation).
  const pages: React.ReactNode[] = [];

  // Front matter (page I = couverture, numérotée à part)
  pages.push(<ManuelCover key="cover" identification={TRAINING_SYLLABUS.identification} />);
  pages.push(<ManuelColophon key="colophon" identification={TRAINING_SYLLABUS.identification} />);
  pages.push(<ManuelForeword key="foreword" syllabus={TRAINING_SYLLABUS} pageNumber="III" />);
  pages.push(<ManuelTOC key="toc" entries={tocEntries} pageNumber="IV" />);
  pages.push(<ManuelAbbreviations key="abbrev" abbreviations={TRAINING_ABBREVIATIONS} pageNumber="V" />);

  // Syllabus (pages 1–4)
  const syllabusBlock = ManuelSyllabusBlock({ syllabus: TRAINING_SYLLABUS, startPage: 1 });
  syllabusBlock.pages.forEach((p) => pages.push(p));
  let currentPage = syllabusBlock.nextPage;

  // Modules (1 par rôle, dans l'ordre stratégique)
  MODULE_ORDER.forEach((roleKey) => {
    const guide = GUIDES[roleKey];
    const ass = TRAINING_ASSESSMENTS[roleKey];
    if (!guide || !ass) return;

    const moduleBlock = ManuelModuleBlock({
      moduleCode: ass.moduleCode,
      roleKey,
      roleLabel: guide.roleLabel,
      icon: GUIDE_ICONS[roleKey],
      duration: guide.meta.duration,
      level: guide.meta.level,
      audience: guide.meta.targetAudience,
      context: guide.meta.context,
      objectives: guide.objectives,
      prerequisites: guide.prerequisites,
      chapters: guide.chapters,
      startPage: currentPage,
    });
    moduleBlock.pages.forEach((p) => pages.push(p));
    currentPage = moduleBlock.nextPage;

    const assessmentBlock = ManuelAssessmentBlock({ assessment: ass, startPage: currentPage });
    assessmentBlock.pages.forEach((p) => pages.push(p));
    currentPage = assessmentBlock.nextPage;
  });

  // Annexes
  pages.push(
    <ManuelProgressionGrid
      key="annexe-progression"
      progression={TRAINING_PROGRESSION.grilleProgression}
      pageNumber={currentPage}
    />,
  );
  currentPage += 1;

  const glossaryBlock = ManuelGlossary({
    entries: TRAINING_PROGRESSION.indexGeneral,
    startPage: currentPage,
  });
  glossaryBlock.pages.forEach((p) => pages.push(p));
  currentPage = glossaryBlock.nextPage;

  pages.push(
    <ManuelEnd key="end" identification={TRAINING_SYLLABUS.identification} pageNumber={currentPage} />,
  );

  return (
    <div className="space-y-6">
      {/* Barre d'actions (masquée à l'impression) */}
      <div className="no-print sticky top-16 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur sm:-mx-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/aide">
              <ArrowLeft className="h-4 w-4" /> Bibliothèque
            </Link>
          </Button>
          <div>
            <p className="font-display text-base font-bold leading-none text-foreground">
              Support de formation académique
            </p>
            <p className="text-xs text-muted-foreground">
              {TRAINING_SYLLABUS.identification.code} · Version {TRAINING_SYLLABUS.identification.version}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="#manuel-print">
              <ListTree className="h-4 w-4" /> Aller au manuel
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="/api/docx/training-manual">
              <FileDown className="h-4 w-4" /> Télécharger Word (.docx)
            </a>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Télécharger PDF
          </Button>
        </div>
      </div>

      {/* Notice d'utilisation pour l'écran (non imprimable) */}
      <div className="no-print rounded-2xl border border-ew-green-100 bg-ew-green-50/50 p-4 text-sm leading-relaxed text-ew-green-900">
        <p className="font-display text-base font-bold">
          Comment télécharger le manuel au format PDF ?
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Cliquez sur <strong>« Télécharger le PDF »</strong> en haut à droite (ou pressez <kbd>Ctrl</kbd> + <kbd>P</kbd>).
          </li>
          <li>
            Dans la boîte de dialogue d&apos;impression, choisissez la destination{" "}
            <strong>« Enregistrer en PDF »</strong>.
          </li>
          <li>
            Vérifiez que <strong>l&apos;arrière-plan et les images</strong> sont activés
            (« Plus de paramètres » → cocher « Graphiques d&apos;arrière-plan »).
          </li>
          <li>Choisissez le format <strong>A4</strong> et lancez l&apos;enregistrement.</li>
        </ol>
        <p className="mt-2 text-xs italic text-ew-green-800/70">
          Le manuel s&apos;imprime sur une mise en page A4 conforme aux standards académiques.
          La barre d&apos;actions, ce bandeau et la navigation de l&apos;application sont automatiquement masqués
          dans le PDF.
        </p>
      </div>

      {/* Le manuel imprimable */}
      <div id="manuel-print" className="space-y-10 bg-muted/40 py-8 print:bg-white print:py-0">
        {pages}
      </div>
    </div>
  );
}
