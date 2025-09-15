import { setAct } from "../../../mod.ts";
import { getUserStatisticsValidator } from "./getUserStatistics.val.ts";
import { getUserStatisticsFn } from "./getUserStatistics.fn.ts";

export const getUserStatisticsSetup = () => {
  setAct({
    schema: {
      details: getUserStatisticsValidator.schema.details,
    },
    validator: getUserStatisticsValidator,
    fn: getUserStatisticsFn,
  });
};
