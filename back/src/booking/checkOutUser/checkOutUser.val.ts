import {
  object,
  string,
  optional,
  boolean,
  coerce,
  date,
  enums,
  number,
  refine,
} from "@deps";

// Checkout status options
const checkout_status_array = [
  "on_time",
  "early",
  "overtime",
  "extended"
];
const checkout_status_enums = enums(checkout_status_array);

// Space condition options
const space_condition_array = [
  "excellent",
  "good",
  "fair",
  "needs_cleaning",
  "damage_reported",
  "maintenance_required"
];
const space_condition_enums = enums(space_condition_array);

// Equipment return status
const equipment_status_array = [
  "all_returned",
  "partial_return",
  "missing_items",
  "damaged_items",
  "no_equipment_used"
];
const equipment_status_enums = enums(equipment_status_array);

// Rating validation (1-5 stars)
const rating_validation = refine(
  number(),
  "rating_validation",
  (value: number) => {
    return value >= 1 && value <= 5;
  },
);

// Positive amount validation for charges
const positive_amount = refine(
  number(),
  "positive_amount",
  (value: number) => {
    return value >= 0;
  },
);

export const checkOutUserValidator = () => {
  return object({
    set: object({
      // Booking identification (required)
      booking_id: string(),

      // Check-out timing (optional - auto-set if not provided)
      check_out_time: optional(coerce(date(), string(), (value) => new Date(value))),

      // Duration and timing assessment
      checkout_status: optional(checkout_status_enums),
      actual_duration: optional(number()), // Calculated if not provided

      // Space and equipment assessment
      space_condition: optional(space_condition_enums),
      equipment_status: optional(equipment_status_enums),
      equipment_returned: optional(string()), // List of returned equipment
      missing_equipment: optional(string()), // List of missing equipment
      damaged_equipment: optional(string()), // List of damaged equipment

      // Financial assessment
      overtime_charges: optional(positive_amount),
      damage_charges: optional(positive_amount),
      cleaning_charges: optional(positive_amount),
      additional_charges: optional(positive_amount),
      early_checkout_refund: optional(positive_amount),

      // Customer feedback and rating
      customer_rating: optional(rating_validation),
      customer_feedback: optional(string()),
      customer_complaints: optional(string()),
      customer_compliments: optional(string()),

      // Admin assessment and notes
      admin_notes: optional(string()),
      checkout_notes: optional(string()),
      damage_report: optional(string()),
      maintenance_required: optional(string()),

      // Staff and process details
      staff_member_checkout: optional(string()), // Staff member handling checkout
      checkout_location: optional(string()), // Where checkout occurred
      checkout_method: optional(enums(["in_person", "remote", "automatic", "assisted"])),

      // Service quality assessment
      special_requirements_met: optional(boolean()),
      service_quality_rating: optional(rating_validation),
      space_cleanliness_rating: optional(rating_validation),
      equipment_functionality_rating: optional(rating_validation),

      // Business process flags
      collect_detailed_feedback: optional(boolean()),
      send_checkout_receipt: optional(boolean()),
      send_feedback_survey: optional(boolean()),
      schedule_follow_up: optional(boolean()),

      // Override and special handling
      override_overtime_charges: optional(boolean()), // Waive overtime charges
      override_damage_charges: optional(boolean()), // Waive damage charges
      manual_checkout: optional(boolean()), // Manual checkout process
      emergency_checkout: optional(boolean()), // Emergency/urgent checkout

      // Future booking considerations
      blacklist_customer: optional(boolean()), // Flag customer issues
      priority_customer: optional(boolean()), // Mark as VIP for future bookings
      booking_extension_offered: optional(boolean()), // Was extension offered?
      future_booking_discount: optional(boolean()), // Offer discount for next booking

      // Quality assurance
      checkout_verification_complete: optional(boolean()),
      all_items_accounted_for: optional(boolean()),
      customer_satisfaction_confirmed: optional(boolean()),

      // Contact and follow-up
      updated_contact_info: optional(string()),
      follow_up_required: optional(boolean()),
      follow_up_reason: optional(string()),
    }),
  });
};
