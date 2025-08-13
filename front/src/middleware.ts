import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./config/i18n.config";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // The `localePrefix` option is set to `always` to ensure
  // a locale is always part of the URL path.
  localePrefix: "always",
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
