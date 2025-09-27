import { array, boolean, number, object, optional, string, instance } from "@deps";
import {  coreApp  } from "@app";

export const bulkUploadValidator = () => {
  return object({
    set: object({
      // Files to upload
      files: array(object({
        formData: instance(FormData),
        type: optional(string()),
        category: optional(string()),
        tags: optional(array(string())),
        description: optional(string()),
        alt_text: optional(string()),
      })),

      // Global metadata applied to all files
      global_metadata: optional(object({
        category: optional(string()),
        tags: optional(array(string())),
        permissions: optional(string()),
        description_template: optional(string()),
      })),

      // Organization options
      organization: optional(object({
        strategy: optional(string()),
        base_path: optional(string()),
        create_date_folders: optional(boolean()),
        separate_by_type: optional(boolean()),
      })),

      // Processing options
      processing: optional(object({
        max_file_size: optional(number()),
        allowed_types: optional(array(string())),
      })),

      // Batch options
      batch_options: optional(object({
        batch_size: optional(number()),
        continue_on_error: optional(boolean()),
      })),

      // Preview and confirmation
      dry_run: optional(boolean()),
    }),
    get: coreApp.schemas.selectStruct("file", 1),
  });
};
