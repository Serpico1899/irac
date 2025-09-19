import {
  array,
  boolean,
  coerce,
  date,
  enums,
  number,
  object,
  objectIdValidation,
  optional,
  string,
} from "@deps";
import { selectStruct } from "../../../mod.ts";

const timeframe_array = ["week", "month", "quarter", "year", "all", "custom"];
const timeframe_enums = enums(timeframe_array);

const metrics_array = [
  "course_counts",
  "enrollment_stats",
  "revenue_stats",
  "popular_courses",
  "instructor_performance"
];
const metrics_enums = enums(metrics_array);

const group_by_array = ["course_type", "status", "category", "instructor", "month"];
const group_by_enums = enums(group_by_array);

export const getCourseStatsValidator = () => {
  return object({
    set: object({
      // Filter by specific course
      course_id: optional(objectIdValidation),

      // Filter by category
      category_id: optional(objectIdValidation),

      // Filter by instructor
      instructor_id: optional(objectIdValidation),

      // Time range options
      timeframe: optional(timeframe_enums),
      start_date: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      end_date: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Metrics to include
      include_metrics: optional(array(metrics_enums)),

      // Grouping options
      group_by: optional(group_by_enums),

      // Result limits
      limit: optional(number([
        { min: 1, message: "حداقل تعداد نتایج 1 است" },
        { max: 1000, message: "حداکثر تعداد نتایج 1000 است" }
      ])),

      popular_courses_limit: optional(number([
        { min: 1, message: "حداقل تعداد دوره‌های محبوب 1 است" },
        { max: 100, message: "حداکثر تعداد دوره‌های محبوب 100 است" }
      ])),

      // Include detailed breakdown
      include_detailed_breakdown: optional(boolean()),

      // Additional filter options
      status_filter: optional(array(string([
        { max: 50, message: "فیلتر وضعیت نمی‌تواند بیش از 50 کاراکتر باشد" }
      ]))),

      type_filter: optional(array(string([
        { max: 50, message: "فیلتر نوع دوره نمی‌تواند بیش از 50 کاراکتر باشد" }
      ]))),

      // Price range filters
      min_price: optional(number([
        { min: 0, message: "حداقل قیمت نمی‌تواند منفی باشد" }
      ])),

      max_price: optional(number([
        { min: 0, message: "حداکثر قیمت نمی‌تواند منفی باشد" }
      ])),

      // Include only featured courses
      featured_only: optional(boolean()),

      // Include only courses with enrollments
      with_enrollments_only: optional(boolean()),

      // Minimum student count filter
      min_students: optional(number([
        { min: 0, message: "حداقل تعداد دانشجو نمی‌تواند منفی باشد" }
      ])),

      // Include revenue projections
      include_projections: optional(boolean()),

      // Export format (for future use)
      export_format: optional(enums(["json", "csv", "excel"])),

      // Language preference for results
      result_language: optional(enums(["fa", "en", "both"])),
    }),
    get: selectStruct("course", 1),
  });
};
