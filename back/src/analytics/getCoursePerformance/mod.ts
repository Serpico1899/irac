import {  setAct  } from "@app";
import { getCoursePerformanceValidator } from "./getCoursePerformance.val.ts";
import { getCoursePerformanceFn } from "./getCoursePerformance.fn.ts";

export const getCoursePerformanceSetup = () => {
  setAct({
    schema: {
      details: getCoursePerformanceValidator.schema.details,
    },
    validator: getCoursePerformanceValidator,
    fn: getCoursePerformanceFn,
  });
};
