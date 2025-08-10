export const locales = ["fa", "en"] as const;
export const defaultLocale = "fa" as const;

export type Locale = (typeof locales)[number];

// Utility functions
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === "fa" ? "en" : "fa";
}

export function isRTL(locale: Locale): boolean {
  return locale === "fa";
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return isRTL(locale) ? "rtl" : "ltr";
}

export function getLanguageName(locale: Locale): string {
  const names = {
    fa: "فارسی",
    en: "English",
  };
  return names[locale];
}

export function getLanguageNativeNames(): Record<Locale, string> {
  return {
    fa: "فارسی",
    en: "English",
  };
}

// Date formatting utilities
export function getDateFormat(locale: Locale): Intl.DateTimeFormatOptions {
  const baseFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (locale === "fa") {
    return {
      ...baseFormat,
      calendar: "persian",
      numberingSystem: "arabext",
    };
  }

  return baseFormat;
}

// Number formatting utilities
export function getNumberFormat(locale: Locale): Intl.NumberFormatOptions {
  if (locale === "fa") {
    return {
      numberingSystem: "arabext",
    };
  }

  return {
    numberingSystem: "latn",
  };
}

// Currency formatting
export function getCurrencyFormat(locale: Locale): Intl.NumberFormatOptions {
  if (locale === "fa") {
    return {
      style: "currency",
      currency: "IRR",
      numberingSystem: "arabext",
      currencyDisplay: "symbol",
    };
  }

  return {
    style: "currency",
    currency: "USD",
    numberingSystem: "latn",
  };
}

// Utility to get browser locale preference
export function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const browserLocale = navigator.language.split("-")[0];
  return isValidLocale(browserLocale) ? browserLocale : defaultLocale;
}

// Utility to format numbers based on locale
export function formatNumber(
  number: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  const formatOptions = { ...getNumberFormat(locale), ...options };
  return new Intl.NumberFormat(locale, formatOptions).format(number);
}

// Utility to format currency based on locale
export function formatCurrency(
  amount: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  const formatOptions = { ...getCurrencyFormat(locale), ...options };
  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}

// Utility to format dates based on locale
export function formatDate(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const formatOptions = { ...getDateFormat(locale), ...options };
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

// Persian/Arabic number conversion utilities
export function convertToPersianNumbers(input: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return input.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
}

export function convertToEnglishNumbers(input: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  let result = input;
  persianDigits.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, "g"), index.toString());
  });
  return result;
}

// Utility to convert numbers based on locale
export function localizeNumbers(input: string, locale: Locale): string {
  if (locale === "fa") {
    return convertToPersianNumbers(input);
  }
  return convertToEnglishNumbers(input);
}

// Text direction utilities
export function getTextAlign(locale: Locale): "left" | "right" {
  return isRTL(locale) ? "right" : "left";
}

export function getFlexDirection(locale: Locale): "row" | "row-reverse" {
  return isRTL(locale) ? "row-reverse" : "row";
}

// Validation utilities
export function validateLocaleParam(locale: string | undefined): Locale {
  if (!locale || !isValidLocale(locale)) {
    return defaultLocale;
  }
  return locale;
}
