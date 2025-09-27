import { coreApp } from "@app";
import {
  boolean,
  defaulted,
  enums,
  number,
  optional,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const scoring_action_array = [
  "purchase",
  "course_complete",
  "referral",
  "daily_login",
  "workshop_booking",
  "review_write",
  "profile_complete",
  "social_share",
  "bonus",
  "penalty",
  "manual_adjustment"
];
export const scoring_action_enums = enums(scoring_action_array);

export const scoring_transaction_status_array = [
  "pending",
  "completed",
  "cancelled",
  "expired"
];
export const scoring_transaction_status_enums = enums(scoring_transaction_status_array);

export const scoring_transaction_pure = {
  points: number(), // Can be positive or negative
  action: scoring_action_enums,
  status: defaulted(scoring_transaction_status_enums, "completed"),
  description: string(),
  metadata: optional(string()), // JSON string for additional data
  reference_id: optional(string()), // Reference to related entity (order_id, course_id, etc.)
  reference_type: optional(enums(["order", "course", "referral", "booking", "review", "other"])),

  // Admin fields
  admin_notes: optional(string()),
  processed_by: optional(string()), // Admin user ID for manual adjustments

  // Expiration for pending transactions
  expires_at: optional(string()),
  processed_at: optional(string()),

  // Tracking fields
  ip_address: optional(string()),
  user_agent: optional(string()),

  ...createUpdateAt,
};

export const scoring_transaction_relations = {
  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {},
  },
  // Optional relation to orders for purchase-related points
  order: {
    schemaName: "order",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  // Optional relation to courses for completion points
  course: {
    schemaName: "course",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const scoring_transactions = () =>
  coreApp.odm.newModel("scoring_transaction", scoring_transaction_pure, scoring_transaction_relations, {
    createIndex:
    {
      indexSpec: { "user": 1, "created_at": -1 },
      options: {},
    },

  });
