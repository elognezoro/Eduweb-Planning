"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Conteneur révélé au défilement : passe en `.is-visible` quand il entre dans
 * le viewport. Tolérant aux pannes : se révèle aussi s'il est déjà visible au
 * montage, si l'IntersectionObserver est indisponible, ou après un court délai
 * de sécurité — le contenu n'est donc jamais bloqué en invisible.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => setVisible(true);

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }
    // Déjà dans le viewport au montage → révéler tout de suite.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      reveal();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    // Filet de sécurité : révéler quoi qu'il arrive (au cas où l'IO ne se déclenche pas).
    const fallback = window.setTimeout(reveal, 1600);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} className={cn("ew-reveal", visible && "is-visible", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
