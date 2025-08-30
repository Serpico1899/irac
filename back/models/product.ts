import { coreApp } from "../mod.ts";
import {
  number,
  object,
  optional,
  string,
  type RelationDataType,
} from "@deps";
import { createUpdateAt } from "@lib";

export const product_title_struct = object({
  en: string(),
  fa: string(),
});

export const product_pure = {
  title: product_title_struct,
  price: number(),
  imageUrl: optional(string()),
  ...createUpdateAt,
};

export const product_relations = {
  image: {
    schemaName: "file",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const products = () =>
  coreApp.odm.newModel("product", product_pure, product_relations);
