"use client";

import * as React from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  GraduationCap,
  Lightbulb,
  ListChecks,
  MessageSquare,
  ScrollText,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Seminaire,
  SeminaireActivity,
  SeminaireBlock,
  SeminaireModule,
  SeminaireQuiz,
} from "@/lib/seminaires/types";
import {
  SeminaireActivityProvider,
  useSeminaireActivityContext,
} from "./activity-context";
import { useQuizReveal } from "./use-quiz-reveal";
import { TestTimer } from "./test-timer";
import { InteractivePoll } from "./activities/interactive-poll";
import { InteractiveForum } from "./activities/interactive-forum";
import { InteractiveMindMap } from "./activities/interactive-mindmap";

/* ============================================================================
   Composants d'affichage interactif d'un séminaire :
   - SeminaireHeader : bandeau d'identité + KPIs + actions
   - SeminaireOverview : objectifs, compétences, parcours LMS
   - SeminaireModulesList : modules sous forme d'accordéon
   - SeminaireQuizCard : quiz interactif auto-corrigé
   - SeminaireCharte : modèle de charte + actions
   ========================================================================== */

/* -------- HEADER -------- */
export function SeminaireHeader({
  seminaire,
  rightSlot,
}: {
  seminaire: Seminaire;
  rightSlot?: React.ReactNode;
}) {
  const m = seminaire.meta;
  return (
    <section className="overflow-hidden rounded-2xl border border-ew-green-200 bg-gradient-to-br from-ew-green-50 via-card to-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start gap-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ew-green-700 text-white">
          <ScrollText aria-hidden className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ew-green-700">
            Séminaire des écoles catholiques
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            {m.title}
          </h1>
          <p className="mt-1 text-sm italic text-muted-foreground">{m.subtitle}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Référence :</strong> {m.reference}
            {m.referenceDate ? ` (${m.referenceDate})` : null} · <strong>Format :</strong> {m.courseType}
          </p>
        </div>
        {rightSlot ? <div className="flex flex-wrap gap-2">{rightSlot}</div> : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile icon={<Clock className="h-4 w-4" />} label="Durée totale" value={m.duration} />
        <KpiTile icon={<Users className="h-4 w-4" />} label="Public" value={shorten(m.audience, 60)} />
        <KpiTile icon={<GraduationCap className="h-4 w-4" />} label="Niveau" value={m.level} />
        <KpiTile icon={<CheckCircle2 className="h-4 w-4" />} label="Complétion" value={shorten(m.completion, 60)} />
      </div>

      <div className="mt-5 space-y-2 text-sm text-muted-foreground">
        {m.presentation.map((p, i) => (
          <p key={i} className="leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

function KpiTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-xs font-bold text-foreground">{value}</p>
    </div>
  );
}

function shorten(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

/* -------- OVERVIEW : objectifs, compétences, architecture -------- */
export function SeminaireOverview({ seminaire }: { seminaire: Seminaire }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <Target className="h-4 w-4" /> Objectifs pédagogiques
        </p>
        <ol className="mt-3 space-y-2 text-sm">
          {seminaire.objectives.map((o, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ew-green-700 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span>{o}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <Lightbulb className="h-4 w-4" /> Compétences visées
        </p>
        <div className="mt-3 space-y-3 text-sm">
          {seminaire.competences.map((c) => (
            <div key={c.category}>
              <p className="text-xs font-bold text-foreground">{c.category}</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {c.items.map((it, j) => (
                  <li key={j} className="flex gap-1.5">
                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-600" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- ARCHITECTURE LMS -------- */
export function SeminaireArchitecture({ seminaire }: { seminaire: Seminaire }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <ListChecks className="h-4 w-4" /> Architecture pédagogique
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-bold">Section LMS</th>
              <th className="px-3 py-2 text-left font-bold">Contenu</th>
              <th className="px-3 py-2 text-left font-bold">Activité</th>
              <th className="px-3 py-2 text-left font-bold">Évaluation</th>
            </tr>
          </thead>
          <tbody>
            {seminaire.architecture.map((row, i) => (
              <tr key={i} className="border-t border-border align-top">
                <td className="px-3 py-2 font-bold text-ew-green-800">{row.section}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.contentType}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.activity}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.evaluation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* -------- MODULES en accordéon -------- */
export function SeminaireModulesList({ modules }: { modules: SeminaireModule[] }) {
  // Plusieurs modules peuvent rester ouverts ; on conserve l'état des activités/QCM grâce au masquage CSS (hidden) plutôt qu'au démontage.
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => new Set([modules[0]?.id].filter(Boolean) as string[]));

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="space-y-3">
      <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
        <BookOpen aria-hidden className="h-4 w-4" /> Modules du parcours
      </p>
      {modules.map((m) => {
        const isOpen = openIds.has(m.id);
        const buttonId = `mod-${m.id}-btn`;
        const panelId = `mod-${m.id}-panel`;
        return (
          <article
            key={m.id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-card transition-all",
              isOpen ? "border-ew-green-300 shadow-sm" : "border-border",
            )}
          >
            <button
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(m.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/20"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ew-green-700 font-display text-sm font-extrabold text-white"
                >
                  {m.num}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-foreground">{m.title}</p>
                  <p className="truncate text-xs italic text-muted-foreground">{m.displayTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-muted-foreground sm:inline">{m.duration}</span>
                {isOpen ? (
                  <ChevronUp aria-hidden className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown aria-hidden className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
            >
              <ModuleBody module={m} />
            </div>
          </article>
        );
      })}
    </section>
  );
}

export function ModuleBody({
  module: m,
  courseId,
}: {
  module: SeminaireModule;
  /** Identifiant du cours parent — active les activités interactives
      (sondage, forum) en fournissant le contexte de persistance. */
  courseId?: string;
}) {
  if (courseId) {
    return (
      <SeminaireActivityProvider value={{ courseId, moduleId: m.id }}>
        <ModuleBodyContent module={m} />
      </SeminaireActivityProvider>
    );
  }
  return <ModuleBodyContent module={m} />;
}

function ModuleBodyContent({ module: m }: { module: SeminaireModule }) {
  // Accordéon exclusif des activités : ouvrir une activité ferme les autres.
  const [openActivityId, setOpenActivityId] = React.useState<string | null>(null);
  return (
    <div className="border-t border-border p-5 space-y-5">
      <div className="rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
        <p>
          <strong className="text-foreground">Objectif :</strong> {m.objective}
        </p>
        {m.welcomeMessage ? (
          <p className="mt-2 whitespace-pre-line italic">{m.welcomeMessage}</p>
        ) : null}
      </div>

      {m.resume ? (
        <div className="text-sm leading-relaxed text-foreground/90">
          {m.resume.split("\n\n").map((para, i) => (
            <p key={i} className={i > 0 ? "mt-2" : undefined}>
              {para}
            </p>
          ))}
        </div>
      ) : null}

      {m.centralMessage ? (
        <div className="rounded-xl border-l-4 border-ew-gold-500 bg-ew-gold-50 px-4 py-3 text-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ew-gold-700">Message central</p>
          <p className="mt-1 font-display text-sm italic text-foreground">{m.centralMessage}</p>
        </div>
      ) : null}

      {m.retain && m.retain.length ? (
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">À retenir</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {m.retain.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-600" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ContentBlocks blocks={m.content} />

      <div className="space-y-3">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">Activités</p>
        {m.activities.map((a) => (
          <ActivityCard
            key={a.id}
            activity={a}
            isOpen={openActivityId === a.id}
            onToggle={() =>
              setOpenActivityId((cur) => (cur === a.id ? null : a.id))
            }
          />
        ))}
      </div>

      <div>
        <p className="font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          Critères d&apos;achèvement
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {m.achievement.map((c, i) => (
            <li key={i} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-600" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------- Rendu des blocs de contenu -------- */
function ContentBlocks({ blocks }: { blocks: SeminaireBlock[] }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="space-y-3 text-sm">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block: b }: { block: SeminaireBlock }) {
  switch (b.kind) {
    case "paragraph":
      return <p className="leading-relaxed">{b.text}</p>;
    case "subheading": {
      const sizes = { 2: "text-base", 3: "text-sm", 4: "text-xs" } as const;
      return (
        <p className={cn("font-display font-bold text-foreground", sizes[b.level])}>{b.text}</p>
      );
    }
    case "bulletList":
      return (
        <div>
          {b.intro ? <p className="mb-1 italic text-muted-foreground">{b.intro}</p> : null}
          <ul className="space-y-1">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "numberedList":
      return (
        <div>
          {b.intro ? <p className="mb-1 italic text-muted-foreground">{b.intro}</p> : null}
          <ol className="space-y-1">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-ew-green-700">{i + 1}.</span>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          {b.caption ? <p className="mb-1 text-xs italic text-muted-foreground">{b.caption}</p> : null}
          <table className="w-full text-xs">
            <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
              <tr>
                {b.headers.map((h, i) => (
                  <th key={i} className="px-2 py-1.5 text-left font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td key={j} className="px-2 py-1.5">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <div
          className={cn(
            "rounded-xl border-l-4 px-3 py-2 text-sm",
            b.tone === "info" && "border-ew-blue bg-ew-blue/10",
            b.tone === "warning" && "border-ew-gold-500 bg-ew-gold-50",
            b.tone === "success" && "border-ew-green-500 bg-ew-green-50",
            b.tone === "spiritual" && "border-ew-purple-500 bg-ew-purple-50",
          )}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide">{b.label}</p>
          <p className="mt-1">{b.text}</p>
        </div>
      );
    case "principle":
      return (
        <div className="rounded-xl border border-ew-green-200 bg-ew-green-50/40 p-3">
          <p className="font-display text-sm font-bold text-ew-green-800">
            {b.num}. {b.title}
          </p>
          <p className="mt-1 text-sm text-foreground/90">{b.description}</p>
          <p className="mt-1 text-xs italic text-ew-green-800">
            <strong>Application :</strong> {b.application}
          </p>
        </div>
      );
    case "deviation":
      return (
        <div className="rounded-xl border border-ew-gold-200 bg-ew-gold-50/40 p-3">
          <p className="font-display text-sm font-bold text-ew-gold-700">
            {b.num}. {b.title}
          </p>
          <p className="mt-1 text-sm">{b.description}</p>
          <p className="mt-2 text-xs font-bold uppercase text-ew-gold-700">Risques</p>
          <ul className="mt-1 space-y-0.5 text-xs">
            {b.risks.map((r, i) => (
              <li key={i} className="flex gap-1.5">
                <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-ew-gold-600" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs italic text-foreground/90">
            <strong>Solution :</strong> {b.solution}
          </p>
        </div>
      );
    case "domain":
      return (
        <div className="rounded-xl border border-border p-3">
          <p className="font-display text-sm font-bold text-ew-green-800">
            {b.num}. {b.title}
          </p>
          <ul className="mt-1.5 space-y-0.5 text-sm">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-1.5">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ew-green-600" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}

/* -------- ACTIVITÉS --------
   Comportement d'accordéon exclusif piloté par le parent (ModuleBodyContent
   pour Magnifica) : isOpen + onToggle sont remontés au niveau de la liste
   afin qu'ouvrir une activité ferme automatiquement les autres. */
function ActivityCard({
  activity: a,
  isOpen,
  onToggle,
}: {
  activity: SeminaireActivity;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const open = isOpen;
  const buttonId = `act-${a.id}-btn`;
  const panelId = `act-${a.id}-panel`;
  return (
    <div className="rounded-xl border border-border bg-background/60">
      <button
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/20"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="rounded-md bg-ew-green-700 px-2 py-0.5 font-mono text-[11px] font-bold text-white"
          >
            {a.num}
          </span>
          <p className="text-sm font-bold">{a.title}</p>
        </div>
        {open ? (
          <ChevronUp aria-hidden className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown aria-hidden className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="border-t border-border"
      >
        <div className="space-y-3 p-4 text-sm">
          {a.recommendation ? (
            <p className="text-xs italic text-muted-foreground">
              <strong>Outil recommandé :</strong> {a.recommendation}
            </p>
          ) : null}
          {a.instructions.map((ins, i) => (
            <p key={i}>{ins}</p>
          ))}

          {a.kind === "qcm" && a.qcm ? (
            <InteractiveQcm questions={a.qcm} idPrefix={a.id} />
          ) : null}
          {a.kind === "truefalse" && a.truefalse ? (
            <InteractiveTruefalse items={a.truefalse} idPrefix={a.id} />
          ) : null}
          {a.kind === "dragdrop" && a.matchings ? (
            <DragDropTable matchings={a.matchings} activityId={a.id} />
          ) : null}
          {a.kind === "scenario" && a.steps ? (
            <InteractiveScenario steps={a.steps} idPrefix={a.id} />
          ) : null}
          {a.kind === "case" && a.caseStudy ? (
            <CaseStudyView c={a.caseStudy} />
          ) : null}
          {a.tableHeaders ? (
            <BlankTable headers={a.tableHeaders} example={a.example} activityId={a.id} />
          ) : null}
          {/* Sondage interactif si un contexte cours/module est fourni ; sinon
              affichage statique des options (compatibilité ascendante). */}
          {a.kind === "survey" && a.options ? (
            <SurveyDispatcher
              question={a.question ?? ""}
              options={a.options}
              activityId={a.id}
            />
          ) : a.options ? (
            <SurveyOptions options={a.options} />
          ) : null}
          {a.kind === "forum" ? (
            <ForumDispatcher
              instructions={a.instructions?.[0]}
              activityId={a.id}
            />
          ) : null}
          {a.kind === "mindmap" ? (
            <MindMapDispatcher
              instructions={a.instructions?.[0]}
              activityId={a.id}
            />
          ) : null}
          {a.exploitation ? (
            <p className="rounded-md border-l-4 border-ew-blue bg-ew-blue/10 px-3 py-2 text-xs">
              <strong>Exploitation pédagogique :</strong> {a.exploitation}
            </p>
          ) : null}
          {a.deliverable ? (
            <p className="text-xs">
              <strong>Livrable attendu :</strong> {a.deliverable}
            </p>
          ) : null}
          {a.presentationCriteria ? (
            <div>
              <p className="text-xs font-bold">Critères de présentation</p>
              <ul className="mt-1 space-y-0.5 text-xs">
                {a.presentationCriteria.map((c, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SurveyOptions({ options }: { options: string[] }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((o, i) => (
        <span
          key={i}
          className="rounded-full border border-border bg-muted/30 px-3 py-1 text-center text-xs"
        >
          {o}
        </span>
      ))}
    </div>
  );
}

function InteractiveQcm({
  questions,
  idPrefix,
  onScored,
}: {
  questions: { question: string; options: string[]; correctIdx: number }[];
  idPrefix: string;
  /** Notifié à chaque vérification — score en pourcentage 0-100. */
  onScored?: (percent: number, raw: number, total: number) => void;
}) {
  const [answers, setAnswers] = React.useState<Record<number, number | null>>({});
  const reveal = useQuizReveal(questions.length);
  const [resetCount, setResetCount] = React.useState(0);
  const helpId = `${idPrefix}-help`;
  const answered = Object.keys(answers).length;
  const score = React.useMemo(
    () =>
      questions.reduce((acc, q, i) => (answers[i] === q.correctIdx ? acc + 1 : acc), 0),
    [answers, questions],
  );

  // Notifier le parent du score UNIQUEMENT quand TOUTES les questions sont
  // vérifiées (le test est terminé) — préserve la sémantique de validation.
  const scoredRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!reveal.allRevealed) {
      scoredRef.current = null;
      return;
    }
    if (scoredRef.current === score) return;
    scoredRef.current = score;
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    onScored?.(pct, score, questions.length);
  }, [reveal.allRevealed, score, questions.length, onScored]);

  const restart = () => {
    setAnswers({});
    reveal.reset();
    setResetCount((c) => c + 1);
  };

  return (
    <div className="space-y-3">
      {/* En-tête : chronomètre démarré dès l'ouverture du test, figé à la fin. */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Test — {reveal.revealedCount}/{questions.length} vérifiées
        </p>
        <TestTimer running={!reveal.allRevealed} resetKey={resetCount} />
      </div>
      {questions.map((q, i) => {
        const shown = reveal.isRevealed(i);
        const good = answers[i] === q.correctIdx;
        return (
          <div key={i} className="rounded-md border border-border p-3">
            <p className="text-sm font-bold" id={`${idPrefix}-q${i}-label`}>
              Q{i + 1}. {q.question}
            </p>
            <div className="mt-2 space-y-1" role="radiogroup" aria-labelledby={`${idPrefix}-q${i}-label`}>
              {q.options.map((o, j) => {
                const isPicked = answers[i] === j;
                const isCorrect = shown && j === q.correctIdx;
                const isWrong = shown && isPicked && j !== q.correctIdx;
                return (
                  <label
                    key={j}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                      !shown && isPicked && "border-ew-green-500 bg-ew-green-50",
                      isCorrect && "border-ew-green-600 bg-ew-green-100",
                      isWrong && "border-red-500 bg-red-50",
                      !shown && !isPicked && "border-border",
                      shown && !isCorrect && !isWrong && "border-border",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${idPrefix}-q${i}`}
                      checked={isPicked}
                      onChange={() => setAnswers((a) => ({ ...a, [i]: j }))}
                      disabled={shown}
                      className="accent-ew-green-700"
                    />
                    <span>{o}</span>
                    {isCorrect ? (
                      <CheckCircle2 aria-hidden className="ml-auto h-4 w-4 text-ew-green-600" />
                    ) : null}
                    {isWrong ? <XCircle aria-hidden className="ml-auto h-4 w-4 text-red-600" /> : null}
                  </label>
                );
              })}
            </div>
            {/* Vérification IMMÉDIATE de cette question. */}
            <div className="mt-2 flex items-center justify-between gap-2">
              {shown ? (
                <p
                  className={cn(
                    "text-xs font-bold",
                    good ? "text-ew-green-700" : "text-red-600",
                  )}
                >
                  {good ? "✓ Bonne réponse" : `✗ Réponse exacte : ${q.options[q.correctIdx]}`}
                </p>
              ) : (
                <span aria-hidden />
              )}
              {!shown ? (
                <button
                  type="button"
                  onClick={() => reveal.revealOne(i)}
                  disabled={answers[i] == null}
                  className="rounded-md border border-ew-green-400 bg-ew-green-50 px-2.5 py-1 text-xs font-bold text-ew-green-800 hover:bg-ew-green-100 disabled:opacity-40"
                  title={answers[i] == null ? "Choisissez une réponse pour vérifier." : "Vérifier cette question"}
                >
                  Vérifier
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground" id={helpId}>
          {reveal.allRevealed ? (
            <>
              Score : <strong>{score}/{questions.length}</strong> (
              {Math.round((score / questions.length) * 100)} %)
            </>
          ) : (
            <>
              {answered}/{questions.length} répondues — vérifiez chaque question, ou tout d&apos;un coup.
            </>
          )}
        </p>
        {reveal.allRevealed ? (
          <button
            onClick={restart}
            aria-label={`Recommencer le quiz ${idPrefix}`}
            className="rounded-md border border-border bg-card px-3 py-1 text-xs font-bold hover:bg-muted/20"
          >
            Recommencer
          </button>
        ) : (
          <button
            onClick={reveal.revealAll}
            disabled={answered < questions.length}
            aria-label={`Tout vérifier — quiz ${idPrefix}`}
            aria-describedby={helpId}
            title={
              answered < questions.length
                ? "Répondez à toutes les questions pour tout vérifier."
                : undefined
            }
            className="rounded-md bg-ew-green-700 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
          >
            Tout vérifier
          </button>
        )}
      </div>
    </div>
  );
}

function InteractiveTruefalse({
  items,
  idPrefix,
}: {
  items: { statement: string; answer: "Vrai" | "Faux"; explanation?: string }[];
  idPrefix: string;
}) {
  const [picks, setPicks] = React.useState<Record<number, "Vrai" | "Faux" | null>>({});
  const [checked, setChecked] = React.useState(false);
  const helpId = `${idPrefix}-help`;
  const answered = Object.keys(picks).length;
  const score = React.useMemo(
    () => items.reduce((acc, it, i) => (picks[i] === it.answer ? acc + 1 : acc), 0),
    [picks, items],
  );

  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const good = checked && picks[i] === it.answer;
        const bad = checked && picks[i] && picks[i] !== it.answer;
        return (
          <div key={i} className="rounded-md border border-border p-3">
            <p className="text-sm">{it.statement}</p>
            <div className="mt-2 flex gap-2">
              {(["Vrai", "Faux"] as const).map((v) => {
                const picked = picks[i] === v;
                return (
                  <button
                    key={v}
                    onClick={() => !checked && setPicks((p) => ({ ...p, [i]: v }))}
                    disabled={checked}
                    aria-pressed={picked}
                    aria-label={`Réponse ${v} pour l'affirmation ${i + 1} de ${idPrefix}`}
                    className={cn(
                      "rounded-md border px-3 py-1 text-xs font-bold",
                      picked && "border-ew-green-600 bg-ew-green-100",
                      !picked && "border-border bg-card",
                    )}
                  >
                    {v}
                  </button>
                );
              })}
              {good ? (
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-ew-green-700">
                  <CheckCircle2 aria-hidden className="h-4 w-4" /> Correct
                </span>
              ) : bad ? (
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-red-600">
                  <XCircle aria-hidden className="h-4 w-4" /> Réponse attendue : {it.answer}
                </span>
              ) : null}
            </div>
            {checked && it.explanation ? (
              <p className="mt-2 rounded-md bg-muted/40 px-2 py-1 text-xs italic">{it.explanation}</p>
            ) : null}
          </div>
        );
      })}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground" id={helpId}>
          {checked
            ? `Score : ${score}/${items.length}`
            : `${answered}/${items.length} affirmations classées.`}
        </p>
        {checked ? (
          <button
            onClick={() => {
              setChecked(false);
              setPicks({});
            }}
            aria-label={`Recommencer l'activité ${idPrefix}`}
            className="rounded-md border border-border bg-card px-3 py-1 text-xs font-bold hover:bg-muted/20"
          >
            Recommencer
          </button>
        ) : (
          <button
            onClick={() => setChecked(true)}
            disabled={answered < items.length}
            aria-label={`Vérifier les réponses de ${idPrefix}`}
            aria-describedby={helpId}
            title={
              answered < items.length
                ? "Répondez à chaque affirmation pour vérifier."
                : undefined
            }
            className="rounded-md bg-ew-green-700 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
          >
            Vérifier
          </button>
        )}
      </div>
    </div>
  );
}

function DragDropTable({
  matchings,
  activityId,
}: {
  matchings: { situation: string; principle: string }[];
  activityId: string;
}) {
  // Liste de principes (avec quelques distracteurs si la consigne est riche), mélangée par index.
  const principles = React.useMemo(() => {
    const items = matchings.map((m) => m.principle);
    return Array.from(new Set(items));
  }, [matchings]);

  const [picks, setPicks] = React.useState<Record<number, string>>({});
  const [revealed, setRevealed] = React.useState(false);
  const allAnswered = matchings.every((_, i) => picks[i]);
  const correctCount = React.useMemo(
    () => matchings.reduce((acc, m, i) => (picks[i] === m.principle ? acc + 1 : acc), 0),
    [picks, matchings],
  );

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 text-left font-bold">Situation</th>
              <th className="px-2 py-1.5 text-left font-bold">Principe à associer</th>
            </tr>
          </thead>
          <tbody>
            {matchings.map((m, i) => {
              const picked = picks[i] ?? "";
              const good = revealed && picked === m.principle;
              const bad = revealed && picked && picked !== m.principle;
              return (
                <tr key={i} className="border-t border-border align-top">
                  <td className="px-2 py-1.5">{m.situation}</td>
                  <td className="px-2 py-1.5">
                    <select
                      aria-label={`Principe à associer à la situation ${i + 1}`}
                      value={picked}
                      onChange={(e) =>
                        !revealed && setPicks((p) => ({ ...p, [i]: e.target.value }))
                      }
                      disabled={revealed}
                      className={cn(
                        "w-full rounded border bg-background px-2 py-1 text-xs",
                        good && "border-ew-green-600 bg-ew-green-100",
                        bad && "border-red-500 bg-red-50",
                        !good && !bad && "border-border",
                      )}
                    >
                      <option value="">— Choisir —</option>
                      {principles.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {revealed && bad ? (
                      <p className="mt-1 text-[10px] italic text-red-600">
                        Réponse attendue : <strong>{m.principle}</strong>
                      </p>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {revealed ? (
            <>
              Score : <strong>{correctCount}/{matchings.length}</strong>
            </>
          ) : (
            <>
              {Object.keys(picks).length}/{matchings.length} associations
            </>
          )}
        </p>
        {revealed ? (
          <button
            onClick={() => {
              setRevealed(false);
              setPicks({});
            }}
            className="rounded-md border border-border bg-card px-3 py-1 text-xs font-bold hover:bg-muted/20"
            id={`${activityId}-reset`}
          >
            Recommencer
          </button>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            disabled={!allAnswered}
            aria-label={`Vérifier les associations de l'activité ${activityId}`}
            title={!allAnswered ? "Associez chaque situation à un principe pour vérifier." : undefined}
            className="rounded-md bg-ew-green-700 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
          >
            Afficher la correction
          </button>
        )}
      </div>
    </div>
  );
}

function InteractiveScenario({
  steps,
  idPrefix,
}: {
  steps: { num: number; description: string; choices: string[]; bestIdx: number }[];
  idPrefix: string;
}) {
  const [picks, setPicks] = React.useState<Record<number, number | null>>({});
  const [checked, setChecked] = React.useState(false);
  const helpId = `${idPrefix}-help`;
  const answered = Object.keys(picks).length;

  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={i} className="rounded-md border border-border p-3">
          <p className="text-sm font-bold">Étape {s.num}</p>
          <p className="mt-1 text-sm">{s.description}</p>
          <div className="mt-2 space-y-1" role="radiogroup" aria-label={`Étape ${s.num} — ${idPrefix}`}>
            {s.choices.map((c, j) => {
              const picked = picks[i] === j;
              const good = checked && j === s.bestIdx;
              const bad = checked && picked && j !== s.bestIdx;
              return (
                <button
                  key={j}
                  onClick={() => !checked && setPicks((p) => ({ ...p, [i]: j }))}
                  disabled={checked}
                  aria-pressed={picked}
                  className={cn(
                    "block w-full rounded-md border px-2 py-1.5 text-left text-xs",
                    picked && !checked && "border-ew-green-500 bg-ew-green-50",
                    good && "border-ew-green-600 bg-ew-green-100",
                    bad && "border-red-500 bg-red-50",
                    !picked && !good && !bad && "border-border bg-card",
                  )}
                >
                  {String.fromCharCode(65 + j)}. {c}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <p className="text-xs italic text-muted-foreground" id={helpId}>
          {checked
            ? "Comparez vos choix avec la décision la plus responsable."
            : `${answered}/${steps.length} étapes décidées — choisissez à chaque étape l'action la plus responsable.`}
        </p>
        {checked ? (
          <button
            onClick={() => {
              setChecked(false);
              setPicks({});
            }}
            aria-label={`Recommencer le scénario ${idPrefix}`}
            className="rounded-md border border-border bg-card px-3 py-1 text-xs font-bold hover:bg-muted/20"
          >
            Recommencer
          </button>
        ) : (
          <button
            onClick={() => setChecked(true)}
            disabled={answered < steps.length}
            aria-label={`Vérifier le scénario ${idPrefix}`}
            aria-describedby={helpId}
            title={
              answered < steps.length
                ? "Décidez de chaque étape pour vérifier."
                : undefined
            }
            className="rounded-md bg-ew-green-700 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
          >
            Vérifier
          </button>
        )}
      </div>
    </div>
  );
}

function CaseStudyView({
  c,
}: {
  c: { description: string; questions: string[]; production: string };
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">Cas</p>
      <p className="mt-1 text-sm">{c.description}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">Questions</p>
      <ol className="mt-1 space-y-1 text-sm">
        {c.questions.map((q, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold text-ew-green-700">{i + 1}.</span>
            <span>{q}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs italic">
        <strong>Production attendue :</strong> {c.production}
      </p>
    </div>
  );
}

function BlankTable({
  headers,
  example,
  activityId,
}: {
  headers: string[];
  example?: { label: string; content: string }[];
  activityId: string;
}) {
  // Une ligne par exemple (1re colonne pré-remplie en lecture seule) + 2 lignes vides supplémentaires.
  const initialRows = React.useMemo(() => {
    const base = (example ?? []).map((e) => [e.content, ...Array(headers.length - 1).fill("")]);
    return base.length > 0
      ? [...base, ...Array(2).fill(null).map(() => Array(headers.length).fill(""))]
      : Array(3).fill(null).map(() => Array(headers.length).fill(""));
  }, [example, headers.length]);
  const [rows, setRows] = React.useState<string[][]>(initialRows);
  const fixedFirstCells = (example ?? []).length;

  function updateCell(r: number, c: number, v: string) {
    setRows((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = v;
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, Array(headers.length).fill("")]);
  }

  function copyAsText() {
    const lines = [headers.join("\t"), ...rows.map((r) => r.join("\t"))];
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
  }

  function resetTable() {
    setRows(initialRows);
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-2 py-1.5 text-left font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-t border-border align-top">
                {row.map((cell, c) => {
                  const readOnly = r < fixedFirstCells && c === 0;
                  return (
                    <td key={c} className="px-1 py-1">
                      {readOnly ? (
                        <div className="px-1 py-1 font-bold text-foreground">{cell}</div>
                      ) : (
                        <textarea
                          aria-label={`${headers[c]} — ligne ${r + 1}`}
                          value={cell}
                          onChange={(e) => updateCell(r, c, e.target.value)}
                          rows={1}
                          className="w-full resize-y rounded border border-transparent bg-transparent px-1 py-0.5 text-xs hover:border-border focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
                          placeholder="…"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={addRow}
          aria-label={`Ajouter une ligne à l'activité ${activityId}`}
          className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-bold hover:bg-muted/20"
        >
          + Ajouter une ligne
        </button>
        <button
          onClick={copyAsText}
          aria-label={`Copier le contenu de l'activité ${activityId}`}
          className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-bold hover:bg-muted/20"
        >
          Copier mon travail
        </button>
        <button
          onClick={resetTable}
          aria-label={`Réinitialiser l'activité ${activityId}`}
          className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:bg-muted/20"
        >
          Réinitialiser
        </button>
      </div>
      <p className="text-[10px] italic text-muted-foreground">
        Votre travail reste local à votre navigateur. Pensez à le « copier » avant de quitter la page.
      </p>
    </div>
  );
}

/* -------- QUIZ INDÉPENDANTS -------- */
export function SeminaireQuizCard({
  quiz,
  onScored,
}: {
  quiz: SeminaireQuiz;
  onScored?: (percent: number, raw: number, total: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <MessageSquare aria-hidden className="h-4 w-4 text-ew-green-700" />
        <p className="font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          {quiz.title}
        </p>
      </div>
      <div className="mt-3">
        <InteractiveQcm questions={quiz.questions} idPrefix={quiz.id} onScored={onScored} />
      </div>
    </div>
  );
}

/* ----- Dispatchers : versions interactives quand le contexte est fourni ----- */
function SurveyDispatcher({
  question,
  options,
  activityId,
}: {
  question: string;
  options: string[];
  activityId: string;
}) {
  const ctx = useSeminaireActivityContext();
  if (!ctx) {
    return <SurveyOptions options={options} />;
  }
  return (
    <InteractivePoll
      question={question || "Sélectionnez une réponse"}
      options={options}
      courseId={ctx.courseId}
      moduleId={ctx.moduleId}
      activityId={activityId}
    />
  );
}

function ForumDispatcher({
  instructions,
  activityId,
}: {
  instructions?: string;
  activityId: string;
}) {
  const ctx = useSeminaireActivityContext();
  if (!ctx) {
    return null;
  }
  return (
    <InteractiveForum
      instructions={instructions}
      courseId={ctx.courseId}
      moduleId={ctx.moduleId}
      activityId={activityId}
    />
  );
}

function MindMapDispatcher({
  instructions,
  activityId,
}: {
  instructions?: string;
  activityId: string;
}) {
  const ctx = useSeminaireActivityContext();
  if (!ctx) {
    return null;
  }
  return (
    <InteractiveMindMap
      instructions={instructions}
      courseId={ctx.courseId}
      moduleId={ctx.moduleId}
      activityId={activityId}
    />
  );
}
