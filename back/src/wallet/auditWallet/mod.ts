import {  coreApp  } from "@app";
import { auditWalletFn } from "./auditWallet.fn.ts";
import { auditWalletValidator } from "./auditWallet.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const auditWalletSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "auditWallet",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: auditWalletValidator(),
    fn: auditWalletFn,
  });
