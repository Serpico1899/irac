import { array, boolean, object, optional, string, number } from "@deps";
import { coreApp } from "../../../mod.ts";

export const getFileStatsValidator = () => {
  return object({
    set: object({
      // Statistics scope and types
      stats_types: optional(array(string())),

      // Time period for analysis
      time_period: optional(object({
        start_date: optional(string()),
        end_date: optional(string()),
        period_type: optional(string()),
        compare_previous: optional(boolean()),
      })),

      // Grouping and aggregation options
      grouping: optional(object({
        group_by: optional(array(string())),
        date_granularity: optional(string()),
        size_ranges: optional(array(object({
          name: string(),
          min_size: number(),
          max_size: optional(number()),
        }))),
      })),

      // Filtering options
      filters: optional(object({
        file_types: optional(array(string())),
        categories: optional(array(string())),
        uploader_ids: optional(array(string())),
        size_min: optional(number()),
        size_max: optional(number()),
        has_references: optional(boolean()),
        permissions: optional(array(string())),
        tags: optional(array(string())),
      })),

      // Output format and detail level
      output: optional(object({
        format: optional(string()),
        include_totals: optional(boolean()),
        include_percentages: optional(boolean()),
        include_trends: optional(boolean()),
        include_recommendations: optional(boolean()),
        max_results: optional(number()),
      })),

      // Storage analysis options
      storage_analysis: optional(object({
        calculate_duplicates: optional(boolean()),
        analyze_compression: optional(boolean()),
        estimate_cleanup: optional(boolean()),
        check_physical_files: optional(boolean()),
        cdn_usage: optional(boolean()),
      })),

      // Usage analysis options
      usage_analysis: optional(object({
        track_downloads: optional(boolean()),
        track_views: optional(boolean()),
        reference_depth: optional(boolean()),
        popular_files: optional(number()),
        unused_files: optional(boolean()),
        recent_activity: optional(number()),
      })),
    }),
    get: coreApp.schemas.selectStruct("file", 2),
  });
};
