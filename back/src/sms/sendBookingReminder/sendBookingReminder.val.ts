import { date, enums, object, optional, string } from "@deps";
import { mobile_pattern } from "@model";

export const sendBookingReminderValidator = () => {
  return object({
    set: object({
      booking_id: string(),
      mobile: optional(mobile_pattern),
      user_id: optional(string()),
      reminder_type: enums([
        "confirmation",
        "reminder_24h",
        "reminder_2h",
        "cancellation",
        "reschedule",
        "completion"
      ]),
      course_title: optional(string()),
      booking_date: optional(date()),
      booking_time: optional(string()),
      instructor_name: optional(string()),
      location: optional(string()),
      amount: optional(string()),
      locale: optional(string()),
    }),
    get: optional(
      object({
        booking_id: optional(string()),
        mobile: optional(string()),
        reminder_type: optional(string()),
        message_sent: optional(string()),
        scheduled_reminders: optional(string()),
        next_reminder_at: optional(string()),
        message: optional(string()),
      }),
    ),
  });
};
