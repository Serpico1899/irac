import { object, objectIdValidation, number, string, optional } from "@deps";
import {  selectStruct  } from "@app";

export const getTransactionsValidator = () => {
  return object({
    set: object({
      user_id: objectIdValidation,
      page: optional(number()),
      limit: optional(number()),
      type: optional(string()),
      status: optional(string()),
    }),
    get: selectStruct("wallet_transaction", 2),
  });
};
