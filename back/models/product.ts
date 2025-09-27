import {  coreApp  } from "@app";
import {
  array,
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  object,
  optional,
  refine,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const product_type_array = [
  "book",
  "artwork",
  "article",
  "cultural",
  "other"
];
export const product_type_enums = enums(product_type_array);

export const product_status_array = [
  "active",
  "draft",
  "archived",
  "out_of_stock"
];
export const product_status_enums = enums(product_status_array);

export const product_category_array = [
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
  "other"
];
export const product_category_enums = enums(product_category_array);

export const language_array = [
  "fa",
  "en",
  "ar",
  "mixed"
];
export const language_enums = enums(language_array);

export const file_format_array = [
  "pdf",
  "epub",
  "mobi",
  "jpg",
  "png",
  "svg",
  "mp4",
  "mp3",
  "zip",
  "rar"
];
export const file_format_enums = enums(file_format_array);

// Validate positive numbers
export const product_positive_number = refine(
  number(),
  "product_positive_number",
  (value: number) => {
    return value >= 0;
  },
);

// Validate rating (0-5)
export const product_rating = refine(
  number(),
  "product_rating",
  (value: number) => {
    return value >= 0 && value <= 5;
  },
);

// Image structure for featured image and gallery
export const product_image_struct = object({
  url: string(),
  alt: optional(string()),
  width: optional(product_positive_number),
  height: optional(product_positive_number),
});

// Dimensions structure
export const product_dimensions_struct = object({
  width: product_positive_number,
  height: product_positive_number,
  depth: optional(product_positive_number),
  unit: enums(["cm", "mm", "inch"]),
});

// Weight structure
export const product_weight_struct = object({
  value: product_positive_number,
  unit: enums(["g", "kg", "lb"]),
});

// Rating structure
export const product_rating_struct = object({
  average: product_rating,
  count: defaulted(product_positive_number, 0),
});

export const product_model_pure = {
  // Basic Information
  title: string(),
  title_en: optional(string()),
  slug: string(),
  description: string(),
  description_en: optional(string()),

  // Classification
  type: product_type_enums,
  category: product_category_enums,
  status: defaulted(product_status_enums, "draft"),

  // Pricing and Inventory
  price: product_positive_number,
  discounted_price: optional(product_positive_number),
  stock_quantity: optional(product_positive_number),
  is_digital: defaulted(boolean(), false),

  // Media
  featured_image: optional(product_image_struct),
  gallery: optional(array(product_image_struct)),

  // Categorization
  tags: defaulted(array(string()), []),
  specifications: optional(string()), // JSON string for flexible specifications

  // Book-specific fields
  author: optional(string()),
  author_en: optional(string()),
  isbn: optional(string()),
  publisher: optional(string()),
  publisher_en: optional(string()),
  publication_date: optional(coerce(date(), string(), (value) => new Date(value))),
  language: defaulted(language_enums, "fa"),
  page_count: optional(product_positive_number),

  // Digital file information
  file_url: optional(string()),
  file_size: optional(product_positive_number), // in bytes
  file_format: optional(file_format_enums),

  // Physical dimensions and properties
  dimensions: optional(product_dimensions_struct),
  weight: optional(product_weight_struct),
  materials: optional(array(string())),

  // Artwork-specific fields
  artist: optional(string()),
  artist_en: optional(string()),
  artwork_year: optional(product_positive_number),
  artwork_style: optional(string()),

  // Featured flags
  is_featured: defaulted(boolean(), false),
  is_bestseller: defaulted(boolean(), false),
  is_new: defaulted(boolean(), false),

  // Analytics
  view_count: defaulted(product_positive_number, 0),
  purchase_count: defaulted(product_positive_number, 0),
  rating: defaulted(product_rating_struct, { average: 0, count: 0 }),

  // SEO
  meta_title: optional(string()),
  meta_description: optional(string()),
  seo_keywords: optional(array(string())),

  // Audit fields
  created_by: optional(string()),
  updated_by: optional(string()),

  ...createUpdateAt,
};

export const product_model_relations = {
  category_rel: {
    schemaName: "category",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  tags_rel: {
    schemaName: "tag",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  created_by_user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  updated_by_user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const product_models = () =>
  coreApp.odm.newModel("product", product_model_pure, product_model_relations);
