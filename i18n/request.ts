import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const SUPPORTED_LOCALES = ["fr", "en", "ar", "de", "sw", "ru", "zh", "ko"] as const;
export const DEFAULT_LOCALE = "fr";

/**
 * Configuration i18n « sans routing » : la locale est portée par un cookie
 * (NEXT_LOCALE), avec repli sur le français. Aucun segment [locale] dans l'URL,
 * ce qui simplifie l'ensemble des routes tout en restant pleinement traduisible.
 */
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("NEXT_LOCALE")?.value;
  const locale = SUPPORTED_LOCALES.includes(cookieLocale as never)
    ? (cookieLocale as string)
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
