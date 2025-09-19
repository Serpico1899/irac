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

const enrollment_status_array = ["Active", "Pending", "Completed", "Suspended", "Cancelled"];
const enrollment_status_enums = enums(enrollment_status_array);

const payment_status_array = ["Pending", "Paid", "Free", "Partial", "Refunded", "Failed"];
const payment_status_enums = enums(payment_status_array);

const sort_by_array = ["enrollment_date", "progress_percentage", "payment_amount", "completion_date", "user_name"];
const sort_by_enums = enums(sort_by_array);

const sort_order_array = ["asc", "desc"];
const sort_order_enums = enums(sort_order_array);

const include_fields_array = ["user_details", "payment_info", "progress_info", "enrollment_info"];
const include_fields_enums = enums(include_fields_array);

const export_format_array = ["json", "csv", "excel"];
const export_format_enums = enums(export_format_array);

export const getCourseEnrollmentsValidator = () => {
  return object({
    set: object({
      // Required: Course ID
      course_id: objectIdValidation,

      // Pagination
      page: optional(number([
        { min: 1, message: "شماره صفحه باید حداقل 1 باشد" },
        { max: 10000, message: "شماره صفحه نمی‌تواند بیش از 10000 باشد" }
      ])),
      limit: optional(number([
        { min: 1, message: "تعداد نتایج در هر صفحه باید حداقل 1 باشد" },
        { max: 100, message: "تعداد نتایج در هر صفحه نمی‌تواند بیش از 100 باشد" }
      ])),

      // Sorting
      sort_by: optional(sort_by_enums),
      sort_order: optional(sort_order_enums),

      // Status filters
      enrollment_status: optional(array(enrollment_status_enums)),
      payment_status: optional(array(payment_status_enums)),

      // Date range filters
      enrolled_after: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      enrolled_before: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Progress filters
      min_progress: optional(number([
        { min: 0, message: "حداقل پیشرفت نمی‌تواند منفی باشد" },
        { max: 100, message: "حداقل پیشرفت نمی‌تواند بیش از 100 باشد" }
      ])),
      max_progress: optional(number([
        { min: 0, message: "حداکثر پیشرفت نمی‌تواند منفی باشد" },
        { max: 100, message: "حداکثر پیشرفت نمی‌تواند بیش از 100 باشد" }
      ])),

      // Search functionality
      search_query: optional(string([
        { min: 1, message: "متن جستجو باید حداقل 1 کاراکتر باشد" },
        { max: 100, message: "متن جستجو نمی‌تواند بیش از 100 کاراکتر باشد" }
      ])),

      // Include options
      include_cancelled: optional(boolean()),
      include_summary_stats: optional(boolean()),
      include_fields: optional(array(include_fields_enums)),

      // Payment amount filters
      min_payment: optional(number([
        { min: 0, message: "حداقل مبلغ پرداخت نمی‌تواند منفی باشد" }
      ])),
      max_payment: optional(number([
        { min: 0, message: "حداکثر مبلغ پرداخت نمی‌تواند منفی باشد" }
      ])),

      // Certificate filters
      has_certificate: optional(boolean()),
      certificate_issued_after: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      certificate_issued_before: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Admin-specific filters
      enrolled_by_admin: optional(boolean()),
      has_admin_notes: optional(boolean()),

      // Completion filters
      completed_after: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      completed_before: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Source filters
      enrollment_source: optional(string([
        { max: 100, message: "منبع ثبت‌نام نمی‌تواند بیش از 100 کاراکتر باشد" }
      ])),

      // Discount filters
      has_discount: optional(boolean()),
      discount_code: optional(string([
        { max: 50, message: "کد تخفیف نمی‌تواند بیش از 50 کاراکتر باشد" }
      ])),

      // Referral filters
      has_referral: optional(boolean()),
      referral_code: optional(string([
        { max: 50, message: "کد معرف نمی‌تواند بیش از 50 کاراکتر باشد" }
      ])),

      // Notification preferences
      email_notifications: optional(boolean()),
      sms_notifications: optional(boolean()),

      // Export options
      export_format: optional(export_format_enums),
      include_sensitive_data: optional(boolean()),

      // User location filters
      city: optional(string([
        { max: 100, message: "نام شهر نمی‌تواند بیش از 100 کاراکتر باشد" }
      ])),
      province: optional(string([
        { max: 100, message: "نام استان نمی‌تواند بیش از 100 کاراکتر باشد" }
      ])),

      // Grade/Score filters
      min_practical_score: optional(number([
        { min: 0, message: "حداقل نمره عملی نمی‌تواند منفی باشد" },
        { max: 100, message: "حداقل نمره عملی نمی‌تواند بیش از 100 باشد" }
      ])),
      max_practical_score: optional(number([
        { min: 0, message: "حداکثر نمره عملی نمی‌تواند منفی باشد" },
        { max: 100, message: "حداکثر نمره عملی نمی‌تواند بیش از 100 باشد" }
      ])),
      min_theory_score: optional(number([
        { min: 0, message: "حداقل نمره تئوری نمی‌تواند منفی باشد" },
        { max: 100, message: "حداقل نمره تئوری نمی‌تواند بیش از 100 باشد" }
      ])),
      max_theory_score: optional(number([
        { min: 0, message: "حداکثر نمره تئوری نمی‌تواند منفی باشد" },
        { max: 100, message: "حداکثر نمره تئوری نمی‌تواند بیش از 100 باشد" }
      ])),

      // Workshop-specific filters
      workshop_attendance: optional(boolean()),

      // Risk/Overdue filters
      include_overdue: optional(boolean()),
      overdue_only: optional(boolean()),

      // User level filters
      user_level: optional(string([
        { max: 50, message: "سطح کاربر نمی‌تواند بیش از 50 کاراکتر باشد" }
      ])),

      // Activity filters
      last_activity_after: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      last_activity_before: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Bulk operations support
      selected_enrollment_ids: optional(array(objectIdValidation)),
      bulk_action: optional(string([
        { max: 50, message: "عملیات گروهی نمی‌تواند بیش از 50 کاراکتر باشد" }
      ])),
    }),
    get: selectStruct("enrollment", 2),
  });
};
