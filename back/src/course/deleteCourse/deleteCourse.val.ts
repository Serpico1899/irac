import {
  object,
  objectIdValidation,
} from "@deps";
import { selectStruct } from "../../../mod.ts";

export const deleteCourseValidator = () => {
  return object({
    filter: object({
      _id: objectIdValidation,
    }),
    get: selectStruct("course", 2),
  });
};
