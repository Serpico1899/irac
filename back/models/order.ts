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

export const order_status_array = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "failed"
];
export const order_status_enums = enums(order_status_array);

export const order_payment_status_array = [
  "pending",
  "paid",
  "partially_paid",
  "failed",
  "refunded",
  "cancelled"
];
export const order_payment_status_enums = enums(order_payment_status_array);

export const order_type_array = [
  "course",
  "workshop",
  "product",
  "mixed"
];
export const order_type_enums = enums(order_type_array);

// Validate positive amounts
export const order_positive_amount = refine(
  number(),
  "order_positive_amount",
  (value: number) => {
    return value >= 0;
  },
);

// Order item structure
export const order_item_struct = object({
  item_id: string(),
  item_type: enums(["course", "workshop", "product"]),
  name: string(),
  name_en: optional(string()),
  price: order_positive_amount,
  discounted_price: optional(order_positive_amount),
  quantity: defaulted(number(), 1),
  total: order_positive_amount,
  metadata: optional(string()), // JSON string for additional data
});

export const order_model_pure = {
  order_number: string(), // Human-readable order number
  order_id: string(), // Unique internal ID

  // Order details
  status: defaulted(order_status_enums, "pending"),
  payment_status: defaulted(order_payment_status_enums, "pending"),
  order_type: order_type_enums,

  // Items
  items: array(order_item_struct),

  // Pricing
  subtotal: order_positive_amount,
  tax_amount: defaulted(order_positive_amount, 0),
  discount_amount: defaulted(order_positive_amount, 0),
  total_amount: order_positive_amount,
  currency: defaulted(string(), "IRR"),

  // Customer information
  customer_email: optional(string()),
  customer_phone: optional(string()),
  customer_name: string(),

  // Billing information
  billing_address: optional(string()),
  billing_city: optional(string()),
  billing_postal_code: optional(string()),
  billing_country: defaulted(string(), "Iran"),

  // Shipping information (for physical products)
  shipping_address: optional(string()),
  shipping_city: optional(string()),
  shipping_postal_code: optional(string()),
  shipping_country: optional(string()),
  shipping_cost: defaulted(order_positive_amount, 0),

  // Payment information
  payment_method: optional(string()),
  payment_reference: optional(string()),
  gateway_transaction_id: optional(string()),
  gateway_response: optional(string()), // JSON string

  // Fulfillment
  shipped_at: optional(coerce(date(), string(), (value) => new Date(value))),
  delivered_at: optional(coerce(date(), string(), (value) => new Date(value))),

  // Admin fields
  admin_notes: optional(string()),
  internal_notes: optional(string()),

  // Tracking
  tracking_number: optional(string()),
  tracking_url: optional(string()),

  // Refund information
  refund_amount: defaulted(order_positive_amount, 0),
  refund_reason: optional(string()),
  refunded_at: optional(coerce(date(), string(), (value) => new Date(value))),

  ...createUpdateAt,
};

export const order_model_relations = {
  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {},
  },
  // Optional relation to wallet transactions
  wallet_transactions: {
    schemaName: "wallet_transaction",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const order_models = () =>
  coreApp.odm.newModel("order", order_model_pure, order_model_relations, {
    createIndex: {
      indexSpec: { "order_number": 1 },
      options: { unique: true },
    },
  });
