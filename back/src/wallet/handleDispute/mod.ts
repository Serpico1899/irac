import {  coreApp  } from "@app";
import { handleDisputeFn } from "./handleDispute.fn.ts";
import { handleDisputeValidator } from "./handleDispute.val.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const handleDisputeSetup = () =>
  coreApp.acts.setAct({
    schema: "wallet",
    actName: "handleDispute",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
        features: ["wallet:admin"],
      }),
    ],
    validator: handleDisputeValidator(),
    fn: handleDisputeFn,
  });
