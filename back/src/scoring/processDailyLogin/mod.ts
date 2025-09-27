import {  coreApp  } from "@app";
import { processDailyLoginValidator } from "./processDailyLogin.val.ts";
import { processDailyLoginFn } from "./processDailyLogin.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const processDailyLoginSetup = () =>
  coreApp.acts.setAct({
    schema: "user_level",
    actName: "processDailyLogin",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: processDailyLoginValidator(),
    fn: processDailyLoginFn,
  });
