import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// Configuration for next-intl middleware
const intlMiddleware = createMiddleware({
  locales: ["en", "fa"],
  defaultLocale: "fa",
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle root path redirect to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/fa", request.url));
  }

  // Apply internationalization middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
