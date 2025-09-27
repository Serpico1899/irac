import {
  boolean,
  coerce,
  date,
  defaulted,
  number,
  object,
  objectIdValidation,
  optional,
  string,
} from "@deps";
import {  selectStruct  } from "@app";
import { enrollment_status_enums } from "@model";

export const createEnrollmentValidator = () => {
  return object({
    set: object({
      // Required fields
      user: objectIdValidation,
      course: objectIdValidation,
      total_paid: number(),

      // Optional fields with defaults
      enrollment_date: optional(
        coerce(date(), string(), (value) => new Date(value)),
      ),
      status: optional(enrollment_status_enums),
      progress_percentage: optional(number()),
      points_earned: optional(number()),
      points_used_for_enrollment: optional(number()),
      discount_applied: optional(number()),
      attendance_count: optional(number()),
      certificate_issued: optional(boolean()),

      // Optional fields
      completed_date: optional(
        coerce(date(), string(), (value) => new Date(value)),
      ),
      assignment_scores: optional(string()),
      final_grade: optional(number()),
      certificate_issue_date: optional(
        coerce(date(), string(), (value) => new Date(value)),
      ),
      notes: optional(string()),

      // Optional relations
      order: optional(objectIdValidation),
      certificate: optional(objectIdValidation),
    }),
    get: selectStruct("enrollment", 1),
  });
};
