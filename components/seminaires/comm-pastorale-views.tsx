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
  Clock,
  Compass,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  MessageSquare,
  Sparkles,
  StickyNote,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
          alt="Séminaire SENEC — Communication éducative et pastorale"
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

/* -------- Rendu d'une slide selon son layout -------- */
function SlideView({ slide }: { slide: CommSlide | undefined }) {
  if (!slide) return null;
  const isCover = slide.layout === "cover";
  const isClosing = slide.layout === "closing";

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
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ew-green-700">
            Diapositive {String(slide.num).padStart(2, "0")}
          </p>
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
export function ActivityList({ activities }: { activities: CommSeminaireActivity[] }) {
  // Accordéon exclusif : un seul atelier ouvert à la fois. Le précédent se
  // ferme automatiquement quand l'apprenant en ouvre un autre.
  const [openId, setOpenId] = React.useState<string | null>(null);
  return (
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
        {a.instructions.map((ins, i) => (
          <p key={i} className="mb-2">
            {ins}
          </p>
        ))}

        {a.kind === "qcm" || a.kind === "scenario" ? (
          a.qcm ? <InteractiveQcm questions={a.qcm} idPrefix={a.id} /> : null
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
}: {
  questions: { question: string; options: string[]; correctIdx: number; rationale?: string }[];
  idPrefix: string;
}) {
  const [answers, setAnswers] = React.useState<Record<number, number | null>>({});
  const [checked, setChecked] = React.useState(false);
  const helpId = `${idPrefix}-help`;
  const answered = Object.keys(answers).length;
  const score = React.useMemo(
    () => questions.reduce((acc, q, i) => (answers[i] === q.correctIdx ? acc + 1 : acc), 0),
    [answers, questions],
  );

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={i} className="rounded-md border border-border p-3">
          <p className="text-sm font-bold" id={`${idPrefix}-q${i}`}>
            Q{i + 1}. {q.question}
          </p>
          <div className="mt-2 space-y-1" role="radiogroup" aria-labelledby={`${idPrefix}-q${i}`}>
            {q.options.map((o, j) => {
              const isPicked = answers[i] === j;
              const isCorrect = checked && j === q.correctIdx;
              const isWrong = checked && isPicked && j !== q.correctIdx;
              return (
                <label
                  key={j}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                    !checked && isPicked && "border-ew-green-500 bg-ew-green-50",
                    isCorrect && "border-ew-green-600 bg-ew-green-100",
                    isWrong && "border-red-500 bg-red-50",
                    !checked && !isPicked && "border-border",
                  )}
                >
                  <input
                    type="radio"
                    name={`${idPrefix}-q${i}`}
                    checked={isPicked}
                    onChange={() => setAnswers((a) => ({ ...a, [i]: j }))}
                    disabled={checked}
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
          {checked && q.rationale ? (
            <p className="mt-1.5 rounded-md bg-muted/40 px-2 py-1 text-[11px] italic">
              {q.rationale}
            </p>
          ) : null}
        </div>
      ))}
      <div className="flex items-center justify-between">
        <p id={helpId} className="text-xs text-muted-foreground">
          {checked ? (
            <>
              Score : <strong>{score}/{questions.length}</strong> (
              {Math.round((score / questions.length) * 100)} %)
            </>
          ) : (
            <>
              {answered}/{questions.length} questions répondues.
            </>
          )}
        </p>
        {checked ? (
          <button
            onClick={() => {
              setChecked(false);
              setAnswers({});
            }}
            className="rounded-md border border-border bg-card px-3 py-1 text-xs font-bold hover:bg-muted/40"
          >
            Recommencer
          </button>
        ) : (
          <button
            onClick={() => setChecked(true)}
            disabled={answered < questions.length}
            aria-describedby={helpId}
            title={answered < questions.length ? "Répondez à toutes les questions pour vérifier." : undefined}
            className="rounded-md bg-ew-green-700 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
          >
            Vérifier
          </button>
        )}
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
  const score = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((score / items.length) * 100);

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

/* -------- Check-list RAPIDE (6 critères à cocher) -------- */
function RapidChecklist({
  items,
  idPrefix,
}: {
  items: { label: string; helper?: string }[];
  idPrefix: string;
}) {
  const [checked, setChecked] = React.useState<Record<number, boolean>>({});
  const score = Object.values(checked).filter(Boolean).length;
  return (
    <div className="space-y-2">
      <p className="text-xs italic text-muted-foreground">
        Cochez chaque critère vérifié. Le feu vert s&apos;allume seulement si les 6 critères sont au vert.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((it, i) => {
          const c = !!checked[i];
          return (
            <li key={i}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm transition-colors",
                  c
                    ? "border-ew-green-500 bg-ew-green-50"
                    : "border-border bg-background/60 hover:bg-muted/20",
                )}
              >
                <input
                  type="checkbox"
                  checked={c}
                  onChange={() => setChecked((p) => ({ ...p, [i]: !p[i] }))}
                  className="mt-0.5 accent-ew-green-700"
                />
                <div className="flex-1">
                  <p className={cn("font-display font-bold", c ? "text-ew-green-800" : "text-foreground")}>
                    {it.label}
                  </p>
                  {it.helper ? <p className="text-[11px] italic text-muted-foreground">{it.helper}</p> : null}
                </div>
                {c ? (
                  <CheckCircle2 aria-hidden className="h-5 w-5 text-ew-green-600" />
                ) : (
                  <span aria-hidden className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
                )}
              </label>
            </li>
          );
        })}
      </ul>
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border p-3 text-sm font-medium",
          score === items.length
            ? "border-ew-green-500 bg-ew-green-100 text-ew-green-900"
            : "border-ew-gold-500 bg-ew-gold-50 text-foreground",
        )}
        aria-live="polite"
      >
        {score === items.length ? (
          <>
            <CheckCircle2 aria-hidden className="h-5 w-5" />
            <span>
              <strong>Feu vert :</strong> publication autorisée selon RAPIDE.
            </span>
          </>
        ) : (
          <>
            <AlertTriangle aria-hidden className="h-5 w-5 text-ew-gold-700" />
            <span>
              {score}/{items.length} critères validés — corrigez avant publication.
            </span>
          </>
        )}
      </div>
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
  function copy() {
    const text = items
      .map((it, i) => `${it.label} :\n${values[i] || "…"}\n`)
      .join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }
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
      <button
        type="button"
        onClick={copy}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-muted/40"
      >
        Copier mon engagement
      </button>
    </div>
  );
}

/* -------- Matrice / plan (tableaux saisissables) -------- */
function FillableMatrix({
  headers,
  rowLabels,
  idPrefix,
}: {
  headers: string[];
  rowLabels: string[];
  idPrefix: string;
}) {
  // 1re colonne = label en lecture seule, autres colonnes = textarea
  const [cells, setCells] = React.useState<Record<string, string>>({});
  function key(r: number, c: number) {
    return `${r}-${c}`;
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
                        onChange={(e) =>
                          setCells((cs) => ({ ...cs, [key(r, c)]: e.target.value }))
                        }
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
    </div>
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

export function CommRapideCard({ seminaire }: { seminaire: CommSeminaire }) {
  return (
    <div className="rounded-2xl border border-ew-green-200 bg-ew-green-50/40 p-5">
      <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
        <Eye aria-hidden className="h-4 w-4" /> Méthode RAPIDE — boussole quotidienne
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {seminaire.rapide.map((r) => {
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
        {seminaire.fourV.map((v, i) => (
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
