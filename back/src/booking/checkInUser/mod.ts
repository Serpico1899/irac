import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { checkInUserFn } from "./checkInUser.fn.ts";
import { checkInUserValidator } from "./checkInUser.val.ts";

export const checkInUserSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "checkInUser",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: checkInUserValidator(),
    fn: checkInUserFn,
  });
