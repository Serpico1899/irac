import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./config/i18n.config";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always prefix routes with locale
  localePrefix: "always",
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
