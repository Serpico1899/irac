import { coreApp } from "../../../mod.ts";
import { freezeWalletFn } from "./freezeWallet.fn.ts";
import { freezeWalletValidator } from "./freezeWallet.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const freezeWalletSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "freezeWallet",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: freezeWalletValidator(),
    fn: freezeWalletFn,
  });
