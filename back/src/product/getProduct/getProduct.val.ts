import {
  object,
  string,
} from "@deps";

export const getProductValidator = () => {
  return object({
    set: object({
      identifier: string(), // Can be ObjectId or slug
    }),
  });
};
