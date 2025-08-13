import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./config/i18n.config";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use a locale prefix for all routes
  localePrefix: "always",
});

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Next.js internal files (_next)
  // - Static files (images, favicon, etc.)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};
