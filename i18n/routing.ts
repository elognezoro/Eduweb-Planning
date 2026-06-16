/**
 * Métadonnées de langues supportées (utilisées par le LocaleSwitcher).
 * L'application n'utilise pas de préfixe de locale dans l'URL : la langue est
 * gérée via cookie (voir i18n/request.ts).
 */
export const LOCALES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "fr";
