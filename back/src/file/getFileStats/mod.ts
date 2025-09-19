import { coreApp } from "../../../mod.ts";
import { setTokens, setUser, grantAccess } from "@lib";
import { getFileStatsFn } from "./getFileStats.fn.ts";
import { getFileStatsValidator } from "./getFileStats.val.ts";

export const getFileStatsSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "getFileStats",
    validationRunType: "get",
    validator: getFileStatsValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: getFileStatsFn,
  });
