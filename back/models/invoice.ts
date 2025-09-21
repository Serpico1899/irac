import { coreApp } from "../mod.ts";
import {
  array,
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  object,
  optional,
  refine,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const invoice_status_array = [
  "draft",
  "sent",
  "viewed",
  "paid",
  "partially_paid",
  "overdue",
  "cancelled",
  "refunded"
];
export const invoice_status_enums = enums(invoice_status_array);

export const invoice_type_array = [
  "standard",
  "proforma",
  "credit_note",
  "debit_note"
];
export const invoice_type_enums = enums(invoice_type_array);

export const tax_type_array = [
  "vat",
  "service_tax",
  "withholding_tax",
  "exempt"
];
export const tax_type_enums = enums(tax_type_array);

// Validate positive amounts
export const invoice_positive_amount = refine(
  number(),
  "invoice_positive_amount",
  (value: number) => {
    return value >= 0;
  },
);

// Validate percentage (0-100)
export const percentage = refine(
  number(),
  "percentage",
  (value: number) => {
    return value >= 0 && value <= 100;
  },
);

// Invoice line item structure
export const invoice_line_item_struct = object({
  item_id: string(),
  item_type: enums(["course", "workshop", "product", "service"]),
  name: string(),
  name_en: optional(string()),
  description: optional(string()),
  description_en: optional(string()),
  unit_price: invoice_positive_amount,
  quantity: defaulted(number(), 1),
  discount_amount: defaulted(invoice_positive_amount, 0),
  discount_percentage: defaulted(percentage, 0),
  tax_rate: defaulted(percentage, 9), // Default 9% Iranian VAT
  tax_amount: invoice_positive_amount,
  line_total: invoice_positive_amount,
  metadata: optional(string()), // JSON string for additional data
});

// Tax breakdown structure
export const invoice_tax_struct = object({
  tax_id: string(),
  name: string(),
  name_en: optional(string()),
  rate: percentage,
  amount: invoice_positive_amount,
  tax_type: defaulted(tax_type_enums, "vat"),
  is_inclusive: defaulted(boolean(), false),
});

// Discount breakdown structure
export const invoice_discount_struct = object({
  discount_id: optional(string()),
  description: string(),
  description_en: optional(string()),
  coupon_code: optional(string()),
  discount_type: enums(["percentage", "fixed_amount", "bulk_discount"]),
  discount_value: number(), // Percentage or fixed amount
  discount_amount: invoice_positive_amount,
});

// Payment record structure
export const invoice_payment_struct = object({
  payment_id: string(),
  payment_date: coerce(date(), string(), (value) => new Date(value)),
  amount: invoice_positive_amount,
  payment_method: string(),
  transaction_reference: optional(string()),
  gateway_response: optional(string()), // JSON string
  notes: optional(string()),
});

// Company information structure
export const invoice_company_struct = object({
  name: string(),
  name_en: optional(string()),
  logo_url: optional(string()),
  address: optional(string()),
  city: optional(string()),
  postal_code: optional(string()),
  country: defaulted(string(), "Iran"),
  phone: optional(string()),
  email: optional(string()),
  website: optional(string()),
  tax_id: optional(string()),
  registration_number: optional(string()),
});

// Customer information structure
export const invoice_customer_struct = object({
  name: string(),
  company_name: optional(string()),
  email: optional(string()),
  phone: optional(string()),
  national_id: optional(string()),
  tax_id: optional(string()),
  address: optional(string()),
  city: optional(string()),
  postal_code: optional(string()),
  country: defaulted(string(), "Iran"),
});

export const invoice_model_pure = {
  // Invoice identification
  invoice_number: string(), // Sequential number like "INV-2024-0001"
  invoice_id: string(), // Unique internal ID
  reference_number: optional(string()), // External reference

  // Invoice type and status
  invoice_type: defaulted(invoice_type_enums, "standard"),
  status: defaulted(invoice_status_enums, "draft"),

  // Dates
  issue_date: coerce(date(), string(), (value) => new Date(value)),
  due_date: optional(coerce(date(), string(), (value) => new Date(value))),
  payment_date: optional(coerce(date(), string(), (value) => new Date(value))),

  // Company and customer information
  company: invoice_company_struct,
  customer: invoice_customer_struct,

  // Items and pricing
  line_items: array(invoice_line_item_struct),
  subtotal: invoice_positive_amount,
  total_discount: defaulted(invoice_positive_amount, 0),
  total_tax: defaulted(invoice_positive_amount, 0),
  total_amount: invoice_positive_amount,
  currency: defaulted(string(), "IRR"),
  exchange_rate: defaulted(number(), 1),

  // Detailed breakdowns
  taxes: defaulted(array(invoice_tax_struct), []),
  discounts: defaulted(array(invoice_discount_struct), []),
  payments: defaulted(array(invoice_payment_struct), []),

  // Balance tracking
  paid_amount: defaulted(invoice_positive_amount, 0),
  balance_due: invoice_positive_amount,

  // Terms and conditions
  payment_terms: optional(string()),
  payment_terms_en: optional(string()),
  notes: optional(string()),
  notes_en: optional(string()),
  terms_and_conditions: optional(string()),
  terms_and_conditions_en: optional(string()),

  // Localization
  locale: defaulted(string(), "fa"),
  timezone: defaulted(string(), "Asia/Tehran"),

  // PDF and email tracking
  pdf_generated: defaulted(boolean(), false),
  pdf_url: optional(string()),
  pdf_generated_at: optional(coerce(date(), string(), (value) => new Date(value))),
  email_sent: defaulted(boolean(), false),
  email_sent_at: optional(coerce(date(), string(), (value) => new Date(value))),
  viewed_at: optional(coerce(date(), string(), (value) => new Date(value))),

  // Admin and internal fields
  admin_notes: optional(string()),
  internal_reference: optional(string()),

  // Sequential numbering fields
  fiscal_year: number(), // e.g., 2024
  sequence_number: number(), // Auto-incremented per year

  // Tax compliance (Iranian specific)
  tax_exempt: defaulted(boolean(), false),
  tax_exempt_reason: optional(string()),
  reverse_charge: defaulted(boolean(), false),

  // Collection tracking
  collection_attempts: defaulted(number(), 0),
  last_reminder_sent: optional(coerce(date(), string(), (value) => new Date(value))),

  ...createUpdateAt,
};

export const invoice_model_relations = {
  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {},
  },
  order: {
    schemaName: "order",
    type: "single" as RelationDataType,
    optional: true, // Some invoices might not be tied to orders
    relatedRelations: {},
  },
  wallet_transactions: {
    schemaName: "wallet_transaction",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const invoice_models = () =>
  coreApp.odm.newModel("invoice", invoice_model_pure, invoice_model_relations, {
    createIndex: [
      {
        indexSpec: { "invoice_number": 1 },
        options: { unique: true },
      },
      {
        indexSpec: { "fiscal_year": 1, "sequence_number": 1 },
        options: { unique: true },
      },
      {
        indexSpec: { "status": 1, "due_date": 1 },
        options: {},
      },
      {
        indexSpec: { "customer.email": 1, "issue_date": -1 },
        options: {},
      },
    ],
  });
