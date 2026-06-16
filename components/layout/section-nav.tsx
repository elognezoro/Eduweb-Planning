"use client";

import * as React from "react";
import { List, ChevronUp, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionItem {
  id: string;
  label: string;
}

/**
 * Sommaire de page : boutons « Aller à » qui défilent en douceur vers chaque bloc.
 * Les blocs cibles doivent porter l'`id` correspondant (et idéalement `scroll-mt-24`).
 */
export function SectionNav({ sections, className }: { sections: SectionItem[]; className?: string }) {
  if (!sections?.length) return null;

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Sommaire de la page"
      className={cn("flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm", className)}
    >
      <span className="flex items-center gap-1.5 pr-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        <List className="h-3.5 w-3.5" /> Aller à
      </span>
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => go(s.id)}
          className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-ew-green-600 hover:bg-ew-green-50 hover:text-ew-green-700"
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}

/**
 * Navigateur flottant de blocs : visible dès qu'on dépasse le premier bloc.
 * Permet d'aller au bloc précédent / suivant, ou de sauter directement à un
 * bloc via le menu (un seul clic).
 */
export function FloatingSectionNav({ sections }: { sections: SectionItem[] }) {
  const [active, setActive] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Suit le défilement : bloc actif = dernier bloc dont le haut est passé au-dessus
  // du tiers supérieur de l'écran ; visible dès que le 1er bloc est dépassé.
  React.useEffect(() => {
    const onScroll = () => {
      const probe = window.innerHeight * 0.35;
      let idx = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= probe) idx = i;
      });
      setActive(idx);
      const first = document.getElementById(sections[0]?.id ?? "");
      const firstTop = first ? first.getBoundingClientRect().top : Infinity;
      setVisible(idx > 0 || firstTop < 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  // Ferme le menu au clic extérieur / Échap.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (!sections?.length) return null;

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };
  const prev = () => active > 0 && go(sections[active - 1].id);
  const next = () => active < sections.length - 1 && go(sections[active + 1].id);

  return (
    <div
      ref={ref}
      className={cn(
        "no-print fixed bottom-6 right-4 z-50 transition-all duration-300 sm:right-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      {menuOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-60 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
          <p className="border-b border-border bg-muted/50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Aller au bloc…
          </p>
          <ul className="max-h-64 overflow-y-auto p-1">
            {sections.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                    i === active ? "font-bold text-ew-green-700" : "text-foreground",
                  )}
                >
                  {s.label}
                  {i === active && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-lg">
        <button
          type="button"
          onClick={prev}
          disabled={active === 0}
          aria-label="Bloc précédent"
          title={active > 0 ? `Bloc précédent : ${sections[active - 1].label}` : "Premier bloc"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-ew-green-50 hover:text-ew-green-700 disabled:opacity-35 disabled:hover:bg-transparent"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Choisir un bloc"
          aria-expanded={menuOpen}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
            menuOpen ? "bg-ew-green-700 text-white" : "bg-ew-green-100 text-ew-green-800 hover:bg-ew-green-700 hover:text-white",
          )}
        >
          <List className="h-4 w-4" />
          <span className="hidden max-w-[120px] truncate sm:block">{sections[active]?.label}</span>
        </button>
        <button
          type="button"
          onClick={next}
          disabled={active >= sections.length - 1}
          aria-label="Bloc suivant"
          title={active < sections.length - 1 ? `Bloc suivant : ${sections[active + 1].label}` : "Dernier bloc"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-ew-green-50 hover:text-ew-green-700 disabled:opacity-35 disabled:hover:bg-transparent"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
