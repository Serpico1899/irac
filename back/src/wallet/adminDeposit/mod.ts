import { coreApp } from "../../../mod.ts";
import { adminDepositFn } from "./adminDeposit.fn.ts";
import { adminDepositValidator } from "./adminDeposit.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const adminDepositSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "adminDeposit",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: adminDepositValidator(),
    fn: adminDepositFn,
  });
