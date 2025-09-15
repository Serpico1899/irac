import { coreApp } from "../mod.ts";
import {
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  optional,
  refine,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const referral_status_array = [
  "pending",
  "registered",
  "first_purchase",
  "completed",
  "rewarded",
  "expired",
  "cancelled"
];
export const referral_status_enums = enums(referral_status_array);

export const referral_type_array = [
  "direct",
  "group",
  "campaign",
  "affiliate"
];
export const referral_type_enums = enums(referral_type_array);

export const commission_status_array = [
  "pending",
  "calculated",
  "paid",
  "cancelled",
  "on_hold"
];
export const commission_status_enums = enums(commission_status_array);

// Validate positive commission rate (0-100%)
export const commission_rate_validator = refine(
  number(),
  "commission_rate",
  (value: number) => {
    return value >= 0 && value <= 100;
  },
);

// Validate positive amounts
export const positive_amount = refine(
  number(),
  "positive_amount",
  (value: number) => {
    return value >= 0;
  },
);

export const referral_pure = {
  referral_code: string(), // Unique referral code (ARCH-{USER_ID}-{RANDOM})
  referral_type: defaulted(referral_type_enums, "direct"),
  status: defaulted(referral_status_enums, "pending"),

  // Commission tracking
  commission_rate: defaulted(commission_rate_validator, 20), // Percentage
  commission_earned: defaulted(positive_amount, 0),
  commission_status: defaulted(commission_status_enums, "pending"),
  commission_paid_at: optional(coerce(date(), string(), (value) => new Date(value))),

  // Purchase tracking
  first_purchase_amount: optional(positive_amount),
  total_purchase_amount: defaulted(positive_amount, 0),
  purchase_count: defaulted(number(), 0),

  // Tracking timestamps
  registered_at: optional(coerce(date(), string(), (value) => new Date(value))),
  first_purchase_at: optional(coerce(date(), string(), (value) => new Date(value))),
  completed_at: optional(coerce(date(), string(), (value) => new Date(value))),
  rewarded_at: optional(coerce(date(), string(), (value) => new Date(value))),
  expires_at: optional(coerce(date(), string(), (value) => new Date(value))),

  // Group referral features
  group_discount_applied: defaulted(boolean(), false),
  group_size: defaulted(number(), 1),
  group_discount_percentage: defaulted(number(), 0),

  // Campaign tracking
  campaign_id: optional(string()),
  campaign_name: optional(string()),
  source: optional(string()), // where the referral came from
  medium: optional(string()), // marketing medium

  // Metadata
  metadata: optional(string()), // JSON string for additional data
  tracking_data: optional(string()), // JSON string for analytics

  // Admin fields
  admin_notes: optional(string()),
  is_verified: defaulted(boolean(), false),
  fraud_check_status: defaulted(enums(["pending", "passed", "failed", "manual_review"]), "pending"),
  blocked_reason: optional(string()),

  // Bonus and penalties
  bonus_amount: defaulted(positive_amount, 0),
  penalty_amount: defaulted(positive_amount, 0),

  // Statistics
  click_count: defaulted(number(), 0),
  conversion_rate: defaulted(number(), 0), // Calculated percentage

  ...createUpdateAt,
};

export const referral_relations = {
  referrer: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {},
  },
  referee: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: true, // null until signup
    relatedRelations: {},
  },
  // Link to the order that triggered commission
  triggering_order: {
    schemaName: "order",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  // Link to all orders from the referee
  related_orders: {
    schemaName: "order",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const referrals = () =>
  coreApp.odm.newModel("referral", referral_pure, referral_relations, {
    createIndex: {
      indexSpec: { "referral_code": 1 },
      options: { unique: true },
    },
  });
