import {
  object,
  string,
  optional,
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

// Time period options for analytics
const time_period_array = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom"
];
const time_period_enums = enums(time_period_array);

// Metric selection options
const metrics_array = [
  "total_bookings",
  "total_revenue",
  "average_booking_value",
  "occupancy_rate",
  "cancellation_rate",
  "customer_satisfaction",
  "space_utilization",
  "peak_hours",
  "conversion_rate",
  "repeat_customer_rate"
];
const metrics_enums = enums(metrics_array);

// Grouping options for statistics
const group_by_array = [
  "date",
  "space_type",
  "status",
  "payment_status",
  "hour",
  "day_of_week",
  "month",
  "customer_segment",
  "booking_source"
];
const group_by_enums = enums(group_by_array);

// Chart type options
const chart_type_array = [
  "line",
  "bar",
  "pie",
  "area",
  "scatter",
  "heatmap",
  "table"
];
const chart_type_enums = enums(chart_type_array);

// Export format options
const export_format_array = [
  "json",
  "csv",
  "excel",
  "pdf",
  "png",
  "svg"
];
const export_format_enums = enums(export_format_array);

// Comparison period validation
const comparison_period_array = [
  "previous_period",
  "same_period_last_year",
  "same_period_last_month",
  "custom_period",
  "none"
];
const comparison_period_enums = enums(comparison_period_array);

export const getBookingStatsValidator = () => {
  return object({
    set: object({
      // Time range filters
      start_date: optional(coerce(date(), string(), (value) => new Date(value))),
      end_date: optional(coerce(date(), string(), (value) => new Date(value))),
      time_period: optional(time_period_enums),

      // Quick time filters
      today: optional(boolean()),
      this_week: optional(boolean()),
      this_month: optional(boolean()),
      this_quarter: optional(boolean()),
      this_year: optional(boolean()),
      last_30_days: optional(boolean()),
      last_90_days: optional(boolean()),

      // Filtering options
      space_types: optional(array(booking_space_type_enums)),
      statuses: optional(array(booking_status_enums)),
      payment_statuses: optional(array(booking_payment_status_enums)),

      // Metrics selection
      metrics: optional(array(metrics_enums)),
      include_all_metrics: optional(boolean()),

      // Grouping and segmentation
      group_by: optional(group_by_enums),
      segment_by_hour: optional(boolean()),
      segment_by_day: optional(boolean()),
      segment_by_customer_type: optional(boolean()),

      // Comparison options
      include_comparison: optional(boolean()),
      comparison_period: optional(comparison_period_enums),
      comparison_start_date: optional(coerce(date(), string(), (value) => new Date(value))),
      comparison_end_date: optional(coerce(date(), string(), (value) => new Date(value))),

      // Advanced analytics
      calculate_trends: optional(boolean()),
      include_forecasting: optional(boolean()),
      customer_lifetime_value: optional(boolean()),
      seasonal_analysis: optional(boolean()),
      peak_time_analysis: optional(boolean()),

      // Revenue analytics
      include_revenue_breakdown: optional(boolean()),
      revenue_by_space_type: optional(boolean()),
      average_revenue_per_user: optional(boolean()),
      profit_margin_analysis: optional(boolean()),

      // Customer analytics
      customer_retention_rate: optional(boolean()),
      new_vs_returning_customers: optional(boolean()),
      customer_satisfaction_trends: optional(boolean()),
      customer_demographic_analysis: optional(boolean()),

      // Operational analytics
      space_efficiency_metrics: optional(boolean()),
      booking_lead_time_analysis: optional(boolean()),
      cancellation_pattern_analysis: optional(boolean()),
      no_show_rate_analysis: optional(boolean()),

      // Performance indicators
      include_kpis: optional(boolean()),
      benchmark_against_targets: optional(boolean()),
      identify_growth_opportunities: optional(boolean()),

      // Data presentation
      chart_type: optional(chart_type_enums),
      include_charts: optional(boolean()),
      chart_resolution: optional(enums(["low", "medium", "high"])),

      // Export and sharing
      export_format: optional(export_format_enums),
      include_raw_data: optional(boolean()),
      generate_report: optional(boolean()),
      report_title: optional(string()),

      // Cache and performance
      use_cache: optional(boolean()),
      cache_duration_minutes: optional(refine(
        string(),
        "cache_duration",
        (value) => !isNaN(parseInt(value)) && parseInt(value) > 0 && parseInt(value) <= 1440
      )),

      // Filtering by specific criteria
      min_booking_value: optional(string()),
      max_booking_value: optional(string()),
      customer_segments: optional(array(string())),
      booking_sources: optional(array(string())),

      // Geographic and demographic filters
      customer_locations: optional(array(string())),
      company_bookings_only: optional(boolean()),
      individual_bookings_only: optional(boolean()),

      // Special event analysis
      exclude_holidays: optional(boolean()),
      exclude_weekends: optional(boolean()),
      special_events_impact: optional(boolean()),

      // Detailed breakdown options
      hourly_breakdown: optional(boolean()),
      daily_breakdown: optional(boolean()),
      weekly_breakdown: optional(boolean()),
      monthly_breakdown: optional(boolean()),

      // Quality metrics
      include_ratings_analysis: optional(boolean()),
      include_feedback_sentiment: optional(boolean()),
      service_quality_trends: optional(boolean()),

      // Operational efficiency
      staff_productivity_metrics: optional(boolean()),
      resource_utilization_rates: optional(boolean()),
      maintenance_impact_analysis: optional(boolean()),

      // Financial metrics
      cost_per_booking: optional(boolean()),
      profit_per_space_type: optional(boolean()),
      seasonal_pricing_effectiveness: optional(boolean()),

      // Predictive analytics
      demand_forecasting: optional(boolean()),
      capacity_planning_insights: optional(boolean()),
      price_optimization_suggestions: optional(boolean()),

      // Alert thresholds
      set_performance_alerts: optional(boolean()),
      alert_thresholds: optional(object({
        low_occupancy_rate: optional(string()),
        high_cancellation_rate: optional(string()),
        low_customer_satisfaction: optional(string()),
      })),
    }),
  });
};
