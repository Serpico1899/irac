import {
  boolean,
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

export const updateEnrollmentValidator = () => {
  return object({
    set: object({
      // Required field for identification
      _id: objectIdValidation,

      // Optional enrollment fields that can be updated
      enrollment_date: optional(
        coerce(date(), string(), (value) => new Date(value)),
      ),
      status: optional(enrollment_status_enums),
      progress_percentage: optional(number()),
      completed_date: optional(
        coerce(date(), string(), (value) => new Date(value)),
      ),
      points_earned: optional(number()),
      points_used_for_enrollment: optional(number()),
      total_paid: optional(number()),
      discount_applied: optional(number()),
      attendance_count: optional(number()),
      assignment_scores: optional(string()),
      final_grade: optional(number()),
      certificate_issued: optional(boolean()),
      certificate_issue_date: optional(
        coerce(date(), string(), (value) => new Date(value)),
      ),
      notes: optional(string()),

      // Optional relation updates
      user: optional(objectIdValidation),
      course: optional(objectIdValidation),
      order: optional(objectIdValidation),
      certificate: optional(objectIdValidation),
    }),
    get: selectStruct("enrollment", 1),
  });
};
