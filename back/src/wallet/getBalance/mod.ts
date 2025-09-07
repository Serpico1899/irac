import { coreApp } from "../../../mod.ts";
import { getBalanceFn } from "./getBalance.fn.ts";
import { getBalanceValidator } from "./getBalance.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getBalanceSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "getBalance",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "User"],
        features: ["wallet:read"],
      }),
    ],
    validator: getBalanceValidator(),
    fn: getBalanceFn,
  });
