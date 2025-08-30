import { coreApp } from "../../../mod.ts";
import { getHomePageDataFn } from "./getHomePageData.fn.ts";
import { getHomePageDataValidator } from "./getHomePageData.val.ts";

export const getHomePageDataSetup = () =>
  coreApp.acts.setAct({
    schema: "main",
    fn: getHomePageDataFn,
    actName: "getHomePageData",
    validator: getHomePageDataValidator(),
  });
