import {
  boolean,
  number,
  object,
  optional,
  record,
  string,
} from "@deps";

export const completeCourseValidator = () => {
  return {
    set: object({
      course_id: string(),
      completion_percentage: optional(number()),
      completion_time_minutes: optional(number()),
      quiz_score: optional(number()),
      certificate_requested: optional(boolean()),
      final_assessment_score: optional(number()),
      chapters_completed: optional(number()),
      total_chapters: optional(number()),
      metadata: optional(record(string(), string())),
      completion_notes: optional(string()),
    }),
    get: object({}),
  };
};
