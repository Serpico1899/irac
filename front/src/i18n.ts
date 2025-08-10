import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
const locales = ["fa", "en"];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
    timeZone: "Asia/Tehran",
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      },
      number: {
        precise: {
          maximumFractionDigits: 5,
        },
      },
      list: {
        enumeration: {
          style: "long",
          type: "conjunction",
        },
      },
    },
  };
});
