import {  setAct  } from "@app";
import { getBookingAnalyticsValidator } from "./getBookingAnalytics.val.ts";
import { getBookingAnalyticsFn } from "./getBookingAnalytics.fn.ts";

export const getBookingAnalyticsSetup = () => {
  setAct({
    schema: {
      details: getBookingAnalyticsValidator.schema.details,
    },
    validator: getBookingAnalyticsValidator,
    fn: getBookingAnalyticsFn,
  });
};
