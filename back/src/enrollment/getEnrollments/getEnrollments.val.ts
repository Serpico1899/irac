import {
  coerce,
  date,
  number,
  object,
  objectIdValidation,
  optional,
  string,
} from "@deps";
import {  selectStruct  } from "@app";
import { enrollment_status_enums } from "@model";

export const getEnrollmentsValidator = () => {
  return object({
    set: object({
      // Pagination
      page: optional(number()),
      limit: optional(number()),

      // Sorting
      sort: optional(object({
        field: string(),
        type: string(), // "asc" or "desc"
      })),

      // Filters
      status: optional(enrollment_status_enums),
      user: optional(objectIdValidation),
      course: optional(objectIdValidation),

      // Date range filters
      enrollment_date_from: optional(
        coerce(date(), string(), (value) => new Date(value)),
      ),
      enrollment_date_to: optional(
        coerce(date(), string(), (value) => new Date(value)),
      ),

      // Progress range filters
      progress_min: optional(number()),
      progress_max: optional(number()),
    }),
    get: selectStruct("enrollment", 2),
  });
};
