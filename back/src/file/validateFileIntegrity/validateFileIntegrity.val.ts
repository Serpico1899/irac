import { array, boolean, object, optional, string, number } from "@deps";
import {  coreApp  } from "@app";

export const validateFileIntegrityValidator = () => {
  return object({
    set: object({
      // Scope of validation
      validation_scope: optional(object({
        file_ids: optional(array(string())),
        validate_all: optional(boolean()),
        categories: optional(array(string())),
        file_types: optional(array(string())),
        uploaded_before: optional(string()),
        uploaded_after: optional(string()),
        size_min: optional(number()),
        size_max: optional(number()),
      })),

      // Types of integrity checks
      checks: optional(object({
        physical_existence: optional(boolean()),
        database_consistency: optional(boolean()),
        file_corruption: optional(boolean()),
        checksum_validation: optional(boolean()),
        size_verification: optional(boolean()),
        metadata_integrity: optional(boolean()),
        reference_integrity: optional(boolean()),
        permission_validation: optional(boolean()),
        path_validation: optional(boolean()),
        url_accessibility: optional(boolean()),
      })),

      // Reference validation options
      reference_validation: optional(object({
        check_articles: optional(boolean()),
        check_courses: optional(boolean()),
        check_users: optional(boolean()),
        check_orphaned_references: optional(boolean()),
        deep_reference_scan: optional(boolean()),
        validate_external_urls: optional(boolean()),
      })),

      // Auto-repair options
      auto_repair: optional(object({
        enabled: optional(boolean()),
        fix_paths: optional(boolean()),
        clean_broken_references: optional(boolean()),
        update_file_sizes: optional(boolean()),
        restore_permissions: optional(boolean()),
        generate_missing_thumbnails: optional(boolean()),
        max_repairs: optional(number()),
        require_confirmation: optional(boolean()),
      })),

      // Performance and processing options
      processing: optional(object({
        batch_size: optional(number()),
        parallel_processing: optional(boolean()),
        timeout_per_file: optional(number()),
        max_processing_time: optional(number()),
        skip_large_files: optional(boolean()),
        large_file_threshold: optional(number()),
        use_cache: optional(boolean()),
        cache_duration: optional(number()),
      })),

      // Output and reporting options
      reporting: optional(object({
        detail_level: optional(string()),
        include_healthy_files: optional(boolean()),
        include_statistics: optional(boolean()),
        include_recommendations: optional(boolean()),
        group_by_issue_type: optional(boolean()),
        sort_by_severity: optional(boolean()),
        export_format: optional(string()),
      })),

      // Testing and debugging
      testing: optional(object({
        dry_run: optional(boolean()),
        verbose_logging: optional(boolean()),
        debug_mode: optional(boolean()),
        sample_validation: optional(number()),
        benchmark_performance: optional(boolean()),
      })),
    }),
    get: coreApp.schemas.selectStruct("file", 2),
  });
};
