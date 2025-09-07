import { coreApp } from "../../../mod.ts";
import { getProductFiltersValidator } from "./getProductFilters.val.ts";
import { getProductFiltersFn } from "./getProductFilters.fn.ts";

export const getProductFiltersSetup = () =>
  coreApp.acts.setAct({
    schema: "product",
    actName: "getProductFilters",
    validator: getProductFiltersValidator(),
    fn: getProductFiltersFn,
  });
