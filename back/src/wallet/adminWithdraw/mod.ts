import { coreApp } from "../../../mod.ts";
import { adminWithdrawFn } from "./adminWithdraw.fn.ts";
import { adminWithdrawValidator } from "./adminWithdraw.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const adminWithdrawSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "adminWithdraw",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: adminWithdrawValidator(),
    fn: adminWithdrawFn,
  });
