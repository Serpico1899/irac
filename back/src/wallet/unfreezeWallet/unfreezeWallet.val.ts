import { object, objectIdValidation, string, optional } from "@deps";
import { selectStruct } from "../../../mod.ts";

export const unfreezeWalletValidator = () => {
  return object({
    set: object({
      user_id: objectIdValidation,
      reason: string(),
      notes: optional(string()),
    }),
    get: selectStruct("wallet", 2),
  });
};
