import {
  object,
  objectIdValidation,
} from "@deps";
import { selectStruct } from "../../../mod.ts";

export const publishArticleValidator = () => {
  return object({
    set: object({
      _id: objectIdValidation,
    }),
    get: selectStruct("article", 2),
  });
};
