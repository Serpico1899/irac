import {
  array,
  boolean,
  coerce,
  date,
  enums,
  number,
  object,
  optional,
  refine,
  string,
} from "@deps";
import {
  product_type_array,
  product_category_array,
  language_array,
  file_format_array,
} from "@model";

// Validate positive numbers
const positive_number = refine(
  number(),
  "positive_number",
  (value: number) => {
    return value >= 0;
  },
);

// Validate required positive numbers (price must be > 0)
const required_positive_number = refine(
  number(),
  "required_positive_number",
  (value: number) => {
    return value > 0;
  },
);

// Validate year (reasonable range)
const artwork_year = refine(
  number(),
  "artwork_year",
  (value: number) => {
    const currentYear = new Date().getFullYear();
    return value >= 1000 && value <= currentYear + 10;
  },
);

// Image structure validation
const image_struct = object({
  url: string(),
  alt: optional(string()),
  width: optional(positive_number),
  height: optional(positive_number),
});

// Dimensions structure validation
const dimensions_struct = object({
  width: positive_number,
  height: positive_number,
  depth: optional(positive_number),
  unit: enums(["cm", "mm", "inch"]),
});

// Weight structure validation
const weight_struct = object({
  value: positive_number,
  unit: enums(["g", "kg", "lb"]),
});

// ISBN validation (basic format check)
const isbn_validation = refine(
  string(),
  "isbn_validation",
  (value: string) => {
    // Remove hyphens and spaces
    const cleaned = value.replace(/[-\s]/g, "");
    // Check if it's 10 or 13 digits
    return /^(\d{10}|\d{13})$/.test(cleaned);
  },
);

// URL validation
const url_validation = refine(
  string(),
  "url_validation",
  (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
);

// File size validation (max 500MB)
const file_size_validation = refine(
  number(),
  "file_size_validation",
  (value: number) => {
    return value > 0 && value <= 500 * 1024 * 1024; // 500MB in bytes
  },
);

export const createProductValidator = () => {
  return object({
    set: object({
      // Basic Information (Required)
      title: string(),
      title_en: optional(string()),
      description: string(),
      description_en: optional(string()),

      // Classification (Required)
      type: enums(product_type_array),
      category: enums(product_category_array),

      // Pricing and Inventory (Required)
      price: required_positive_number,
      discounted_price: optional(positive_number),
      stock_quantity: optional(positive_number),
      is_digital: boolean(),

      // Media
      featured_image: optional(image_struct),
      gallery: optional(array(image_struct)),

      // Categorization
      tags: optional(array(string())),
      specifications: optional(object({})), // Will be converted to JSON string

      // Book-specific fields
      author: optional(string()),
      author_en: optional(string()),
      isbn: optional(isbn_validation),
      publisher: optional(string()),
      publisher_en: optional(string()),
      publication_date: optional(coerce(date(), string(), (value) => new Date(value))),
      language: optional(enums(language_array)),
      page_count: optional(positive_number),

      // Digital file information
      file_url: optional(url_validation),
      file_size: optional(file_size_validation),
      file_format: optional(enums(file_format_array)),

      // Physical dimensions and properties
      dimensions: optional(dimensions_struct),
      weight: optional(weight_struct),
      materials: optional(array(string())),

      // Artwork-specific fields
      artist: optional(string()),
      artist_en: optional(string()),
      artwork_year: optional(artwork_year),
      artwork_style: optional(string()),

      // Featured flags
      is_featured: optional(boolean()),
      is_bestseller: optional(boolean()),
      is_new: optional(boolean()),

      // SEO
      meta_title: optional(string()),
      meta_description: optional(string()),
      seo_keywords: optional(array(string())),

      // Audit
      created_by: optional(string()),
    }),
  });
};
