"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookMarked,
  CheckCircle2,
  Clock,
  FileDown,
  GraduationCap,
  Lock,
  Printer,
  RotateCcw,
  ScrollText,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SeminaireQuizCard,
  ModuleBody,
} from "@/components/seminaires/seminaire-views";
import { MAGNIFICA_HUMANITAS } from "@/lib/seminaires/magnifica-humanitas";
import { CourseGate } from "@/components/formations/course-gate";
import {
  MagnificaBook,
  type BookPage,
} from "@/components/seminaires/magnifica-book";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import {
  checkModuleAccess,
  getAccessRule,
  getModuleCompletion,
  isModuleCompleted,
} from "@/lib/formations/module-access";
import {
  evaluateCourseCompletion,
  getCourseCompletionRule,
  SUMMATIVE_QUIZ_ID,
} from "@/lib/formations/course-completion";

/**
 * Espace de formation Magnifica Humanitas — mode livre paginé.
 *
 * Le séminaire est présenté comme un livre que l'on feuillette : chaque page
 * est un thème (identité, objectifs, architecture, modules, quiz, charte,
 * évaluation, glossaire, clôture). La navigation se fait via Précédent /
 * Suivant, ← →, clic sur le sommaire, ou plein écran.
 */
export default function SeminaireMagnificaPage() {
  const s = MAGNIFICA_HUMANITAS;

  // Quiz sommatif : agrégation des 3 banques de questions du séminaire en un
  // unique quiz global (mêmes questions, ordre conservé).
  const sumQuiz = React.useMemo(
    () => ({
      id: "quiz-sommatif",
      num: 0,
      title: "Quiz sommatif — toutes les questions du séminaire",
      questions: s.quizzes.flatMap((q) =>
        q.questions.map((it, idx) => ({
          ...it,
          num: idx + 1,
        })),
      ),
    }),
    [s.quizzes],
  );

  const pages: BookPage[] = React.useMemo(() => {
    const arr: BookPage[] = [];

    // 1) Identité
    arr.push({
      id: "identity",
      category: "identity",
      shortTitle: "Présentation",
      title: s.meta.title,
      subtitle: s.meta.subtitle,
      content: <IdentityPage />,
    });

    // 2) Objectifs + Compétences
    arr.push({
      id: "objectives",
      category: "objectives",
      shortTitle: "Objectifs & compétences",
      title: "Objectifs pédagogiques & compétences visées",
      content: <ObjectivesPage />,
    });

    // 3) Architecture pédagogique (sans « recommandée » ni « (LMS) »)
    arr.push({
      id: "architecture",
      category: "architecture",
      shortTitle: "Architecture",
      title: "Architecture pédagogique",
      content: <ArchitecturePage />,
    });

    // 4..N) Modules du parcours : un par page, avec leur évaluation
    s.modules.forEach((m) => {
      arr.push({
        id: `module-${m.id}`,
        category: "module",
        shortTitle: `Module ${m.num} — ${m.displayTitle}`,
        title: m.title,
        subtitle: m.displayTitle,
        content: <ModulePage module={m} />,
      });
    });

    // N+1) Quiz sommatif
    arr.push({
      id: "quiz-sommatif",
      category: "quiz",
      shortTitle: "Quiz sommatif",
      title: "Quiz sommatif du séminaire",
      subtitle: `${sumQuiz.questions.length} questions à valider`,
      content: <QuizPage />,
    });

    // N+2) Charte
    arr.push({
      id: "charte",
      category: "charte",
      shortTitle: "Charte",
      title: "Charte d'usage responsable de l'IA",
      content: <ChartePage />,
    });

    // N+3) Évaluation + Badges + Pondération
    arr.push({
      id: "evaluation",
      category: "evaluation",
      shortTitle: "Évaluation",
      title: "Grille d'évaluation, badges & pondération",
      content: <EvaluationPage />,
    });

    // N+4) Glossaire + 10 repères
    arr.push({
      id: "glossary",
      category: "glossary",
      shortTitle: "Glossaire & repères",
      title: "Glossaire et 10 repères d'un usage responsable",
      content: <GlossaryPage />,
    });

    // N+5) Clôture
    arr.push({
      id: "closing",
      category: "closing",
      shortTitle: "Clôture",
      title: "Message de clôture",
      content: <ClosingPage />,
    });

    return arr;
    // Tous les sous-composants ne dépendent que de s (constante du séminaire).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sumQuiz]);

  /* ----- Sous-composants des pages (closures sur s) ----- */
  function IdentityPage() {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-ew-green-200 bg-ew-green-50/30 p-5">
          <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
            <ScrollText aria-hidden className="h-4 w-4" /> Séminaire des écoles
            catholiques
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <strong>Référence :</strong> {s.meta.reference}
            {s.meta.referenceDate ? ` (${s.meta.referenceDate})` : null} ·{" "}
            <strong>Format :</strong> {s.meta.courseType}
            {s.meta.format ? ` / ${s.meta.format}` : null}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            icon={<Clock className="h-4 w-4" />}
            label="Durée totale"
            value={s.meta.duration}
          />
          <KpiTile
            icon={<Users className="h-4 w-4" />}
            label="Public"
            value={shorten(s.meta.audience, 80)}
          />
          <KpiTile
            icon={<GraduationCap className="h-4 w-4" />}
            label="Niveau"
            value={s.meta.level}
          />
          <KpiTile
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Complétion"
            value={shorten(s.meta.completion, 80)}
          />
        </div>

        <div className="space-y-3 text-base leading-relaxed text-foreground/90">
          {s.meta.presentation.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    );
  }

  function ObjectivesPage() {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
            <Target aria-hidden className="h-4 w-4" /> Objectifs pédagogiques
          </p>
          <ol className="mt-3 space-y-2 text-base">
            {s.objectives.map((o, i) => (
              <li key={i} className="flex gap-2">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ew-green-700 text-xs font-bold text-white"
                >
                  {i + 1}
                </span>
                <span>{o}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
            <Sparkles aria-hidden className="h-4 w-4" /> Compétences visées
          </p>
          <div className="mt-3 space-y-3 text-base">
            {s.competences.map((c) => (
              <div key={c.category}>
                <p className="text-sm font-bold text-foreground">
                  {c.category}
                </p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {c.items.map((it, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span
                        aria-hidden
                        className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-600"
                      />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ArchitecturePage() {
    return (
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-base">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-bold">Section</th>
              <th className="px-3 py-2 text-left font-bold">Contenu</th>
              <th className="px-3 py-2 text-left font-bold">Activité</th>
              <th className="px-3 py-2 text-left font-bold">Évaluation</th>
            </tr>
          </thead>
          <tbody>
            {s.architecture.map((row, i) => (
              <tr key={i} className="border-t border-border align-top">
                <td className="px-3 py-2 font-bold text-ew-green-800">
                  {row.section}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {row.contentType}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {row.activity}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {row.evaluation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function ModulePage({ module: m }: { module: (typeof s.modules)[number] }) {
    return <GatedModulePage module={m} />;
  }

  function QuizPage() {
    return <SummativeQuizPage quiz={sumQuiz} />;
  }

  function ChartePage() {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-base">
        <p className="text-justify leading-relaxed text-foreground/90">
          {s.charte.preambule}
        </p>
        <ol className="mt-5 space-y-3">
          {s.charte.engagements.map((e) => (
            <li
              key={e.num}
              className="rounded-xl border border-ew-green-200 bg-ew-green-50/40 p-3"
            >
              <p className="font-display text-base font-bold text-ew-green-800">
                {e.num}. {e.title}
              </p>
              <p className="mt-1">{e.description}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm font-bold uppercase tracking-wide text-ew-green-700">
          Mise en œuvre
        </p>
        <ul className="mt-1 space-y-1 text-sm">
          {s.charte.implementation.map((it, i) => (
            <li key={i} className="flex gap-1.5">
              <span
                aria-hidden
                className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700"
              />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function EvaluationPage() {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
            <Award aria-hidden className="h-4 w-4" /> Grille d&apos;évaluation
          </p>
          <table className="mt-3 w-full text-base">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 text-left font-bold">Critère</th>
                <th className="px-2 py-1.5 text-right font-bold">Points</th>
              </tr>
            </thead>
            <tbody>
              {s.evaluation.criteria.map((c, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-2 py-1.5">{c.criterion}</td>
                  <td className="px-2 py-1.5 text-right font-bold text-ew-green-800">
                    {c.points}
                  </td>
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
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-ew-green-700">
            Niveaux
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {s.evaluation.levels.map((lv, i) => (
              <li key={i} className="flex gap-2">
                <span className="rounded bg-ew-green-700 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                  {lv.range}
                </span>
                <span>{lv.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
              <Award aria-hidden className="h-4 w-4" /> Badges numériques
            </p>
            <ul className="mt-3 space-y-2 text-base">
              {s.badges.map((b) => (
                <li
                  key={b.num}
                  className="rounded-lg border border-ew-gold-200 bg-ew-gold-50/40 p-3"
                >
                  <p className="font-display font-bold text-ew-gold-700">
                    {b.num}. {b.title}
                  </p>
                  <p className="mt-0.5 text-sm">{b.condition}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
              Pondération évaluation globale
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {s.achievement.weights.map((w) => (
                <li
                  key={w.element}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <span>{w.element}</span>
                  <span className="font-bold text-ew-green-800">
                    {w.weight}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  function GlossaryPage() {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
            <BookMarked aria-hidden className="h-4 w-4" /> Glossaire
          </p>
          <dl className="mt-3 space-y-3 text-base">
            {s.glossary.map((g) => (
              <div key={g.term} className="border-l-2 border-ew-green-300 pl-3">
                <dt className="font-bold text-ew-green-800">{g.term}</dt>
                <dd className="text-sm text-muted-foreground">
                  {g.definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
            <Sparkles aria-hidden className="h-4 w-4" /> Les 10 repères
            d&apos;un usage responsable
          </p>
          <ol className="mt-3 space-y-2 text-base">
            {s.references10.map((r) => (
              <li key={r.num} className="flex gap-2">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ew-green-700 text-xs font-bold text-white"
                >
                  {r.num}
                </span>
                <span>{r.text}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm font-bold uppercase tracking-wide text-ew-green-700">
            Cinq verbes pour rester humains
          </p>
          <ul className="mt-1 space-y-1 text-base">
            {s.synthese.map((v) => (
              <li key={v.num} className="flex gap-2">
                <span className="font-bold text-ew-green-800">{v.verb} :</span>
                <span>{v.description}</span>
              </li>
            ))}
          </ul>
        </div>
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
    <CourseGate courseId="magnifica-humanitas">
      <MagnificaPageShell pages={pages} />
    </CourseGate>
  );
}

/* ============================================================================
   Coque principale : barre d'actions conditionnée par la réussite + livre.
   ========================================================================== */
function MagnificaPageShell({ pages }: { pages: BookPage[] }) {
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

  // Conditions :
  //  - Livret PDF + Certificat → débloqués si admin OU cours achevé
  //  - Word (.docx) → réservé aux administrateurs (toujours)
  const canPrintLivret = isAdmin || verdict.completed;
  const canDeliverCertificate = isAdmin || verdict.completed;
  const canDownloadWord = isAdmin;

  const lockedTip =
    verdict.reason ?? `Achevez la formation pour débloquer ce livrable.`;

  return (
    <div className="space-y-5">
      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/aide">
            <ArrowLeft className="h-4 w-4" /> Bibliothèque
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {verdict.completed ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-ew-green-300 bg-ew-green-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ew-green-800">
              <CheckCircle2 aria-hidden className="h-3 w-3" /> Formation achevée
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-ew-gold-200 bg-ew-gold-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ew-gold-700"
              title={lockedTip}
            >
              <Lock aria-hidden className="h-3 w-3" /> Formation en cours
            </span>
          )}
          {canPrintLivret ? (
            <Button size="sm" variant="outline" asChild>
              <Link href="/aide/seminaire/magnifica-humanitas/livret">
                <Printer className="h-4 w-4" /> Livret imprimable
              </Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled title={lockedTip}>
              <Lock className="h-4 w-4" /> Livret imprimable
            </Button>
          )}
          {canDownloadWord ? (
            <Button size="sm" variant="outline" asChild>
              <a href="/api/docx/seminaire/magnifica-humanitas">
                <FileDown className="h-4 w-4" /> Télécharger Word (.docx)
              </a>
            </Button>
          ) : null}
          {canDeliverCertificate ? (
            <Button size="sm" asChild>
              <Link href="/aide/certificat?course=magnifica-humanitas">
                <Award className="h-4 w-4" /> Délivrer un certificat
              </Link>
            </Button>
          ) : (
            <Button size="sm" disabled title={lockedTip}>
              <Lock className="h-4 w-4" /> Délivrer un certificat
            </Button>
          )}
        </div>
      </div>

      {/* Indicateur de progression si pas encore achevé (non-admin uniquement) */}
      {!isAdmin && !verdict.completed && verdict.progress.total > 0 ? (
        <div className="rounded-xl border border-ew-gold-200 bg-ew-gold-50/60 px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-ew-gold-700">
              <Lock aria-hidden className="h-4 w-4" />
              <strong>{lockedTip}</strong>
            </p>
            <p className="text-xs font-mono font-bold text-ew-gold-700">
              {verdict.progress.completed}/{verdict.progress.total} modules
            </p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-card">
            <div
              className="h-full bg-ew-gold-500 transition-all duration-300"
              style={{ width: `${Math.round(verdict.progress.ratio * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      <MagnificaBook pages={pages} />
    </div>
  );
}

/* -------- Helpers locaux -------- */
function KpiTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function shorten(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

/* ============================================================================
   Page de module avec garde d'accès (prérequis) et bouton de complétion.
   - Vérifie la règle d'accès configurée pour ce module dans le cours.
   - Si bloqué : écran de verrou listant les prérequis non encore terminés.
   - Si accessible : ModuleBody + barre de complétion en bas, dépendante du
     mode (manuel / auto / quiz).
   ========================================================================== */
function GatedModulePage({
  module: m,
}: {
  module: (typeof MAGNIFICA_HUMANITAS.modules)[number];
}) {
  const app = useApp();
  const store = useStore();
  const courseId = MAGNIFICA_HUMANITAS.meta.slug;
  const isAdmin = app.effectiveRole === "admin";

  const verdict = checkModuleAccess(
    app.user.id,
    isAdmin,
    courseId,
    m.id,
    store.moduleAccessRules,
    store.moduleCompletions,
  );
  const rule = getAccessRule(courseId, m.id, store.moduleAccessRules);
  const completed = isModuleCompleted(
    app.user.id,
    courseId,
    m.id,
    store.moduleCompletions,
  );
  const completion = getModuleCompletion(
    app.user.id,
    courseId,
    m.id,
    store.moduleCompletions,
  );

  // Mode `auto` : marquer comme complété au premier rendu accessible.
  React.useEffect(() => {
    if (!verdict.accessible || isAdmin) return;
    if (rule.completionMode !== "auto") return;
    if (completed) return;
    store.markModuleCompleted({
      userId: app.user.id,
      courseId,
      moduleId: m.id,
      source: "auto",
    });
  }, [
    verdict.accessible,
    isAdmin,
    rule.completionMode,
    completed,
    app.user.id,
    courseId,
    m.id,
    store,
  ]);

  if (!verdict.accessible) {
    return (
      <LockedModuleView module={m} missingIds={verdict.missingPrerequisites} />
    );
  }

  function toggleCompletion() {
    if (completed) {
      store.unmarkModuleCompleted(app.user.id, courseId, m.id);
    } else {
      store.markModuleCompleted({
        userId: app.user.id,
        courseId,
        moduleId: m.id,
        source: "manual",
      });
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-1">
        <ModuleBody module={m} courseId={courseId} />
      </div>
      <CompletionBar
        completed={completed}
        completedAt={completion?.completedAt}
        mode={rule.completionMode}
        minQuizScore={rule.minQuizScore ?? 70}
        isAdmin={isAdmin}
        onToggle={toggleCompletion}
      />
    </div>
  );
}

function CompletionBar({
  completed,
  completedAt,
  mode,
  minQuizScore,
  isAdmin,
  onToggle,
}: {
  completed: boolean;
  completedAt?: string;
  mode: "manual" | "auto" | "quiz";
  minQuizScore: number;
  isAdmin: boolean;
  onToggle: () => void;
}) {
  const date = completedAt
    ? new Date(completedAt).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4",
        completed
          ? "border-ew-green-300 bg-ew-green-50/60"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            completed
              ? "bg-ew-green-700 text-white"
              : "bg-ew-gold-100 text-ew-gold-700",
          )}
        >
          <CheckCircle2 aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-sm font-bold text-foreground">
            {completed ? "Module terminé" : "Validation de la complétion"}
          </p>
          <p className="text-xs text-muted-foreground">
            {completed ? (
              <>
                Marqué comme terminé{date ? ` le ${date}` : ""}. Les modules
                suivants qui dépendaient de celui-ci sont désormais accessibles.
              </>
            ) : mode === "manual" ? (
              <>
                Lorsque vous estimez avoir terminé ce module, cliquez sur
                «&nbsp;Marquer comme terminé&nbsp;» pour débloquer les modules
                qui en dépendent.
              </>
            ) : mode === "auto" ? (
              <>
                Ce module est marqué comme terminé automatiquement à la lecture.
              </>
            ) : (
              <>
                Pour valider ce module, atteignez un score d&apos;au moins{" "}
                <strong>{minQuizScore}%</strong> à son quiz. Vous pouvez aussi
                le marquer comme terminé manuellement après vérification.
              </>
            )}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant={completed ? "outline" : "default"}
        onClick={onToggle}
        disabled={!isAdmin && completed && mode === "auto"}
      >
        {completed ? (
          <>
            <RotateCcw className="h-4 w-4" /> Marquer comme non terminé
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" /> Marquer comme terminé
          </>
        )}
      </Button>
    </div>
  );
}

function LockedModuleView({
  module: m,
  missingIds,
}: {
  module: (typeof MAGNIFICA_HUMANITAS.modules)[number];
  missingIds: string[];
}) {
  const missingModules = MAGNIFICA_HUMANITAS.modules.filter((other) =>
    missingIds.includes(other.id),
  );
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-700">
        <Lock aria-hidden className="h-7 w-7" />
      </span>
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">
          Module verrouillé
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          L&apos;accès au <strong>Module {m.num}</strong> nécessite que vous
          ayez d&apos;abord terminé le(s) module(s) suivant(s) :
        </p>
      </div>
      <ul className="w-full space-y-2 text-left">
        {missingModules.map((mm) => (
          <li
            key={mm.id}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
          >
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ew-gold-100 text-ew-gold-700"
            >
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display font-bold text-foreground">
                {mm.title}
              </p>
              <p className="text-xs italic text-muted-foreground">
                {mm.displayTitle}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs italic text-muted-foreground">
        Revenez aux pages des prérequis avec ← ou via le sommaire au pied du
        livre, terminez-les, puis ce module sera automatiquement déverrouillé.
      </p>
    </div>
  );
}

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ============================================================================
   Page quiz sommatif — branche la réussite si la règle l'exige.
   ========================================================================== */
function SummativeQuizPage({
  quiz,
}: {
  quiz: {
    id: string;
    num: number;
    title: string;
    questions: {
      question: string;
      options: string[];
      correctIdx: number;
      rationale?: string;
    }[];
  };
}) {
  const app = useApp();
  const store = useStore();
  const courseId = MAGNIFICA_HUMANITAS.meta.slug;
  const rule = getCourseCompletionRule(courseId, store.courseCompletionRules);
  const usesQuiz =
    (rule.mode === "quiz-score" || rule.mode === "all-modules-and-quiz") &&
    (rule.quizModuleId ?? SUMMATIVE_QUIZ_ID) === SUMMATIVE_QUIZ_ID;
  const minScore = rule.minQuizScore ?? 70;
  const [lastScore, setLastScore] = React.useState<number | null>(null);

  function handleScored(pct: number) {
    setLastScore(pct);
    if (!usesQuiz) return;
    if (pct < minScore) return;
    store.markCourseCompleted({
      userId: app.user.id,
      courseId,
      source: "quiz",
      score: pct,
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-ew-green-200 bg-ew-green-50/30 p-4 text-base text-foreground/90">
        <p>
          Ce <strong>quiz sommatif</strong> regroupe les questions des 3 banques
          de quiz du séminaire : compréhension générale, Doctrine sociale &amp;
          IA, risques &amp; solutions. Validez chacune et vérifiez votre score
          global.
        </p>
        {usesQuiz ? (
          <p className="mt-2 text-sm">
            <strong className="text-ew-green-800">
              Score minimum requis pour valider la formation : {minScore}%.
            </strong>
            {lastScore !== null ? (
              <span
                className={cn(
                  "ml-2",
                  lastScore >= minScore
                    ? "text-ew-green-700 font-bold"
                    : "text-ew-gold-700",
                )}
              >
                Votre dernier score : {lastScore}%{" "}
                {lastScore >= minScore
                  ? "— formation validée !"
                  : "— continuez !"}
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
      <SeminaireQuizCard
        quiz={quiz as Parameters<typeof SeminaireQuizCard>[0]["quiz"]}
        onScored={handleScored}
      />
    </div>
  );
}
