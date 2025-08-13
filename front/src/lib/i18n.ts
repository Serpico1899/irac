import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

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
