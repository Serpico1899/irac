import {
  object,
  string,
  optional,
  boolean,
  enums,
} from "@deps";

// Rejection reason categories
const rejection_reason_category_array = [
  "payment_failed",
  "insufficient_capacity",
  "space_unavailable",
  "policy_violation",
  "incomplete_information",
  "duplicate_booking",
  "maintenance_scheduled",
  "admin_decision",
  "customer_request",
  "other"
];
const rejection_reason_category_enums = enums(rejection_reason_category_array);

// Refund processing options
const refund_processing_enums = enums(["full_refund", "partial_refund", "no_refund", "manual_review"]);

export const rejectBookingValidator = () => {
  return object({
    set: object({
      // Booking identification (required)
      booking_id: string(),

      // Rejection details (required)
      rejection_reason: string(),
      rejection_category: optional(rejection_reason_category_enums),

      // Admin details
      admin_notes: optional(string()),
      internal_notes: optional(string()),

      // Refund handling
      refund_processing: optional(refund_processing_enums),
      refund_percentage: optional(string()), // Custom percentage like "75" for 75%

      // Customer notification
      send_notification: optional(boolean()), // Whether to notify customer
      notification_message: optional(string()), // Custom message to customer
      include_alternative_dates: optional(boolean()), // Suggest alternative dates

      // Administrative flags
      blacklist_customer: optional(boolean()), // Flag customer for review
      flag_for_review: optional(boolean()), // Flag this rejection for manager review

      // Auto-suggestion system
      suggest_alternatives: optional(boolean()), // Auto-suggest alternative spaces/times
      alternative_space_types: optional(string()), // Comma-separated list of space types
      alternative_dates: optional(string()), // Suggest specific dates

      // Escalation options
      escalate_to_manager: optional(boolean()), // Escalate for manager review
      priority_handling: optional(boolean()), // Mark for priority follow-up
    }),
  });
};
