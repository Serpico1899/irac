import {  setAct  } from "@app";
import { exportReportsValidator } from "./exportReports.val.ts";
import { exportReportsFn } from "./exportReports.fn.ts";

export const exportReportsSetup = () => {
  setAct({
    schema: {
      details: exportReportsValidator.schema.details,
    },
    validator: exportReportsValidator,
    fn: exportReportsFn,
  });
};
