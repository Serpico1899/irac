import {  coreApp  } from "@app";
import { getLeaderboardValidator } from "./getLeaderboard.val.ts";
import { getLeaderboardFn } from "./getLeaderboard.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getLeaderboardSetup = () =>
  coreApp.acts.setAct({
    schema: "user_level",
    actName: "getLeaderboard",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: getLeaderboardValidator(),
    fn: getLeaderboardFn,
  });
