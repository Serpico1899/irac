import { number, object, optional } from "@deps";
import { selectStruct } from "../../../mod.ts";

export const getCoursesValidator = () => {
  return object({
    set: object({
      page: optional(number()),
      limit: optional(number()),
    }),
    get: selectStruct("course", 2),
  });
};
