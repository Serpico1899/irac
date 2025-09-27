import { object, optional, string, number, defaulted } from "@deps";
import {  selectStruct  } from "@app";

export const getAllWalletsValidator = () => {
  return object({
    set: object({
      page: defaulted(number(), 1),
      limit: defaulted(number(), 20),
      status: optional(string()), // active, suspended, blocked
      search: optional(string()), // search by user name/email
      sort_by: defaulted(string(), "created_at"), // balance, created_at, last_transaction_at
      sort_order: defaulted(string(), "desc"), // asc, desc
      min_balance: optional(number()),
      max_balance: optional(number()),
    }),
    get: selectStruct("wallet", 2),
  });
};
