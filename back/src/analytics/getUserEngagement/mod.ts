import {  setAct  } from "@app";
import { getUserEngagementValidator } from "./getUserEngagement.val.ts";
import { getUserEngagementFn } from "./getUserEngagement.fn.ts";

export const getUserEngagementSetup = () => {
  setAct({
    schema: {
      details: getUserEngagementValidator.schema.details,
    },
    validator: getUserEngagementValidator,
    fn: getUserEngagementFn,
  });
};
