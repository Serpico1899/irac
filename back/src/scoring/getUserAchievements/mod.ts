import { coreApp } from "../../../mod.ts";
import { getUserAchievementsValidator } from "./getUserAchievements.val.ts";
import { getUserAchievementsFn } from "./getUserAchievements.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getUserAchievementsSetup = () =>
  coreApp.acts.setAct({
    schema: "user_level",
    actName: "getUserAchievements",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: getUserAchievementsValidator(),
    fn: getUserAchievementsFn,
  });
