import {  coreApp  } from "@app";
import { getWalletStatsFn } from "./getWalletStats.fn.ts";
import { getWalletStatsValidator } from "./getWalletStats.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getWalletStatsSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "getWalletStats",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: getWalletStatsValidator(),
    fn: getWalletStatsFn,
  });
