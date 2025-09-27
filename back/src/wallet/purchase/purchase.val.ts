import { object, objectIdValidation, number, string, optional } from "@deps";
import {  selectStruct  } from "@app";

export const purchaseValidator = () => {
  return object({
    set: object({
      user_id: objectIdValidation,
      amount: number(),
      order_id: string(),
      description: optional(string()),
    }),
    get: selectStruct("wallet_transaction", 2),
  });
};
