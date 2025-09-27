import { object, optional, string, defaulted } from "@deps";
import {  selectStruct  } from "@app";

export const getWalletStatsValidator = () => {
  return object({
    set: object({
      period: defaulted(string(), "all"), // all, today, week, month, year
      start_date: optional(string()), // ISO date string
      end_date: optional(string()), // ISO date string
      include_dormant: defaulted(string(), "true"), // Include dormant wallets in stats
    }),
    get: selectStruct("wallet", 1),
  });
};
