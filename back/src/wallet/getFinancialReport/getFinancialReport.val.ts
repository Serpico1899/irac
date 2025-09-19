import { object, optional, string, defaulted, boolean } from "@deps";
import { selectStruct } from "../../../mod.ts";

export const getFinancialReportValidator = () => {
  return object({
    set: object({
      report_type: defaulted(string(), "monthly"), // monthly, quarterly, yearly, custom
      start_date: optional(string()), // ISO date string - required for custom
      end_date: optional(string()), // ISO date string - required for custom
      breakdown_by: defaulted(string(), "source"), // source, payment_method, transaction_type
      include_refunds: defaulted(boolean(), true),
      include_failed: defaulted(boolean(), false),
      export_format: defaulted(string(), "json"), // json, csv
      currency: defaulted(string(), "IRR"),
    }),
    get: selectStruct("wallet_transaction", 1),
  });
};
