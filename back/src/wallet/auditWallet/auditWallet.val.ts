import { object, objectIdValidation, string, optional, boolean, defaulted } from "@deps";
import {  selectStruct  } from "@app";

export const auditWalletValidator = () => {
  return object({
    set: object({
      user_id: objectIdValidation,
      start_date: optional(string()), // ISO date string
      end_date: optional(string()), // ISO date string
      transaction_types: optional(string()), // comma-separated list of transaction types
      include_suspicious: defaulted(boolean(), true), // Include suspicious activity detection
      detailed: defaulted(boolean(), true), // Include detailed transaction analysis
      verify_balance: defaulted(boolean(), true), // Perform balance verification
    }),
    get: selectStruct("wallet_transaction", 2),
  });
};
