import { coreApp } from "../../../mod.ts";
import { adjustBalanceFn } from "./adjustBalance.fn.ts";
import { adjustBalanceValidator } from "./adjustBalance.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const adjustBalanceSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "adjustBalance",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: adjustBalanceValidator(),
    fn: adjustBalanceFn,
  });
