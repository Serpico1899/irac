import {
  object,
  string,
  optional,
  boolean,
  coerce,
  date,
} from "@deps";

export const approveBookingValidator = () => {
  return object({
    set: object({
      // Booking identification (required)
      booking_id: string(),

      // Approval details
      approval_notes: optional(string()),
      admin_notes: optional(string()),

      // Notification options
      send_confirmation: optional(boolean()), // Whether to send confirmation to customer
      send_sms_notification: optional(boolean()), // Whether to send SMS notification

      // Payment confirmation
      payment_confirmed: optional(boolean()), // Confirm payment is received
      payment_method: optional(string()), // How payment was confirmed
      payment_reference: optional(string()), // Payment reference number

      // Approval timing (optional - usually auto-set)
      approved_at: optional(coerce(date(), string(), (value) => new Date(value))),

      // Space confirmation
      confirm_space_availability: optional(boolean()), // Double-check space is available

      // Special arrangements
      special_arrangements: optional(string()), // Any special notes for this approval
      priority_booking: optional(boolean()), // Mark as priority booking

      // Override options
      override_payment_check: optional(boolean()), // Approve even if payment not confirmed
      override_capacity_check: optional(boolean()), // Approve even if capacity seems exceeded
    }),
  });
};
