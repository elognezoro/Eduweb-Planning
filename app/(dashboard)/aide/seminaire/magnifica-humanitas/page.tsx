"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookMarked,
  FileDown,
  Printer,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SeminaireHeader,
  SeminaireOverview,
  SeminaireArchitecture,
  SeminaireModulesList,
  SeminaireQuizCard,
} from "@/components/seminaires/seminaire-views";
import { MAGNIFICA_HUMANITAS } from "@/lib/seminaires/magnifica-humanitas";
import { CourseGate } from "@/components/formations/course-gate";

/**
 * Espace de formation interactif du séminaire « Magnifica Humanitas ».
 * - Vue d'ensemble (objectifs, compétences, architecture)
 * - Modules en accordéon avec quiz / scénarios / études de cas interactifs
 * - Quiz globaux auto-corrigés
 * - Charte modèle, glossaire, badges, grille d'évaluation
 * - Actions : imprimer livret, télécharger Word, délivrer un certificat
 */
export default function SeminaireMagnificaPage() {
  const s = MAGNIFICA_HUMANITAS;
  return (
    <CourseGate courseId="magnifica-humanitas">
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/aide">
            <ArrowLeft className="h-4 w-4" /> Bibliothèque
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/aide/seminaire/magnifica-humanitas/livret">
              <Printer className="h-4 w-4" /> Livret imprimable
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="/api/docx/seminaire/magnifica-humanitas">
              <FileDown className="h-4 w-4" /> Télécharger Word (.docx)
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link href="/aide/certificat">
              <Award className="h-4 w-4" /> Délivrer un certificat
            </Link>
          </Button>
        </div>
      </div>

      <SeminaireHeader seminaire={s} />

      {/* Navigation interne par ancres */}
      <nav className="sticky top-16 z-10 -mx-4 flex flex-wrap items-center gap-2 border-y border-border bg-card/80 px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground backdrop-blur sm:-mx-6">
        <a href="#overview" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Vue d&apos;ensemble
        </a>
        <a href="#architecture" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Architecture
        </a>
        <a href="#modules" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Modules
        </a>
        <a href="#quizzes" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Quiz
        </a>
        <a href="#charte" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Charte
        </a>
        <a href="#evaluation" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Évaluation
        </a>
        <a href="#glossary" className="rounded-md px-2 py-1 hover:bg-muted/40 hover:text-foreground">
          Glossaire
        </a>
      </nav>

      <section id="overview" className="space-y-4 scroll-mt-32">
        <SeminaireOverview seminaire={s} />
      </section>

      <section id="architecture" className="scroll-mt-32">
        <SeminaireArchitecture seminaire={s} />
      </section>

      <section id="modules" className="scroll-mt-32">
        <SeminaireModulesList modules={s.modules} />
      </section>

      <section id="quizzes" className="space-y-3 scroll-mt-32">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <Sparkles className="h-4 w-4" /> Quiz auto-corrigés
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {s.quizzes.map((q) => (
            <SeminaireQuizCard key={q.id} quiz={q} />
          ))}
        </div>
      </section>

      <section id="charte" className="space-y-3 scroll-mt-32">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <ScrollText className="h-4 w-4" /> Charte d&apos;usage responsable de l&apos;IA
        </p>
        <div className="rounded-2xl border border-border bg-card p-5 text-sm">
          <p className="text-justify leading-relaxed text-foreground/90">{s.charte.preambule}</p>
          <ol className="mt-4 space-y-2.5">
            {s.charte.engagements.map((e) => (
              <li key={e.num} className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3">
                <p className="font-display text-sm font-bold text-ew-green-800">
                  {e.num}. {e.title}
                </p>
                <p className="mt-1 text-sm">{e.description}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ew-green-700">
            Mise en œuvre
          </p>
          <ul className="mt-1 space-y-1 text-xs">
            {s.charte.implementation.map((it, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="evaluation" className="grid gap-4 lg:grid-cols-2 scroll-mt-32">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
            <Award className="h-4 w-4" /> Grille d&apos;évaluation
          </p>
          <table className="mt-3 w-full text-xs">
            <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 text-left font-bold">Critère</th>
                <th className="px-2 py-1.5 text-right font-bold">Points</th>
              </tr>
            </thead>
            <tbody>
              {s.evaluation.criteria.map((c, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-2 py-1.5">{c.criterion}</td>
                  <td className="px-2 py-1.5 text-right font-bold text-ew-green-800">{c.points}</td>
                </tr>
              ))}
              <tr className="border-t border-border bg-ew-green-50/60 font-bold">
                <td className="px-2 py-1.5">Total</td>
                <td className="px-2 py-1.5 text-right text-ew-green-800">
                  {s.evaluation.totalPoints}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-ew-green-700">Niveaux</p>
          <ul className="mt-1 space-y-1 text-xs">
            {s.evaluation.levels.map((lv, i) => (
              <li key={i} className="flex gap-2">
                <span className="rounded bg-ew-green-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                  {lv.range}
                </span>
                <span>{lv.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
            <Award className="h-4 w-4" /> Badges numériques
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {s.badges.map((b) => (
              <li key={b.num} className="rounded-lg border border-ew-gold-200 bg-ew-gold-50/40 p-3">
                <p className="font-display font-bold text-ew-gold-700">
                  {b.num}. {b.title}
                </p>
                <p className="mt-0.5 text-xs">{b.condition}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ew-green-700">
            Pondération évaluation globale
          </p>
          <ul className="mt-1 grid gap-1 text-xs sm:grid-cols-2">
            {s.achievement.weights.map((w) => (
              <li
                key={w.element}
                className="flex items-center justify-between rounded-md border border-border px-2 py-1"
              >
                <span>{w.element}</span>
                <span className="font-bold text-ew-green-800">{w.weight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="glossary" className="grid gap-4 lg:grid-cols-2 scroll-mt-32">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
            <BookMarked className="h-4 w-4" /> Glossaire
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            {s.glossary.map((g) => (
              <div key={g.term} className="border-l-2 border-ew-green-300 pl-3">
                <dt className="font-bold text-ew-green-800">{g.term}</dt>
                <dd className="text-xs text-muted-foreground">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
            <Sparkles className="h-4 w-4" /> Les 10 repères d&apos;un usage responsable
          </p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {s.references10.map((r) => (
              <li key={r.num} className="flex gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ew-green-700 text-[11px] font-bold text-white">
                  {r.num}
                </span>
                <span>{r.text}</span>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ew-green-700">
            Synthèse — cinq verbes
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {s.synthese.map((v) => (
              <li key={v.num} className="flex gap-2">
                <span className="font-bold text-ew-green-800">{v.verb} :</span>
                <span>{v.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pied : message de clôture */}
      <section className="rounded-2xl border border-ew-green-200 bg-gradient-to-r from-ew-green-50 via-card to-card p-5">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <Sparkles className="h-4 w-4" /> Message de clôture
        </p>
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/90">
          {s.closingMessage.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>
    </div>
    </CourseGate>
  );
}
