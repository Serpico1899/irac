import {
  array,
  boolean,
  enums,
  number,
  object,
  optional,
  refine,
  string,
} from "@deps";

// Validate seed count limit
const seed_count_limit = refine(
  number(),
  "seed_count_limit",
  (value: number) => {
    return value > 0 && value <= 100; // Max 100 products per seed operation
  },
);

// Available categories for selective seeding
const seedable_categories = [
  "books",
  "digital_books",
  "physical_books",
  "artworks",
  "paintings",
  "sculptures",
  "digital_art",
  "articles",
  "cultural_items",
  "handicrafts",
  "educational",
  "research",
  "all"
];

export const seedProductsValidator = () => {
  return object({
    set: object({
      // Whether to clear existing products before seeding
      clear_existing: optional(boolean()),

      // Limit number of products to seed
      limit: optional(seed_count_limit),

      // Specific categories to seed (optional)
      categories: optional(array(enums(seedable_categories))),

      // Whether to set random featured products
      set_featured: optional(boolean()),

      // Whether to set random bestseller products
      set_bestsellers: optional(boolean()),

      // Force reseed even if products exist
      force_reseed: optional(boolean()),

      // Test mode - creates fewer products for testing
      test_mode: optional(boolean()),
    }),
  });
};
