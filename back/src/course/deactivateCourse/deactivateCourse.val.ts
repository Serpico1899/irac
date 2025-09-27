import {
  boolean,
  enums,
  object,
  objectIdValidation,
  optional,
  string,
} from "@deps";
import {  selectStruct  } from "@app";

const enrollment_action_array = ["notify", "cancel_enrollments", "transfer_enrollments"];
const enrollment_action_enums = enums(enrollment_action_array);

const deactivation_status_array = ["Archived", "Sold_Out"];
const deactivation_status_enums = enums(deactivation_status_array);

export const deactivateCourseValidator = () => {
  return object({
    filter: object({
      _id: objectIdValidation,
    }),
    set: object({
      // Deactivation status - defaults to "Archived" if not specified
      status: optional(deactivation_status_enums),

      // How to handle existing enrollments
      enrollment_action: optional(enrollment_action_enums),

      // Reason for deactivation
      deactivation_reason: optional(string([
        { min: 3, message: "دلیل غیرفعال‌سازی باید حداقل 3 کاراکتر باشد" },
        { max: 500, message: "دلیل غیرفعال‌سازی نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),

      // Whether to remove featured flag (defaults to true)
      remove_featured: optional(boolean()),

      // Optional admin notes
      admin_notes: optional(string([
        { max: 1000, message: "یادداشت‌های ادمین نمی‌تواند بیش از 1000 کاراکتر باشد" }
      ])),

      // Optional notification message for enrolled students
      student_notification_message: optional(string([
        { min: 10, message: "پیام اطلاع‌رسانی باید حداقل 10 کاراکتر باشد" },
        { max: 500, message: "پیام اطلاع‌رسانی نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),

      // Whether to send notification to enrolled students
      notify_students: optional(boolean()),
    }),
    get: selectStruct("course", 2),
  });
};
