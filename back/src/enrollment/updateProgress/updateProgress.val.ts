import {
  number,
  object,
  objectIdValidation,
  optional,
  string,
} from "@deps";
import {  selectStruct  } from "@app";

export const updateProgressValidator = () => {
  return object({
    set: object({
      // Required field for identification
      _id: objectIdValidation,

      // Progress tracking fields
      progress_percentage: optional(number()),
      attendance_count: optional(number()),
      assignment_scores: optional(string()),
      final_grade: optional(number()),
      points_earned: optional(number()),

      // Optional notes for progress tracking
      notes: optional(string()),
    }),
    get: selectStruct("enrollment", 1),
  });
};
