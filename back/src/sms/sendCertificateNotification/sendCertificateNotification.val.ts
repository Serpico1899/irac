import { object, string, optional, enums } from "@deps";

const notification_types = ["certificate_issued", "certificate_ready", "certificate_reminder"];

export const sendCertificateNotificationValidator = () => {
  return {
    set: object({
      // Required fields
      phone_number: string(),
      user_id: string(),
      certificate_number: string(),
      course_name: string(),
      student_name: string(),

      // Optional fields
      student_name_en: optional(string()),
      course_name_en: optional(string()),
      certificate_url: optional(string()),
      verification_url: optional(string()),
      completion_date: optional(string()),
      notification_type: optional(enums(notification_types)),

      // Template customization
      custom_message: optional(string()),
      include_download_link: optional(string()),
      include_verification_link: optional(string()),
    }),
    get: object({}),
  };
};
