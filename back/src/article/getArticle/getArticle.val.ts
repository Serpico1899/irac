import {
  boolean,
  object,
  objectIdValidation,
  optional,
  string,
} from "@deps";
import { selectStruct } from "../../../mod.ts";

export const getArticleValidator = () => {
  return object({
    set: object({
      // Article identifier - either _id or slug required
      _id: optional(objectIdValidation),
      slug: optional(string([
        { min: 3, message: "نام مستعار باید حداقل 3 کاراکتر باشد / Slug must be at least 3 characters" },
        { max: 200, message: "نام مستعار نمی‌تواند بیش از 200 کاراکتر باشد / Slug cannot exceed 200 characters" }
      ])),

      // Control options
      increment_views: optional(boolean()),
      admin_view: optional(boolean()),
    }),
    get: selectStruct("article", 3),
  });
};
