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
} from "@model";

// Time granularity options for analysis
const time_granularity_array = [
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly"
];
const time_granularity_enums = enums(time_granularity_array);

// Utilization metrics selection
const utilization_metrics_array = [
  "occupancy_rate",
  "capacity_utilization",
  "revenue_per_space",
  "revenue_per_hour",
  "booking_frequency",
  "average_duration",
  "peak_hours_analysis",
  "off_peak_analysis",
  "space_turnover_rate",
  "customer_satisfaction_by_space"
];
const utilization_metrics_enums = enums(utilization_metrics_array);

// Analysis type options
const analysis_type_array = [
  "current_status",
  "trend_analysis",
  "comparative_analysis",
  "predictive_analysis",
  "efficiency_analysis",
  "financial_analysis"
];
const analysis_type_enums = enums(analysis_type_array);

// Report format options
const report_format_array = [
  "json",
  "csv",
  "excel",
  "pdf",
  "dashboard",
  "summary"
];
const report_format_enums = enums(report_format_array);

// Comparison period options
const comparison_period_array = [
  "previous_period",
  "same_period_last_month",
  "same_period_last_quarter",
  "same_period_last_year",
  "custom_period"
];
const comparison_period_enums = enums(comparison_period_array);

// Space grouping options
const space_grouping_array = [
  "individual_spaces",
  "by_space_type",
  "by_capacity_range",
  "by_location",
  "by_amenities",
  "by_price_range"
];
const space_grouping_enums = enums(space_grouping_array);

// Percentage validation (0-100)
const percentage_validation = refine(
  string(),
  "percentage_validation",
  (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  },
);

export const getSpaceUtilizationValidator = () => {
  return object({
    set: object({
      // Time range filters
      start_date: optional(coerce(date(), string(), (value) => new Date(value))),
      end_date: optional(coerce(date(), string(), (value) => new Date(value))),

      // Quick time period filters
      today: optional(boolean()),
      yesterday: optional(boolean()),
      this_week: optional(boolean()),
      last_week: optional(boolean()),
      this_month: optional(boolean()),
      last_month: optional(boolean()),
      this_quarter: optional(boolean()),
      last_quarter: optional(boolean()),
      this_year: optional(boolean()),
      last_year: optional(boolean()),
      last_30_days: optional(boolean()),
      last_90_days: optional(boolean()),

      // Space filtering
      space_types: optional(array(booking_space_type_enums)),
      specific_spaces: optional(array(string())),
      exclude_spaces: optional(array(string())),
      minimum_capacity: optional(string()),
      maximum_capacity: optional(string()),

      // Analysis configuration
      time_granularity: optional(time_granularity_enums),
      analysis_type: optional(array(analysis_type_enums)),
      metrics: optional(array(utilization_metrics_enums)),
      include_all_metrics: optional(boolean()),

      // Grouping and segmentation
      group_by: optional(space_grouping_enums),
      segment_by_time: optional(boolean()),
      segment_by_day_type: optional(boolean()), // weekday vs weekend
      segment_by_booking_source: optional(boolean()),

      // Status and booking filters
      include_statuses: optional(array(booking_status_enums)),
      exclude_cancelled: optional(boolean()),
      exclude_no_shows: optional(boolean()),
      paid_bookings_only: optional(boolean()),

      // Performance and efficiency analysis
      calculate_efficiency_scores: optional(boolean()),
      identify_underutilized_spaces: optional(boolean()),
      identify_peak_demand_periods: optional(boolean()),
      calculate_revenue_optimization: optional(boolean()),

      // Comparative analysis
      include_comparison: optional(boolean()),
      comparison_period: optional(comparison_period_enums),
      comparison_start_date: optional(coerce(date(), string(), (value) => new Date(value))),
      comparison_end_date: optional(coerce(date(), string(), (value) => new Date(value))),
      benchmark_against_targets: optional(boolean()),

      // Utilization thresholds
      low_utilization_threshold: optional(percentage_validation),
      high_utilization_threshold: optional(percentage_validation),
      target_occupancy_rate: optional(percentage_validation),

      // Financial analysis
      include_revenue_analysis: optional(boolean()),
      calculate_profit_margins: optional(boolean()),
      include_cost_per_hour: optional(boolean()),
      analyze_pricing_effectiveness: optional(boolean()),

      // Customer behavior analysis
      analyze_booking_patterns: optional(boolean()),
      customer_preference_analysis: optional(boolean()),
      repeat_booking_analysis: optional(boolean()),
      seasonal_demand_analysis: optional(boolean()),

      // Predictive analytics
      forecast_utilization: optional(boolean()),
      forecast_period_days: optional(string()),
      identify_trends: optional(boolean()),
      predict_maintenance_needs: optional(boolean()),

      // Report generation
      generate_report: optional(boolean()),
      report_format: optional(report_format_enums),
      report_title: optional(string()),
      include_charts: optional(boolean()),
      include_recommendations: optional(boolean()),

      // Visualization options
      chart_type_preference: optional(enums(["bar", "line", "heatmap", "pie", "scatter"])),
      color_coding_by_utilization: optional(boolean()),
      interactive_dashboard: optional(boolean()),

      // Export and sharing
      export_raw_data: optional(boolean()),
      include_metadata: optional(boolean()),
      schedule_recurring_report: optional(boolean()),
      email_report_to: optional(array(string())),

      // Advanced filters
      business_hours_only: optional(boolean()),
      exclude_holidays: optional(boolean()),
      exclude_maintenance_periods: optional(boolean()),
      filter_by_weather: optional(boolean()), // For outdoor spaces

      // Space-specific analysis
      amenities_impact_analysis: optional(boolean()),
      location_factor_analysis: optional(boolean()),
      accessibility_utilization: optional(boolean()),

      // Operational insights
      staff_efficiency_correlation: optional(boolean()),
      booking_lead_time_analysis: optional(boolean()),
      cancellation_impact_on_utilization: optional(boolean()),

      // Alert and monitoring
      set_utilization_alerts: optional(boolean()),
      alert_thresholds: optional(object({
        low_utilization_alert: optional(percentage_validation),
        overutilization_alert: optional(percentage_validation),
        revenue_decline_alert: optional(percentage_validation),
      })),

      // Performance optimization
      use_cache: optional(boolean()),
      cache_duration_minutes: optional(string()),
      parallel_processing: optional(boolean()),
      sample_data_for_large_datasets: optional(boolean()),

      // Quality and accuracy
      exclude_test_bookings: optional(boolean()),
      validate_data_integrity: optional(boolean()),
      include_confidence_intervals: optional(boolean()),

      // Integration options
      sync_with_external_calendar: optional(boolean()),
      include_competitor_benchmarks: optional(boolean()),
      correlate_with_marketing_campaigns: optional(boolean()),
    }),
  });
};
