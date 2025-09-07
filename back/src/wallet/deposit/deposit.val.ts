import { object, objectIdValidation, number, optional, string } from "@deps";
import { selectStruct } from "../../../mod.ts";

export const depositValidator = () => {
  return object({
    set: object({
      user_id: objectIdValidation,
      amount: number(),
      payment_method: optional(string()),
      description: optional(string()),
      reference_id: optional(string()),
    }),
    get: selectStruct("wallet_transaction", 2),
  });
};
