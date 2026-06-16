/**
 * Tokens de thème EduWeb Planner — vert bouteille institutionnel + or.
 * Sert de source pour le ThemeCustomizer (page Design & thème) et les exports.
 */

export const EW_COLORS = {
  green950: "#062c1b",
  green900: "#0b3b25",
  green800: "#105234",
  green700: "#176b45",
  green600: "#218552",
  green100: "#dff4e9",
  green50: "#f0fbf5",
  gold600: "#d99a1e",
  gold500: "#eba52a",
  gold100: "#fff1cc",
  blue600: "#2563eb",
  red600: "#dc2626",
  orange600: "#ea580c",
  purple600: "#7c3aed",
  background: "#f7f6f1",
  card: "#ffffff",
  border: "#e6e2d8",
  muted: "#6b7280",
  text: "#17231d",
} as const;

/** Palette de séries pour les graphiques Recharts (cohérente avec la charte). */
export const CHART_COLORS = [
  "#176b45",
  "#218552",
  "#d99a1e",
  "#2563eb",
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#65a30d",
];

export type ThemeDensity = "comfortable" | "compact";

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  radius: number; // px
  density: ThemeDensity;
  logoUrl?: string | null;
}

export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: EW_COLORS.green700,
  secondaryColor: EW_COLORS.gold500,
  radius: 18,
  density: "comfortable",
  logoUrl: null,
};
