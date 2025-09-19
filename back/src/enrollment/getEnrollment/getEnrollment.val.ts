import {
  object,
  objectIdValidation,
} from "@deps";
import { selectStruct } from "../../../mod.ts";

export const getEnrollmentValidator = () => {
  return object({
    set: object({
      _id: objectIdValidation,
    }),
    get: selectStruct("enrollment", 2),
  });
};
