import {
  number,
  type RelationDataType,
  type RelationSortOrderType,
  string,
} from "@deps";
import { coreApp } from "../mod.ts";
import { createUpdateAt } from "@lib";

export const pure_file = {
  name: string(),
  type: string(),
  size: number(),
  path: string(), // ⚡ ADD THIS - Critical for file serving
  url: string(),  // ⚡ ADD THIS - Public URL
  ...createUpdateAt,
};

export const file_relations = {
  uploader: {
    schemaName: "user",
    optional: false,
    type: "single" as RelationDataType,
    relatedRelations: {
      uploadedAssets: {
        type: "multiple" as RelationDataType,
        limit: 50,
        sort: {
          field: "_id",
          order: "desc" as RelationSortOrderType,
        },
      },
    },
  },
};

export const files = () =>
  coreApp.odm.newModel("file", pure_file, file_relations);
