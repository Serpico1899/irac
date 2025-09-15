import { coreApp } from "../../../mod.ts";
import { applyReferralCodeValidator } from "./applyReferralCode.val.ts";
import { applyReferralCodeFn } from "./applyReferralCode.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const applyReferralCodeSetup = () =>
  coreApp.acts.setAct({
    schema: "referral",
    actName: "applyReferralCode",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: applyReferralCodeValidator(),
    fn: applyReferralCodeFn,
  });
