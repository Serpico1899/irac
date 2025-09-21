import { object, string, boolean, array, enums, optional } from "@deps";

export const getFiltersValidator = () => ({
  set: {
    content_types: optional(array(enums(["Course", "Article", "Workshop", "Product"]))),
    category_id: optional(string()),
    include_counts: optional(boolean()),
    language: optional(enums(["fa", "en", "both"])),
  },
  get: {
    content_types: optional(string()),
    category: optional(string()),
    counts: optional(string()),
    language: optional(string()),
  }
});
