import { object, string, number, boolean, array, enums, optional } from "@deps";

export const getRecommendationsValidator = () => ({
  set: {
    user_id: optional(string()),
    content_id: optional(string()),
    content_type: optional(enums(["Course", "Article", "Workshop", "Product"])),
    content_types: optional(array(enums(["Course", "Article", "Workshop", "Product"]))),
    category_id: optional(string()),
    recommendation_type: optional(enums([
      "similar",
      "popular",
      "trending",
      "personalized",
      "recently_viewed",
      "category_based",
      "collaborative"
    ])),
    exclude_ids: optional(array(string())),
    language: optional(enums(["fa", "en", "both"])),
    limit: optional(number()),
    min_rating: optional(number()),
    include_metadata: optional(boolean()),
    include_reasons: optional(boolean()),
    diversify: optional(boolean()),
    time_range: optional(enums(["day", "week", "month", "quarter", "year", "all"])),
  },
  get: {
    user_id: optional(string()),
    content_id: optional(string()),
    content_type: optional(string()),
    content_types: optional(string()),
    category: optional(string()),
    type: optional(string()),
    exclude: optional(string()),
    language: optional(string()),
    limit: optional(string()),
    min_rating: optional(string()),
    metadata: optional(string()),
    reasons: optional(string()),
    diversify: optional(string()),
    time_range: optional(string()),
  }
});
