import {  coreApp  } from "@app";
import getRecommendationsHandler from "./getRecommendations.fn.ts";
import { getRecommendationsValidator } from "./getRecommendations.val.ts";

export const getRecommendationsSetup = () =>
  coreApp.acts.setAct({
    schema: "search",
    actName: "getRecommendations",
    validator: getRecommendationsValidator,
    fn: getRecommendationsHandler,
  });
