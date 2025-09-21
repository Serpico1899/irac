import { coreApp } from "../../mod.ts";
import getFiltersHandler from "./getFilters.fn.ts";
import { getFiltersValidator } from "./getFilters.val.ts";

export const getFiltersSetup = () =>
  coreApp.acts.setAct({
    schema: "search",
    actName: "getFilters",
    validator: getFiltersValidator,
    fn: getFiltersHandler,
  });
