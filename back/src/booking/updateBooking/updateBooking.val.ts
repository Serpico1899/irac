import {
  object,
  string,
  optional,
  number,
  boolean,
  coerce,
  date,
  enums,
  refine,
} from "@deps";
import {
  booking_space_type_enums,
  booking_status_enums,
  booking_payment_status_enums,
  booking_time_slot_enums,
  booking_positive_amount,
  booking_capacity,
  booking_duration,
} from "@model";

// Email validation
const email_validation = refine(
  string(),
  "email_validation",
  (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
);

// Phone validation (basic)
const phone_validation = refine(
  string(),
  "phone_validation",
  (value: string) => {
    return value.length >= 10;
  },
);

export const updateBookingValidator = () => {
  return object({
    set: object({
      // Booking identification (required)
      booking_id: string(),

      // Space details (optional updates)
      space_type: optional(booking_space_type_enums),
      space_name: optional(string()),
      space_location: optional(string()),

      // Time details (optional updates)
      booking_date: optional(coerce(date(), string(), (value) => new Date(value))),
      start_time: optional(booking_time_slot_enums),
      end_time: optional(booking_time_slot_enums),
      duration_hours: optional(booking_duration),

      // Capacity updates
      capacity_requested: optional(booking_capacity),
      attendee_count: optional(number()),

      // Status updates (admin only)
      status: optional(booking_status_enums),
      payment_status: optional(booking_payment_status_enums),

      // Pricing updates (admin only)
      hourly_rate: optional(booking_positive_amount),
      base_price: optional(booking_positive_amount),
      additional_services_cost: optional(booking_positive_amount),
      discount_amount: optional(booking_positive_amount),
      total_price: optional(booking_positive_amount),
      currency: optional(string()),

      // Customer information updates
      customer_name: optional(string()),
      customer_email: optional(email_validation),
      customer_phone: optional(phone_validation),
      company_name: optional(string()),

      // Booking details updates
      purpose: optional(string()),
      special_requirements: optional(string()),
      equipment_needed: optional(string()),
      catering_required: optional(boolean()),

      // Check-in/out updates (admin only)
      checked_in_at: optional(coerce(date(), string(), (value) => new Date(value))),
      checked_out_at: optional(coerce(date(), string(), (value) => new Date(value))),
      actual_duration: optional(number()),

      // Payment details updates
      payment_method: optional(string()),
      payment_reference: optional(string()),
      gateway_transaction_id: optional(string()),

      // Cancellation details (admin only)
      cancelled_at: optional(coerce(date(), string(), (value) => new Date(value))),
      cancellation_reason: optional(string()),
      cancellation_fee: optional(booking_positive_amount),
      refund_amount: optional(booking_positive_amount),

      // Notification flags
      reminder_sent: optional(boolean()),
      confirmation_sent: optional(boolean()),

      // Rating and feedback
      rating: optional(refine(number(), "rating_validation", (value) => value >= 1 && value <= 5)),
      feedback: optional(string()),

      // Admin fields
      admin_notes: optional(string()),
      internal_notes: optional(string()),
      approved_by: optional(string()),

      // Update reason (for audit trail)
      update_reason: optional(string()),
    }),
  });
};
