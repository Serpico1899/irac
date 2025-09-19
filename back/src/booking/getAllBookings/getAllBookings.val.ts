import {
  object,
  string,
  optional,
  number,
  boolean,
  coerce,
  date,
  enums,
  array,
  refine,
} from "@deps";
import {
  booking_space_type_enums,
  booking_status_enums,
  booking_payment_status_enums,
} from "@model";

// Sort field validation
const sort_field_array = [
  "created_at",
  "booking_date",
  "start_time",
  "total_price",
  "customer_name",
  "status",
  "payment_status",
  "booking_number",
  "space_type"
];
const sort_field_enums = enums(sort_field_array);

// Sort direction validation
const sort_direction_enums = enums(["asc", "desc"]);

// Export format validation
const export_format_enums = enums(["csv", "excel", "pdf"]);

// Positive number validation for pagination
const positive_number = refine(
  number(),
  "positive_number",
  (value: number) => {
    return value > 0;
  },
);

// Page size validation (max 100 records)
const page_size_validation = refine(
  number(),
  "page_size_validation",
  (value: number) => {
    return value > 0 && value <= 100;
  },
);

export const getAllBookingsValidator = () => {
  return object({
    set: object({
      // Pagination
      page: optional(positive_number),
      page_size: optional(page_size_validation),

      // Date range filters
      start_date: optional(coerce(date(), string(), (value) => new Date(value))),
      end_date: optional(coerce(date(), string(), (value) => new Date(value))),

      // Status filters
      status: optional(array(booking_status_enums)),
      payment_status: optional(array(booking_payment_status_enums)),

      // Space filters
      space_type: optional(array(booking_space_type_enums)),
      space_name: optional(string()),

      // Customer search
      search_query: optional(string()), // Search in customer name, email, phone
      customer_name: optional(string()),
      customer_email: optional(string()),
      customer_phone: optional(string()),
      company_name: optional(string()),

      // Booking details filters
      booking_number: optional(string()),
      booking_id: optional(string()),

      // Price range filters
      min_price: optional(number()),
      max_price: optional(number()),

      // Time filters
      start_time: optional(string()),
      end_time: optional(string()),

      // Special filters
      has_special_requirements: optional(boolean()),
      requires_catering: optional(boolean()),
      is_recurring: optional(boolean()),
      is_workshop_booking: optional(boolean()),

      // Admin filters
      approved_by: optional(string()), // Admin user ID
      has_admin_notes: optional(boolean()),

      // Check-in status filters
      is_checked_in: optional(boolean()),
      is_completed: optional(boolean()),
      is_overdue: optional(boolean()), // Past booking date but not completed

      // Rating filters
      min_rating: optional(refine(number(), "min_rating", (value) => value >= 1 && value <= 5)),
      max_rating: optional(refine(number(), "max_rating", (value) => value >= 1 && value <= 5)),
      has_feedback: optional(boolean()),

      // Sorting
      sort_by: optional(sort_field_enums),
      sort_direction: optional(sort_direction_enums),

      // Multiple sorting (advanced)
      multi_sort: optional(array(object({
        field: sort_field_enums,
        direction: sort_direction_enums,
      }))),

      // Export options
      export_format: optional(export_format_enums),
      include_customer_details: optional(boolean()),
      include_payment_details: optional(boolean()),
      include_admin_notes: optional(boolean()),

      // Advanced filters
      created_by_user: optional(string()), // Filter by user who created booking
      last_updated_by: optional(string()), // Filter by admin who last updated

      // Date-specific filters
      today_only: optional(boolean()),
      this_week_only: optional(boolean()),
      this_month_only: optional(boolean()),
      upcoming_only: optional(boolean()), // Future bookings only
      past_only: optional(boolean()), // Past bookings only

      // Cancellation filters
      cancelled_bookings: optional(boolean()),
      cancelled_by: optional(string()),
      has_refund: optional(boolean()),

      // Workshop-related filters
      workshop_id: optional(string()),
      workshop_session_id: optional(string()),

      // Performance options
      include_relations: optional(boolean()), // Whether to include user/order/wallet relations
      summary_only: optional(boolean()), // Return summary stats only

      // Aggregation options
      group_by: optional(enums([
        "status",
        "space_type",
        "booking_date",
        "payment_status",
        "month",
        "week",
        "customer"
      ])),

      // Quick filters (predefined combinations)
      quick_filter: optional(enums([
        "pending_approval",
        "confirmed_today",
        "checked_in_now",
        "overdue_checkins",
        "requiring_attention",
        "high_value", // Above certain amount
        "recent_cancellations",
        "recurring_bookings",
        "workshop_bookings"
      ])),
    }),
  });
};
