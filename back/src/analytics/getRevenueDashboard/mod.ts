import {  setAct  } from "@app";
import { getRevenueDashboardValidator } from "./getRevenueDashboard.val.ts";
import { getRevenueDashboardFn } from "./getRevenueDashboard.fn.ts";

export const getRevenueDashboardSetup = () => {
  setAct({
    schema: {
      details: getRevenueDashboardValidator.schema.details,
    },
    validator: getRevenueDashboardValidator,
    fn: getRevenueDashboardFn,
  });
};
