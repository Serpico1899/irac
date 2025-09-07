import { coreApp } from "../../../mod.ts";
import { getTransactionsFn } from "./getTransactions.fn.ts";
import { getTransactionsValidator } from "./getTransactions.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getTransactionsSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "getTransactions",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "User"],
        features: ["wallet:read"],
      }),
    ],
    validator: getTransactionsValidator(),
    fn: getTransactionsFn,
  });
