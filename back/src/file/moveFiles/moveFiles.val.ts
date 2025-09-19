import { array, boolean, object, optional, string, number } from "@deps";
import { coreApp } from "../../../mod.ts";

export const moveFilesValidator = () => {
  return object({
    set: object({
      // Files to move
      file_ids: array(string()),

      // Destination options
      destination_category: optional(string()),
      destination_path: optional(string()),

      // Move strategy
      move_strategy: optional(string()),

      // Path structure options
      preserve_structure: optional(boolean()),
      create_directories: optional(boolean()),

      // File handling options
      handle_conflicts: optional(string()),

      // Naming options
      rename_pattern: optional(string()),
      preserve_names: optional(boolean()),

      // Safety options
      backup_before_move: optional(boolean()),
      verify_move: optional(boolean()),
      dry_run: optional(boolean()),

      // Batch options
      batch_size: optional(number()),
      skip_errors: optional(boolean()),

      // Update references
      update_references: optional(boolean()),

      // Filters for conditional moves
      filters: optional(object({
        file_type: optional(string()),
        size_min: optional(number()),
        size_max: optional(number()),
        unused_only: optional(boolean()),
        older_than: optional(string()),
      })),

      // Confirmation for dangerous operations
      confirm_move: optional(boolean()),
      force_move: optional(boolean()),
    }),
    get: coreApp.schemas.selectStruct("file", 1),
  });
};
