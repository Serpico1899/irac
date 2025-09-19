import { array, object, optional, string } from "@deps";
import { coreApp } from "../../../mod.ts";

export const updateFileMetadataValidator = () => {
  return object({
    set: object({
      _id: string(),
      name: optional(string()),
      description: optional(string()),
      alt_text: optional(string()), // For images - accessibility
      category: optional(string()), // File category/folder
      tags: optional(array(string())), // File tags for organization
      permissions: optional(string()), // public, private, restricted
      seo_title: optional(string()), // SEO optimized title
      seo_description: optional(string()), // SEO meta description
      // Multilingual support
      name_fa: optional(string()), // Persian name
      description_fa: optional(string()), // Persian description
      alt_text_fa: optional(string()), // Persian alt text
      // Custom metadata
      custom_metadata: optional(object({})), // Additional custom fields
    }),
    get: coreApp.schemas.selectStruct("file", 1),
  });
};
