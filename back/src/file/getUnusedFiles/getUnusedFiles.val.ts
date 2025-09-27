import { array, boolean, object, optional, string, number } from "@deps";
import {  coreApp  } from "@app";

export const getUnusedFilesValidator = () => {
  return object({
    set: object({
      // Grace period and timing options
      grace_period: optional(object({
        days: optional(number()),
        hours: optional(number()),
        ignore_recent: optional(boolean()),
      })),

      // File filtering criteria
      filters: optional(object({
        file_types: optional(array(string())),
        categories: optional(array(string())),
        size_min: optional(number()),
        size_max: optional(number()),
        uploader_ids: optional(array(string())),
        uploaded_before: optional(string()),
        uploaded_after: optional(string()),
        permissions: optional(array(string())),
        has_tags: optional(boolean()),
        has_category: optional(boolean()),
        tags_include: optional(array(string())),
        tags_exclude: optional(array(string())),
      })),

      // Reference checking depth
      reference_checking: optional(object({
        deep_scan: optional(boolean()),
        check_external_references: optional(boolean()),
        check_draft_content: optional(boolean()),
        check_archived_content: optional(boolean()),
        include_soft_references: optional(boolean()),
      })),

      // Output and reporting options
      output: optional(object({
        include_file_details: optional(boolean()),
        include_storage_impact: optional(boolean()),
        include_uploader_info: optional(boolean()),
        sort_by: optional(string()),
        group_by: optional(string()),
        limit: optional(number()),
        offset: optional(number()),
      })),

      // Analysis options
      analysis: optional(object({
        calculate_total_waste: optional(boolean()),
        identify_largest_files: optional(number()),
        analyze_by_uploader: optional(boolean()),
        analyze_by_type: optional(boolean()),
        find_duplicate_unused: optional(boolean()),
        estimate_cleanup_time: optional(boolean()),
      })),

      // Safety and confirmation options
      safety: optional(object({
        require_confirmation: optional(boolean()),
        max_files_threshold: optional(number()),
        size_threshold_mb: optional(number()),
        dry_run: optional(boolean()),
      })),

      // Performance options
      performance: optional(object({
        batch_size: optional(number()),
        use_cache: optional(boolean()),
        cache_duration: optional(number()),
        timeout_seconds: optional(number()),
        parallel_processing: optional(boolean()),
      })),

      // Testing and validation
      dry_run: optional(boolean()),
    }),
    get: coreApp.schemas.selectStruct("file", 2),
  });
};
