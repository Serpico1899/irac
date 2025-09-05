import {
  array,
  object,
  optional,
  string,
  union,
} from "@deps";

export const getCourseValidator = {
  details: optional(
    object({
      // Course identifier - either course_id or slug must be provided
      course_id: optional(string([
        { min: 24, max: 24, message: "شناسه دوره نامعتبر است / Invalid course ID" }
      ])),

      slug: optional(string([
        { min: 1, max: 200, message: "اسلاگ دوره نامعتبر است / Invalid course slug" },
        { pattern: /^[a-z0-9-]+$/, message: "اسلاگ فقط می‌تواند شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد" }
      ])),

      // User context for enrollment status
      user_id: optional(string([
        { min: 24, max: 24, message: "شناسه کاربر نامعتبر است / Invalid user ID" }
      ])),

      // Relations to populate
      populate: optional(array(string([
        { min: 1, max: 50, message: "نام رابطه نامعتبر است / Invalid relation name" }
      ]))),
    })
  ),
};
