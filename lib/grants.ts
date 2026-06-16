/** Durées d'attribution d'habilitations (partagées entre Habilitations et Niveaux d'accès). */
export const GRANT_DURATIONS = [
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
  { id: "90d", label: "90 jours (trimestre)" },
  { id: "year", label: "Fin d'année scolaire" },
  { id: "perm", label: "Permanent (sans limite)" },
] as const;

export type GrantDurationId = (typeof GRANT_DURATIONS)[number]["id"];

export function grantDurationLabel(id: string): string {
  return GRANT_DURATIONS.find((d) => d.id === id)?.label ?? id;
}

/** Date d'expiration ISO pour une durée donnée ; null = sans limite. */
export function computeGrantExpiry(id: string): string | null {
  if (id === "perm") return null;
  const now = new Date();
  if (id === "year") {
    const y = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
    return new Date(y, 6, 31).toISOString();
  }
  const days = id === "7d" ? 7 : id === "90d" ? 90 : 30;
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
