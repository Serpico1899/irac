import {
  object,
  string,
  optional,
  boolean,
  enums,
  coerce,
  date,
  refine,
} from "@deps";

// Cancellation reason categories
const cancellation_reason_category_array = [
  "customer_request",
  "admin_decision",
  "payment_issues",
  "space_unavailable",
  "maintenance_required",
  "policy_violation",
  "emergency",
  "technical_issues",
  "capacity_changes",
  "schedule_conflict",
  "other"
];
const cancellation_reason_category_enums = enums(cancellation_reason_category_array);

// Refund calculation methods
const refund_method_array = [
  "automatic", // Based on cancellation policy
  "full_refund",
  "partial_refund",
  "no_refund",
  "custom_amount",
  "manual_review"
];
const refund_method_enums = enums(refund_method_array);

// Cancellation initiator
const cancelled_by_array = [
  "admin",
  "customer",
  "system",
  "staff",
  "manager"
];
const cancelled_by_enums = enums(cancelled_by_array);

// Notification preferences
const notification_method_array = [
  "email",
  "sms",
  "both",
  "none"
];
const notification_method_enums = enums(notification_method_array);

// Custom refund percentage validation (0-100)
const refund_percentage_validation = refine(
  string(),
  "refund_percentage_validation",
  (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  },
);

export const cancelBookingValidator = () => {
  return object({
    set: object({
      // Booking identification (required)
      booking_id: string(),

      // Cancellation details (required)
      cancellation_reason: string(),
      cancellation_category: optional(cancellation_reason_category_enums),
      cancelled_by: optional(cancelled_by_enums),

      // Timing details
      cancellation_requested_at: optional(coerce(date(), string(), (value) => new Date(value))),
      effective_cancellation_date: optional(coerce(date(), string(), (value) => new Date(value))),

      // Refund handling
      refund_method: optional(refund_method_enums),
      refund_percentage: optional(refund_percentage_validation),
      custom_refund_amount: optional(string()), // Custom refund amount
      waive_cancellation_fee: optional(boolean()),
      cancellation_fee_override: optional(string()),

      // Policy and timeline considerations
      respect_cancellation_policy: optional(boolean()),
      policy_override_reason: optional(string()),
      emergency_cancellation: optional(boolean()),
      immediate_cancellation: optional(boolean()),

      // Customer communication
      notify_customer: optional(boolean()),
      notification_method: optional(notification_method_enums),
      custom_message_to_customer: optional(string()),
      include_refund_details: optional(boolean()),
      include_rebooking_options: optional(boolean()),

      // Alternative solutions
      offer_rescheduling: optional(boolean()),
      suggest_alternative_spaces: optional(boolean()),
      provide_future_discount: optional(boolean()),
      discount_percentage: optional(refund_percentage_validation),

      // Admin and audit details
      admin_notes: optional(string()),
      internal_notes: optional(string()),
      requires_manager_approval: optional(boolean()),
      escalation_reason: optional(string()),

      // Customer relationship management
      customer_satisfaction_priority: optional(boolean()),
      maintain_customer_goodwill: optional(boolean()),
      blacklist_prevention: optional(boolean()),

      // Financial processing
      process_refund_immediately: optional(boolean()),
      refund_to_original_method: optional(boolean()),
      refund_to_wallet: optional(boolean()),
      create_credit_note: optional(boolean()),

      // Space management
      release_space_immediately: optional(boolean()),
      block_space_for_maintenance: optional(boolean()),
      maintenance_duration_hours: optional(string()),

      // Follow-up actions
      schedule_follow_up_call: optional(boolean()),
      send_feedback_survey: optional(boolean()),
      create_customer_service_ticket: optional(boolean()),
      flag_for_review: optional(boolean()),

      // Bulk cancellation support
      is_bulk_cancellation: optional(boolean()),
      bulk_cancellation_group: optional(string()),
      apply_to_related_bookings: optional(boolean()),

      // Legal and compliance
      comply_with_consumer_rights: optional(boolean()),
      document_legal_basis: optional(string()),
      cooling_off_period_applicable: optional(boolean()),

      // Integration and external systems
      update_external_calendar: optional(boolean()),
      notify_third_party_services: optional(boolean()),
      cancel_related_services: optional(boolean()),

      // Quality assurance
      cancellation_verification_complete: optional(boolean()),
      customer_acknowledgment_required: optional(boolean()),
      manager_sign_off_required: optional(boolean()),

      // Reporting and analytics
      include_in_cancellation_statistics: optional(boolean()),
      flag_as_preventable_cancellation: optional(boolean()),
      identify_improvement_opportunities: optional(boolean()),
    }),
  });
};
