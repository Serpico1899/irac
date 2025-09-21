import { object, string, boolean, number, enums, defaulted, optional } from "https://deno.land/x/lesan@v0.1.8/mod.ts";

// Payment Gateway Types
export const paymentGatewayType = enums([
  "zarinpal",
  "mellat_bank",
  "saman_bank",
  "wallet",
  "bank_transfer",
  "crypto",
] as const);

export const paymentGatewayStatus = enums([
  "active",
  "inactive",
  "maintenance",
  "suspended",
] as const);

export const paymentGatewayEnvironment = enums([
  "production",
  "sandbox",
  "test",
] as const);

export const currencyCode = enums([
  "IRR",
  "USD",
  "EUR",
] as const);

// Payment Gateway Configuration Schema
export const paymentGatewayConfig = object({
  // ZarinPal Configuration
  zarinpal: optional(object({
    merchant_id: string(),
    sandbox: defaulted(boolean(), false),
    callback_url: string(),
    description: defaulted(string(), "پرداخت از طریق زرین‌پال"),
    auto_verify: defaulted(boolean(), true),
    webhook_url: optional(string()),
  })),

  // Mellat Bank Configuration
  mellat_bank: optional(object({
    terminal_id: string(),
    username: string(),
    password: string(),
    callback_url: string(),
    payment_url: defaulted(string(), "https://bpm.shaparak.ir/pgwchannel/services/pgw"),
    verify_url: defaulted(string(), "https://bpm.shaparak.ir/pgwchannel/services/pgw"),
    sandbox: defaulted(boolean(), false),
    auto_verify: defaulted(boolean(), true),
  })),

  // Saman Bank Configuration
  saman_bank: optional(object({
    merchant_id: string(),
    terminal_id: string(),
    callback_url: string(),
    payment_url: defaulted(string(), "https://sep.shaparak.ir/payment.aspx"),
    verify_url: defaulted(string(), "https://sep.shaparak.ir/verifyTxn.aspx"),
    sandbox: defaulted(boolean(), false),
    auto_verify: defaulted(boolean(), true),
  })),

  // Wallet Configuration
  wallet: optional(object({
    enabled: defaulted(boolean(), true),
    min_balance_required: defaulted(number(), 0),
    max_daily_spending: defaulted(number(), 10000000), // 1M Toman default
    auto_confirm: defaulted(boolean(), true),
    require_pin: defaulted(boolean(), false),
  })),

  // Bank Transfer Configuration
  bank_transfer: optional(object({
    enabled: defaulted(boolean(), true),
    account_number: string(),
    iban: string(),
    bank_name: string(),
    account_holder: string(),
    auto_verify: defaulted(boolean(), false),
    require_receipt: defaulted(boolean(), true),
  })),
});

// Payment Gateway Model
export const paymentGateway = object({
  _id: optional(string()),

  // Basic Information
  name: string(), // e.g., "زرین‌پال", "بانک ملت", "سامان بانک"
  name_en: string(), // e.g., "ZarinPal", "Mellat Bank", "Saman Bank"
  type: paymentGatewayType,

  // Status and Settings
  status: defaulted(paymentGatewayStatus, "active"),
  environment: defaulted(paymentGatewayEnvironment, "production"),
  is_default: defaulted(boolean(), false),
  priority: defaulted(number(), 0), // Higher priority = shown first

  // Financial Settings
  supported_currencies: defaulted(enums([currencyCode]), ["IRR"]),
  min_amount: defaulted(number(), 1000), // Minimum payment amount in IRR
  max_amount: defaulted(number(), 500000000), // Maximum payment amount in IRR
  fee_percentage: defaulted(number(), 0), // Gateway fee percentage
  fee_fixed: defaulted(number(), 0), // Fixed fee amount

  // Configuration
  config: paymentGatewayConfig,

  // Display Settings
  display_name: string(), // Display name in UI
  description: defaulted(string(), ""),
  icon_url: optional(string()),
  logo_url: optional(string()),
  color: defaulted(string(), "#168c95"), // Brand color

  // Features and Capabilities
  features: defaulted(object({
    supports_refund: defaulted(boolean(), false),
    supports_partial_refund: defaulted(boolean(), false),
    supports_recurring: defaulted(boolean(), false),
    supports_installment: defaulted(boolean(), false),
    supports_wallet_charge: defaulted(boolean(), true),
    supports_direct_payment: defaulted(boolean(), true),
    requires_verification: defaulted(boolean(), true),
    instant_confirmation: defaulted(boolean(), false),
  }), {}),

  // Availability Settings
  availability: defaulted(object({
    enabled_for_users: defaulted(boolean(), true),
    enabled_for_guests: defaulted(boolean(), false),
    enabled_for_mobile: defaulted(boolean(), true),
    enabled_for_web: defaulted(boolean(), true),
    country_restrictions: defaulted(enums([string()]), []),
    min_user_level: defaulted(number(), 0),
    business_hours_only: defaulted(boolean(), false),
    maintenance_mode: defaulted(boolean(), false),
  }), {}),

  // Performance and Reliability
  metrics: defaulted(object({
    success_rate: defaulted(number(), 0),
    average_processing_time: defaulted(number(), 0), // in seconds
    total_transactions: defaulted(number(), 0),
    total_volume: defaulted(number(), 0), // Total amount processed
    last_successful_transaction: optional(string()), // ISO date
    last_failed_transaction: optional(string()), // ISO date
    uptime_percentage: defaulted(number(), 100),
  }), {}),

  // Error Handling
  error_settings: defaulted(object({
    max_retry_attempts: defaulted(number(), 3),
    retry_delay_seconds: defaulted(number(), 30),
    timeout_seconds: defaulted(number(), 120),
    fallback_gateway_id: optional(string()),
    enable_logging: defaulted(boolean(), true),
    alert_on_failure: defaulted(boolean(), true),
  }), {}),

  // Webhooks and Callbacks
  webhook_settings: defaulted(object({
    webhook_url: optional(string()),
    webhook_secret: optional(string()),
    enable_webhook: defaulted(boolean(), false),
    webhook_events: defaulted(enums([string()]), ["payment.completed", "payment.failed", "payment.refunded"]),
    webhook_retry_count: defaulted(number(), 3),
  }), {}),

  // Metadata and Tracking
  metadata: defaulted(object({
    provider_version: optional(string()),
    integration_version: defaulted(string(), "1.0.0"),
    last_config_update: optional(string()), // ISO date
    created_by: optional(string()), // User ID
    updated_by: optional(string()), // User ID
    tags: defaulted(enums([string()]), []),
    notes: defaulted(string(), ""),
  }), {}),

  // Audit Fields
  created_at: defaulted(string(), () => new Date().toISOString()),
  updated_at: defaulted(string(), () => new Date().toISOString()),
  deleted_at: optional(string()),
  is_deleted: defaulted(boolean(), false),
}, {
  // Indexes for performance
  indexes: [
    { key: { type: 1 }, background: true },
    { key: { status: 1 }, background: true },
    { key: { is_default: 1 }, background: true },
    { key: { priority: 1 }, background: true },
    { key: { "availability.enabled_for_users": 1 }, background: true },
    { key: { created_at: -1 }, background: true },
    { key: { updated_at: -1 }, background: true },
  ],
});

// Type exports for TypeScript
export type PaymentGatewayType = typeof paymentGatewayType.enum;
export type PaymentGatewayStatus = typeof paymentGatewayStatus.enum;
export type PaymentGatewayEnvironment = typeof paymentGatewayEnvironment.enum;
export type CurrencyCode = typeof currencyCode.enum;
export type PaymentGateway = typeof paymentGateway.pure;
export type PaymentGatewayConfig = typeof paymentGatewayConfig.pure;

// Default gateway configurations
export const DEFAULT_GATEWAYS = {
  zarinpal: {
    name: "زرین‌پال",
    name_en: "ZarinPal",
    type: "zarinpal" as PaymentGatewayType,
    display_name: "پرداخت با زرین‌پال",
    description: "پرداخت آنلاین امن و سریع با تمام کارت‌های بانکی",
    color: "#ffd900",
    priority: 10,
    min_amount: 1000,
    max_amount: 50000000,
    features: {
      supports_refund: true,
      supports_partial_refund: false,
      supports_recurring: false,
      supports_installment: false,
      supports_wallet_charge: true,
      supports_direct_payment: true,
      requires_verification: true,
      instant_confirmation: false,
    },
  },

  mellat_bank: {
    name: "بانک ملت",
    name_en: "Mellat Bank",
    type: "mellat_bank" as PaymentGatewayType,
    display_name: "پرداخت با بانک ملت",
    description: "درگاه پرداخت اینترنتی بانک ملت",
    color: "#e31e24",
    priority: 8,
    min_amount: 1000,
    max_amount: 100000000,
    features: {
      supports_refund: true,
      supports_partial_refund: true,
      supports_recurring: false,
      supports_installment: true,
      supports_wallet_charge: true,
      supports_direct_payment: true,
      requires_verification: true,
      instant_confirmation: false,
    },
  },

  saman_bank: {
    name: "بانک سامان",
    name_en: "Saman Bank",
    type: "saman_bank" as PaymentGatewayType,
    display_name: "پرداخت با بانک سامان",
    description: "درگاه پرداخت اینترنتی بانک سامان",
    color: "#1e3d59",
    priority: 7,
    min_amount: 1000,
    max_amount: 100000000,
    features: {
      supports_refund: true,
      supports_partial_refund: true,
      supports_recurring: false,
      supports_installment: true,
      supports_wallet_charge: true,
      supports_direct_payment: true,
      requires_verification: true,
      instant_confirmation: false,
    },
  },

  wallet: {
    name: "کیف پول",
    name_en: "Wallet",
    type: "wallet" as PaymentGatewayType,
    display_name: "پرداخت با کیف پول",
    description: "پرداخت سریع و آسان از موجودی کیف پول شما",
    color: "#168c95",
    priority: 15,
    min_amount: 100,
    max_amount: 1000000000,
    features: {
      supports_refund: true,
      supports_partial_refund: true,
      supports_recurring: true,
      supports_installment: false,
      supports_wallet_charge: false,
      supports_direct_payment: true,
      requires_verification: false,
      instant_confirmation: true,
    },
  },

  bank_transfer: {
    name: "حواله بانکی",
    name_en: "Bank Transfer",
    type: "bank_transfer" as PaymentGatewayType,
    display_name: "واریز به حساب",
    description: "واریز مستقیم به حساب بانکی سازمان",
    color: "#6b7280",
    priority: 5,
    min_amount: 10000,
    max_amount: 1000000000,
    features: {
      supports_refund: false,
      supports_partial_refund: false,
      supports_recurring: false,
      supports_installment: false,
      supports_wallet_charge: true,
      supports_direct_payment: false,
      requires_verification: true,
      instant_confirmation: false,
    },
  },
} as const;

// Validation functions
export const validateGatewayConfig = (type: PaymentGatewayType, config: any): boolean => {
  try {
    switch (type) {
      case "zarinpal":
        return !!(config?.zarinpal?.merchant_id && config?.zarinpal?.callback_url);
      case "mellat_bank":
        return !!(config?.mellat_bank?.terminal_id && config?.mellat_bank?.username &&
          config?.mellat_bank?.password && config?.mellat_bank?.callback_url);
      case "saman_bank":
        return !!(config?.saman_bank?.merchant_id && config?.saman_bank?.terminal_id &&
          config?.saman_bank?.callback_url);
      case "wallet":
        return true; // Wallet doesn't require external configuration
      case "bank_transfer":
        return !!(config?.bank_transfer?.account_number && config?.bank_transfer?.iban);
      default:
        return false;
    }
  } catch {
    return false;
  }
};

// Gateway feature checks
export const gatewaySupportsFeature = (gateway: PaymentGateway, feature: string): boolean => {
  return gateway.features?.[feature as keyof typeof gateway.features] || false;
};

// Amount validation for gateway
export const validateAmountForGateway = (gateway: PaymentGateway, amount: number): {
  valid: boolean;
  error?: string;
} => {
  if (amount < gateway.min_amount) {
    return {
      valid: false,
      error: `حداقل مبلغ پرداخت ${gateway.min_amount.toLocaleString('fa-IR')} تومان می‌باشد`,
    };
  }

  if (amount > gateway.max_amount) {
    return {
      valid: false,
      error: `حداکثر مبلغ پرداخت ${gateway.max_amount.toLocaleString('fa-IR')} تومان می‌باشد`,
    };
  }

  return { valid: true };
};

// Calculate gateway fees
export const calculateGatewayFees = (gateway: PaymentGateway, amount: number): {
  fee_amount: number;
  final_amount: number;
} => {
  const percentage_fee = (amount * gateway.fee_percentage) / 100;
  const total_fee = percentage_fee + gateway.fee_fixed;

  return {
    fee_amount: Math.round(total_fee),
    final_amount: amount + Math.round(total_fee),
  };
};
