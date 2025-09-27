import { object, objectIdValidation, optional } from "@deps";
import {  selectStruct  } from "@app";

export const updateUserRelationsValidator = () => {
  return object({
    set: object({
      _id: objectIdValidation,
      avatar: optional(objectIdValidation),
      nationalCard: optional(objectIdValidation),
    }),
    get: selectStruct("user", 1),
  });
};
