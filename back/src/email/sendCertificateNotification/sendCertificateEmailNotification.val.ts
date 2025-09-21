import { object, string, optional, enums } from "@deps";

const notification_types = ["certificate_issued", "certificate_ready", "certificate_reminder"];

export const sendCertificateEmailNotificationValidator = () => {
  return {
    set: object({
      // Required fields
      email: string(),
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
      certificate_issue_date: optional(string()),
      notification_type: optional(enums(notification_types)),

      // Instructor information
      instructor_name: optional(string()),
      instructor_name_en: optional(string()),

      // Academic details
      final_grade: optional(string()),
      locale: optional(string()),

      // Template customization
      custom_subject: optional(string()),
      custom_html: optional(string()),
      custom_text: optional(string()),
      include_download_link: optional(string()),
      include_verification_link: optional(string()),

      // Email specific options
      cc_emails: optional(string()),
      bcc_emails: optional(string()),
      reply_to: optional(string()),
    }),
    get: object({}),
  };
};
