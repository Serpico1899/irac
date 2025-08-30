import { coreApp } from "../mod.ts";
import {
  object,
  optional,
  string,
  type RelationDataType,
} from "@deps";
import { createUpdateAt } from "@lib";

export const article_title_struct = object({
  en: string(),
  fa: string(),
});

export const article_pure = {
  title: article_title_struct,
  authorName: string(),
  imageUrl: optional(string()),
  ...createUpdateAt,
};

export const article_relations = {
  image: {
    schemaName: "file",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const articles = () =>
  coreApp.odm.newModel("article", article_pure, article_relations);
