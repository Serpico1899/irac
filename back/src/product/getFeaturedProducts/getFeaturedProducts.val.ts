import {
  number,
  object,
  optional,
  refine,
} from "@deps";

// Validate limit parameter (reasonable range for featured products)
const featured_limit = refine(
  number(),
  "featured_limit",
  (value: number) => {
    return value > 0 && value <= 50; // Max 50 featured products
  },
);

export const getFeaturedProductsValidator = () => {
  return object({
    set: object({
      // Optional limit parameter
      limit: optional(featured_limit),
    }),
  });
};
