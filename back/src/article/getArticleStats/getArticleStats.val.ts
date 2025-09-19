import {
  boolean,
  enums,
  object,
  objectIdValidation,
  optional,
} from "@deps";
import { selectStruct } from "../../../mod.ts";

const periodEnum = enums(["week", "month", "quarter", "year", "all"]);

export const getArticleStatsValidator = () => {
  return object({
    set: optional(object({
      // Time period for statistics
      period: optional(periodEnum),

      // Filter by specific author
      author_id: optional(objectIdValidation),

      // Filter by specific category
      category_id: optional(objectIdValidation),

      // Include detailed analytics
      include_detailed: optional(boolean()),
    })),
    get: selectStruct("article", 1),
  });
};
