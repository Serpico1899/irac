import { boolean, object, optional, string } from "@deps";
import {  coreApp  } from "@app";

export const getFileDetailsValidator = () => {
  return object({
    set: object({
      _id: string(),
      include_usage_stats: optional(boolean()), // Include file usage statistics
      include_references: optional(boolean()), // Include references from other models
      include_physical_info: optional(boolean()), // Include physical file system info
      include_upload_history: optional(boolean()), // Include upload and modification history
      include_related_files: optional(boolean()), // Include related/similar files
    }),
    get: coreApp.schemas.selectStruct("file", 2),
  });
};
