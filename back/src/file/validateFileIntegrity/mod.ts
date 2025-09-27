import {  coreApp  } from "@app";
import { setTokens, setUser, grantAccess } from "@lib";
import { validateFileIntegrityFn } from "./validateFileIntegrity.fn.ts";
import { validateFileIntegrityValidator } from "./validateFileIntegrity.val.ts";

export const validateFileIntegritySetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "validateFileIntegrity",
    validationRunType: "get",
    validator: validateFileIntegrityValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: validateFileIntegrityFn,
  });
