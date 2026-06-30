"use client";

import * as React from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Chronomètre de test (compteur croissant mm:ss).
 *
 * - démarre/continue tant que `running` est vrai (déclenché dès le début du test) ;
 * - se fige dès que `running` passe à faux (test terminé / toutes les questions
 *   vérifiées) ;
 * - se remet à zéro quand `resetKey` change (bouton « Recommencer ») ;
 * - notifie le temps final via `onElapsed(seconds)` à l'arrêt.
 *
 * Styles ≥ 13px garantis par le scope `.formation-reader`.
 */
export function TestTimer({
  running,
  resetKey,
  onElapsed,
  className,
}: {
  running: boolean;
  resetKey?: string | number;
  onElapsed?: (seconds: number) => void;
  className?: string;
}) {
  const [seconds, setSeconds] = React.useState(0);

  // Remise à zéro quand le test redémarre.
  React.useEffect(() => {
    setSeconds(0);
  }, [resetKey]);

  // Tic à la seconde tant que le test tourne.
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Notifie le temps final au passage running true → false.
  const secondsRef = React.useRef(seconds);
  React.useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);
  const onElapsedRef = React.useRef(onElapsed);
  React.useEffect(() => {
    onElapsedRef.current = onElapsed;
  }, [onElapsed]);
  const prevRunning = React.useRef(running);
  React.useEffect(() => {
    if (prevRunning.current && !running) onElapsedRef.current?.(secondsRef.current);
    prevRunning.current = running;
  }, [running]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold tabular-nums",
        running
          ? "border-ew-green-300 bg-ew-green-50 text-ew-green-700"
          : "border-border bg-card text-muted-foreground",
        className,
      )}
      title={running ? "Temps écoulé (en cours)" : "Temps final"}
    >
      <Timer aria-hidden className={cn("h-4 w-4", running && "animate-pulse")} />
      <span aria-label="Temps écoulé">{format(seconds)}</span>
    </span>
  );
}
