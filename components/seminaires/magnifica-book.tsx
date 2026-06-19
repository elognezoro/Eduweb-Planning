"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ListTree, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================================
   MagnificaBook — visionneuse de séminaire en mode livre.
   - Une page = un noeud React (identité, objectifs, module, quiz, charte…)
   - Navigation : Précédent / Suivant, raccourcis clavier ← →, swipe tactile
   - Table des matières (chips cliquables) + barre de progression
   - Plein écran via F ou bouton dédié
   - Animation de tournage de page (fade + translation)
   ========================================================================== */

export interface BookPage {
  /** Identifiant stable (slug). */
  id: string;
  /** Catégorie pour l'icône / la couleur. */
  category:
    | "identity"
    | "objectives"
    | "architecture"
    | "module"
    | "quiz"
    | "charte"
    | "evaluation"
    | "glossary"
    | "closing"
    | "presentation"
    | "slides"
    | "methods"
    | "workshops"
    | "schedule"
    | "landmarks";
  /** Titre court affiché dans la TOC (chips). */
  shortTitle: string;
  /** Titre long affiché en haut de la page. */
  title: string;
  /** Sous-titre / mention. */
  subtitle?: string;
  /** Contenu de la page. */
  content: React.ReactNode;
}

export function MagnificaBook({ pages }: { pages: BookPage[] }) {
  const [idx, setIdx] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);
  // Le pied (bandeau prev/next + sommaire) est rétractable. En plein écran,
  // il est replié par défaut pour libérer toute la place à la diapositive ;
  // l'utilisateur peut le faire réapparaître via le bouton « Sommaire ».
  const [showFooter, setShowFooter] = React.useState(true);
  React.useEffect(() => {
    setShowFooter(!fullscreen);
  }, [fullscreen]);
  const [direction, setDirection] = React.useState<"next" | "prev">("next");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pageRef = React.useRef<HTMLDivElement>(null);

  const total = pages.length;
  const page = pages[idx];

  const goPrev = React.useCallback(() => {
    setDirection("prev");
    setIdx((i) => Math.max(0, i - 1));
  }, []);
  const goNext = React.useCallback(() => {
    setDirection("next");
    setIdx((i) => Math.min(total - 1, i + 1));
  }, [total]);
  const goTo = React.useCallback(
    (i: number) => {
      setDirection(i >= idx ? "next" : "prev");
      setIdx(Math.max(0, Math.min(total - 1, i)));
    },
    [idx, total],
  );

  // Au changement de page : (1) remettre le scroll interne du livre en haut,
  // (2) faire défiler la fenêtre pour amener le haut du livre (titre de la
  // page) dans la zone visible, (3) restaurer le focus sans déclencher un
  // saut de scroll supplémentaire.
  React.useEffect(() => {
    pageRef.current?.scrollTo?.({ top: 0, behavior: "auto" });
    // Si on n'est pas en plein écran, le livre est inséré dans la page
    // dashboard : on amène son bandeau du haut juste sous le topbar de l'app.
    if (!fullscreen) {
      containerRef.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
    }
    pageRef.current?.focus({ preventScroll: true });
  }, [idx, fullscreen]);

  // Navigation clavier — seulement quand le livre est en plein écran ou
  // que le focus est à l'intérieur (les boutons / la zone de contenu).
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
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setFullscreen((v) => !v);
      } else if (e.key === "Escape" && fullscreen) {
        setFullscreen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, goPrev, goNext, goTo, total]);

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

  const progress = ((idx + 1) / total) * 100;

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative",
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-ew-green-50/95 backdrop-blur"
          : "rounded-2xl border border-border bg-card",
      )}
      aria-label="Livre du séminaire — naviguer page par page"
    >
      {/* Bandeau : numéro de page, titre, navigation rapide, plein écran */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs">
          <ListTree aria-hidden className="h-4 w-4 text-ew-green-700" />
          <span className="font-mono font-bold text-ew-green-700">
            Page {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span className="hidden text-muted-foreground sm:inline">— {page?.shortTitle}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goPrev}
            disabled={idx === 0}
            aria-label="Page précédente"
            className="flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-bold disabled:opacity-50 hover:bg-muted/40"
            title="Page précédente (←)"
          >
            <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Précédente</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={idx === total - 1}
            aria-label="Page suivante"
            className="flex items-center gap-1 rounded-md bg-ew-green-700 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-50"
            title="Page suivante (→)"
          >
            <span className="hidden sm:inline">Page suivante</span>
            <span className="sm:hidden">Suivante</span>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={showFooter ? "Replier le sommaire" : "Afficher le sommaire"}
            aria-pressed={showFooter}
            onClick={() => setShowFooter((v) => !v)}
            className={cn(
              "ml-1 flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-wide hover:bg-muted/40",
              showFooter
                ? "border-border bg-card text-muted-foreground"
                : "border-ew-green-300 bg-ew-green-50 text-ew-green-800",
            )}
            title="Plier / déplier le sommaire et la navigation du pied"
          >
            <ListTree aria-hidden className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sommaire</span>
          </button>
          <button
            type="button"
            aria-label={fullscreen ? "Quitter le mode plein écran" : "Afficher en plein écran"}
            aria-pressed={fullscreen}
            onClick={() => setFullscreen((v) => !v)}
            className="ml-1 flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground hover:bg-muted/40"
            title="Plein écran (F)"
          >
            {fullscreen ? (
              <Minimize2 aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 aria-hidden className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{fullscreen ? "Réduire" : "Plein écran"}</span>
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

      {/* Page */}
      <div
        ref={pageRef}
        tabIndex={0}
        className={cn(
          "relative flex-1 overflow-y-auto outline-none",
          fullscreen ? "px-6 py-8 sm:px-10 sm:py-12" : "p-5 sm:p-8",
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <article
          key={page?.id}
          className={cn(
            "mx-auto max-w-4xl",
            direction === "next" ? "book-page-enter-next" : "book-page-enter-prev",
          )}
        >
          {page ? (
            <>
              <header className="mb-5">
                <p className="font-display text-[12px] font-bold uppercase tracking-[0.18em] text-ew-gold-600">
                  Page {String(page.category === "identity" ? 1 : idx + 1).padStart(2, "0")} ·{" "}
                  {categoryLabel(page.category)}
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight text-ew-green-900 sm:text-3xl">
                  {page.title}
                </h2>
                {page.subtitle ? (
                  <p className="mt-1 text-sm italic text-muted-foreground">{page.subtitle}</p>
                ) : null}
              </header>
              {page.content}
            </>
          ) : null}
        </article>
      </div>

      {/* Pied : précédent / suivant + table des matières.
          Repliable via le bouton « Sommaire » de la barre du haut, et
          automatiquement replié en mode plein écran pour libérer toute la
          place au contenu de la page (utile pour les diapositives SENEC). */}
      <div className={cn("border-t border-border bg-muted/20", !showFooter && "hidden")}>
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={idx === 0}
            aria-label="Page précédente"
            className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold disabled:opacity-50 hover:bg-muted/40"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" /> Page précédente
          </button>
          <p className="hidden text-[11px] italic text-muted-foreground sm:block">
            Tournez les pages avec ← → ou cliquez sur le sommaire ci-dessous.
          </p>
          <button
            type="button"
            onClick={goNext}
            disabled={idx === total - 1}
            aria-label="Page suivante"
            className="flex items-center gap-1 rounded-md bg-ew-green-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Page suivante <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <div className="border-t border-border bg-card">
          <div
            className="flex gap-1 overflow-x-auto px-3 py-2"
            role="tablist"
            aria-label="Sommaire du livre"
          >
            {pages.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === idx}
                aria-label={`Aller à la page ${i + 1} — ${p.shortTitle}`}
                onClick={() => goTo(i)}
                className={cn(
                  "min-w-[120px] max-w-[180px] shrink-0 rounded-md border px-2 py-1.5 text-left text-[10px] transition-all",
                  i === idx
                    ? "border-ew-green-600 bg-ew-green-50 text-ew-green-900"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40",
                )}
              >
                <p className="font-mono font-bold">#{String(i + 1).padStart(2, "0")}</p>
                <p className="line-clamp-2">{p.shortTitle}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function categoryLabel(c: BookPage["category"]): string {
  switch (c) {
    case "identity":
      return "Présentation du séminaire";
    case "objectives":
      return "Objectifs et compétences";
    case "architecture":
      return "Architecture pédagogique";
    case "module":
      return "Module";
    case "quiz":
      return "Quiz sommatif";
    case "charte":
      return "Charte d'usage responsable";
    case "evaluation":
      return "Évaluation";
    case "glossary":
      return "Glossaire";
    case "closing":
      return "Message de clôture";
    case "presentation":
      return "Présentation";
    case "slides":
      return "Diapositives";
    case "methods":
      return "Méthodes";
    case "workshops":
      return "Ateliers interactifs";
    case "schedule":
      return "Déroulé";
    case "landmarks":
      return "Repères et synthèse";
  }
}
