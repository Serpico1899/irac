import {
  object,
  objectIdValidation,
} from "@deps";
import {  selectStruct  } from "@app";

export const deleteEnrollmentValidator = () => {
  return object({
    set: object({
      _id: objectIdValidation,
    }),
    get: selectStruct("enrollment", 1),
  });
};
