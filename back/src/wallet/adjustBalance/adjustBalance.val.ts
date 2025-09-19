import { object, objectIdValidation, number, string, optional } from "@deps";
import { selectStruct } from "../../../mod.ts";

export const adjustBalanceValidator = () => {
  return object({
    set: object({
      user_id: objectIdValidation,
      new_balance: number(),
      reason: string(),
      notes: optional(string()),
    }),
    get: selectStruct("wallet_transaction", 2),
  });
};
