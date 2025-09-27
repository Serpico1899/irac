import {  coreApp  } from "@app";
import { setTokens, setUser, grantAccess } from "@lib";
import { bulkDeleteFn } from "./bulkDelete.fn.ts";
import { bulkDeleteValidator } from "./bulkDelete.val.ts";

export const bulkDeleteSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "bulkDelete",
    validationRunType: "delete",
    validator: bulkDeleteValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: bulkDeleteFn,
  });
