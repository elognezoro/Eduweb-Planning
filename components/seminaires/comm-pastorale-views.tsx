"use client";

import * as React from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Compass,
  Copy,
  Download,
  Eye,
  FileText,
  Layers,
  Maximize2,
  Minimize2,
  MessageSquare,
  RefreshCw,
  Sparkles,
  StickyNote,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { generateMatrixCritique } from "@/lib/seminaires/matrix-critique";
import { NarrationButton } from "@/components/seminaires/narration-button";
import { useFormationRole } from "@/components/formations/use-formation-role";
import { isFacilitatorRole } from "@/lib/formations/formation-roles";
import {
  fetchCourseMatrix,
  persistMatrixSubmission,
  persistMatrixReview,
} from "@/lib/seminaires/productions-server";
import {
  matrixSubmissionId,
  matrixReviewId,
} from "@/lib/seminaires/production-keys";
import { useReflectionSync } from "@/components/seminaires/use-reflection-sync";
import { useQuizReveal } from "@/components/seminaires/use-quiz-reveal";
import { TestTimer } from "@/components/seminaires/test-timer";
import { ReflectionFacilitatorPanel } from "@/components/seminaires/reflection-facilitator-panel";
import {
  SeminaireActivityProvider,
  useSeminaireActivityContext,
} from "@/components/seminaires/activity-context";
import type {
  CommSeminaire,
  CommSeminaireActivity,
  CommSlide,
  CommSlideBlock,
} from "@/lib/seminaires/communication-pastorale";

/* ============================================================================
   Composants pour le séminaire « Communication pastorale ».
   - Hero avec photo d'entête institutionnelle
   - KPIs + objectifs + compétences
   - Visionneuse de slides type ePub (navigation, miniatures, plein écran,
     notes formateur, clavier)
   - Activités interactives : diagnostic, QCM, scénario, matrice, check-list,
     plan d'action, réflexion personnelle
   ========================================================================== */

/* -------- HERO -------- */
export function CommHero({
  seminaire,
  rightSlot,
}: {
  seminaire: CommSeminaire;
  rightSlot?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-ew-green-200 shadow-sm">
      <div className="relative h-[260px] w-full sm:h-[320px] lg:h-[380px]">
        <Image
          src={seminaire.heroImage}
          alt={seminaire.meta.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ew-green-950/95 via-ew-green-900/55 to-ew-green-900/15" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-9 text-white">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-ew-gold-200">
            Séminaire des communicateurs · {seminaire.meta.organiser}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
            {seminaire.meta.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm italic text-ew-green-50 sm:text-base">
            {seminaire.meta.subtitle}
          </p>
        </div>
      </div>
      <div className="border-t border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile icon={<Clock className="h-4 w-4" />} label="Durée totale" value={seminaire.meta.duration} />
          <KpiTile icon={<Layers className="h-4 w-4" />} label="Slides" value={`${seminaire.slides.length} diapositives`} />
          <KpiTile icon={<Users className="h-4 w-4" />} label="Public" value={shorten(seminaire.meta.audience, 90)} />
          <KpiTile icon={<Target className="h-4 w-4" />} label="Niveau" value={seminaire.meta.level} />
        </div>
        {rightSlot ? <div className="mt-4 flex flex-wrap gap-2">{rightSlot}</div> : null}
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

/* -------- OBJECTIFS + COMPÉTENCES -------- */
export function CommObjectives({ seminaire }: { seminaire: CommSeminaire }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          <Target aria-hidden className="h-4 w-4" /> Objectifs pédagogiques
        </p>
        <ol className="mt-3 space-y-2 text-sm">
          {seminaire.objectives.map((o, i) => (
            <li key={i} className="flex gap-2">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ew-green-700 text-[11px] font-bold text-white"
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
          <Compass aria-hidden className="h-4 w-4" /> Compétences visées
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {seminaire.competences.map((c, i) => (
            <li key={i} className="flex gap-2">
              <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-600" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================================
   VISIONNEUSE DE SLIDES — style ePub
   ========================================================================== */
export function SlideDeck({ slides }: { slides: CommSlide[] }) {
  const [idx, setIdx] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [showNotes, setShowNotes] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const slide = slides[idx];

  const goPrev = React.useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const goNext = React.useCallback(
    () => setIdx((i) => Math.min(slides.length - 1, i + 1)),
    [slides.length],
  );

  // Navigation clavier : seulement quand on est en plein écran ou quand le
  // focus est à l'intérieur du conteneur (pour ne pas voler Espace/F/← → à
  // la page entière). Le conteneur est focusable via tabIndex={0}.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const focusedInside =
        containerRef.current?.contains(document.activeElement) ?? false;
      if (!fullscreen && !focusedInside) return;

      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        setIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIdx(slides.length - 1);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setFullscreen((v) => !v);
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setShowNotes((v) => !v);
      } else if (e.key === "Escape" && fullscreen) {
        setFullscreen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, slides.length, fullscreen]);

  // Swipe tactile (mobile)
  const touchStartX = React.useRef<number | null>(null);
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  }

  const progress = ((idx + 1) / slides.length) * 100;

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative",
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-ew-green-50/95 backdrop-blur"
          : "rounded-2xl border border-border bg-card",
      )}
      aria-label="Visionneuse de diapositives — feuilleter comme un livre"
    >
      {/* Barre de tête */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Layers aria-hidden className="h-4 w-4 text-ew-green-700" />
          <span className="font-mono font-bold text-ew-green-700">
            {String(idx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <span className="hidden text-muted-foreground sm:inline">— {slide?.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={showNotes ? "Masquer les notes du formateur" : "Afficher les notes du formateur"}
            aria-pressed={showNotes}
            onClick={() => setShowNotes((v) => !v)}
            className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors",
              showNotes
                ? "border-ew-green-600 bg-ew-green-100 text-ew-green-900"
                : "border-border bg-card text-muted-foreground hover:bg-muted/40",
            )}
            title="Notes du formateur (N)"
          >
            <StickyNote aria-hidden className="h-3.5 w-3.5" /> Notes
          </button>
          <button
            type="button"
            aria-label={fullscreen ? "Quitter le mode plein écran" : "Afficher en plein écran"}
            aria-pressed={fullscreen}
            onClick={() => setFullscreen((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground hover:bg-muted/40"
            title="Plein écran (F)"
          >
            {fullscreen ? (
              <Minimize2 aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 aria-hidden className="h-3.5 w-3.5" />
            )}
            {fullscreen ? "Réduire" : "Plein écran"}
          </button>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-1 w-full bg-muted/40" aria-hidden>
        <div
          className="h-full bg-ew-green-700 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide */}
      <div
        className={cn(
          // Fond crème/parchemin doux : effet « papier ancien », contraste >12:1
          // avec text-ew-green-900. Met en valeur les sous-zones colorées
          // (pillars vert, principles violet, highlight gold) et fait paraître
          // les cartes bg-card (channels, steps) comme des fiches posées dessus.
          "relative flex-1 overflow-y-auto bg-[#F6F2EA]",
          fullscreen ? "px-6 py-8 sm:px-10 sm:py-12" : "p-5 sm:p-8",
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SlideView slide={slide} />
        {showNotes && slide?.facilitatorNote ? (
          <div className="mt-6 rounded-xl border-l-4 border-ew-gold-500 bg-ew-gold-50 px-4 py-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ew-gold-700">
              <StickyNote aria-hidden className="h-3.5 w-3.5" /> Note du formateur
            </p>
            <p className="mt-1 text-sm italic text-foreground/90">{slide.facilitatorNote}</p>
          </div>
        ) : null}
      </div>

      {/* Bas : prev / next + miniatures */}
      <div className="border-t border-border bg-muted/20">
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={idx === 0}
            aria-label="Diapositive précédente"
            className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold disabled:opacity-50 hover:bg-muted/40"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" /> Précédente
          </button>
          <p className="hidden text-[10px] italic text-muted-foreground sm:block">
            Utilisez ← → pour naviguer, F pour plein écran, N pour les notes du formateur.
          </p>
          <button
            type="button"
            onClick={goNext}
            disabled={idx === slides.length - 1}
            aria-label="Diapositive suivante"
            className="flex items-center gap-1 rounded-md bg-ew-green-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Suivante <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
        {/* Miniatures (chips de navigation) */}
        <div className="border-t border-border bg-card">
          <div className="flex gap-1 overflow-x-auto px-3 py-2" role="tablist" aria-label="Sommaire des diapositives">
            {slides.map((s, i) => (
              <button
                key={s.num}
                type="button"
                role="tab"
                aria-selected={i === idx}
                aria-label={`Diapositive ${s.num} — ${s.title}`}
                onClick={() => setIdx(i)}
                className={cn(
                  "min-w-[120px] max-w-[180px] shrink-0 rounded-md border px-2 py-1.5 text-left text-[10px] transition-all",
                  i === idx
                    ? "border-ew-green-600 bg-ew-green-50 text-ew-green-900"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40",
                )}
              >
                <p className="font-mono font-bold">#{String(s.num).padStart(2, "0")}</p>
                <p className="line-clamp-2">{s.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------- Texte narratif d'une slide pour la lecture audio (TTS) -------- */
function blockNarrationText(b: CommSlideBlock): string {
  switch (b.kind) {
    case "paragraph":
    case "highlight":
      return b.text;
    case "bulletList":
    case "numberedList":
      return (b.intro ? `${b.intro}. ` : "") + b.items.join(". ");
    case "pillars":
      return b.items
        .map((it) => `${it.label}. ${it.title}. ${it.description}`)
        .join(" ");
    case "principles":
      return (
        (b.title ? `${b.title}. ` : "") +
        b.items
          .map((it) => `${it.letter}, ${it.label}. ${it.points.join(". ")}.`)
          .join(" ")
      );
    case "flow":
      return b.items.join(", puis ");
    case "channels":
      return b.items.map((c) => `${c.name} : ${c.purpose}.`).join(" ");
    case "publics":
      return b.rows
        .map(
          (r) =>
            `${r.public}. Verbes : ${r.verbs.join(", ")}. ${r.columns.join(". ")}.`,
        )
        .join(" ");
    case "steps":
      return b.items
        .map((s) => `Étape ${s.num}. ${s.label}. ${s.detail}`)
        .join(" ");
    default: {
      // Exhaustiveness check : si une nouvelle valeur est ajoutée à
      // CommSlideBlock sans cas correspondant, TypeScript signalera ici.
      const _exhaustive: never = b;
      void _exhaustive;
      return "";
    }
  }
}

function slideNarration(slide: CommSlide): string {
  const parts: string[] = [];
  parts.push(
    `Diapositive ${slide.num} : ${slide.title}.${slide.subtitle ? ` ${slide.subtitle}.` : ""}`,
  );
  slide.blocks.forEach((b) => {
    const t = blockNarrationText(b).trim();
    if (t) parts.push(t);
  });
  if (slide.footer) parts.push(slide.footer);
  return parts.join(" ");
}

/* -------- Rendu d'une slide selon son layout -------- */
function SlideView({ slide }: { slide: CommSlide | undefined }) {
  if (!slide) return null;
  const isCover = slide.layout === "cover";
  const isClosing = slide.layout === "closing";
  const narration = slideNarration(slide);

  return (
    <article
      className={cn(
        "mx-auto max-w-4xl",
        isCover && "py-6 text-center",
        isClosing && "py-6 text-center",
      )}
    >
      {isCover ? (
        <>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-ew-gold-600">
            Diapositive {String(slide.num).padStart(2, "0")}
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-ew-green-900 sm:text-3xl lg:text-4xl">
            {slide.title}
          </h2>
          {slide.subtitle ? (
            <p className="mt-2 text-sm italic text-muted-foreground sm:text-base">{slide.subtitle}</p>
          ) : null}
          <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-ew-gold-500" aria-hidden />
        </>
      ) : isClosing ? (
        <>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-ew-gold-600">
            Diapositive de clôture
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ew-green-900 sm:text-4xl">
            {slide.title}
          </h2>
          {slide.subtitle ? (
            <p className="mt-1 italic text-muted-foreground">{slide.subtitle}</p>
          ) : null}
          <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-ew-gold-500" aria-hidden />
        </>
      ) : (
        <header>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ew-green-700">
              Diapositive {String(slide.num).padStart(2, "0")}
            </p>
            <NarrationButton
              key={`slide-${slide.num}`}
              text={narration}
              label="Écouter la diapositive"
            />
          </div>
          <h2 className="mt-1 font-display text-xl font-extrabold leading-tight text-ew-green-900 sm:text-2xl lg:text-3xl">
            {slide.title}
          </h2>
          {slide.subtitle ? (
            <p className="mt-1 text-sm italic text-muted-foreground">{slide.subtitle}</p>
          ) : null}
        </header>
      )}

      <div className={cn("mt-5 space-y-4", isCover && "mt-8")}>
        {slide.blocks.map((b, i) => (
          <SlideBlockView key={i} block={b} />
        ))}
      </div>

      {slide.footer ? (
        <p className="mt-6 rounded-lg border-l-4 border-ew-gold-500 bg-ew-gold-50 px-3 py-2 text-sm italic text-foreground/90">
          {slide.footer}
        </p>
      ) : null}
    </article>
  );
}

function SlideBlockView({ block: b }: { block: CommSlideBlock }) {
  switch (b.kind) {
    case "paragraph":
      return (
        <p
          className={cn(
            "leading-relaxed",
            b.tone === "lead" && "text-base font-medium text-foreground",
            b.tone === "muted" && "text-sm italic text-muted-foreground",
            !b.tone && "text-sm",
          )}
        >
          {b.text}
        </p>
      );
    case "highlight":
      return (
        <p
          className={cn(
            "rounded-xl border-l-4 px-3 py-2 text-sm font-medium",
            b.tone === "info" && "border-ew-blue bg-ew-blue/10",
            b.tone === "pastoral" && "border-ew-purple-500 bg-ew-purple-50",
            b.tone === "warning" && "border-ew-gold-500 bg-ew-gold-50",
            b.tone === "success" && "border-ew-green-500 bg-ew-green-50",
            !b.tone && "border-ew-green-500 bg-ew-green-50",
          )}
        >
          {b.text}
        </p>
      );
    case "bulletList":
      return (
        <div>
          {b.intro ? <p className="mb-1 italic text-muted-foreground">{b.intro}</p> : null}
          <ul className="space-y-1.5 text-sm">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
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
          <ol className="space-y-1.5 text-sm">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-ew-green-700">{i + 1}.</span>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "pillars":
      return (
        <div
          className={cn(
            "grid gap-3",
            b.align === "horizontal" && "grid-cols-1 sm:grid-cols-3",
            b.align !== "horizontal" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {b.items.map((it, i) => (
            <div
              key={i}
              className="rounded-xl border border-ew-green-200 bg-ew-green-50/50 p-3 text-sm shadow-sm"
            >
              <p className="font-display text-[10px] font-bold uppercase tracking-wide text-ew-green-700">
                {it.label}
              </p>
              <p className="mt-1 font-display text-sm font-bold text-ew-green-900">{it.title}</p>
              <p className="mt-1 text-xs text-foreground/80">{it.description}</p>
            </div>
          ))}
        </div>
      );
    case "principles":
      return (
        <div>
          {b.title ? (
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">
              {b.title}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {b.items.map((it, i) => (
              <div
                key={i}
                className="rounded-xl border border-ew-purple-200 bg-ew-purple-50 p-3 text-sm shadow-sm"
              >
                <p
                  className="font-display text-3xl font-extrabold text-ew-purple-700"
                  aria-hidden
                >
                  {it.letter}
                </p>
                <p className="font-display text-sm font-bold text-ew-purple-700">{it.label}</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  {it.points.map((p, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span aria-hidden className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-purple-500" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    case "flow":
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {b.items.map((it, i) => (
            <React.Fragment key={i}>
              <span className="rounded-full border border-ew-green-300 bg-ew-green-50 px-3 py-1 font-medium text-ew-green-900">
                {it}
              </span>
              {i < b.items.length - 1 ? (
                <ArrowRight aria-hidden className="h-3.5 w-3.5 text-ew-gold-600" />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      );
    case "channels":
      return (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {b.items.map((c, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
              <p className="font-display font-bold text-ew-green-800">{c.name}</p>
              <p className="text-xs italic text-muted-foreground">{c.purpose}</p>
            </div>
          ))}
        </div>
      );
    case "publics":
      return (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-ew-green-50 text-ew-green-800">
              <tr>
                {b.headers.map((h, i) => (
                  <th key={i} className="border-b border-border px-2 py-1.5 text-left font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-border align-top">
                  <td className="px-2 py-1.5 font-bold text-ew-green-800">{r.public}</td>
                  <td className="px-2 py-1.5">
                    <div className="flex flex-wrap gap-1">
                      {r.verbs.map((v, j) => (
                        <span
                          key={j}
                          className="rounded-full border border-ew-gold-200 bg-ew-gold-50 px-1.5 text-[10px] font-bold text-ew-gold-700"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </td>
                  {r.columns.map((cell, j) => (
                    <td key={j} className="px-2 py-1.5 text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "steps":
      return (
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {b.items.map((s) => (
            <li
              key={s.num}
              className="rounded-xl border border-ew-green-200 bg-card p-3 text-sm shadow-sm"
            >
              <p
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ew-green-700 text-sm font-bold text-white"
              >
                {s.num}
              </p>
              <p className="mt-2 font-display font-bold text-ew-green-900">{s.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
            </li>
          ))}
        </ol>
      );
  }
}

/* ============================================================================
   ACTIVITÉS
   ========================================================================== */
export function ActivityList({
  activities,
  courseId,
  moduleId = "ateliers",
}: {
  activities: CommSeminaireActivity[];
  /** Cours du séminaire — fournit le contexte aux activités pour la persistance
   *  Supabase (QCM, correction IA, engagement). Sans lui, ces productions ne se
   *  sauvegardent pas. */
  courseId?: string;
  moduleId?: string;
}) {
  // Accordéon exclusif : un seul atelier ouvert à la fois. Le précédent se
  // ferme automatiquement quand l'apprenant en ouvre un autre.
  const [openId, setOpenId] = React.useState<string | null>(null);
  const list = (
    <div className="space-y-3">
      {activities.map((a) => (
        <ActivityCard
          key={a.id}
          activity={a}
          isOpen={openId === a.id}
          onToggle={() => setOpenId((cur) => (cur === a.id ? null : a.id))}
        />
      ))}
    </div>
  );
  return courseId ? (
    <SeminaireActivityProvider value={{ courseId, moduleId }}>
      {list}
    </SeminaireActivityProvider>
  ) : (
    list
  );
}

function ActivityCard({
  activity: a,
  isOpen,
  onToggle,
}: {
  activity: CommSeminaireActivity;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const open = isOpen;
  const buttonId = `cp-${a.id}-btn`;
  const panelId = `cp-${a.id}-panel`;
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/20"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="rounded-md bg-ew-purple-500 px-2 py-0.5 font-mono text-[11px] font-bold text-white"
          >
            {a.num}
          </span>
          <p className="font-display font-bold">{a.title}</p>
        </div>
        <ChevronRight
          aria-hidden
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-90")}
        />
      </button>
      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open} className="border-t border-border p-5 text-sm">
        {a.recommendation ? (
          <p className="mb-2 text-xs italic text-muted-foreground">
            <strong>Modalité :</strong> {a.recommendation}
          </p>
        ) : null}
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            {a.instructions.map((ins, i) => (
              <p key={i}>{ins}</p>
            ))}
          </div>
          <NarrationButton
            key={`act-${a.id}`}
            text={`Atelier ${a.num}. ${a.title}. Consignes. ${a.instructions
              .map((s) => s.replace(/[.!?]+$/, ""))
              .join(". ")}.`}
            label="Écouter la consigne"
          />
        </div>

        {a.kind === "qcm" || a.kind === "scenario" ? (
          a.qcm ? (
            <InteractiveQcm
              questions={a.qcm}
              idPrefix={a.id}
              scenario={
                a.kind === "scenario"
                  ? { title: a.title, context: a.instructions }
                  : undefined
              }
            />
          ) : null
        ) : null}

        {a.kind === "diagnostic" && a.items ? (
          <DiagnosticChecklist items={a.items} idPrefix={a.id} />
        ) : null}

        {a.kind === "checklist" && a.items ? (
          <RapidChecklist items={a.items} idPrefix={a.id} />
        ) : null}

        {a.kind === "reflection" && a.items ? (
          <ReflectionFields items={a.items} idPrefix={a.id} />
        ) : null}

        {(a.kind === "matrix" || a.kind === "plan") && a.tableHeaders && a.tableRows ? (
          <FillableMatrix
            headers={a.tableHeaders}
            rowLabels={a.tableRows}
            idPrefix={a.id}
          />
        ) : null}

        {a.kind === "ai-correction" && a.aiChallenge ? (
          <AiCorrectionChallenge challenge={a.aiChallenge} idPrefix={a.id} />
        ) : null}

        {a.deliverable ? (
          <p className="mt-3 rounded-md border-l-4 border-ew-green-500 bg-ew-green-50 px-3 py-2 text-xs">
            <strong>Livrable :</strong> {a.deliverable}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/* -------- QCM auto-corrigé -------- */
function InteractiveQcm({
  questions,
  idPrefix,
  scenario,
}: {
  questions: { question: string; options: string[]; correctIdx: number; rationale?: string }[];
  idPrefix: string;
  scenario?: { title: string; context: string[] };
}) {
  const [answers, setAnswers] = React.useState<Record<number, number | null>>({});
  const reveal = useQuizReveal(questions.length);
  const [resetCount, setResetCount] = React.useState(0);
  const helpId = `${idPrefix}-help`;
  const answered = Object.keys(answers).length;
  const score = React.useMemo(
    () => questions.reduce((acc, q, i) => (answers[i] === q.correctIdx ? acc + 1 : acc), 0),
    [answers, questions],
  );

  // Persistance Supabase (production privée, migration 032) : ré-hydratation des
  // réponses + sauvegarde différée ; le formateur voit les résultats des
  // participants. Couvre aussi le scénario de crise (dérivé des mêmes réponses).
  const refl = useReflectionSync<{
    answers: Record<number, number | null>;
    checked: boolean;
  }>(idPrefix, "qcm");
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (hydrated.current || !refl.loaded) return;
    hydrated.current = true;
    if (refl.own) {
      setAnswers(refl.own.answers ?? {});
      if (refl.own.checked) reveal.revealAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refl.loaded, refl.own]);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // N'enregistre QUE sur action utilisateur réelle — jamais sur l'hydratation
  // (sinon une production validée serait momentanément réécrite en checked:false).
  const userInteracted = React.useRef(false);
  React.useEffect(() => {
    if (!userInteracted.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const snapshot = { answers, checked: reveal.allRevealed };
    saveTimer.current = setTimeout(() => refl.save(snapshot), 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [answers, reveal.allRevealed, refl.save]);

  const restart = () => {
    // Action utilisateur → l'effet de sauvegarde persiste l'état VIDE (answers:{},
    // checked:false), purgeant la production serveur : la tentative précédente ne
    // ressuscite plus (ni côté apprenant, ni dans le panneau formateur).
    userInteracted.current = true;
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
            <p className="text-sm font-bold" id={`${idPrefix}-q${i}`}>
              Q{i + 1}. {q.question}
            </p>
            <div className="mt-2 space-y-1" role="radiogroup" aria-labelledby={`${idPrefix}-q${i}`}>
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
                    )}
                  >
                    <input
                      type="radio"
                      name={`${idPrefix}-q${i}`}
                      checked={isPicked}
                      onChange={() => {
                        userInteracted.current = true;
                        setAnswers((a) => ({ ...a, [i]: j }));
                      }}
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
            {/* Vérification IMMÉDIATE de cette question (la justification sert de feedback). */}
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
                  onClick={() => {
                    userInteracted.current = true;
                    reveal.revealOne(i);
                  }}
                  disabled={answers[i] == null}
                  className="rounded-md border border-ew-green-400 bg-ew-green-50 px-2.5 py-1 text-xs font-bold text-ew-green-800 hover:bg-ew-green-100 disabled:opacity-40"
                  title={answers[i] == null ? "Choisissez une réponse pour vérifier." : "Vérifier cette question"}
                >
                  Vérifier
                </button>
              ) : null}
            </div>
            {shown && q.rationale ? (
              <p className="mt-1.5 rounded-md bg-muted/40 px-2 py-1 text-[11px] italic">
                {q.rationale}
              </p>
            ) : null}
          </div>
        );
      })}
      <div className="flex items-center justify-between">
        <p id={helpId} className="text-xs text-muted-foreground">
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
            className="rounded-md border border-border bg-card px-3 py-1 text-xs font-bold hover:bg-muted/40"
          >
            Recommencer
          </button>
        ) : (
          <button
            onClick={() => {
              userInteracted.current = true;
              reveal.revealAll();
            }}
            disabled={answered < questions.length}
            aria-describedby={helpId}
            title={answered < questions.length ? "Répondez à toutes les questions pour tout vérifier." : undefined}
            className="rounded-md bg-ew-green-700 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
          >
            Tout vérifier
          </button>
        )}
      </div>

      {/* Justification cohérente du score : apparaît après vérification.
          Présente un niveau d'appréciation, une explication, les thèmes
          maîtrisés et ceux à consolider, et une recommandation personnalisée. */}
      {reveal.allRevealed ? (
        <QuizJustification
          questions={questions}
          answers={answers}
          score={score}
          total={questions.length}
        />
      ) : null}

      {/* Compte-rendu de gestion de crise — généré uniquement pour les
          activités de type scénario. Reprend le contexte, les décisions de
          l'utilisateur, l'écart avec la conduite professionnelle attendue,
          le bilan chiffré et les enseignements. Copiable et téléchargeable
          pour archivage dans la mémoire institutionnelle. */}
      {reveal.allRevealed && scenario ? (
        <ScenarioReport
          title={scenario.title}
          context={scenario.context}
          questions={questions}
          answers={answers}
          score={score}
          idPrefix={idPrefix}
        />
      ) : null}

      {refl.canReview ? (
        <ReflectionFacilitatorPanel<{
          answers: Record<number, number | null>;
          checked: boolean;
        }>
          title="QCM"
          others={refl.others}
          onRefresh={refl.refresh}
          render={(p) => {
            const s = questions.reduce(
              (acc, q, i) => (p.answers?.[i] === q.correctIdx ? acc + 1 : acc),
              0,
            );
            const ans = Object.keys(p.answers ?? {}).length;
            return (
              <p>
                Score : <strong>{s}/{questions.length}</strong> · {ans} réponse
                {ans > 1 ? "s" : ""} {p.checked ? "(validé)" : "(en cours)"}
              </p>
            );
          }}
        />
      ) : null}
    </div>
  );
}

function QuizJustification({
  questions,
  answers,
  score,
  total,
}: {
  questions: { question: string; options: string[]; correctIdx: number; rationale?: string }[];
  answers: Record<number, number | null>;
  score: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const level = appreciationLevel(pct);
  const masteredIdx = questions.map((_, i) => i).filter((i) => answers[i] === questions[i].correctIdx);
  const toConsolidateIdx = questions.map((_, i) => i).filter((i) => answers[i] !== questions[i].correctIdx);

  const shortify = (s: string) => (s.length > 95 ? s.slice(0, 92).trimEnd() + "…" : s);

  return (
    <div className="rounded-2xl border border-ew-purple-200 bg-ew-purple-50/60 p-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-purple-700">
          <Sparkles aria-hidden className="h-4 w-4" /> Justification de votre score
        </p>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
            level.tone === "excellent" && "bg-ew-green-100 text-ew-green-800",
            level.tone === "good" && "bg-ew-green-50 text-ew-green-800",
            level.tone === "ok" && "bg-ew-gold-50 text-ew-gold-700",
            level.tone === "weak" && "bg-ew-gold-100 text-ew-gold-700",
            level.tone === "redo" && "bg-red-100 text-red-700",
          )}
        >
          {level.title}
        </span>
      </div>

      <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
        <p>
          <strong className="text-ew-purple-700">Votre score :</strong>{" "}
          <strong className="text-ew-green-800">{score}/{total}</strong> ({pct}%). {level.explanation}
        </p>

        {masteredIdx.length > 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
              Thèmes maîtrisés ({masteredIdx.length})
            </p>
            <ul className="mt-1 space-y-1">
              {masteredIdx.map((i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-600" />
                  <span>
                    <strong>Q{i + 1}.</strong> {shortify(questions[i].question)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {toConsolidateIdx.length > 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ew-gold-700">
              Thèmes à consolider ({toConsolidateIdx.length})
            </p>
            <ul className="mt-1 space-y-1.5">
              {toConsolidateIdx.map((i) => {
                const q = questions[i];
                const correct = q.options[q.correctIdx];
                return (
                  <li key={i} className="rounded-md border-l-2 border-ew-gold-400 bg-card/80 px-2 py-1.5">
                    <p className="flex items-start gap-2 text-sm">
                      <XCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <span>
                        <strong>Q{i + 1}.</strong> {shortify(q.question)}
                      </span>
                    </p>
                    <p className="mt-0.5 pl-6 text-[12px] italic text-muted-foreground">
                      Réponse attendue : <strong className="not-italic text-ew-green-800">{correct}</strong>
                      {q.rationale ? ` — ${q.rationale}` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <p className="rounded-md border-l-4 border-ew-purple-500 bg-card px-3 py-2 text-sm">
          <strong className="text-ew-purple-700">Recommandation :</strong> {level.recommendation}
        </p>
      </div>
    </div>
  );
}

interface AppreciationLevel {
  title: string;
  tone: "excellent" | "good" | "ok" | "weak" | "redo";
  explanation: string;
  recommendation: string;
}

function appreciationLevel(pct: number): AppreciationLevel {
  if (pct >= 87.5) {
    return {
      title: "Excellent",
      tone: "excellent",
      explanation:
        "Vous démontrez une excellente maîtrise des repères structurants de la communication éducative et pastorale : présence cohérente, méthode RAPIDE, règle des 4V appliquée à l'IA.",
      recommendation:
        "Capitalisez : transformez ces acquis en charte d'équipe, partagez-les en formation auprès de vos collègues et appliquez-les systématiquement à chaque publication.",
    };
  }
  if (pct >= 62.5) {
    return {
      title: "Très bon",
      tone: "good",
      explanation:
        "Vous avez intégré la majorité des principes-clés. Quelques notions méritent encore d'être consolidées pour gagner en réflexe professionnel.",
      recommendation:
        "Revisez les questions manquées en revenant à la diapositive correspondante. Ancrez ces notions par une mise en situation concrète dans votre établissement.",
    };
  }
  if (pct >= 50) {
    return {
      title: "Satisfaisant",
      tone: "ok",
      explanation:
        "Vous avez saisi les grandes lignes, mais certaines règles fondamentales (RAPIDE, 4V, gestion de crise) restent à approfondir.",
      recommendation:
        "Reprenez les diapositives liées aux thèmes à consolider, échangez avec un pair de référence sur ces points, puis refaites le quiz dans la semaine.",
    };
  }
  if (pct >= 25) {
    return {
      title: "À consolider",
      tone: "weak",
      explanation:
        "Les fondamentaux méritent d'être revisités. Plusieurs principes structurants de la formation n'ont pas encore été identifiés correctement.",
      recommendation:
        "Reprenez la présentation contextuelle dans son intégralité, puis travaillez les notions une à une avec les ateliers correspondants. Refaites ensuite ce quiz.",
    };
  }
  return {
    title: "À reprendre",
    tone: "redo",
    explanation:
      "Les principes clés de la formation n'ont pas encore été assimilés. C'est normal pour une première lecture — il est important de prendre le temps de revisiter les bases.",
    recommendation:
      "Reprenez la formation depuis la présentation, n'hésitez pas à mobiliser un formateur ou un pair pour clarifier chaque notion, puis refaites ce quiz à tête reposée.",
  };
}

/* -------- Compte-rendu de gestion de crise (à archiver) -------- */
function ScenarioReport({
  title,
  context,
  questions,
  answers,
  score,
  idPrefix,
}: {
  title: string;
  context: string[];
  questions: { question: string; options: string[]; correctIdx: number; rationale?: string }[];
  answers: Record<number, number | null>;
  score: number;
  idPrefix: string;
}) {
  const app = useApp();
  const total = questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const level = appreciationLevel(pct);
  const [copied, setCopied] = React.useState(false);

  // Date du compte-rendu — calculée à la volée. Cette branche n'est rendue
  // qu'après un clic utilisateur (checked === true) donc pas de problème
  // d'hydratation SSR.
  const reportDate = React.useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  const decisions = questions.map((q, i) => {
    const picked = answers[i];
    const pickedText = picked != null ? q.options[picked] : "(aucune décision)";
    const conform = picked === q.correctIdx;
    const expected = q.options[q.correctIdx];
    return {
      etape: i + 1,
      question: q.question,
      pickedText,
      conform,
      expected,
      rationale: q.rationale,
    };
  });

  const conformes = decisions.filter((d) => d.conform).length;
  const ecarts = decisions.filter((d) => !d.conform);

  const enseignements: string[] = [];
  if (ecarts.length === 0) {
    enseignements.push(
      "Toutes les décisions retenues sont conformes au protocole de gestion de crise. Capitalisez ce parcours comme cas-école interne.",
    );
  } else {
    enseignements.push(
      `${ecarts.length} décision${ecarts.length > 1 ? "s ont" : " a"} dévié${ecarts.length > 1 ? "" : ""} du protocole — à retravailler avant la prochaine crise réelle.`,
    );
    ecarts.forEach((e) => {
      enseignements.push(
        `Étape ${e.etape} : privilégier « ${e.expected} »${e.rationale ? ` — ${e.rationale}` : ""}.`,
      );
    });
  }
  enseignements.push(
    "Protocole à retenir : documenter, vérifier les faits, reconnaître ce qui est avéré, signer institutionnellement, publier sur le canal d'origine.",
  );

  const buildText = () => {
    const lines: string[] = [];
    lines.push(`COMPTE-RENDU DE GESTION DE CRISE`);
    lines.push(`${title}`);
    lines.push("");
    lines.push(`Date du compte-rendu : ${reportDate}`);
    lines.push(`Participant : ${app.user.displayName}`);
    lines.push(
      `Bilan : ${score}/${total} décisions conformes (${pct} %) — ${level.title}.`,
    );
    lines.push("");
    lines.push(`1. CONTEXTE`);
    context.forEach((c) => lines.push(`   ${c}`));
    lines.push("");
    lines.push(`2. DÉCISIONS PRISES`);
    decisions.forEach((d) => {
      lines.push(`   Étape ${d.etape} — ${d.question}`);
      lines.push(`      Décision retenue : ${d.pickedText}`);
      lines.push(`      Statut : ${d.conform ? "CONFORME au protocole" : "ÉCART au protocole"}`);
      if (!d.conform) {
        lines.push(`      Conduite attendue : ${d.expected}`);
      }
      if (d.rationale) {
        lines.push(`      Justification : ${d.rationale}`);
      }
    });
    lines.push("");
    lines.push(`3. ANALYSE CRITIQUE`);
    lines.push(`   ${level.explanation}`);
    lines.push(`   Recommandation : ${level.recommendation}`);
    lines.push("");
    lines.push(`4. ENSEIGNEMENTS À RETENIR`);
    enseignements.forEach((e) => lines.push(`   • ${e}`));
    lines.push("");
    lines.push(
      `Document à archiver dans la mémoire institutionnelle (cellule communication / direction).`,
    );
    return lines.join("\n");
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const downloadReport = () => {
    const text = buildText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compte-rendu-crise-${idPrefix}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-ew-purple-200 bg-card p-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-purple-700">
          <FileText aria-hidden className="h-4 w-4" /> Compte-rendu de gestion de crise — à archiver
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={copyReport}>
            <Copy aria-hidden className="mr-1.5 h-3.5 w-3.5" />
            {copied ? "Copié" : "Copier"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={downloadReport}>
            <Download aria-hidden className="mr-1.5 h-3.5 w-3.5" />
            Télécharger
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-3 text-sm leading-relaxed">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span><strong className="text-foreground">Date :</strong> {reportDate}</span>
          <span><strong className="text-foreground">Participant :</strong> {app.user.displayName}</span>
          <span>
            <strong className="text-foreground">Bilan :</strong> {conformes}/{total} décisions conformes ({pct} %) — {level.title}
          </span>
        </div>

        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-ew-purple-700">1. Contexte</p>
          {context.map((c, i) => (
            <p key={i} className="mt-1">{c}</p>
          ))}
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-ew-purple-700">2. Décisions prises</p>
          <ul className="mt-1 space-y-2">
            {decisions.map((d) => (
              <li
                key={d.etape}
                className={cn(
                  "rounded-md border-l-2 px-3 py-2",
                  d.conform ? "border-ew-green-500 bg-ew-green-50/60" : "border-red-500 bg-red-50/60",
                )}
              >
                <p className="text-sm">
                  <strong>Étape {d.etape}.</strong> {d.question}
                </p>
                <p className="mt-1 text-xs">
                  Décision retenue : <em>{d.pickedText}</em>
                </p>
                <p className={cn("mt-0.5 text-xs font-bold", d.conform ? "text-ew-green-800" : "text-red-700")}>
                  {d.conform ? "✓ Conforme au protocole" : `✗ Écart — attendu : « ${d.expected} »`}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-ew-purple-700">3. Analyse critique</p>
          <p className="mt-1">{level.explanation}</p>
          <p className="mt-1 rounded-md border-l-4 border-ew-purple-500 bg-muted/30 px-3 py-1.5">
            <strong className="text-ew-purple-700">Recommandation :</strong> {level.recommendation}
          </p>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-ew-purple-700">4. Enseignements à retenir</p>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {enseignements.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </section>

        <p className="rounded-md border-l-4 border-ew-gold-500 bg-ew-gold-50 px-3 py-2 text-xs italic">
          Document à archiver dans la mémoire institutionnelle (cellule communication / direction).
        </p>
      </div>
    </div>
  );
}

/* -------- Diagnostic flash (cases à cocher avec score) -------- */
function DiagnosticChecklist({
  items,
  idPrefix,
}: {
  items: { label: string; helper?: string }[];
  idPrefix: string;
}) {
  const [checked, setChecked] = React.useState<Record<number, boolean>>({});
  const [showNote, setShowNote] = React.useState(false);
  const score = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((score / items.length) * 100);

  // Les 3 premières pratiques NON cochées sont identifiées comme priorités
  // (ce sont les chantiers à structurer en priorité pour consolider le socle).
  const priorities = React.useMemo(
    () => items.map((it, i) => ({ ...it, i })).filter((it) => !checked[it.i]).slice(0, 3),
    [items, checked],
  );

  function noteText(): string {
    const lines = [
      `NOTE DE SYNTHÈSE — Diagnostic flash de maturité numérique`,
      ``,
      `Score : ${score}/${items.length} pratiques en place (${pct}%).`,
      `Niveau : ${maturityLabel(pct)}`,
      ``,
      priorities.length === 0
        ? `Bravo : toutes les pratiques sont déjà en place. Consolidez vos acquis et partagez vos bonnes pratiques avec d'autres établissements.`
        : `Trois priorités à structurer dans les 30 prochains jours :`,
    ];
    priorities.forEach((p, idx) => {
      lines.push(`  ${idx + 1}. ${p.label}${p.helper ? ` — ${p.helper}` : ""}`);
    });
    if (priorities.length > 0) {
      lines.push(``);
      lines.push(
        `Recommandation : transformez ces trois priorités en un plan d'action court (un responsable, une échéance, un livrable par priorité).`,
      );
    }
    return lines.join("\n");
  }

  function copyNote() {
    navigator.clipboard.writeText(noteText()).catch(() => {});
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background/60 p-2.5 text-sm hover:bg-muted/20">
              <input
                type="checkbox"
                checked={!!checked[i]}
                onChange={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                className="mt-0.5 accent-ew-green-700"
                aria-describedby={`${idPrefix}-it${i}-helper`}
              />
              <div className="flex-1">
                <span className="font-medium">{it.label}</span>
                {it.helper ? (
                  <p
                    id={`${idPrefix}-it${i}-helper`}
                    className="text-[11px] italic text-muted-foreground"
                  >
                    {it.helper}
                  </p>
                ) : null}
              </div>
            </label>
          </li>
        ))}
      </ul>
      <div
        className="flex items-center justify-between rounded-lg border border-ew-green-200 bg-ew-green-50 p-2.5 text-sm"
        aria-live="polite"
      >
        <p>
          <strong className="text-ew-green-800">{score}/{items.length}</strong> pratiques en place ·
          <strong className="ml-2 text-ew-green-800">{pct}%</strong>
        </p>
        <p className="text-xs italic text-muted-foreground">{maturityLabel(pct)}</p>
      </div>

      {/* Bouton de génération de la note de synthèse */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="text-xs italic text-muted-foreground">
          Cochez les pratiques en place, puis générez votre note personnalisée.
        </p>
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          aria-expanded={showNote}
          className="inline-flex items-center gap-1.5 rounded-md bg-ew-purple-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-ew-purple-700"
        >
          <Sparkles aria-hidden className="h-3.5 w-3.5" />
          {showNote ? "Masquer la note" : "Générer ma note de synthèse"}
        </button>
      </div>

      {/* Note de synthèse */}
      {showNote ? (
        <div
          className="rounded-2xl border border-ew-purple-200 bg-ew-purple-50/60 p-4"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-purple-700">
              <FileText aria-hidden className="h-4 w-4" /> Note de synthèse
            </p>
            <button
              type="button"
              onClick={copyNote}
              className="inline-flex items-center gap-1 rounded-md border border-ew-purple-200 bg-card px-2 py-1 text-[11px] font-bold text-ew-purple-700 hover:bg-ew-purple-100"
            >
              <ClipboardCheck aria-hidden className="h-3 w-3" /> Copier
            </button>
          </div>

          <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/90">
            <p>
              <strong className="text-ew-purple-700">Score :</strong>{" "}
              <strong className="text-ew-green-800">
                {score}/{items.length}
              </strong>{" "}
              pratiques en place ({pct}%) —{" "}
              <em className="text-muted-foreground">{maturityLabel(pct)}</em>
            </p>

            {priorities.length === 0 ? (
              <p className="rounded-md border-l-4 border-ew-green-500 bg-ew-green-50 px-3 py-2">
                <strong>Bravo</strong> — toutes les pratiques sont déjà en place. Consolidez
                vos acquis et envisagez de partager vos bonnes pratiques avec d&apos;autres
                établissements.
              </p>
            ) : (
              <>
                <p>
                  <strong className="text-ew-purple-700">
                    {priorities.length === 3
                      ? "Trois priorités identifiées"
                      : `${priorities.length} priorité${priorities.length > 1 ? "s" : ""} identifiée${priorities.length > 1 ? "s" : ""}`}{" "}
                    à structurer dans les 30 prochains jours :
                  </strong>
                </p>
                <ol className="space-y-1.5">
                  {priorities.map((p, idx) => (
                    <li key={p.i} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ew-purple-500 text-xs font-bold text-white"
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-foreground">{p.label}</p>
                        {p.helper ? (
                          <p className="text-xs italic text-muted-foreground">{p.helper}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="rounded-md border-l-4 border-ew-purple-500 bg-card px-3 py-2 text-sm">
                  <strong className="text-ew-purple-700">Recommandation :</strong> transformez
                  ces priorités en un <strong>plan d&apos;action court</strong> — un responsable,
                  une échéance et un livrable concret par priorité.
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function maturityLabel(pct: number): string {
  if (pct >= 80) return "Maturité élevée — consolidez et partagez vos bonnes pratiques.";
  if (pct >= 60) return "Maturité solide — visez les zones encore fragiles.";
  if (pct >= 40) return "Maturité en construction — priorisez 3 chantiers.";
  if (pct >= 20) return "Maturité émergente — commencez par le socle (charte, identité).";
  return "À structurer — un atelier d'urgence est conseillé.";
}

/**
 * Variante personnelle du label de maturité, adaptée à l'auto-évaluation
 * d'un participant sur ses propres compétences (registre à la 2e personne,
 * encourageant). Distincte de maturityLabel() qui vise le diagnostic
 * institutionnel.
 */
function maturityLabelPersonnel(pct: number): string {
  if (pct >= 80)
    return "Maîtrise affirmée — consolidez et partagez votre expérience avec un collègue.";
  if (pct >= 60)
    return "Bonne maîtrise — visez les quelques compétences encore fragiles.";
  if (pct >= 40)
    return "En progression — choisissez 2 compétences à travailler en priorité.";
  if (pct >= 20)
    return "Premiers acquis — appuyez-vous sur vos forces pour progresser pas à pas.";
  return "Début de parcours — vous repartez avec des priorités claires et un premier engagement.";
}

/* -------- Check-list RAPIDE (6 critères à cocher) -------- */
function RapidChecklist({
  items,
  idPrefix,
}: {
  items: { label: string; helper?: string }[];
  idPrefix: string;
}) {
  const [checked, setChecked] = React.useState<Record<number, boolean>>({});
  const [tested, setTested] = React.useState(false);
  const score = Object.values(checked).filter(Boolean).length;
  const allGreen = score === items.length;
  const showRed = tested && !allGreen;
  return (
    <div className="space-y-2">
      <p className="text-xs italic text-muted-foreground">
        Cochez chaque critère vérifié, puis lancez le test. Le feu reste au rouge tant que les 6 critères ne sont pas tous au vert.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((it, i) => {
          const c = !!checked[i];
          const red = showRed && !c;
          return (
            <li key={i}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm transition-colors",
                  c
                    ? "border-ew-green-500 bg-ew-green-50"
                    : red
                      ? "border-ew-red bg-ew-red/10"
                      : "border-border bg-background/60 hover:bg-muted/20",
                )}
              >
                <input
                  type="checkbox"
                  checked={c}
                  onChange={() => {
                    setChecked((p) => ({ ...p, [i]: !p[i] }));
                    setTested(false);
                  }}
                  className="mt-0.5 accent-ew-green-700"
                />
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-display font-bold",
                      c ? "text-ew-green-800" : red ? "text-ew-red" : "text-foreground",
                    )}
                  >
                    {it.label}
                  </p>
                  {it.helper ? <p className="text-[11px] italic text-muted-foreground">{it.helper}</p> : null}
                </div>
                {c ? (
                  <CheckCircle2 aria-hidden className="h-5 w-5 text-ew-green-600" />
                ) : red ? (
                  <AlertTriangle aria-hidden className="h-5 w-5 text-ew-red" />
                ) : (
                  <span aria-hidden className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
                )}
              </label>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setTested(true)}
          disabled={tested && !allGreen}
        >
          Tester la conformité RAPIDE
        </Button>
        <span className="text-xs text-muted-foreground">
          {score}/{items.length} critère{items.length > 1 ? "s" : ""} validé{score > 1 ? "s" : ""}
        </span>
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium",
          allGreen
            ? "border-ew-green-500 bg-ew-green-100 text-ew-green-900"
            : showRed
              ? "border-ew-red bg-ew-red/10 text-ew-red"
              : "border-ew-gold-500 bg-ew-gold-50 text-foreground",
        )}
        aria-live="polite"
      >
        {allGreen ? (
          <>
            <CheckCircle2 aria-hidden className="h-5 w-5" />
            <span>
              <strong>Feu vert :</strong> publication autorisée selon RAPIDE.
            </span>
          </>
        ) : showRed ? (
          <>
            <AlertTriangle aria-hidden className="h-5 w-5" />
            <span>
              <strong>Feu rouge :</strong> {items.length - score} critère{items.length - score > 1 ? "s" : ""} non validé{items.length - score > 1 ? "s" : ""} — corrigez avant publication.
            </span>
          </>
        ) : (
          <>
            <AlertTriangle aria-hidden className="h-5 w-5 text-ew-gold-700" />
            <span>
              Vérifiez chaque critère puis lancez le test pour obtenir le feu vert.
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* -------- Défi IA : corriger un message avant publication -------- */
function AiCorrectionChallenge({
  challenge,
  idPrefix,
}: {
  challenge: {
    sourceLabel?: string;
    rawMessage: string;
    problems: string[];
    correctedMessage: string;
    whyBetter: string[];
  };
  idPrefix: string;
}) {
  const sourceLabel = challenge.sourceLabel ?? "Message brut généré par IA — à corriger";
  const [problemsText, setProblemsText] = React.useState("");
  const [correctionText, setCorrectionText] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Persistance Supabase (production privée, migration 032) : ré-hydratation de
  // ma saisie + sauvegarde différée ; le formateur du cours voit les productions
  // des participants via le panneau ci-dessous.
  const refl = useReflectionSync<{ problems: string; correction: string }>(
    idPrefix,
    "aicorrection",
  );
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (hydrated.current || !refl.loaded) return;
    hydrated.current = true;
    if (refl.own) {
      setProblemsText(refl.own.problems ?? "");
      setCorrectionText(refl.own.correction ?? "");
    }
  }, [refl.loaded, refl.own]);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (!problemsText.trim() && !correctionText.trim()) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(
      () => refl.save({ problems: problemsText, correction: correctionText }),
      1200,
    );
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [problemsText, correctionText, refl.save]);

  const attempted =
    problemsText.trim().length > 0 || correctionText.trim().length > 0;

  async function copyCorrected() {
    try {
      await navigator.clipboard.writeText(challenge.correctedMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Message brut à corriger */}
      <div className="rounded-xl border border-ew-gold-300 bg-ew-gold-50/50 p-3">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-gold-700">
          <AlertTriangle aria-hidden className="h-4 w-4" /> {sourceLabel}
        </p>
        <p className="mt-2 whitespace-pre-line text-sm italic text-foreground/90">
          {challenge.rawMessage}
        </p>
        <div className="mt-2">
          <NarrationButton
            key={`ai-raw-${idPrefix}`}
            text={`Message généré par intelligence artificielle, à corriger. ${challenge.rawMessage}`}
            label="Écouter le message"
          />
        </div>
      </div>

      {/* Saisie de l'apprenant */}
      <div className="space-y-2">
        <div>
          <label
            htmlFor={`${idPrefix}-problems`}
            className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >
            Les problèmes que j&apos;identifie
          </label>
          <textarea
            id={`${idPrefix}-problems`}
            value={problemsText}
            onChange={(e) => setProblemsText(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
            placeholder="Listez ce qui ne va pas dans ce message…"
          />
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-correction`}
            className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >
            Ma version corrigée
          </label>
          <textarea
            id={`${idPrefix}-correction`}
            value={correctionText}
            onChange={(e) => setCorrectionText(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
            placeholder="Réécrivez le message de façon professionnelle, sobre et respectueuse…"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => setRevealed(true)}>
          <Eye aria-hidden className="mr-1.5 h-4 w-4" /> Voir la correction modèle
        </Button>
        {!attempted ? (
          <span className="text-xs italic text-muted-foreground">
            Astuce : tentez d&apos;abord votre propre correction, puis comparez.
          </span>
        ) : null}
      </div>

      {/* Correction modèle révélée */}
      {revealed ? (
        <div
          className="rounded-2xl border border-ew-green-200 bg-ew-green-50/40 p-4"
          aria-live="polite"
        >
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">
            <Sparkles aria-hidden className="h-4 w-4" /> Correction modèle
          </p>

          <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
            {/* Problèmes à identifier */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ew-gold-700">
                Problèmes à identifier ({challenge.problems.length})
              </p>
              <ul className="mt-1 space-y-1">
                {challenge.problems.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Version corrigée */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
                  Version corrigée proposée
                </p>
                <div className="flex items-center gap-2">
                  <NarrationButton
                    key={`ai-fixed-${idPrefix}`}
                    text={`Version corrigée. ${challenge.correctedMessage}`}
                    label="Écouter"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={copyCorrected}>
                    <Copy aria-hidden className="mr-1.5 h-3.5 w-3.5" />
                    {copied ? "Copié" : "Copier"}
                  </Button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line rounded-md border border-ew-green-200 bg-card px-3 py-2">
                {challenge.correctedMessage}
              </p>
            </div>

            {/* Pourquoi c'est mieux */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
                Pourquoi cette version est meilleure
              </p>
              <ul className="mt-1 space-y-1">
                {challenge.whyBetter.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-600" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {attempted ? (
              <p className="rounded-md border-l-4 border-ew-purple-500 bg-card px-3 py-2 text-sm">
                <strong className="text-ew-purple-700">Comparez :</strong> relisez votre
                version à la lumière de la correction modèle. Avez-vous repéré tous les
                problèmes ? Votre reformulation respecte-t-elle la sobriété institutionnelle
                et l&apos;identité catholique ?
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {refl.canReview ? (
        <ReflectionFacilitatorPanel<{ problems: string; correction: string }>
          title="Correction IA"
          others={refl.others}
          onRefresh={refl.refresh}
          render={(p) => (
            <div className="space-y-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ew-gold-700">
                  Problèmes identifiés
                </p>
                <p className="whitespace-pre-line">{p.problems?.trim() || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
                  Version corrigée proposée
                </p>
                <p className="whitespace-pre-line">{p.correction?.trim() || "—"}</p>
              </div>
            </div>
          )}
        />
      ) : null}
    </div>
  );
}

/* -------- Champs de réflexion -------- */
function ReflectionFields({
  items,
  idPrefix,
}: {
  items: { label: string; helper?: string }[];
  idPrefix: string;
}) {
  const [values, setValues] = React.useState<Record<number, string>>({});
  // Snapshot des valeurs au moment où le participant a déclenché l'évaluation.
  // Si l'apprenant continue à modifier ses réponses, l'évaluation se cache
  // (elle n'est plus à jour) jusqu'à un nouveau clic.
  const [evaluated, setEvaluated] = React.useState<Record<number, string> | null>(null);

  React.useEffect(() => {
    // Toute édition après évaluation invalide l'évaluation précédente.
    if (evaluated == null) return;
    const same = items.every((_, i) => (values[i] || "") === (evaluated[i] || ""));
    if (!same) setEvaluated(null);
  }, [values, evaluated, items]);

  function copy() {
    const text = items
      .map((it, i) => `${it.label} :\n${values[i] || "…"}\n`)
      .join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  const filledCount = items.filter((_, i) => (values[i] || "").trim().length > 0)
    .length;
  const canEvaluate = filledCount >= 1;

  // Persistance Supabase (production privée, migration 032) : ré-hydratation +
  // sauvegarde différée ; le formateur voit l'engagement des participants.
  const refl = useReflectionSync<{ values: Record<number, string> }>(
    idPrefix,
    "engagement",
  );
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (hydrated.current || !refl.loaded) return;
    hydrated.current = true;
    if (refl.own?.values) setValues(refl.own.values);
  }, [refl.loaded, refl.own]);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (filledCount === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => refl.save({ values }), 1000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [values, filledCount, refl.save]);

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i}>
          <label htmlFor={`${idPrefix}-r${i}`} className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {it.label}
          </label>
          <textarea
            id={`${idPrefix}-r${i}`}
            value={values[i] || ""}
            onChange={(e) => setValues((v) => ({ ...v, [i]: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
            placeholder="…"
          />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-muted/40"
        >
          Copier mon engagement
        </button>
        <button
          type="button"
          onClick={() => setEvaluated({ ...values })}
          disabled={!canEvaluate}
          className="rounded-md bg-ew-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-ew-purple-700 disabled:opacity-50"
          title={
            !canEvaluate
              ? "Remplissez au moins une zone avant d'évaluer."
              : "Générer une appréciation et une analyse critique encourageante de votre engagement."
          }
        >
          Évaluer mon engagement
        </button>
        <span className="text-xs italic text-muted-foreground">
          {filledCount}/{items.length} champ{items.length > 1 ? "s" : ""} rempli{items.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Appréciation + analyse critique + encouragement — générée sur
          demande, depuis un snapshot des valeurs. Toute édition ultérieure
          invalide l'évaluation jusqu'à un nouveau clic. */}
      {evaluated ? <EngagementAppreciation items={items} values={evaluated} /> : null}

      {refl.canReview ? (
        <ReflectionFacilitatorPanel<{ values: Record<number, string> }>
          title="Engagement"
          others={refl.others}
          onRefresh={refl.refresh}
          render={(p) => (
            <div className="space-y-1.5">
              {items.map((it, i) => (
                <div key={i}>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {it.label}
                  </p>
                  <p className="whitespace-pre-line">{p.values?.[i]?.trim() || "—"}</p>
                </div>
              ))}
            </div>
          )}
        />
      ) : null}
    </div>
  );
}

interface EngagementSignals {
  filled: number;
  total: number;
  totalChars: number;
  meanChars: number;
  hasTimeMarker: boolean;
  hasActionVerb: boolean;
  hasHumanAnchor: boolean;
  hasSpecificDetail: boolean;
  shortestLen: number;
  longestLen: number;
}

/**
 * Frontière de mot tolérante à l'unicode (lettres et chiffres accentués).
 * `\b` natif de JavaScript ne reconnaît que l'ASCII : `\bévêque\b` ne
 * matche pas " évêque " car ni `é` ni ` ` ne sont des « word chars ».
 * On utilise `\p{L}\p{N}` avec le flag `u` pour s'aligner sur le français.
 */
function makeFrenchWordRegex(alternatives: string[]): RegExp {
  return new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${alternatives.join("|")})(?![\\p{L}\\p{N}])`,
    "iu",
  );
}

const TIME_MARKERS = [
  "\\d+\\s*(?:jours?|semaines?|mois|ans?|h|heures?|minutes?)",
  "aujourd['’]hui",
  "demain",
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
  "matin", "soir", "midi", "après-midi",
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  "chaque", "tous\\s+les", "toutes\\s+les",
  "trimestre", "semestre", "rentrée", "vacances", "week-end",
  "toussaint", "avent", "noël", "carême", "pâques", "ascension", "pentecôte",
  "retraite",
];

const ACTION_VERBS = [
  // Verbes managériaux / professionnels
  "changer", "faire", "mettre", "écrire", "partager", "publier",
  "surveiller", "vérifier", "former", "relire", "appliquer", "réviser",
  "réorganiser", "professionnaliser", "construire", "documenter", "signer",
  "valider", "écouter", "rencontrer", "sensibiliser", "adopter", "déployer",
  "planifier", "rédiger", "transmettre", "enseigner", "accueillir",
  "organiser", "animer", "encourager",
  // Verbes pastoraux
  "prier", "célébrer", "accompagner", "témoigner", "annoncer",
  "évangéliser", "méditer", "discerner", "servir",
];

const HUMAN_ANCHORS = [
  "équipe", "collègue", "directrice", "directeur", "parent", "élève",
  "enseignant", "tuteur", "formateur", "paroisse", "communauté",
  "cellule", "service", "direction",
  // Anchors pastoraux catholiques (SENEC / DDEC)
  "évêque", "archevêque", "cardinal", "prêtre", "abbé", "curé", "vicaire",
  "aumônier", "religieuse", "sœur", "frère", "séminariste", "catéchiste",
  "fondation", "congrégation", "ddec", "senec", "enc", "ceic",
  "conseil\\s+d['’]administration", "association\\s+de\\s+parents",
  "apeec", "chef\\s+d['’]établissement", "chef\\s+d['’]école",
];

const PASTORAL_LEXICON = [
  "messe", "sacrement[s]?", "eucharistie", "catéchèse", "foi",
  "doctrine", "pastorale", "mission", "œuvre", "oeuvre", "évangile",
  "vocation", "communion", "spiritualité", "diocèse", "archidiocèse",
];

const TIME_RE = makeFrenchWordRegex(TIME_MARKERS);
const ACTION_RE = makeFrenchWordRegex(ACTION_VERBS);
const HUMAN_RE = makeFrenchWordRegex(HUMAN_ANCHORS);
const PASTORAL_RE = makeFrenchWordRegex(PASTORAL_LEXICON);

function analyzeEngagement(
  items: { label: string; helper?: string }[],
  values: Record<number, string>,
): EngagementSignals & { hasPastoralLexicon: boolean } {
  const texts = items.map((_, i) => (values[i] || "").trim());
  const filled = texts.filter((t) => t.length > 0);
  const totalChars = filled.reduce((acc, t) => acc + t.length, 0);
  // Normalise les apostrophes typographiques (U+2019) → ASCII pour
  // robustesse contre les autocorrections Word / iOS / Android.
  const joined = filled.join(" ").toLowerCase().replace(/[‘’]/g, "'");
  return {
    filled: filled.length,
    total: items.length,
    totalChars,
    meanChars: filled.length > 0 ? Math.round(totalChars / filled.length) : 0,
    hasTimeMarker: TIME_RE.test(joined),
    hasActionVerb: ACTION_RE.test(joined),
    hasHumanAnchor: HUMAN_RE.test(joined),
    hasSpecificDetail: /\d/.test(joined) || /[A-Z]{3,}/.test(filled.join(" ")),
    hasPastoralLexicon: PASTORAL_RE.test(joined),
    shortestLen: filled.length > 0 ? Math.min(...filled.map((t) => t.length)) : 0,
    longestLen: filled.length > 0 ? Math.max(...filled.map((t) => t.length)) : 0,
  };
}

interface EngagementVerdict {
  level: "remarquable" | "solide" | "amorcé" | "esquissé";
  tone: "excellent" | "good" | "ok" | "weak";
  appreciation: string;
  critique: string[];
  encouragement: string;
}

function evaluateEngagement(
  s: EngagementSignals & { hasPastoralLexicon: boolean },
): EngagementVerdict {
  const completion = s.total > 0 ? s.filled / s.total : 0;
  const richness = Math.min(1, s.meanChars / 80);
  // 5 signaux : temporel, action, ancrage humain, détail spécifique, pastoral.
  const signals =
    Number(s.hasTimeMarker) +
    Number(s.hasActionVerb) +
    Number(s.hasHumanAnchor) +
    Number(s.hasSpecificDetail) +
    Number(s.hasPastoralLexicon);
  const score = completion * 0.4 + richness * 0.3 + (signals / 5) * 0.3;

  let level: EngagementVerdict["level"];
  let tone: EngagementVerdict["tone"];
  let appreciation: string;
  if (score >= 0.75) {
    level = "remarquable";
    tone = "excellent";
    appreciation =
      "Engagement remarquable. Vos réponses sont à la fois personnelles, concrètes et orientées vers la mise en œuvre. Ce niveau de réflexion est précisément ce que la formation cherche à éveiller : un passage de la prise de conscience à la décision, et de la décision à un acte daté, partagé et qui porte du fruit dans la mission éducative confiée à votre établissement.";
  } else if (score >= 0.55) {
    level = "solide";
    tone = "good";
    appreciation =
      "Engagement solide. Vous avez pris au sérieux le temps de réflexion : vos formulations laissent transparaître une vraie intention et une fidélité au charisme éducatif catholique. Avec quelques précisions supplémentaires, cet engagement deviendra pleinement opérationnel.";
  } else if (score >= 0.35) {
    level = "amorcé";
    tone = "ok";
    appreciation =
      "Engagement amorcé. C'est déjà précieux d'avoir posé par écrit ce premier jet : la mise en mots est la première étape du passage à l'acte. Le contenu mérite à présent d'être étoffé pour devenir un vrai plan personnel au service de votre communauté éducative.";
  } else {
    level = "esquissé";
    tone = "weak";
    appreciation =
      "Premier pas important. Le simple fait d'avoir formulé ne serait-ce qu'une ligne marque déjà une décision : celle de prendre cette formation au sérieux. Donnez-vous quelques minutes supplémentaires pour préciser ces premières intuitions — vous serez surpris de la clarté qui en émerge.";
  }

  const critique: string[] = [];
  const missing = s.total - s.filled;
  if (missing > 0) {
    critique.push(
      `${missing} champ${missing > 1 ? "s" : ""} sur ${s.total} reste${missing > 1 ? "nt" : ""} à compléter — chaque ligne ouvre une dimension différente (conviction, vigilance, pratique, canal, partage).`,
    );
  }
  if (s.filled > 0 && s.meanChars < 30) {
    critique.push(
      "Vos réponses sont brèves. Précisez : un fait, un nom, une date, un canal — un engagement gagne en force quand il devient observable.",
    );
  }
  if (!s.hasTimeMarker) {
    critique.push(
      "Aucune échéance n'est mentionnée. Ajoutez un horizon temporel précis (dans 7 jours, dans 30 jours, chaque lundi, dès la rentrée…) — un engagement sans date dérive.",
    );
  }
  if (!s.hasActionVerb) {
    critique.push(
      "Les engagements manquent de verbes d'action. Préférez les verbes qui décrivent un geste concret (publier, relire, former, signer, partager, accompagner, célébrer) à un état général.",
    );
  }
  if (!s.hasHumanAnchor) {
    critique.push(
      "Aucune personne ou équipe n'est nommée. Ancrer l'engagement à un interlocuteur (la directrice, mon adjoint, la cellule communication, l'aumônier, un parent référent…) augmente sa probabilité de tenue.",
    );
  }
  if (critique.length === 0) {
    critique.push(
      "Pour aller encore plus loin : partagez cet engagement à l'oral avec un binôme dans les 48 heures et notez sa réaction — c'est ce qui transforme l'intention en alliance.",
    );
  }

  // 5 messages d'encouragement alignés sur les paliers du verdict.
  const encouragements: string[] = [
    // remarquable (≥ 0.75)
    "Bravo pour cet engagement abouti. Ce que vous avez écrit est un acte de leadership pastoral : prendre une responsabilité publique sur la communication de votre école n'est pas anodin. C'est une démarche qui honore la mission éducative confiée par l'Église à votre établissement.",
    // solide (≥ 0.55)
    "Bravo d'avoir pris le temps de vous engager personnellement. Ce que vous écrivez ici ne reste pas dans la formation : c'est la première brique d'une communication plus juste, plus cohérente et plus pastorale dans votre établissement.",
    // amorcé (≥ 0.35)
    "Votre engagement compte. Chaque communicateur catholique qui sort de cette session avec une décision claire renforce, à son échelle, la qualité de la parole de l'Église éducative en Côte d'Ivoire.",
    // esquissé (< 0.35)
    "Félicitations pour ce premier pas. Mettre par écrit, même brièvement, une intention au service de votre communauté éducative est déjà un acte de discernement. Reprenez ces lignes à tête reposée pour en faire un plan personnel solide.",
  ];
  const encouragement =
    score >= 0.75
      ? encouragements[0]
      : score >= 0.55
        ? encouragements[1]
        : score >= 0.35
          ? encouragements[2]
          : encouragements[3];

  return { level, tone, appreciation, critique, encouragement };
}

function EngagementAppreciation({
  items,
  values,
}: {
  items: { label: string; helper?: string }[];
  values: Record<number, string>;
}) {
  const signals = React.useMemo(() => analyzeEngagement(items, values), [items, values]);
  const verdict = React.useMemo(() => evaluateEngagement(signals), [signals]);

  return (
    <div
      className="rounded-2xl border border-ew-purple-200 bg-ew-purple-50/60 p-4"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-purple-700">
          <Sparkles aria-hidden className="h-4 w-4" /> Appréciation de votre engagement
        </p>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
            verdict.tone === "excellent" && "bg-ew-green-100 text-ew-green-800",
            verdict.tone === "good" && "bg-ew-green-50 text-ew-green-800",
            verdict.tone === "ok" && "bg-ew-gold-50 text-ew-gold-700",
            verdict.tone === "weak" && "bg-ew-gold-100 text-ew-gold-700",
          )}
        >
          Engagement {verdict.level}
        </span>
      </div>

      <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
        <p>{verdict.appreciation}</p>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ew-purple-700">
            Analyse critique pour aller plus loin
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {verdict.critique.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <p className="rounded-md border-l-4 border-ew-gold-500 bg-card px-3 py-2">
          <strong className="text-ew-gold-700">Encouragement :</strong> {verdict.encouragement}
        </p>
      </div>
    </div>
  );
}

/* -------- Matrice / plan (tableaux saisissables) -------- */
/* Synchro Supabase descendante des productions « matrice » (migration 031).
   Coalescée (1,5 s) pour éviter des requêtes redondantes quand plusieurs
   matrices sont montées en même temps ; `force` contourne pour le bouton
   « Rafraîchir ». Inerte en mode démo (fetchCourseMatrix renvoie null). */
const lastMatrixFetch: Record<string, number> = {};
async function pullCourseMatrix(
  courseId: string,
  store: ReturnType<typeof useStore>,
  force = false,
) {
  const now = Date.now();
  if (!force && lastMatrixFetch[courseId] && now - lastMatrixFetch[courseId] < 1500) {
    return;
  }
  lastMatrixFetch[courseId] = now;
  const data = await fetchCourseMatrix(courseId);
  if (data) {
    store.mergeMatrixSubmissions(data.submissions);
    store.mergeMatrixReviews(data.reviews);
  }
}

function FillableMatrix({
  headers,
  rowLabels,
  idPrefix,
}: {
  headers: string[];
  rowLabels: string[];
  /** Sert d'activityId pour la persistance. */
  idPrefix: string;
}) {
  // Persistance : la matrice est rattachée à (userId, activityId). Toute
  // édition est immédiatement enregistrée dans le store. Le formateur peut
  // ensuite consulter et critiquer les soumissions des participants.
  const app = useApp();
  const store = useStore();
  const ctx = useSeminaireActivityContext();
  const courseId = ctx?.courseId ?? "communication-pastorale";
  const moduleId = ctx?.moduleId ?? "senec-workshops";
  const activityId = idPrefix;

  // Synchro descendante au montage (mode réel) : récupère les soumissions des
  // participants (pour le formateur) et les critiques publiées (pour l'apprenant).
  React.useEffect(() => {
    void pullCourseMatrix(courseId, store);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const mine = React.useMemo(
    () =>
      store.matrixSubmissions.find(
        (m) => m.userId === app.user.id && m.activityId === activityId,
      ),
    [store.matrixSubmissions, app.user.id, activityId],
  );
  const cells = mine?.cells ?? {};

  // Push différé vers Supabase (anti-rafale de frappe) ; inerte en mode démo.
  // `pendingRef` retient la dernière soumission à pousser → flush à la sortie
  // (navigation juste après une frappe) pour ne rien perdre.
  const pushTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = React.useRef<
    Parameters<typeof persistMatrixSubmission>[0] | null
  >(null);
  React.useEffect(
    () => () => {
      if (pushTimer.current) {
        clearTimeout(pushTimer.current);
        if (pendingRef.current) void persistMatrixSubmission(pendingRef.current);
        pendingRef.current = null;
      }
    },
    [],
  );
  function schedulePush(nextCells: Record<string, string>) {
    const nowIso = new Date().toISOString();
    pendingRef.current = {
      id: matrixSubmissionId(app.user.id, activityId),
      userId: app.user.id,
      userName: app.user.displayName,
      userRole: app.effectiveRole,
      courseId,
      moduleId,
      activityId,
      headers,
      rowLabels,
      cells: nextCells,
      createdAt: mine?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      if (pendingRef.current) void persistMatrixSubmission(pendingRef.current);
      pendingRef.current = null;
    }, 1200);
  }

  function key(r: number, c: number) {
    return `${r}-${c}`;
  }
  function updateCell(r: number, c: number, value: string) {
    const nextCells = { ...cells, [key(r, c)]: value };
    store.upsertMatrixSubmission({
      userId: app.user.id,
      userName: app.user.displayName,
      userRole: app.effectiveRole,
      courseId,
      moduleId,
      activityId,
      headers,
      rowLabels,
      cells: nextCells,
    });
    schedulePush(nextCells);
  }
  function copy() {
    const lines: string[] = [];
    lines.push(headers.join("\t"));
    rowLabels.forEach((rl, r) => {
      const row = [rl];
      for (let c = 1; c < headers.length; c++) {
        row.push(cells[key(r, c)] || "");
      }
      lines.push(row.join("\t"));
    });
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
  }

  // Une critique m'est-elle adressée et publiée par un formateur ?
  const publishedReview = mine
    ? store.matrixReviews.find(
        (r) => r.submissionId === mine.id && r.publishedToLearner,
      )
    : undefined;

  // Le panneau de critiques est réservé aux animateurs de la formation
  // (enseignant, tuteur, gestionnaire, administrateur) — selon le rôle de
  // formation, et non plus seulement le rôle applicatif global.
  const formationRole = useFormationRole(courseId);
  const canReview = isFacilitatorRole(formationRole);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-border">
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
            {rowLabels.map((rl, r) => (
              <tr key={r} className="border-t border-border align-top">
                <td className="px-2 py-1.5 font-bold text-ew-green-800">{rl}</td>
                {Array.from({ length: headers.length - 1 }).map((_, ci) => {
                  const c = ci + 1;
                  return (
                    <td key={c} className="px-1 py-1">
                      <textarea
                        aria-label={`${headers[c]} pour ${rl}`}
                        value={cells[key(r, c)] || ""}
                        onChange={(e) => updateCell(r, c, e.target.value)}
                        rows={1}
                        className="w-full resize-y rounded border border-transparent bg-transparent px-1 py-0.5 text-xs hover:border-border focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
                        placeholder="…"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={copy}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-muted/40"
      >
        Copier mon tableau
      </button>

      {/* Critique du formateur publiée à mon attention */}
      {publishedReview ? (
        <PublishedReview review={publishedReview} />
      ) : null}

      {/* Panneau de critiques — visible uniquement par les formateurs/admins.
          Liste les soumissions des autres participants ; possibilité de
          générer une critique, l'éditer, la publier ou la dépublier. */}
      {canReview ? (
        <FacilitatorReviewPanel activityId={activityId} courseId={courseId} />
      ) : null}
    </div>
  );
}

/* ----- Critique publiée à destination du participant ----- */
function PublishedReview({ review }: { review: ReturnType<typeof useStore>["matrixReviews"][number] }) {
  return (
    <div className="rounded-2xl border border-ew-purple-200 bg-ew-purple-50/60 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-purple-700">
        <FileText aria-hidden className="h-4 w-4" /> Retour du formateur
      </p>
      <p className="mt-1 text-[11px] italic text-muted-foreground">
        Par <strong className="not-italic text-foreground">{review.reviewerName}</strong>
        {review.reviewerRole ? ` (${review.reviewerRole})` : ""} ·{" "}
        {new Date(review.updatedAt).toLocaleString("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
        {review.content}
      </pre>
    </div>
  );
}

/* ----- Panneau de critique réservé aux formateurs/admins ----- */
function FacilitatorReviewPanel({
  activityId,
  courseId,
}: {
  activityId: string;
  courseId: string;
}) {
  const app = useApp();
  const store = useStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const submissions = store.matrixSubmissions
    .filter((m) => m.activityId === activityId && m.userId !== app.user.id)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  async function refresh() {
    setRefreshing(true);
    try {
      await pullCourseMatrix(courseId, store, true);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ew-gold-200 bg-ew-gold-50/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-gold-700">
          <Eye aria-hidden className="h-4 w-4" /> Espace formateur — {submissions.length}{" "}
          soumission{submissions.length > 1 ? "s" : ""} à critiquer
        </p>
        <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
          <RefreshCw aria-hidden className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Actualisation…" : "Rafraîchir"}
        </Button>
      </div>
      <p className="mt-1 text-[11px] italic text-muted-foreground">
        Réservé à l&apos;administrateur, à l&apos;enseignant ou au tuteur.
        Générez une première critique objective, éditez-la si besoin, puis
        publiez-la pour la rendre accessible au participant.
      </p>
      {submissions.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed border-border bg-background/60 p-3 text-xs italic text-muted-foreground">
          Aucune soumission visible pour le moment. Dès qu&apos;un participant
          remplit sa matrice, cliquez sur «&nbsp;Rafraîchir&nbsp;» pour la faire
          apparaître ici (en mode démo, les productions du même navigateur
          s&apos;affichent automatiquement).
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {submissions.map((sub) => (
            <SubmissionReviewCard key={sub.id} submission={sub} courseId={courseId} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionReviewCard({
  submission,
  courseId,
}: {
  submission: ReturnType<typeof useStore>["matrixSubmissions"][number];
  courseId: string;
}) {
  const app = useApp();
  const store = useStore();
  const [open, setOpen] = React.useState(false);
  // Mes critiques sur cette soumission (un reviewer peut écrire une critique).
  const myReview = React.useMemo(
    () => store.matrixReviews.find(
      (r) => r.submissionId === submission.id && r.reviewerId === app.user.id,
    ),
    [store.matrixReviews, submission.id, app.user.id],
  );
  const [content, setContent] = React.useState(myReview?.content ?? "");
  const [published, setPublished] = React.useState(myReview?.publishedToLearner ?? false);

  React.useEffect(() => {
    setContent(myReview?.content ?? "");
    setPublished(myReview?.publishedToLearner ?? false);
  }, [myReview?.content, myReview?.publishedToLearner]);

  const fillCount = Object.values(submission.cells).filter((v) => v && v.trim().length > 0).length;
  const totalCells = submission.rowLabels.length * Math.max(0, submission.headers.length - 1);

  function generateDraft() {
    const draft = generateMatrixCritique(submission);
    setContent(draft);
  }

  // Persiste la critique côté Supabase (best-effort, inerte en mode démo) avec le
  // même id déterministe que le store → l'apprenant et les autres formateurs la
  // voient (selon la RLS) sur n'importe quel appareil.
  function pushReview(publishedFlag: boolean, text: string) {
    const nowIso = new Date().toISOString();
    void persistMatrixReview(
      {
        id: matrixReviewId(submission.id, app.user.id),
        submissionId: submission.id,
        reviewerId: app.user.id,
        reviewerName: app.user.displayName,
        reviewerRole: app.effectiveRole,
        content: text,
        publishedToLearner: publishedFlag,
        createdAt: myReview?.createdAt ?? nowIso,
        updatedAt: nowIso,
      },
      courseId,
    );
  }

  function save() {
    if (!content.trim()) return;
    store.upsertMatrixReview({
      submissionId: submission.id,
      reviewerId: app.user.id,
      reviewerName: app.user.displayName,
      reviewerRole: app.effectiveRole,
      content: content.trim(),
      publishedToLearner: published,
    });
    pushReview(published, content.trim());
  }

  function togglePublication() {
    if (!myReview) {
      // Pas encore enregistré : on sauvegarde d'abord, puis on active la publication.
      if (!content.trim()) return;
      store.upsertMatrixReview({
        submissionId: submission.id,
        reviewerId: app.user.id,
        reviewerName: app.user.displayName,
        reviewerRole: app.effectiveRole,
        content: content.trim(),
        publishedToLearner: true,
      });
      setPublished(true);
      pushReview(true, content.trim());
      return;
    }
    const next = !myReview.publishedToLearner;
    store.setMatrixReviewPublished(myReview.id, next);
    setPublished(next);
    pushReview(next, content.trim() || myReview.content);
  }

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted/20"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ew-green-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {submission.userName}
          </span>
          {submission.userRole ? (
            <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {submission.userRole}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {fillCount}/{totalCells} cellules remplies
          </span>
          {myReview ? (
            myReview.publishedToLearner ? (
              <span className="rounded-full border border-ew-green-300 bg-ew-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ew-green-800">
                Publié
              </span>
            ) : (
              <span className="rounded-full border border-ew-gold-200 bg-ew-gold-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ew-gold-700">
                Brouillon
              </span>
            )
          ) : null}
        </div>
        <ChevronRight
          aria-hidden
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-90")}
        />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border p-3">
          {/* Aperçu de la matrice du participant */}
          <div className="overflow-x-auto rounded border border-border bg-background/40">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
                <tr>
                  {submission.headers.map((h, i) => (
                    <th key={i} className="px-2 py-1 text-left font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submission.rowLabels.map((rl, r) => (
                  <tr key={r} className="border-t border-border align-top">
                    <td className="px-2 py-1 font-bold text-ew-green-800">{rl}</td>
                    {Array.from({ length: submission.headers.length - 1 }).map((_, ci) => {
                      const c = ci + 1;
                      const v = submission.cells[`${r}-${c}`] || "";
                      return (
                        <td key={c} className="px-2 py-1">
                          {v ? (
                            <span>{v}</span>
                          ) : (
                            <span className="italic text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Génération + édition de la critique */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wide text-ew-purple-700">
                Critique objective
              </label>
              <button
                type="button"
                onClick={generateDraft}
                className="inline-flex items-center gap-1 rounded-md bg-ew-purple-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-ew-purple-700"
              >
                <Sparkles aria-hidden className="h-3.5 w-3.5" />
                {content ? "Régénérer le brouillon" : "Générer un premier jet"}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Rédigez votre critique, ou cliquez sur « Générer un premier jet » pour démarrer."
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] italic text-muted-foreground">
                Tant qu&apos;elle n&apos;est pas publiée, le participant ne voit pas votre critique.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={save} disabled={!content.trim()}>
                  Enregistrer le brouillon
                </Button>
                <Button
                  size="sm"
                  onClick={togglePublication}
                  disabled={!content.trim()}
                  variant={published ? "outline" : "default"}
                >
                  {published ? "Dépublier" : "Publier au participant"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

/* -------- Glossaire + repères + déroulé -------- */
export function CommGlossary({ seminaire }: { seminaire: CommSeminaire }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
        <BookMarked aria-hidden className="h-4 w-4" /> Glossaire
      </p>
      <dl className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {seminaire.glossary.map((g) => (
          <div key={g.term} className="border-l-2 border-ew-green-300 pl-3">
            <dt className="font-bold text-ew-green-800">{g.term}</dt>
            <dd className="text-xs text-muted-foreground">{g.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CommRepères({ seminaire }: { seminaire: CommSeminaire }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
        <Sparkles aria-hidden className="h-4 w-4" /> Les 10 repères du communicateur catholique
      </p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {seminaire.references10.map((r) => (
          <li key={r.num} className="flex gap-2">
            <span
              aria-hidden
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ew-green-700 text-[11px] font-bold text-white"
            >
              {r.num}
            </span>
            <span>{r.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CommSchedule({ seminaire }: { seminaire: CommSeminaire }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
        <Clock aria-hidden className="h-4 w-4" /> Déroulé proposé (120 minutes)
      </p>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-1 text-left font-bold">Plage</th>
            <th className="px-2 py-1 text-left font-bold">Activité</th>
          </tr>
        </thead>
        <tbody>
          {seminaire.schedule.map((s, i) => (
            <tr key={i} className="border-t border-border">
              <td className="px-2 py-1.5 font-mono text-xs font-bold text-ew-green-800">{s.hours}</td>
              <td className="px-2 py-1.5">{s.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================================
   AUTO-ÉVALUATION FINALE (Séquence 7) — grille de compétences + bilan.
   Chaque participant coche son niveau (Pas encore / En progrès / Acquis)
   pour chaque compétence, et signale celles à renforcer collectivement.
   Un bilan personnalisé est généré : maturité, forces, priorités,
   compétences à porter en équipe, et un engagement d'action à 30 jours.
   ========================================================================== */
export function FinalSelfEvaluation({
  data,
  courseId,
}: {
  data: CommSeminaire["finalSelfEvaluation"];
  /** Cours (pour la persistance Supabase — rendu hors SeminaireActivityProvider). */
  courseId?: string;
}) {
  const app = useApp();
  const { competences, levels, reinforceLabel, objective, durationMin } = data;
  // La colonne « à renforcer chez les autres » est optionnelle : certaines
  // formations (ex. IA) n'ont qu'une échelle de niveau.
  const hasReinforce = !!reinforceLabel;
  const maxLevel = Math.max(1, levels.length - 1);

  // Niveau choisi par compétence (index dans `levels`), et drapeau collectif.
  const [picked, setPicked] = React.useState<Record<number, number>>({});
  const [reinforce, setReinforce] = React.useState<Record<number, boolean>>({});
  const [shown, setShown] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const answered = Object.keys(picked).length;
  const allAnswered = answered === competences.length;

  // Le bilan reste masqué tant qu'il n'a pas été généré une première fois ;
  // une fois affiché, il se met à jour en direct si l'apprenant ajuste.
  const bilan = React.useMemo(() => {
    const totalWeight = competences.reduce((acc, _, i) => acc + (picked[i] ?? 0), 0);
    const denom = Math.max(1, competences.length) * maxLevel;
    const pct = Math.round((totalWeight / denom) * 100);
    const acquis: number[] = [];
    const enProgres: number[] = [];
    const pasEncore: number[] = [];
    competences.forEach((_, i) => {
      const lvl = picked[i];
      if (lvl == null || lvl === 0) pasEncore.push(i);
      else if (lvl >= maxLevel) acquis.push(i);
      else enProgres.push(i);
    });
    const collectifs = competences
      .map((_, i) => i)
      .filter((i) => reinforce[i]);
    // L'engagement d'action cible la compétence personnelle la plus fragile.
    const priorityIdx =
      pasEncore[0] ?? enProgres[0] ?? null;
    return { pct, acquis, enProgres, pasEncore, collectifs, priorityIdx };
  }, [competences, picked, reinforce, maxLevel]);

  // Persistance Supabase (production privée, migration 032) : ré-hydratation +
  // sauvegarde différée ; le formateur du cours voit l'auto-évaluation des
  // participants. courseId passé en prop (rendu hors SeminaireActivityProvider).
  const refl = useReflectionSync<{
    picked: Record<number, number>;
    reinforce: Record<number, boolean>;
  }>("final-self-evaluation", "selfeval", courseId);
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (hydrated.current || !refl.loaded) return;
    hydrated.current = true;
    if (refl.own) {
      setPicked(refl.own.picked ?? {});
      setReinforce(refl.own.reinforce ?? {});
    }
  }, [refl.loaded, refl.own]);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (Object.keys(picked).length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => refl.save({ picked, reinforce }), 1000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [picked, reinforce, refl.save]);

  function levelName(i: number): string {
    const lvl = picked[i];
    return lvl != null ? levels[lvl] : "Non évalué";
  }

  function buildText(): string {
    // Date calculée au clic (handler) — sans risque d'hydratation SSR.
    const reportDate = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const lines: string[] = [];
    lines.push("AUTO-ÉVALUATION FINALE — Communication éducative et pastorale");
    lines.push(`Participant : ${app.user.displayName}`);
    lines.push(`Date : ${reportDate}`);
    lines.push(`Maturité déclarée : ${bilan.pct}% — ${maturityLabelPersonnel(bilan.pct)}`);
    lines.push("");
    lines.push("NIVEAUX DÉCLARÉS");
    competences.forEach((c, i) => {
      lines.push(`  • ${c} → ${levelName(i)}${reinforce[i] ? ` [${reinforceLabel}]` : ""}`);
    });
    lines.push("");
    if (bilan.acquis.length > 0) {
      lines.push("FORCES (compétences acquises)");
      bilan.acquis.forEach((i) => lines.push(`  + ${competences[i]}`));
      lines.push("");
    }
    const aTravailler = [...bilan.pasEncore, ...bilan.enProgres];
    if (aTravailler.length > 0) {
      lines.push("PRIORITÉS PERSONNELLES");
      aTravailler.forEach((i) => lines.push(`  - ${competences[i]} (${levelName(i)})`));
      lines.push("");
    }
    if (bilan.collectifs.length > 0) {
      lines.push("À PORTER COLLECTIVEMENT (renforcer dans l'équipe)");
      bilan.collectifs.forEach((i) => lines.push(`  → ${competences[i]}`));
      lines.push("");
    }
    if (bilan.priorityIdx != null) {
      lines.push("ENGAGEMENT D'ACTION (30 prochains jours)");
      lines.push(
        `  Je m'engage à progresser sur : « ${competences[bilan.priorityIdx]} »`,
      );
      lines.push("");
    }
    return lines.join("\n");
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(buildText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ew-purple-200 bg-ew-purple-50/40 px-4 py-3 text-sm">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-purple-700">
          <ClipboardCheck aria-hidden className="h-4 w-4" /> Durée : {durationMin} minutes
        </p>
        <p className="mt-1 text-foreground/90">
          <strong>Objectif :</strong> {objective}
        </p>
        <p className="mt-1 text-xs italic text-muted-foreground">
          Pour chaque compétence, cochez votre niveau.
          {hasReinforce
            ? ` Signalez aussi celles que vous jugez « ${reinforceLabel!.toLowerCase()} » : ce sont les compétences à porter collectivement dans votre établissement.`
            : ""}
        </p>
      </div>

      {/* Grille */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-ew-green-50 text-ew-green-800">
            <tr>
              <th className="border-b border-border px-3 py-2 text-left font-bold">Compétence</th>
              {levels.map((lvl) => (
                <th key={lvl} className="border-b border-border px-2 py-2 text-center font-bold">
                  {lvl}
                </th>
              ))}
              {hasReinforce ? (
                <th className="border-b border-border px-2 py-2 text-center font-bold text-ew-purple-700">
                  {reinforceLabel}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {competences.map((c, i) => {
              const rowName = `selfeval-${i}`;
              const done = picked[i] != null;
              return (
                <tr
                  key={i}
                  className={cn(
                    "border-t border-border align-top",
                    done ? "bg-background" : "bg-ew-gold-50/30",
                  )}
                >
                  <td className="px-3 py-2.5">
                    <span className="font-medium text-foreground">{c}</span>
                  </td>
                  {levels.map((lvl, j) => (
                    <td key={j} className="px-2 py-2.5 text-center">
                      <input
                        type="radio"
                        name={rowName}
                        aria-label={`${c} — ${lvl}`}
                        checked={picked[i] === j}
                        onChange={() => setPicked((p) => ({ ...p, [i]: j }))}
                        className="h-4 w-4 accent-ew-green-700"
                      />
                    </td>
                  ))}
                  {hasReinforce ? (
                    <td className="px-2 py-2.5 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${c} — ${reinforceLabel}`}
                        checked={!!reinforce[i]}
                        onChange={() => setReinforce((r) => ({ ...r, [i]: !r[i] }))}
                        className="h-4 w-4 accent-ew-purple-600"
                      />
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => setShown(true)}
          disabled={!allAnswered}
          title={!allAnswered ? "Évaluez toutes les compétences pour générer le bilan." : undefined}
        >
          <Sparkles aria-hidden className="mr-1.5 h-4 w-4" /> Générer mon bilan
        </Button>
        <span className="text-xs italic text-muted-foreground">
          {answered}/{competences.length} compétence{answered > 1 ? "s" : ""} évaluée{answered > 1 ? "s" : ""}
        </span>
      </div>

      {shown ? (
        <FinalSelfEvaluationBilan
          competences={competences}
          levels={levels}
          reinforceLabel={reinforceLabel}
          picked={picked}
          reinforce={reinforce}
          bilan={bilan}
          onCopy={copyReport}
          copied={copied}
        />
      ) : null}

      {refl.canReview ? (
        <ReflectionFacilitatorPanel<{
          picked: Record<number, number>;
          reinforce: Record<number, boolean>;
        }>
          title="Auto-évaluation"
          others={refl.others}
          onRefresh={refl.refresh}
          render={(p) => {
            const tw = competences.reduce(
              (acc, _, i) => acc + (p.picked?.[i] ?? 0),
              0,
            );
            const denom = Math.max(1, competences.length) * maxLevel;
            const pct = Math.round((tw / denom) * 100);
            const ans = Object.keys(p.picked ?? {}).length;
            return (
              <p>
                Niveau global : <strong>{pct}%</strong> · {ans}/
                {competences.length} compétence{competences.length > 1 ? "s" : ""}{" "}
                évaluée{competences.length > 1 ? "s" : ""}
              </p>
            );
          }}
        />
      ) : null}
    </div>
  );
}

function FinalSelfEvaluationBilan({
  competences,
  levels,
  reinforceLabel,
  picked,
  reinforce,
  bilan,
  onCopy,
  copied,
}: {
  competences: string[];
  levels: string[];
  reinforceLabel?: string;
  picked: Record<number, number>;
  reinforce: Record<number, boolean>;
  bilan: {
    pct: number;
    acquis: number[];
    enProgres: number[];
    pasEncore: number[];
    collectifs: number[];
    priorityIdx: number | null;
  };
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ew-purple-200 bg-ew-purple-50/60 p-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-purple-700">
          <Sparkles aria-hidden className="h-4 w-4" /> Bilan de votre auto-évaluation
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          <Copy aria-hidden className="mr-1.5 h-3.5 w-3.5" />
          {copied ? "Copié" : "Copier le bilan"}
        </Button>
      </div>

      <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
        {/* Maturité */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wide text-ew-green-700">
              Maturité déclarée
            </span>
            <span className="font-mono font-bold text-ew-green-800">{bilan.pct}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted/50" aria-hidden>
            <div
              className="h-full bg-ew-green-600 transition-all duration-500"
              style={{ width: `${bilan.pct}%` }}
            />
          </div>
          <p className="mt-1 text-xs italic text-muted-foreground">{maturityLabelPersonnel(bilan.pct)}</p>
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-ew-green-200 bg-ew-green-50 px-2 py-1.5">
            <p className="font-display text-lg font-extrabold text-ew-green-800">{bilan.acquis.length}</p>
            <p className="text-[11px] uppercase tracking-wide text-ew-green-700">{levels[levels.length - 1]}</p>
          </div>
          <div className="rounded-lg border border-ew-gold-200 bg-ew-gold-50 px-2 py-1.5">
            <p className="font-display text-lg font-extrabold text-ew-gold-700">{bilan.enProgres.length}</p>
            <p className="text-[11px] uppercase tracking-wide text-ew-gold-700">{levels[1] ?? "En progrès"}</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-2 py-1.5">
            <p className="font-display text-lg font-extrabold text-muted-foreground">{bilan.pasEncore.length}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{levels[0]}</p>
          </div>
        </div>

        {/* Forces */}
        {bilan.acquis.length > 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
              Vos forces ({bilan.acquis.length})
            </p>
            <ul className="mt-1 space-y-1">
              {bilan.acquis.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-600" />
                  <span>{competences[i]}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Priorités personnelles */}
        {bilan.pasEncore.length + bilan.enProgres.length > 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ew-gold-700">
              Priorités personnelles à travailler
            </p>
            <ul className="mt-1 space-y-1">
              {[...bilan.pasEncore, ...bilan.enProgres].map((i) => (
                <li key={i} className="rounded-md border-l-2 border-ew-gold-400 bg-card/80 px-2 py-1">
                  {competences[i]}{" "}
                  <span className="text-[11px] italic text-muted-foreground">
                    ({picked[i] != null ? levels[picked[i]] : levels[0]})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* À porter collectivement */}
        {bilan.collectifs.length > 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ew-purple-700">
              À porter collectivement — {reinforceLabel}
            </p>
            <ul className="mt-1 space-y-1">
              {bilan.collectifs.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Users aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ew-purple-600" />
                  <span>{competences[i]}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Engagement d'action */}
        {bilan.priorityIdx != null ? (
          <div className="rounded-md border-l-4 border-ew-green-500 bg-card px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
              Engagement d'action — 30 prochains jours
            </p>
            <p className="mt-1">
              Je m'engage à progresser sur :{" "}
              <strong className="text-ew-green-900">« {competences[bilan.priorityIdx]} »</strong>
            </p>
            <p className="mt-1 text-xs italic text-muted-foreground">
              Fixez une première action concrète cette semaine et une date de revue à 30 jours.
            </p>
          </div>
        ) : (
          <p className="rounded-md border-l-4 border-ew-green-500 bg-ew-green-50 px-3 py-2 text-sm">
            <strong className="text-ew-green-800">Toutes les compétences sont acquises.</strong>{" "}
            Engagez-vous à accompagner un collègue sur l'une d'elles dans les 30 prochains jours.
          </p>
        )}
      </div>
    </div>
  );
}

export function CommRapideCard({ seminaire }: { seminaire: CommSeminaire }) {
  return (
    <div className="rounded-2xl border border-ew-green-200 bg-ew-green-50/40 p-5">
      <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
        <Eye aria-hidden className="h-4 w-4" /> Méthode RAPIDE — boussole quotidienne
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {(seminaire.rapide ?? []).map((r) => {
          // « Réel — le fait est-il vrai et vérifié ? » : isoler le mot-clé
          // (avant le tiret cadratin) pour le mettre en gras.
          const dashIdx = r.label.indexOf(" — ");
          const keyword = dashIdx >= 0 ? r.label.slice(0, dashIdx) : r.label;
          const rest = dashIdx >= 0 ? r.label.slice(dashIdx) : "";
          return (
            <li key={r.letter} className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ew-green-700 font-display text-sm font-extrabold text-white"
              >
                {r.letter}
              </span>
              <span className="text-sm">
                <strong className="font-bold text-ew-green-900">{keyword}</strong>
                {rest}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CommFourVCard({ seminaire }: { seminaire: CommSeminaire }) {
  return (
    <div className="rounded-2xl border border-ew-purple-200 bg-ew-purple-50 p-5">
      <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-purple-700">
        <MessageSquare aria-hidden className="h-4 w-4" /> Règle des 4V — avant toute publication par IA
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {(seminaire.fourV ?? []).map((v, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ew-purple-500 font-display text-sm font-extrabold text-white"
            >
              {v.letter}
            </span>
            <div>
              <p className="font-display text-sm font-bold text-ew-purple-700">{v.label}</p>
              <p className="text-xs text-foreground/80">{v.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
