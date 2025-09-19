import {
  object,
  string,
  optional,
  boolean,
  coerce,
  date,
  enums,
} from "@deps";

// Verification method options
const verification_method_array = [
  "id_card",
  "passport",
  "driver_license",
  "student_id",
  "company_id",
  "booking_confirmation",
  "phone_verification",
  "other"
];
const verification_method_enums = enums(verification_method_array);

// Check-in status options
const checkin_status_array = [
  "on_time",
  "early",
  "late",
  "very_late"
];
const checkin_status_enums = enums(checkin_status_array);

export const checkInUserValidator = () => {
  return object({
    set: object({
      // Booking identification (required)
      booking_id: string(),

      // Check-in timing (optional - auto-set if not provided)
      check_in_time: optional(coerce(date(), string(), (value) => new Date(value))),

      // Verification details
      verification_method: optional(verification_method_enums),
      verification_id: optional(string()), // ID number or reference
      verified_by: optional(string()), // Staff member who verified

      // Check-in status assessment
      checkin_status: optional(checkin_status_enums),

      // Customer details verification
      verify_customer_identity: optional(boolean()),
      customer_present: optional(boolean()),
      group_size_confirmed: optional(boolean()),

      // Equipment and space verification
      equipment_provided: optional(string()), // List of equipment provided
      space_condition_verified: optional(boolean()),
      special_requirements_met: optional(boolean()),

      // Admin notes and observations
      admin_notes: optional(string()),
      checkin_notes: optional(string()),
      special_observations: optional(string()),

      // Override options
      override_time_restrictions: optional(boolean()), // Allow very late check-ins
      override_capacity_limits: optional(boolean()), // Allow over-capacity
      override_payment_status: optional(boolean()), // Check-in even if payment pending

      // Notification options
      send_checkin_confirmation: optional(boolean()), // Notify customer of successful check-in
      notify_staff: optional(boolean()), // Notify other staff members

      // Additional services
      additional_services_requested: optional(string()),
      catering_confirmed: optional(boolean()),

      // Contact information updates
      emergency_contact: optional(string()),
      updated_phone_number: optional(string()),

      // Booking modifications at check-in
      actual_group_size: optional(string()), // If different from booked capacity
      duration_extension_requested: optional(boolean()),
      additional_equipment_needed: optional(string()),

      // Quality assurance
      staff_member_checkin: optional(string()), // Staff member handling check-in
      checkin_location: optional(string()), // Where check-in occurred (reception, space, etc.)
    }),
  });
};
