import {
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
import {  selectStruct  } from "@app";

const payment_status_array = ["Pending", "Paid", "Free", "Partial", "Refunded", "Failed"];
const payment_status_enums = enums(payment_status_array);

const enrollment_status_array = ["Active", "Pending", "Completed", "Suspended", "Cancelled"];
const enrollment_status_enums = enums(enrollment_status_array);

export const enrollStudentValidator = () => {
  return object({
    set: object({
      // Required fields
      course_id: objectIdValidation,
      user_id: objectIdValidation,

      // Enrollment status
      enrollment_status: optional(enrollment_status_enums),

      // Payment information
      payment_status: optional(payment_status_enums),
      payment_amount: optional(number([
        { min: 0, message: "مبلغ پرداخت نمی‌تواند منفی باشد" },
        { max: 999999999, message: "مبلغ پرداخت بیش از حد مجاز است" }
      ])),
      payment_method: optional(string([
        { max: 100, message: "روش پرداخت نمی‌تواند بیش از 100 کاراکتر باشد" }
      ])),
      payment_reference: optional(string([
        { max: 200, message: "شماره مرجع پرداخت نمی‌تواند بیش از 200 کاراکتر باشد" }
      ])),
      payment_date: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Enrollment dates
      enrollment_date: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      completion_date: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Progress tracking
      progress_percentage: optional(number([
        { min: 0, message: "درصد پیشرفت نمی‌تواند منفی باشد" },
        { max: 100, message: "درصد پیشرفت نمی‌تواند بیش از 100 باشد" }
      ])),
      lessons_completed: optional(number([
        { min: 0, message: "تعداد درس‌های تکمیل شده نمی‌تواند منفی باشد" }
      ])),
      total_lessons: optional(number([
        { min: 0, message: "تعداد کل درس‌ها نمی‌تواند منفی باشد" }
      ])),

      // Points system
      completion_points_required: optional(number([
        { min: 0, message: "امتیاز مورد نیاز نمی‌تواند منفی باشد" }
      ])),
      completion_points_earned: optional(number([
        { min: 0, message: "امتیاز کسب شده نمی‌تواند منفی باشد" }
      ])),

      // Certificate information
      certificate_issued: optional(boolean()),
      certificate_number: optional(string([
        { max: 100, message: "شماره گواهینامه نمی‌تواند بیش از 100 کاراکتر باشد" }
      ])),
      certificate_issued_date: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Admin fields
      enrolled_by_admin: optional(boolean()),
      admin_notes: optional(string([
        { max: 1000, message: "یادداشت‌های ادمین نمی‌تواند بیش از 1000 کاراکتر باشد" }
      ])),

      // Discount and pricing
      discount_applied: optional(boolean()),
      discount_amount: optional(number([
        { min: 0, message: "مبلغ تخفیف نمی‌تواند منفی باشد" }
      ])),
      discount_code: optional(string([
        { max: 50, message: "کد تخفیف نمی‌تواند بیش از 50 کاراکتر باشد" }
      ])),
      final_amount: optional(number([
        { min: 0, message: "مبلغ نهایی نمی‌تواند منفی باشد" }
      ])),

      // Course context (auto-filled)
      course_name: optional(string([
        { max: 200, message: "نام دوره نمی‌تواند بیش از 200 کاراکتر باشد" }
      ])),
      course_type: optional(string([
        { max: 50, message: "نوع دوره نمی‌تواند بیش از 50 کاراکتر باشد" }
      ])),
      course_price: optional(number([
        { min: 0, message: "قیمت دوره نمی‌تواند منفی باشد" }
      ])),

      // Additional metadata
      source: optional(string([
        { max: 100, message: "منبع ثبت‌نام نمی‌تواند بیش از 100 کاراکتر باشد" }
      ])),
      referral_code: optional(string([
        { max: 50, message: "کد معرف نمی‌تواند بیش از 50 کاراکتر باشد" }
      ])),

      // Communication preferences
      email_notifications: optional(boolean()),
      sms_notifications: optional(boolean()),

      // Custom fields for specific course types
      workshop_attendance: optional(boolean()),
      practical_score: optional(number([
        { min: 0, message: "نمره عملی نمی‌تواند منفی باشد" },
        { max: 100, message: "نمره عملی نمی‌تواند بیش از 100 باشد" }
      ])),
      theory_score: optional(number([
        { min: 0, message: "نمره تئوری نمی‌تواند منفی باشد" },
        { max: 100, message: "نمره تئوری نمی‌تواند بیش از 100 باشد" }
      ])),
      final_grade: optional(string([
        { max: 10, message: "نمره نهایی نمی‌تواند بیش از 10 کاراکتر باشد" }
      ])),
    }),
    get: selectStruct("enrollment", 2),
  });
};
