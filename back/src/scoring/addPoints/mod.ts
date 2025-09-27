import {  coreApp  } from "@app";
import { addPointsValidator } from "./addPoints.val.ts";
import { addPointsFn } from "./addPoints.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const addPointsSetup = () =>
  coreApp.acts.setAct({
    schema: "scoring_transaction",
    actName: "addPoints",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: addPointsValidator(),
    fn: addPointsFn,
  });
