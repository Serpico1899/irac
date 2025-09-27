import { coreApp } from "@app";
import {
  array,
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  object,
  optional,
  refine,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const space_type_array = [
  "private_office",
  "shared_desk",
  "meeting_room",
  "workshop_space",
  "conference_room",
  "studio",
  "event_hall",
  "phone_booth",
  "lounge_area"
];
export const space_type_enums = enums(space_type_array);

export const availability_status_array = [
  "available",
  "partially_booked",
  "fully_booked",
  "maintenance",
  "blocked",
  "unavailable"
];
export const availability_status_enums = enums(availability_status_array);

export const time_slot_array = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00"
];
export const time_slot_enums = enums(time_slot_array);

// Validate positive capacity
export const positive_capacity = refine(
  number(),
  "positive_capacity",
  (value: number) => {
    return value >= 0;
  },
);

// Validate capacity doesn't exceed total
export const valid_booked_capacity = refine(
  number(),
  "valid_booked_capacity",
  (value: number) => {
    return value >= 0;
  },
);

// Time slot structure
export const time_slot_struct = object({
  start_time: time_slot_enums,
  end_time: time_slot_enums,
  available_capacity: positive_capacity,
  booked_capacity: valid_booked_capacity,
  status: availability_status_enums,
  price_per_hour: optional(number()),
  is_peak_time: defaulted(boolean(), false),
});

export const space_availability_pure = {
  // Date and space identification
  date: coerce(date(), string(), (value) => new Date(value)),
  space_type: space_type_enums,
  space_identifier: optional(string()), // Specific room/desk ID

  // Overall capacity for the day
  total_capacity: positive_capacity,
  booked_capacity: defaulted(valid_booked_capacity, 0),
  available_capacity: positive_capacity,

  // Overall status for the day
  overall_status: defaulted(availability_status_enums, "available"),

  // Time slot breakdown
  available_slots: defaulted(array(time_slot_struct), []),
  blocked_slots: defaulted(array(time_slot_struct), []),

  // Operating hours
  opening_time: defaulted(string(), "08:00"),
  closing_time: defaulted(string(), "20:00"),
  is_operating_day: defaulted(boolean(), true),

  // Pricing
  base_hourly_rate: defaulted(number(), 0),
  peak_hour_rate: optional(number()),
  discount_rate: optional(number()),

  // Peak time definitions
  peak_hours: defaulted(array(string()), []),
  is_weekend: defaulted(boolean(), false),
  is_holiday: defaulted(boolean(), false),

  // Maintenance and blocking
  maintenance_scheduled: defaulted(boolean(), false),
  maintenance_reason: optional(string()),
  maintenance_start: optional(string()),
  maintenance_end: optional(string()),

  // Special events or restrictions
  special_event: defaulted(boolean(), false),
  event_name: optional(string()),
  restricted_access: defaulted(boolean(), false),
  restriction_reason: optional(string()),

  // Booking rules
  minimum_booking_hours: defaulted(number(), 1),
  maximum_booking_hours: defaulted(number(), 8),
  advance_booking_days: defaulted(number(), 30),
  cancellation_policy: optional(string()),

  // Real-time tracking
  last_booking_at: optional(coerce(date(), string(), (value) => new Date(value))),
  last_cancellation_at: optional(coerce(date(), string(), (value) => new Date(value))),
  occupancy_rate: defaulted(number(), 0), // Percentage

  // Statistics for the day
  total_bookings: defaulted(number(), 0),
  total_revenue: defaulted(number(), 0),
  average_booking_duration: defaulted(number(), 0),

  // Admin controls
  manually_blocked: defaulted(boolean(), false),
  block_reason: optional(string()),
  blocked_by: optional(string()), // Admin user ID
  blocked_until: optional(coerce(date(), string(), (value) => new Date(value))),

  // Notifications
  low_availability_threshold: defaulted(number(), 2),
  alert_sent: defaulted(boolean(), false),

  // Cache and performance
  cache_expires_at: optional(coerce(date(), string(), (value) => new Date(value))),
  last_calculated_at: defaulted(coerce(date(), string(), (value) => new Date(value)), () => new Date()),

  ...createUpdateAt,
};

export const space_availabilities = () =>
  coreApp.odm.newModel("space_availability", space_availability_pure, {}, {
    createIndex:
    {
      indexSpec: { "date": 1, "space_type": 1 },
      options: { unique: true },
    },

  });
