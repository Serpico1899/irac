import { coreApp } from "../../../mod.ts";
import { getWalletFn } from "./getWallet.fn.ts";
import { getWalletValidator } from "./getWallet.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getWalletSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "getWallet",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "User"],
        features: ["wallet:read"],
      }),
    ],
    validator: getWalletValidator(),
    fn: getWalletFn,
  });
