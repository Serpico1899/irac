import { coreApp } from "../mod.ts";
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

export const wallet_currency_array = ["IRR", "USD", "EUR"];
export const wallet_currency_enums = enums(wallet_currency_array);

export const wallet_status_array = ["active", "suspended", "blocked"];
export const wallet_status_enums = enums(wallet_status_array);

// Validate that balance is not negative
export const positive_balance = refine(
  number(),
  "positive_balance",
  (value: number) => {
    return value >= 0;
  },
);

export const wallet_pure = {
  balance: defaulted(positive_balance, 0),
  currency: defaulted(wallet_currency_enums, "IRR"),
  status: defaulted(wallet_status_enums, "active"),
  is_active: defaulted(boolean(), true),
  last_transaction_at: optional(string()),
  ...createUpdateAt,
};

export const wallet_relations = {
  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {},
  },
};

export const wallets = () =>
  coreApp.odm.newModel("wallet", wallet_pure, wallet_relations);
