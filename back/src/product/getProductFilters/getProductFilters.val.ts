import {
  object,
} from "@deps";

export const getProductFiltersValidator = () => {
  return object({
    set: object({
      // No parameters needed for getting product filters
      // This endpoint returns available filter options
    }),
  });
};
