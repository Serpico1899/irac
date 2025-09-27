import {  coreApp  } from "@app";
import {
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  optional,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const article_status_array = ["Draft", "Published", "Archived", "Scheduled"];
export const article_status_enums = enums(article_status_array);

export const article_type_array = ["Article", "News", "Research", "Tutorial", "Interview"];
export const article_type_enums = enums(article_type_array);

export const article_pure = {
  // Basic Information
  title: string(),
  content: string(),
  excerpt: optional(string()),

  // Multilingual Support
  title_en: optional(string()),
  content_en: optional(string()),
  excerpt_en: optional(string()),

  // Article Management
  status: defaulted(article_status_enums, "Draft"),
  type: defaulted(article_type_enums, "Article"),

  // Publishing
  published_at: optional(coerce(date(), string(), (value) => new Date(value))),
  scheduled_at: optional(coerce(date(), string(), (value) => new Date(value))),

  // Content Organization
  featured: defaulted(boolean(), false),
  pinned: defaulted(boolean(), false),
  sort_order: defaulted(number(), 0),

  // SEO and URLs
  slug: optional(string()),
  meta_title: optional(string()),
  meta_description: optional(string()),
  meta_title_en: optional(string()),
  meta_description_en: optional(string()),

  // Engagement Metrics
  view_count: defaulted(number(), 0),
  like_count: defaulted(number(), 0),
  comment_count: defaulted(number(), 0),
  share_count: defaulted(number(), 0),

  // Reading Time
  estimated_reading_time: optional(number()), // in minutes

  // Content Features
  allow_comments: defaulted(boolean(), true),
  featured_on_homepage: defaulted(boolean(), false),

  // Social Media
  social_image_alt: optional(string()),
  social_image_alt_en: optional(string()),

  // Research/Academic Fields
  abstract: optional(string()),
  abstract_en: optional(string()),
  keywords: optional(string()), // JSON array of keywords
  keywords_en: optional(string()),
  doi: optional(string()), // Digital Object Identifier for academic articles
  citation: optional(string()), // How to cite this article

  // Media and Gallery
  has_gallery: defaulted(boolean(), false),
  video_url: optional(string()),
  audio_url: optional(string()),

  // Archive and History
  archive_date: optional(coerce(date(), string(), (value) => new Date(value))),
  last_modified_by_name: optional(string()),

  // Content Flags
  is_premium: defaulted(boolean(), false),
  requires_login: defaulted(boolean(), false),

  ...createUpdateAt,
};

export const article_relations = {
  // Featured Image
  featured_image: {
    schemaName: "file",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },

  // Gallery Images
  gallery: {
    schemaName: "file",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },

  // Social Media Image
  social_image: {
    schemaName: "file",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },

  // Content Organization
  category: {
    schemaName: "category",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {
      articles: {
        schemaName: "article",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  tags: {
    schemaName: "tag",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {
      articles: {
        schemaName: "article",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  // Author and Editorial
  author: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {
      articles: {
        schemaName: "article",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  editors: {
    schemaName: "user",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {
      edited_articles: {
        schemaName: "article",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  // User Interactions
  liked_by: {
    schemaName: "user",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {
      liked_articles: {
        schemaName: "article",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  bookmarked_by: {
    schemaName: "user",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {
      bookmarked_articles: {
        schemaName: "article",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  // Related Content
  related_articles: {
    schemaName: "article",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },

  related_courses: {
    schemaName: "course",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {
      related_articles: {
        schemaName: "article",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  // References and Citations
  referenced_files: {
    schemaName: "file",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const articles = () =>
  coreApp.odm.newModel("article", article_pure, article_relations);
