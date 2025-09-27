import {  coreApp  } from "@app";
import { purchaseFn } from "./purchase.fn.ts";
import { purchaseValidator } from "./purchase.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const purchaseSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "purchase",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "User"],
        features: ["wallet:write"],
      }),
    ],
    validator: purchaseValidator(),
    fn: purchaseFn,
  });
