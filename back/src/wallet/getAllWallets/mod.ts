import {  coreApp  } from "@app";
import { getAllWalletsFn } from "./getAllWallets.fn.ts";
import { getAllWalletsValidator } from "./getAllWallets.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getAllWalletsSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "getAllWallets",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: getAllWalletsValidator(),
    fn: getAllWalletsFn,
  });
