import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Define supported locales
export type Locale = "en" | "fa";

// This is used by Next.js to configure next-intl
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale parameter exists and is valid
  if (!locale || typeof locale !== "string") {
    notFound();
  }

  // Only allow our supported locales
  const supportedLocales: Locale[] = ["en", "fa"];
  if (!supportedLocales.includes(locale as Locale)) {
    notFound();
  }

  try {
    const messages = (await import(`./src/i18n/${locale}.json`)).default;

    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    notFound();
  }
});
