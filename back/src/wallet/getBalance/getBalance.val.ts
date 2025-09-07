import { object, objectIdValidation } from "@deps";
import { selectStruct } from "../../../mod.ts";

export const getBalanceValidator = () => {
  return object({
    set: object({
      user_id: objectIdValidation,
    }),
    get: selectStruct("wallet", 1),
  });
};
