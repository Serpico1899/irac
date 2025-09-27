import {
  grantAccess,
  setTokens,
  setUser,
} from "@lib";
import {  coreApp  } from "@app";
import { getArticleStatsFn } from "./getArticleStats.fn.ts";
import { getArticleStatsValidator } from "./getArticleStats.val.ts";

export const getArticleStatsSetup = () =>
  coreApp.acts.setAct({
    schema: "article",
    actName: "getArticleStats",
    validationRunType: "read",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Admin", "Manager"],
      }),
    ],
    validator: getArticleStatsValidator(),
    fn: getArticleStatsFn,
  });
