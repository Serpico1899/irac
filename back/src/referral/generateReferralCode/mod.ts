import {  coreApp  } from "@app";
import { generateReferralCodeValidator } from "./generateReferralCode.val.ts";
import { generateReferralCodeFn } from "./generateReferralCode.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const generateReferralCodeSetup = () =>
  coreApp.acts.setAct({
    schema: "referral",
    actName: "generateReferralCode",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: generateReferralCodeValidator(),
    fn: generateReferralCodeFn,
  });
