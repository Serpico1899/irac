import {
  object,
  objectIdValidation,
} from "@deps";
import {  selectStruct  } from "@app";

export const publishArticleValidator = () => {
  return object({
    set: object({
      _id: objectIdValidation,
    }),
    get: selectStruct("article", 2),
  });
};
