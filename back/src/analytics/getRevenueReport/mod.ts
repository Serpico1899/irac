import { setAct } from "../../../mod.ts";
import { getRevenueReportValidator } from "./getRevenueReport.val.ts";
import { getRevenueReportFn } from "./getRevenueReport.fn.ts";

export const getRevenueReportSetup = () => {
  setAct({
    schema: {
      details: getRevenueReportValidator.schema.details,
    },
    validator: getRevenueReportValidator,
    fn: getRevenueReportFn,
  });
};
