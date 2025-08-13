import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales, type Locale } from "@/config/i18n.config";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const validatedLocale = locale as Locale;

  try {
    let messages;

    // Import messages based on locale
    if (validatedLocale === "en") {
      messages = (await import("../i18n/en.json")).default;
    } else if (validatedLocale === "fa") {
      messages = (await import("../i18n/fa.json")).default;
    } else {
      notFound();
    }

    return {
      locale: validatedLocale,
      messages,
    };
  } catch (error) {
    console.error(
      `Failed to load messages for locale: ${validatedLocale}`,
      error,
    );
    notFound();
  }
});
