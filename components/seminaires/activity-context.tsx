"use client";

import * as React from "react";

/**
 * Contexte fournissant l'identité du cours et du module dans lequel une
 * activité est rendue. Utilisé par les activités interactives (sondage,
 * forum) pour persister les réponses et messages au bon emplacement.
 */
export interface SeminaireActivityContextValue {
  courseId: string;
  moduleId: string;
}

const Ctx = React.createContext<SeminaireActivityContextValue | null>(null);

export function SeminaireActivityProvider({
  value,
  children,
}: {
  value: SeminaireActivityContextValue;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Retourne l'identité du cours/module courant si disponible, sinon `null`. */
export function useSeminaireActivityContext(): SeminaireActivityContextValue | null {
  return React.useContext(Ctx);
}
