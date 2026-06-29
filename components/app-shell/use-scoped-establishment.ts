"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";

/**
 * Établissement de PORTÉE D'AFFICHAGE pour les pages cloisonnées.
 *
 * - En aperçu utilisateur (`isImpersonating`) → `currentEstablishmentId` FORCÉ :
 *   l'établissement exact de l'utilisateur simulé (peut être `null` si cet
 *   utilisateur n'est rattaché à aucun établissement → vue volontairement vide).
 * - Sinon → établissement réel de l'admin (`user.etablissementId`) ou `null`.
 *   `null` hors aperçu = AUCUN cloisonnement (l'admin voit tout — ne JAMAIS
 *   sur-restreindre).
 *
 * ⚠️ MASQUE D'AFFICHAGE CLIENT UNIQUEMENT. Le RLS Supabase sert toujours les
 * données sous les droits RÉELS de l'admin (politiques basées sur `auth.uid()`,
 * jamais sur l'aperçu). Ce hook ne fait que faire correspondre la VUE au
 * rôle/établissement simulé — il n'apporte AUCUNE garantie de sécurité serveur.
 */
export function useScopedEstablishmentId(): string | null {
  const app = useApp();
  return app.isImpersonating
    ? app.currentEstablishmentId // forcé (même si null)
    : app.user.etablissementId ?? null; // réel admin, ou null = tout
}

/** Cohorte de portée pendant l'aperçu (`null` hors aperçu = pas de filtre cohorte). */
export function useScopedCohort(): string | null {
  const app = useApp();
  return app.isImpersonating ? app.currentCohort : null;
}

/**
 * Filtre une liste par établissement UNIQUEMENT pendant un aperçu utilisateur.
 *   - hors aperçu → AUCUN masque (statu quo : l'admin garde sa vue complète, les
 *     vrais rôles restent cloisonnés par le RLS serveur). Pas de régression.
 *   - en aperçu d'un utilisateur sans établissement → vue vide (volontaire).
 *   - en aperçu sinon → uniquement les lignes de l'établissement simulé.
 */
export function useScopeByEstablishment<T>(
  rows: T[],
  getEtabId: (row: T) => string | null | undefined,
): T[] {
  const app = useApp();
  const scoped = useScopedEstablishmentId();
  return React.useMemo(() => {
    if (!app.isImpersonating) return rows; // hors aperçu : aucun masque
    if (scoped === null) return []; // simulé sans établissement : rien
    return rows.filter((r) => (getEtabId(r) ?? null) === scoped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, scoped, app.isImpersonating]);
}
