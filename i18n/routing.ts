/**
 * Métadonnées de langues supportées (utilisées par le LocaleSwitcher).
 * L'application n'utilise pas de préfixe de locale dans l'URL : la langue est
 * gérée via cookie (voir i18n/request.ts).
 */
export const LOCALES = [
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "sw", label: "Kiswahili", flag: "🇹🇿", dir: "ltr" },
  { code: "ru", label: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "zh", label: "中文", flag: "🇨🇳", dir: "ltr" },
  { code: "ko", label: "한국어", flag: "🇰🇷", dir: "ltr" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "fr";

/** Sens d'écriture d'une locale ("rtl" pour l'arabe, "ltr" sinon). */
export function localeDir(code: string): "ltr" | "rtl" {
  return LOCALES.find((l) => l.code === code)?.dir ?? "ltr";
}
