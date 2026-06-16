import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind de manière sûre (gère les conflits).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formate un nombre selon la locale (espaces fines pour les milliers). */
export function formatNumber(value: number, locale = "fr-FR") {
  return new Intl.NumberFormat(locale).format(value);
}

/** Formate un montant monétaire. XOF (FCFA) par défaut, sans décimales. */
export function formatCurrency(amount: number, currency = "XOF", locale = "fr-FR") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${formatNumber(amount, locale)} ${currency}`;
  }
}

/** Formate un pourcentage (valeur déjà en %). */
export function formatPercent(value: number, fractionDigits = 1) {
  return `${value.toFixed(fractionDigits).replace(".", ",")} %`;
}

/** Initiales à partir d'un nom complet, pour les avatars. */
export function initials(name?: string | null) {
  if (!name) return "??";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** Formate une date ISO en format lisible français. */
export function formatDate(value: string | Date, locale = "fr-FR") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Formate une date courte (jj/mm/aaaa). */
export function formatDateShort(value: string | Date, locale = "fr-FR") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Tronque proprement un texte. */
export function truncate(text: string, max = 80) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
