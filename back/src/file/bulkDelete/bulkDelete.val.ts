import { array, boolean, object, optional, string, number } from "@deps";
import {  coreApp  } from "@app";

export const bulkDeleteValidator = () => {
  return object({
    set: object({
      // Files to delete
      file_ids: optional(array(string())),

      // Selection filters (alternative to file_ids)
      filters: optional(object({
        category: optional(string()),
        file_type: optional(string()),
        size_min: optional(number()),
        size_max: optional(number()),
        uploaded_before: optional(string()),
        uploaded_after: optional(string()),
        uploader_id: optional(string()),
        unused_only: optional(boolean()),
        has_tags: optional(boolean()),
        has_category: optional(boolean()),
        permissions: optional(string()),
        tags_include: optional(array(string())),
        tags_exclude: optional(array(string())),
      })),

      // Safety and confirmation options
      confirm_bulk_delete: optional(boolean()),
      force_delete: optional(boolean()),
      max_files_limit: optional(number()),

      // Reference handling
      reference_handling: optional(string()),

      // Physical file handling
      delete_physical_files: optional(boolean()),
      backup_before_delete: optional(boolean()),
      backup_location: optional(string()),

      // Batch processing options
      batch_size: optional(number()),
      delay_between_batches: optional(number()),
      continue_on_error: optional(boolean()),
      max_errors: optional(number()),

      // Reporting and logging
      generate_report: optional(boolean()),
      log_deletions: optional(boolean()),
      notify_uploaders: optional(boolean()),

      // Preview and testing
      dry_run: optional(boolean()),
      return_file_list: optional(boolean()),

      // Advanced options
      delete_empty_categories: optional(boolean()),
      update_statistics: optional(boolean()),
      cleanup_orphaned_data: optional(boolean()),

      // Recovery options
      create_recovery_point: optional(boolean()),
      recovery_retention_days: optional(number()),
    }),
    get: coreApp.schemas.selectStruct("file", 1),
  });
};
