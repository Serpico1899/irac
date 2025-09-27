import {  coreApp  } from "@app";
import { getProductFiltersValidator } from "./getProductFilters.val.ts";
import { getProductFiltersFn } from "./getProductFilters.fn.ts";

export const getProductFiltersSetup = () =>
  coreApp.acts.setAct({
    schema: "product",
    actName: "getProductFilters",
    validator: getProductFiltersValidator(),
    fn: getProductFiltersFn,
  });
