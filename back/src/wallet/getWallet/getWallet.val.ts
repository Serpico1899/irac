import { object, objectIdValidation } from "@deps";
import { selectStruct } from "../../../mod.ts";

export const getWalletValidator = () => {
  return object({
    set: object({
      user_id: objectIdValidation,
    }),
    get: selectStruct("wallet", 2),
  });
};
