import {
  object,
  objectIdValidation,
  optional,
  string,
} from "@deps";
import { selectStruct } from "../../../mod.ts";

export const activateCourseValidator = () => {
  return object({
    filter: object({
      _id: objectIdValidation,
    }),
    set: object({
      // Optional fields that can be set during activation
      // Most fields are set automatically in preAct functions
      activation_notes: optional(string([
        { max: 500, message: "یادداشت فعال‌سازی نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),
    }),
    get: selectStruct("course", 2),
  });
};
