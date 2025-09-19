import { coreApp } from "../../../mod.ts";
import { unfreezeWalletFn } from "./unfreezeWallet.fn.ts";
import { unfreezeWalletValidator } from "./unfreezeWallet.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const unfreezeWalletSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "unfreezeWallet",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: unfreezeWalletValidator(),
    fn: unfreezeWalletFn,
  });
