import { coreApp } from "../../../mod.ts";
import { getUserScoreValidator } from "./getUserScore.val.ts";
import { getUserScoreFn } from "./getUserScore.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getUserScoreSetup = () =>
  coreApp.acts.setAct({
    schema: "user_level",
    actName: "getUserScore",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: getUserScoreValidator(),
    fn: getUserScoreFn,
  });
