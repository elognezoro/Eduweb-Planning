"use client";

import * as React from "react";

/**
 * État de RÉVÉLATION par question pour les quiz interactifs.
 *
 * Remplace l'ancien booléen GLOBAL `checked`/`revealed` (qui ne dévoilait la
 * correction qu'une fois TOUT répondu) par une révélation INDIVIDUELLE : on peut
 * vérifier la bonne réponse d'une question dès qu'on y a répondu, immédiatement.
 *
 * - `isRevealed(i)` : la question i est-elle vérifiée ?
 * - `revealOne(i)`  : vérifier la question i (feedback immédiat).
 * - `revealAll()`   : tout vérifier d'un coup (bouton global conservé).
 * - `reset()`       : recommencer (efface les révélations).
 * - `allRevealed`   : toutes les questions sont vérifiées (= test terminé) —
 *                     sert à notifier le score final et à figer le chronomètre.
 */
export function useQuizReveal(total: number) {
  const [revealed, setRevealed] = React.useState<Record<number, boolean>>({});

  const revealedCount = React.useMemo(
    () => Object.keys(revealed).filter((k) => revealed[Number(k)]).length,
    [revealed],
  );
  // total === 0 (quiz sans question) → considéré « tout vérifié » pour ne pas
  // laisser tourner un chronomètre indéfiniment.
  const allRevealed = total === 0 ? true : revealedCount >= total;

  const isRevealed = React.useCallback((i: number) => Boolean(revealed[i]), [revealed]);
  const revealOne = React.useCallback(
    (i: number) => setRevealed((r) => (r[i] ? r : { ...r, [i]: true })),
    [],
  );
  const revealAll = React.useCallback(() => {
    setRevealed(() => {
      const all: Record<number, boolean> = {};
      for (let i = 0; i < total; i++) all[i] = true;
      return all;
    });
  }, [total]);
  const reset = React.useCallback(() => setRevealed({}), []);

  return { isRevealed, revealOne, revealAll, reset, allRevealed, revealedCount };
}
