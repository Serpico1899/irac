import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { getSpaceUtilizationFn } from "./getSpaceUtilization.fn.ts";
import { getSpaceUtilizationValidator } from "./getSpaceUtilization.val.ts";

export const getSpaceUtilizationSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "getSpaceUtilization",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: getSpaceUtilizationValidator(),
    fn: getSpaceUtilizationFn,
  });
