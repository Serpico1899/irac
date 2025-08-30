import { coreApp } from "../mod.ts";
import {
  boolean,
  number,
  object,
  optional,
  string,
  type RelationDataType,
} from "@deps";
import { createUpdateAt } from "@lib";

export const course_title_struct = object({
  en: string(),
  fa: string(),
});

export const course_description_struct = object({
  en: string(),
  fa: string(),
});

export const course_pure = {
  title: course_title_struct,
  description: course_description_struct,
  instructorName: string(),
  price: number(),
  duration: string(),
  imageUrl: optional(string()),
  isFeatured: optional(boolean()),
  ...createUpdateAt,
};

export const course_relations = {
  instructor: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  category: {
    schemaName: "category",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  image: {
    schemaName: "file",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const courses = () =>
  coreApp.odm.newModel("course", course_pure, course_relations);
