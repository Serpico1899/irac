import {
  object,
  objectIdValidation,
} from "@deps";
import { selectStruct } from "../../../mod.ts";

export const deleteArticleValidator = () => {
  return object({
    set: object({
      _id: objectIdValidation,
    }),
    get: selectStruct("article", 1),
  });
};
