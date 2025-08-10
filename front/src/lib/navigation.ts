import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "./i18n";

// Define the routing configuration
export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Configure locale detection
  localeDetection: true,
});

// Create the navigation utilities
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

// Additional navigation utilities
export function createHref(pathname: string, locale?: string): string {
  const targetLocale = locale || defaultLocale;
  return `/${targetLocale}${pathname}`;
}

export function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (locales.includes(firstSegment as any)) {
    return firstSegment;
  }

  return defaultLocale;
}

export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (locales.includes(firstSegment as any)) {
    return "/" + segments.slice(1).join("/");
  }

  return pathname;
}

export function addLocaleToPathname(pathname: string, locale: string): string {
  const cleanPathname = removeLocaleFromPathname(pathname);
  return `/${locale}${cleanPathname === "/" ? "" : cleanPathname}`;
}

export function switchLocale(
  currentPathname: string,
  newLocale: string,
): string {
  const pathWithoutLocale = removeLocaleFromPathname(currentPathname);
  return addLocaleToPathname(pathWithoutLocale, newLocale);
}

// Utility to get the opposite locale URL
export function getAlternateLocaleUrl(currentPathname: string): string {
  const currentLocale = getLocaleFromPathname(currentPathname);
  const alternateLocale = currentLocale === "fa" ? "en" : "fa";
  return switchLocale(currentPathname, alternateLocale);
}

// Navigation helpers for common routes
export const navigationRoutes = {
  home: "/",
  about: "/about",
  contact: "/contact",
  projects: "/projects",
  research: "/research",
  publications: "/publications",
  login: "/login",
  admin: "/admin",
  user: "/user",
} as const;

export type NavigationRoute = keyof typeof navigationRoutes;

// Utility to check if a route is active
export function isActiveRoute(
  currentPath: string,
  targetRoute: string,
): boolean {
  const cleanCurrentPath = removeLocaleFromPathname(currentPath);
  const cleanTargetRoute = removeLocaleFromPathname(targetRoute);

  if (cleanTargetRoute === "/") {
    return cleanCurrentPath === "/";
  }

  return cleanCurrentPath.startsWith(cleanTargetRoute);
}

// Breadcrumb utilities
export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export function generateBreadcrumbs(
  pathname: string,
  translations: (key: string) => string,
): BreadcrumbItem[] {
  const cleanPath = removeLocaleFromPathname(pathname);
  const segments = cleanPath.split("/").filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: translations("Navigation.home"),
      href: "/",
      isActive: segments.length === 0,
    },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      label: getSegmentLabel(segment, translations),
      href: currentPath,
      isActive: isLast,
    });
  });

  return breadcrumbs;
}

function getSegmentLabel(
  segment: string,
  translations: (key: string) => string,
): string {
  const segmentMap: Record<string, string> = {
    about: translations("Navigation.about"),
    contact: translations("Navigation.contact"),
    projects: translations("Navigation.projects"),
    research: translations("Navigation.research"),
    publications: translations("Navigation.publications"),
    login: translations("Navigation.login"),
    admin: translations("Navigation.dashboard"),
    user: translations("Navigation.profile"),
    "درباره-ما": translations("Navigation.about"),
    تماس: translations("Navigation.contact"),
    "پروژه-ها": translations("Navigation.projects"),
    تحقیقات: translations("Navigation.research"),
    انتشارات: translations("Navigation.publications"),
    ورود: translations("Navigation.login"),
    مدیریت: translations("Navigation.dashboard"),
    کاربر: translations("Navigation.profile"),
  };

  return segmentMap[segment] || segment;
}

// URL parameter utilities
export function parseUrlParams(
  searchParams: URLSearchParams,
): Record<string, string> {
  const params: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  return params;
}

export function buildUrlWithParams(
  pathname: string,
  params: Record<string, string>,
): string {
  const url = new URL(pathname, "http://localhost");

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.pathname + url.search;
}

// External link utilities
export function isExternalLink(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export function sanitizeExternalLink(href: string): string {
  if (isExternalLink(href)) {
    return href;
  }

  // If it's not an external link, treat it as internal
  return href.startsWith("/") ? href : `/${href}`;
}

// Route protection utilities
export function isProtectedRoute(pathname: string): boolean {
  const cleanPath = removeLocaleFromPathname(pathname);
  const protectedPaths = ["/admin", "/user", "/مدیریت", "/کاربر"];

  return protectedPaths.some((path) => cleanPath.startsWith(path));
}

export function isPublicRoute(pathname: string): boolean {
  return !isProtectedRoute(pathname);
}

// SEO utilities
export function generateCanonicalUrl(
  pathname: string,
  locale: string,
  baseUrl: string = "https://irac.ir",
): string {
  const cleanPath = removeLocaleFromPathname(pathname);
  return `${baseUrl}/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}

export function generateAlternateUrls(
  pathname: string,
  baseUrl: string = "https://irac.ir",
): Record<string, string> {
  const cleanPath = removeLocaleFromPathname(pathname);
  const alternates: Record<string, string> = {};

  locales.forEach((locale) => {
    alternates[locale] =
      `${baseUrl}/${locale}${cleanPath === "/" ? "" : cleanPath}`;
  });

  return alternates;
}
