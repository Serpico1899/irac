import {
  coerce,
  date,
  enums,
  object,
  optional,
  string,
} from "@deps";

export const report_period_array = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom"
];

export const report_period_enums = enums(report_period_array);

export const revenue_source_array = [
  "all",
  "products",
  "courses",
  "bookings",
  "workshops",
  "digital_downloads"
];

export const revenue_source_enums = enums(revenue_source_array);

export const report_format_array = [
  "summary",
  "detailed",
  "breakdown",
  "comparative"
];

export const report_format_enums = enums(report_format_array);

export const getRevenueReportValidator = object({
  details: optional(object({
    // Date range
    start_date: optional(coerce(date(), string(), (value) => new Date(value))),
    end_date: optional(coerce(date(), string(), (value) => new Date(value))),

    // Report configuration
    period: optional(report_period_enums),
    source: optional(revenue_source_enums),
    format: optional(report_format_enums),

    // Filters
    category_id: optional(string()),
    user_segment: optional(enums(["all", "new", "returning", "premium"])),
    payment_status: optional(enums(["all", "paid", "pending", "refunded"])),

    // Grouping and sorting
    group_by: optional(enums(["date", "source", "category", "user_type"])),
    sort_by: optional(enums(["date", "amount", "count", "growth"])),
    sort_order: optional(enums(["asc", "desc"])),

    // Pagination
    page: optional(coerce(date(), string(), (value) => Math.max(1, parseInt(value) || 1))),
    limit: optional(coerce(date(), string(), (value) => Math.min(100, Math.max(1, parseInt(value) || 10)))),

    // Currency and timezone
    currency: optional(enums(["IRR", "USD", "EUR"])),
    timezone: optional(string()),

    // Export options
    include_trends: optional(string()),
    include_comparisons: optional(string()),
    include_forecasts: optional(string()),
  }))
});
