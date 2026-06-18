"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  ClipboardList,
  ListTree,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Book,
  Printer,
  Clock,
  Users,
  GraduationCap,
  FileDown,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ============================================================================
   Briques visuelles « académiques » pour la section Aide & Formation.
   Style sobre, didactique : police displayed pour titres, cartouche d'objectifs,
   chapitres numérotés, encadrés (bonne pratique, mise en garde), FAQ, glossaire.
   ========================================================================== */

interface GuideMeta {
  level: string;
  duration: string;
  targetAudience: string;
  context?: string;
}

interface GuideStep {
  instruction: string;
  navigation?: string;
  tip?: string;
  warning?: string;
}

export interface GuideSection {
  title: string;
  body: string;
  steps?: GuideStep[];
  bestPractices?: string[];
  caveat?: string;
}

export interface GuideChapter {
  id: string;
  title: string;
  intro?: string;
  sections: GuideSection[];
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuideGlossaryEntry {
  term: string;
  definition: string;
}

export interface GuideContent {
  roleKey: string;
  roleLabel: string;
  icon: LucideIcon;
  meta: GuideMeta;
  objectives: string[];
  prerequisites: string[];
  chapters: GuideChapter[];
  faq: GuideFaq[];
  glossary: GuideGlossaryEntry[];
}

/* -------------------------------------------------------------------------- */
/*  En-tête du guide : titre, métadonnées, fil d'Ariane, retour à l'index     */
/* -------------------------------------------------------------------------- */
export function GuideHeader({ guide }: { guide: GuideContent }) {
  const Icon = guide.icon;
  return (
    <header className="rounded-2xl border border-border bg-gradient-to-br from-ew-green-700 via-ew-green-800 to-ew-green-950 p-6 text-white shadow-sm sm:p-8 print:rounded-none print:border-b-4 print:border-b-ew-gold-500">
      <Link
        href="/aide"
        className="no-print inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ew-gold-100 transition-colors hover:text-ew-gold-500"
      >
        <ArrowLeft className="h-3 w-3" />
        Retour à la bibliothèque des guides
      </Link>

      <div className="mt-3 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-1 ring-1 ring-inset ring-white/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="EduWeb Planner" className="h-full w-full object-contain" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ew-gold-100/80">Guide de formation</p>
          <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            {guide.roleLabel}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">{guide.meta.targetAudience}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <MetaPill icon={GraduationCap} label="Niveau" value={guide.meta.level} />
            <MetaPill icon={Clock} label="Durée" value={guide.meta.duration} />
            {guide.meta.context && <MetaPill icon={Users} label="Quand" value={guide.meta.context} />}
          </div>
        </div>
        {/* L'icône thématique reste accessible mais à droite */}
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20 lg:flex print:hidden">
          <Icon className="h-7 w-7 text-ew-gold-500" />
        </span>
      </div>
    </header>
  );
}

function MetaPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-inset ring-white/15">
      <Icon className="h-3 w-3 text-ew-gold-500" />
      <span className="text-white/70">{label}</span>
      <span className="text-white">{value}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cartouche d'objectifs pédagogiques (verbes d'action)                      */
/* -------------------------------------------------------------------------- */
export function ObjectivesCard({ objectives, prerequisites }: { objectives: string[]; prerequisites: string[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-l-4 border-l-ew-green-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-ew-green-700" /> Objectifs pédagogiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs italic text-muted-foreground">À l&apos;issue de ce guide, vous serez capable de :</p>
          <ol className="mt-2 space-y-2">
            {objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ew-green-100 text-[10px] font-bold text-ew-green-800">
                  {i + 1}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-ew-gold-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-ew-gold-600" /> Prérequis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs italic text-muted-foreground">Avant de commencer la formation, vérifiez :</p>
          <ul className="mt-2 space-y-2">
            {prerequisites.map((pre, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ew-gold-600" />
                <span>{pre}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sommaire (table des matières) — ancres                                    */
/* -------------------------------------------------------------------------- */
export function TableOfContents({ chapters }: { chapters: GuideChapter[] }) {
  return (
    <nav className="rounded-2xl border border-border bg-card p-5" aria-label="Sommaire">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">
        <ListTree className="h-3.5 w-3.5" /> Sommaire
      </p>
      <ol className="mt-3 space-y-1 text-sm">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-foreground transition-colors hover:bg-ew-green-50 hover:text-ew-green-800"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ew-green-100 text-[10px] font-bold text-ew-green-800">
                {i + 1}
              </span>
              <span className="font-medium">{c.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapitre numéroté (titre, intro, sections enchaînées)                     */
/* -------------------------------------------------------------------------- */
export function ChapterBlock({ chapter, index }: { chapter: GuideChapter; index: number }) {
  return (
    <section id={chapter.id} className="scroll-mt-24">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ew-gold-600">
          Chapitre {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground">{chapter.title}</h2>
      {chapter.intro && (
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{chapter.intro}</p>
      )}

      <div className="mt-6 space-y-7">
        {chapter.sections.map((s, i) => (
          <SectionBlock key={i} section={s} />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bloc « section » : titre, corps, étapes, encadrés                         */
/* -------------------------------------------------------------------------- */
function SectionBlock({ section }: { section: GuideSection }) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold text-foreground">{section.title}</h3>
      <div className="mt-2 space-y-3 text-[14.5px] leading-relaxed text-foreground/90">
        {section.body.split(/\n\n+/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {section.steps && section.steps.length > 0 && (
        <ol className="mt-5 space-y-3 border-l-2 border-ew-green-200 pl-5">
          {section.steps.map((step, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full bg-ew-green-700 text-[10px] font-bold text-white ring-4 ring-card">
                {i + 1}
              </span>
              <p className="text-sm font-medium leading-relaxed text-foreground">{step.instruction}</p>
              {step.navigation && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-bold uppercase tracking-wide text-ew-green-700">Chemin</span> · {step.navigation}
                </p>
              )}
              {step.tip && <Callout tone="tip" text={step.tip} />}
              {step.warning && <Callout tone="warning" text={step.warning} />}
            </li>
          ))}
        </ol>
      )}

      {section.bestPractices && section.bestPractices.length > 0 && (
        <BestPracticesCard practices={section.bestPractices} />
      )}

      {section.caveat && <Callout tone="warning" text={section.caveat} className="mt-4" />}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Encadrés (callouts) : conseil ou mise en garde                            */
/* -------------------------------------------------------------------------- */
function Callout({ tone, text, className }: { tone: "tip" | "warning"; text: string; className?: string }) {
  const styles =
    tone === "tip"
      ? "border-blue-200 bg-blue-50 text-blue-900"
      : "border-ew-gold-500/40 bg-ew-gold-100/70 text-ew-gold-600";
  const Icon = tone === "tip" ? Lightbulb : AlertTriangle;
  const label = tone === "tip" ? "Astuce" : "Attention";
  return (
    <div className={cn("mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs", styles, className)}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p className="leading-relaxed">
        <span className="font-bold uppercase tracking-wide">{label}</span> · <span className="text-foreground/85">{text}</span>
      </p>
    </div>
  );
}

function BestPracticesCard({ practices }: { practices: string[] }) {
  return (
    <div className="mt-5 rounded-xl border border-ew-green-100 bg-ew-green-50/60 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">
        <Sparkles className="h-3.5 w-3.5" /> Bonnes pratiques
      </p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {practices.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-700" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */
export function FaqList({ faq }: { faq: GuideFaq[] }) {
  return (
    <section id="faq" className="scroll-mt-24">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ew-gold-600">
          Annexe — Questions fréquentes
        </span>
      </div>
      <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground">Foire aux questions</h2>
      <div className="mt-5 divide-y divide-border rounded-xl border border-border bg-card">
        {faq.map((q, i) => (
          <details key={i} className="group p-5 marker:text-ew-green-700 open:bg-ew-green-50/30">
            <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-foreground">
              <span className="flex items-start gap-2">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-700" />
                {q.question}
              </span>
              <span className="ml-auto rounded-full bg-ew-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ew-green-700 transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>
            <p className="mt-2 pl-6 text-sm leading-relaxed text-foreground/85">{q.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Glossaire                                                                 */
/* -------------------------------------------------------------------------- */
export function Glossary({ glossary }: { glossary: GuideGlossaryEntry[] }) {
  return (
    <section id="glossaire" className="scroll-mt-24">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ew-gold-600">
          Annexe — Glossaire
        </span>
      </div>
      <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground">
        Glossaire des termes employés
      </h2>
      <dl className="mt-5 grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        {glossary.map((g, i) => (
          <div key={i} className="flex flex-col gap-1">
            <dt className="text-sm font-bold text-ew-green-800">{g.term}</dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">{g.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pied de page : impression, retour                                         */
/* -------------------------------------------------------------------------- */
export function GuideFooter({ roleLabel, roleKey }: { roleLabel: string; roleKey?: string }) {
  return (
    <footer className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2">
          <Book className="h-4 w-4 text-ew-green-700" />
          Fin du guide de formation —{" "}
          <span className="font-semibold text-foreground">{roleLabel}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {roleKey && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/docx/guide/${roleKey}`}>
                <FileDown className="h-4 w-4" /> Télécharger Word (.docx)
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimer en PDF
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/aide">
              <ArrowLeft className="h-4 w-4" /> Bibliothèque
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Composition complète d'un guide                                           */
/* -------------------------------------------------------------------------- */
export function GuideArticle({ guide }: { guide: GuideContent }) {
  return (
    <article className="space-y-8">
      <GuideHeader guide={guide} />
      <ObjectivesCard objectives={guide.objectives} prerequisites={guide.prerequisites} />
      <TableOfContents chapters={guide.chapters} />
      <div className="space-y-12">
        {guide.chapters.map((c, i) => (
          <ChapterBlock key={c.id} chapter={c} index={i} />
        ))}
      </div>
      <FaqList faq={guide.faq} />
      <Glossary glossary={guide.glossary} />
      <GuideFooter roleLabel={guide.roleLabel} roleKey={guide.roleKey} />
    </article>
  );
}
