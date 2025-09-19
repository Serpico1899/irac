import { coreApp } from "../../../mod.ts";
import { setTokens, setUser, grantAccess } from "@lib";
import { getFileDetailsFn } from "./getFileDetails.fn.ts";
import { getFileDetailsValidator } from "./getFileDetails.val.ts";

export const getFileDetailsSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "getFileDetails",
    validationRunType: "get",
    validator: getFileDetailsValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: getFileDetailsFn,
  });
