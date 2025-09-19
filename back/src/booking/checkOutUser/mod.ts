import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { checkOutUserFn } from "./checkOutUser.fn.ts";
import { checkOutUserValidator } from "./checkOutUser.val.ts";

export const checkOutUserSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "checkOutUser",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: checkOutUserValidator(),
    fn: checkOutUserFn,
  });
