import { coreApp } from "../../../mod.ts";
import { depositFn } from "./deposit.fn.ts";
import { depositValidator } from "./deposit.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const depositSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "deposit",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "User"],
        features: ["wallet:write"],
      }),
    ],
    validator: depositValidator(),
    fn: depositFn,
  });
