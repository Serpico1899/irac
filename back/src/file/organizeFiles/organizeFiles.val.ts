import { array, boolean, object, optional, string, number } from "@deps";
import { coreApp } from "../../../mod.ts";

export const organizeFilesValidator = () => {
  return object({
    set: object({
      // Files to organize
      file_ids: optional(array(string())),

      // Organization strategy
      strategy: optional(string()),

      // Category/Folder operations
      target_category: optional(string()),
      create_category: optional(string()),
      category_structure: optional(object({
        name: string(),
        description: optional(string()),
        parent_category: optional(string()),
        auto_rules: optional(array(string())),
      })),

      // Bulk metadata updates
      apply_tags: optional(array(string())),
      remove_tags: optional(array(string())),
      set_permissions: optional(string()),

      // Naming convention
      naming_convention: optional(object({
        pattern: string(),
        date_format: optional(string()),
        include_uploader: optional(boolean()),
        include_category: optional(boolean()),
        sanitize_names: optional(boolean()),
      })),

      // Date-based organization
      date_organization: optional(object({
        group_by: string(),
        create_folders: optional(boolean()),
        folder_pattern: optional(string()),
      })),

      // Type-based organization
      type_organization: optional(object({
        separate_by_type: boolean(),
        type_mapping: optional(object({})),
        create_type_folders: optional(boolean()),
      })),

      // Usage-based organization
      usage_organization: optional(object({
        frequent_threshold: optional(number()),
        unused_category: optional(string()),
        recent_category: optional(string()),
      })),

      // Filters for selecting files to organize
      filters: optional(object({
        file_type: optional(string()),
        size_min: optional(number()),
        size_max: optional(number()),
        uploaded_after: optional(string()),
        uploaded_before: optional(string()),
        uploader_id: optional(string()),
        has_category: optional(boolean()),
        has_tags: optional(boolean()),
        unused_files: optional(boolean()),
      })),

      // Operation options
      dry_run: optional(boolean()),
      batch_size: optional(number()),
      preserve_original_names: optional(boolean()),
      backup_metadata: optional(boolean()),
      notify_uploaders: optional(boolean()),
    }),
    get: coreApp.schemas.selectStruct("file", 1),
  });
};
