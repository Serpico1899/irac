import {
  coerce,
  date,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";

export const user_segment_array = [
  "all",
  "new",
  "returning",
  "active",
  "inactive",
  "premium",
  "free",
  "high_value",
  "at_risk",
  "churned"
];

export const user_segment_enums = enums(user_segment_array);

export const user_metric_array = [
  "registrations",
  "active_users",
  "retention",
  "engagement",
  "lifetime_value",
  "churn_rate",
  "conversion_rate",
  "session_duration",
  "feature_adoption"
];

export const user_metric_enums = enums(user_metric_array);

export const time_period_array = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom"
];

export const time_period_enums = enums(time_period_array);

export const activity_type_array = [
  "all",
  "login",
  "purchase",
  "course_completion",
  "booking",
  "referral",
  "download",
  "content_view",
  "profile_update"
];

export const activity_type_enums = enums(activity_type_array);

export const getUserStatisticsValidator = object({
  details: optional(object({
    // Date range
    start_date: optional(coerce(date(), string(), (value) => new Date(value))),
    end_date: optional(coerce(date(), string(), (value) => new Date(value))),

    // Analysis configuration
    period: optional(time_period_enums),
    metrics: optional(user_metric_enums),
    segment: optional(user_segment_enums),
    activity_type: optional(activity_type_enums),

    // Filters
    user_level: optional(enums(["Ghost", "Manager", "Editor", "Ordinary"])),
    registration_source: optional(enums(["direct", "referral", "social", "advertising"])),
    location: optional(string()), // City or country filter
    age_group: optional(enums(["18-25", "26-35", "36-45", "46-55", "55+"])),
    gender: optional(enums(["Male", "Female"])),

    // Cohort analysis
    cohort_type: optional(enums(["registration", "first_purchase", "first_booking"])),
    cohort_period: optional(enums(["daily", "weekly", "monthly"])),

    // Retention analysis
    retention_periods: optional(string()), // JSON array of periods to analyze
    retention_event: optional(enums(["login", "purchase", "any_activity"])),

    // Engagement metrics
    min_sessions: optional(number()),
    min_session_duration: optional(number()), // in minutes
    min_actions: optional(number()),

    // Value analysis
    min_ltv: optional(number()), // Minimum lifetime value
    max_ltv: optional(number()), // Maximum lifetime value
    value_currency: optional(enums(["IRR", "USD", "EUR"])),

    // Grouping and sorting
    group_by: optional(enums(["date", "segment", "source", "level", "location"])),
    sort_by: optional(enums(["date", "count", "value", "retention", "engagement"])),
    sort_order: optional(enums(["asc", "desc"])),

    // Pagination
    page: optional(number()),
    limit: optional(number()),

    // Output options
    include_demographics: optional(string()), // "true" or "false"
    include_behavioral: optional(string()), // "true" or "false"
    include_financial: optional(string()), // "true" or "false"
    include_predictions: optional(string()), // "true" or "false"

    // Export format
    format: optional(enums(["summary", "detailed", "cohort", "funnel"])),
    export_format: optional(enums(["json", "csv", "excel"])),
  }))
});
