import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Define supported locales
export type Locale = "en" | "fa";

// Helper function to get language display name
export function getLanguageName(locale: Locale): string {
  const languageNames: Record<Locale, string> = {
    en: "English",
    fa: "فارسی",
  };
  return languageNames[locale];
}

// Helper function to get opposite locale
export function getOppositeLocale(locale: Locale): Locale {
  return locale === "en" ? "fa" : "en";
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale parameter exists and is valid
  if (!locale || typeof locale !== "string") {
    notFound();
  }

  // Only allow our supported locales
  const supportedLocales = ["en", "fa"];
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  try {
    const messages = (await import(`../i18n/${locale}.json`)).default;

    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    notFound();
  }
});
