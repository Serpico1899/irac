import {  coreApp  } from "@app";
import {
  boolean,
  defaulted,
  enums,
  number,
  optional,
  refine,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const transaction_type_array = [
  "deposit",
  "withdrawal",
  "purchase",
  "refund",
  "transfer_in",
  "transfer_out",
  "bonus",
  "penalty",
  "commission",
  "admin_deposit",
  "admin_withdrawal",
  "admin_adjustment",
  "dispute_resolution",
  "freeze_penalty",
  "unfreeze_bonus"
];
export const transaction_type_enums = enums(transaction_type_array);

export const transaction_status_array = [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
  "refunded"
];
export const transaction_status_enums = enums(transaction_status_array);

export const wallet_payment_method_array = [
  "zarinpal",
  "bank_transfer",
  "manual",
  "wallet_balance",
  "credit_card",
  "other"
];
export const wallet_payment_method_enums = enums(wallet_payment_method_array);

// Validate that amount is positive
export const wallet_positive_amount = refine(
  number(),
  "wallet_positive_amount",
  (value: number) => {
    return value > 0;
  },
);

export const wallet_transaction_pure = {
  transaction_id: string(), // Unique transaction identifier
  amount: wallet_positive_amount,
  currency: defaulted(string(), "IRR"),
  type: transaction_type_enums,
  status: defaulted(transaction_status_enums, "pending"),
  payment_method: optional(wallet_payment_method_enums),

  // Transaction details
  description: optional(string()),
  reference_id: optional(string()), // External payment gateway reference
  gateway_response: optional(string()), // JSON string of gateway response

  // Balance tracking
  balance_before: number(),
  balance_after: number(),

  // Metadata
  ip_address: optional(string()),
  user_agent: optional(string()),

  // Admin fields
  admin_notes: optional(string()),
  processed_by: optional(string()), // Admin user ID who processed manual transactions

  // Timing
  processed_at: optional(string()),
  expires_at: optional(string()),

  ...createUpdateAt,
};

export const wallet_transaction_relations = {
  wallet: {
    schemaName: "wallet",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {},
  },
  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {},
  },
  // Optional relation to orders for purchase transactions
  order: {
    schemaName: "order",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const wallet_transactions = () =>
  coreApp.odm.newModel("wallet_transaction", wallet_transaction_pure, wallet_transaction_relations);
