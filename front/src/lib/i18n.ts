import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales, type Locale } from "@/config/i18n.config";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  // Ensure locale is properly typed
  const validatedLocale = locale as Locale;

  return {
    locale: validatedLocale,
    messages: (await import(`../i18n/${validatedLocale}.json`)).default,
  };
});
