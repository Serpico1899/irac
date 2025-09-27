import { object, objectIdValidation } from "@deps";
import {  selectStruct  } from "@app";

export const getUserValidator = () => {
  return object({
    set: object({
      _id: objectIdValidation,
    }),
    get: selectStruct("user", 2),
  });
};
