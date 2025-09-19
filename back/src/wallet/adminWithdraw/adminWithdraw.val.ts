import { object, objectIdValidation, number, string, optional } from "@deps";
import { selectStruct } from "../../../mod.ts";

export const adminWithdrawValidator = () => {
  return object({
    set: object({
      user_id: objectIdValidation,
      amount: number(),
      reason: string(),
      notes: optional(string()),
    }),
    get: selectStruct("wallet_transaction", 2),
  });
};
