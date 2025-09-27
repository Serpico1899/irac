import { coreApp } from "@app";
import {
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  optional,
  refine,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const booking_space_type_array = [
  "private_office",
  "shared_desk",
  "meeting_room",
  "workshop_space",
  "conference_room",
  "studio"
];
export const booking_space_type_enums = enums(booking_space_type_array);

export const booking_status_array = [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show"
];
export const booking_status_enums = enums(booking_status_array);

export const booking_payment_status_array = [
  "pending",
  "paid",
  "refunded",
  "failed",
  "partial_refund"
];
export const booking_payment_status_enums = enums(booking_payment_status_array);

export const booking_time_slot_array = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00"
];
export const booking_time_slot_enums = enums(booking_time_slot_array);

// Validate positive amounts
export const booking_positive_amount = refine(
  number(),
  "booking_positive_amount",
  (value: number) => {
    return value >= 0;
  },
);

// Validate capacity (1-50 people)
export const booking_capacity = refine(
  number(),
  "booking_capacity",
  (value: number) => {
    return value >= 1 && value <= 50;
  },
);

// Validate duration (0.5-12 hours)
export const booking_duration = refine(
  number(),
  "booking_duration",
  (value: number) => {
    return value >= 0.5 && value <= 12;
  },
);

export const booking_pure = {
  booking_number: string(), // Human-readable booking number
  booking_id: string(), // Unique internal ID

  // Space details
  space_type: booking_space_type_enums,
  space_name: optional(string()),
  space_location: optional(string()),

  // Time details
  booking_date: coerce(date(), string(), (value) => new Date(value)),
  start_time: booking_time_slot_enums,
  end_time: booking_time_slot_enums,
  duration_hours: booking_duration,

  // Capacity
  capacity_requested: booking_capacity,
  capacity_available: optional(number()),
  attendee_count: defaulted(number(), 1),

  // Status
  status: defaulted(booking_status_enums, "pending"),
  payment_status: defaulted(booking_payment_status_enums, "pending"),

  // Pricing
  hourly_rate: booking_positive_amount,
  total_hours: booking_duration,
  base_price: booking_positive_amount,
  additional_services_cost: defaulted(booking_positive_amount, 0),
  discount_amount: defaulted(booking_positive_amount, 0),
  total_price: booking_positive_amount,
  currency: defaulted(string(), "IRR"),

  // Customer information
  customer_name: string(),
  customer_email: optional(string()),
  customer_phone: optional(string()),
  company_name: optional(string()),

  // Booking details
  purpose: optional(string()), // Meeting, workshop, etc.
  special_requirements: optional(string()),
  equipment_needed: optional(string()),
  catering_required: defaulted(boolean(), false),

  // Workshop relation (if part of a workshop)
  workshop_session_id: optional(string()),
  is_workshop_booking: defaulted(boolean(), false),

  // Check-in/out tracking
  checked_in_at: optional(coerce(date(), string(), (value) => new Date(value))),
  checked_out_at: optional(coerce(date(), string(), (value) => new Date(value))),
  actual_duration: optional(number()),

  // Payment details
  payment_method: optional(string()),
  payment_reference: optional(string()),
  gateway_transaction_id: optional(string()),

  // Cancellation
  cancelled_at: optional(coerce(date(), string(), (value) => new Date(value))),
  cancellation_reason: optional(string()),
  cancellation_fee: defaulted(booking_positive_amount, 0),
  refund_amount: defaulted(booking_positive_amount, 0),

  // Reminders and notifications
  reminder_sent: defaulted(boolean(), false),
  confirmation_sent: defaulted(boolean(), false),

  // Rating and feedback
  rating: optional(number()), // 1-5 stars
  feedback: optional(string()),

  // Admin fields
  admin_notes: optional(string()),
  internal_notes: optional(string()),
  approved_by: optional(string()), // Admin user ID

  // Recurring booking
  is_recurring: defaulted(boolean(), false),
  recurring_pattern: optional(string()), // weekly, monthly
  recurring_end_date: optional(coerce(date(), string(), (value) => new Date(value))),
  parent_booking_id: optional(string()),

  ...createUpdateAt,
};

export const booking_relations = {
  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {},
  },
  workshop: {
    schemaName: "course", // Using course as workshop
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  // Link to order for payment tracking
  order: {
    schemaName: "order",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  // Link to wallet transaction if paid via wallet
  wallet_transaction: {
    schemaName: "wallet_transaction",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const bookings = () =>
  coreApp.odm.newModel("booking", booking_pure, booking_relations, {
    createIndex:
    {
      indexSpec: { "booking_number": 1 },
      options: { unique: true },
    }
  });
