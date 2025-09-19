import { boolean, object, optional, string } from "@deps";
import { coreApp } from "../../../mod.ts";

export const deleteFileValidator = () => {
  return object({
    set: object({
      _id: string(),
      force: optional(boolean()), // Force delete even if referenced
      hardCascade: optional(boolean()), // Delete physical file from storage
      confirm: optional(boolean()), // Admin confirmation for deletion
    }),
    get: coreApp.schemas.selectStruct("file", 1),
  });
};
