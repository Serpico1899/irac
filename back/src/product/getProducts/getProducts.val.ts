import {
  array,
  boolean,
  enums,
  number,
  object,
  optional,
  string,
  refine,
} from "@deps";
import {
  product_type_array,
  product_category_array,
  product_status_array,
  language_array,
} from "@model";

const sort_by_array = ["created_at", "price", "title", "rating", "popularity"];
const sort_order_array = ["asc", "desc"];

// Validate positive numbers for pagination and prices
const positive_number = refine(
  number(),
  "positive_number",
  (value: number) => {
    return value > 0;
  },
);

// Validate pagination limit
const pagination_limit = refine(
  number(),
  "pagination_limit",
  (value: number) => {
    return value > 0 && value <= 100;
  },
);

// Validate min/max price
const price_value = refine(
  number(),
  "price_value",
  (value: number) => {
    return value >= 0;
  },
);

export const getProductsValidator = () => {
  return object({
    set: object({
      // Pagination
      page: optional(positive_number),
      limit: optional(pagination_limit),

      // Search
      search: optional(string()),

      // Filters
      type: optional(array(enums(product_type_array))),
      category: optional(array(enums(product_category_array))),
      status: optional(array(enums(product_status_array))),

      // Price range
      min_price: optional(price_value),
      max_price: optional(price_value),

      // Boolean filters
      is_featured: optional(boolean()),
      is_bestseller: optional(boolean()),
      is_new: optional(boolean()),
      is_digital: optional(boolean()),

      // Tags and language
      tags: optional(array(string())),
      language: optional(enums(language_array)),

      // Sorting
      sort_by: optional(enums(sort_by_array)),
      sort_order: optional(enums(sort_order_array)),
    }),
  });
};
