import { coreApp } from "../mod.ts";
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

export const course_level_array = ["Beginner", "Intermediate", "Advanced"];
export const course_level_enums = enums(course_level_array);

export const course_status_array = ["Draft", "Active", "Archived", "Sold_Out"];
export const course_status_enums = enums(course_status_array);

export const course_type_array = ["Course", "Workshop", "Bootcamp", "Seminar"];
export const course_type_enums = enums(course_type_array);

export const course_pure = {
  // Basic Information
  name: string(),
  description: string(),
  short_description: optional(string()),

  // Multilingual Support
  name_en: optional(string()),
  description_en: optional(string()),
  short_description_en: optional(string()),

  // Course Details
  level: course_level_enums,
  type: course_type_enums,
  status: defaulted(course_status_enums, "Draft"),

  // Pricing
  price: number(), // Price in Iranian Rial (smallest unit)
  original_price: optional(number()), // For discount display
  is_free: defaulted(boolean(), false),

  // Course Metadata
  duration_weeks: optional(number()),
  duration_hours: optional(number()),
  max_students: optional(number()),
  min_students: defaulted(number(), 1),

  // Scheduling
  start_date: optional(coerce(date(), string(), (value) => new Date(value))),
  end_date: optional(coerce(date(), string(), (value) => new Date(value))),
  registration_deadline: optional(coerce(date(), string(), (value) => new Date(value))),

  // Course Content
  curriculum: optional(string()), // JSON string for detailed curriculum
  prerequisites: optional(string()),
  learning_outcomes: optional(string()),

  // Instructor Information
  instructor_name: optional(string()),
  instructor_bio: optional(string()),
  instructor_bio_en: optional(string()),

  // Ratings and Reviews
  average_rating: defaulted(number(), 0),
  total_reviews: defaulted(number(), 0),
  total_students: defaulted(number(), 0),

  // SEO and URLs
  slug: optional(string()),
  meta_title: optional(string()),
  meta_description: optional(string()),

  // Workshop Specific
  is_workshop: defaulted(boolean(), false),
  workshop_location: optional(string()),
  is_online: defaulted(boolean(), true),
  meeting_link: optional(string()),

  // Content Management
  featured: defaulted(boolean(), false),
  sort_order: defaulted(number(), 0),

  // Points System
  completion_points: defaulted(number(), 0), // Points awarded on completion

  ...createUpdateAt,
};

export const course_relations = {
  // Course Image/Gallery
  featured_image: {
    schemaName: "file",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  gallery: {
    schemaName: "file",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },

  // Course Organization
  category: {
    schemaName: "category",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {
      courses: {
        schemaName: "course",
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
      courses: {
        schemaName: "course",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  // User Relationships
  instructor: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {
      taught_courses: {
        schemaName: "course",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },
  enrolled_users: {
    schemaName: "user",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {
      enrolled_courses: {
        schemaName: "course",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  // Course Creator/Admin
  creator: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {
      created_courses: {
        schemaName: "course",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  // Related Courses
  related_courses: {
    schemaName: "course",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },

  // Prerequisites (other courses)
  prerequisite_courses: {
    schemaName: "course",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const courses = () =>
  coreApp.odm.newModel("course", course_pure, course_relations, {
    createIndex: [
      {
        indexSpec: { slug: 1 },
        options: { unique: true, sparse: true },
      },
      {
        indexSpec: { status: 1, featured: -1, sort_order: 1 },
        options: {},
      },
      {
        indexSpec: { price: 1, level: 1 },
        options: {},
      },
      {
        indexSpec: { start_date: 1, registration_deadline: 1 },
        options: {},
      },
    ],
  });
