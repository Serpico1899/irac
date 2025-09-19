import {
  object,
  string,
  optional,
  boolean,
} from "@deps";

export const deleteBookingValidator = () => {
  return object({
    set: object({
      // Booking identification (required)
      booking_id: string(),

      // Cancellation details
      cancellation_reason: optional(string()),

      // Admin options
      force_delete: optional(boolean()), // Override normal deletion rules
      send_notification: optional(boolean()), // Whether to notify customer

      // Refund handling
      process_refund: optional(boolean()), // Whether to process automatic refund
      refund_percentage: optional(string()), // "full", "partial", "none"

      // Admin notes for audit trail
      admin_notes: optional(string()),
    }),
  });
};
