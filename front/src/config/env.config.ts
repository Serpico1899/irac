// Environment Configuration for IRAC Frontend
// This file centralizes all environment variable access and provides fallbacks

export const env = {
  // Application Configuration
  APP: {
    NAME: process.env.NEXT_PUBLIC_APP_NAME || "IRAC",
    URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    NODE_ENV: process.env.NODE_ENV || "development",
  },

  // API Configuration
  API: {
    URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:1405",
    ENDPOINT:
      process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:1405/lesan",
    PLAYGROUND_URL:
      process.env.NEXT_PUBLIC_PLAYGROUND_URL ||
      "http://localhost:1405/playground",
    UPLOAD_URL:
      process.env.NEXT_PUBLIC_UPLOAD_URL || "http://localhost:1405/api/upload",
  },

  // Internationalization
  I18N: {
    DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "fa",
    LOCALES: process.env.NEXT_PUBLIC_LOCALES?.split(",") || ["fa", "en"],
    FALLBACK_LOCALE: process.env.NEXT_PUBLIC_FALLBACK_LOCALE || "fa",
  },

  // Payment Configuration
  PAYMENT: {
    // ZarinPal Configuration
    ZARINPAL_MERCHANT_ID:
      process.env.NEXT_PUBLIC_ZARINPAL_MERCHANT_ID ||
      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    ZARINPAL_SANDBOX:
      process.env.NEXT_PUBLIC_ZARINPAL_SANDBOX === "true" || true,

    // Mellat Bank Configuration
    MELLAT_TERMINAL_ID: process.env.NEXT_PUBLIC_MELLAT_TERMINAL_ID || "",
    MELLAT_USERNAME: process.env.NEXT_PUBLIC_MELLAT_USERNAME || "",
    MELLAT_SANDBOX: process.env.NEXT_PUBLIC_MELLAT_SANDBOX === "true" || true,

    // Saman Bank Configuration
    SAMAN_MERCHANT_ID: process.env.NEXT_PUBLIC_SAMAN_MERCHANT_ID || "",
    SAMAN_TERMINAL_ID: process.env.NEXT_PUBLIC_SAMAN_TERMINAL_ID || "",
    SAMAN_SANDBOX: process.env.NEXT_PUBLIC_SAMAN_SANDBOX === "true" || true,

    // General Payment Settings
    CALLBACK_URL:
      process.env.NEXT_PUBLIC_PAYMENT_CALLBACK_URL ||
      "http://localhost:3000/payment/callback",
    DEFAULT_GATEWAY:
      process.env.NEXT_PUBLIC_DEFAULT_PAYMENT_GATEWAY || "zarinpal",
    ENABLE_FALLBACK:
      process.env.NEXT_PUBLIC_ENABLE_PAYMENT_FALLBACK === "true" || true,
    MAX_RETRY_ATTEMPTS: parseInt(
      process.env.NEXT_PUBLIC_PAYMENT_MAX_RETRIES || "3",
      10,
    ),
    WALLET_ENABLED: process.env.NEXT_PUBLIC_WALLET_ENABLED === "true" || true,
    BANK_TRANSFER_ENABLED:
      process.env.NEXT_PUBLIC_BANK_TRANSFER_ENABLED === "true" || true,

    // Payment Limits
    MIN_AMOUNT: parseInt(
      process.env.NEXT_PUBLIC_PAYMENT_MIN_AMOUNT || "1000",
      10,
    ),
    MAX_AMOUNT: parseInt(
      process.env.NEXT_PUBLIC_PAYMENT_MAX_AMOUNT || "100000000",
      10,
    ),

    // Gateway Health Check
    HEALTH_CHECK_INTERVAL: parseInt(
      process.env.NEXT_PUBLIC_PAYMENT_HEALTH_CHECK_INTERVAL || "300000",
      10,
    ),
    ENABLE_LOAD_BALANCING:
      process.env.NEXT_PUBLIC_ENABLE_PAYMENT_LOAD_BALANCING === "true" || true,
  },

  // Authentication
  AUTH: {
    URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    SECRET:
      process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(
      process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760",
      10,
    ),
    ALLOWED_TYPES: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "video/mp4",
    ],
  },

  // Feature Flags
  FEATURES: {
    PWA: process.env.NEXT_PUBLIC_ENABLE_PWA === "true" || false,
    ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" || false,
    DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true" || false,
  },

  // SEO Configuration
  SEO: {
    SITE_NAME:
      process.env.NEXT_PUBLIC_SITE_NAME || "IRAC - Iranian Architecture Center",
    SITE_DESCRIPTION:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      "Advanced architectural education and coworking space",
    SITE_KEYWORDS:
      process.env.NEXT_PUBLIC_SITE_KEYWORDS ||
      "architecture,education,Iran,coworking,design",
    METADATA_BASE: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Social Media
  SOCIAL: {
    TWITTER: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "@irac_center",
    INSTAGRAM: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "@irac_center",
    LINKEDIN: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "irac-center",
  },

  // Contact Information
  CONTACT: {
    EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@irac.ir",
    PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+98 21 1234 5678",
    ADDRESS: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "Tehran, Iran",
  },

  // Currency and Localization
  CURRENCY: {
    CODE: process.env.NEXT_PUBLIC_CURRENCY || "IRR",
    SYMBOL: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "﷼",
    DECIMAL_PLACES: 0,
  },

  // Timezone
  TIMEZONE: process.env.NEXT_PUBLIC_TIMEZONE || "Asia/Tehran",

  // Media Configuration
  MEDIA: {
    URL: process.env.NEXT_PUBLIC_MEDIA_URL || "http://localhost:1405/public",
    STATIC_URL:
      process.env.NEXT_PUBLIC_STATIC_URL || "http://localhost:1405/public",
    CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
  },

  // Analytics
  ANALYTICS: {
    GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  },

  // Error Tracking
  MONITORING: {
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    SENTRY_ENV:
      process.env.NEXT_PUBLIC_SENTRY_ENV ||
      process.env.NODE_ENV ||
      "development",
  },
} as const;

// Type definitions for better TypeScript support
export type Locale = "fa" | "en";
export type Currency = "IRR" | "USD" | "EUR";
export type Environment = "development" | "production" | "test";

// Validation functions
export const isProduction = (): boolean => env.APP.NODE_ENV === "production";
export const isDevelopment = (): boolean => env.APP.NODE_ENV === "development";
export const isTest = (): boolean => env.APP.NODE_ENV === "test";

// Helper functions
export const getApiUrl = (path: string = ""): string => {
  const baseUrl = env.API.URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
};

export const getMediaUrl = (path: string = ""): string => {
  const baseUrl = (env.MEDIA.CDN_URL || env.MEDIA.URL).replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
};

export const formatCurrency = (
  amount: number,
  options?: Intl.NumberFormatOptions,
): string => {
  const locale = env.I18N.DEFAULT_LOCALE === "fa" ? "fa-IR" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: env.CURRENCY.CODE,
    minimumFractionDigits: env.CURRENCY.DECIMAL_PLACES,
    maximumFractionDigits: env.CURRENCY.DECIMAL_PLACES,
    ...options,
  }).format(amount);
};

// Validation for required environment variables
const requiredEnvVars = {
  // Add any truly required environment variables here
  // Example: API_URL: env.API.URL,
} as const;

// Runtime validation (only in development)
if (isDevelopment()) {
  const missingVars = Object.entries(requiredEnvVars).filter(
    ([_, value]) => !value || value === "",
  );

  if (missingVars.length > 0) {
    console.warn(
      "⚠️  Missing required environment variables:",
      missingVars.map(([key]) => key),
    );
  }
}

// Export individual sections for convenience
export const {
  APP,
  API,
  I18N,
  PAYMENT,
  AUTH,
  UPLOAD,
  FEATURES,
  SEO,
  SOCIAL,
  CONTACT,
  CURRENCY,
  MEDIA,
  ANALYTICS,
  MONITORING,
} = env;

export default env;
