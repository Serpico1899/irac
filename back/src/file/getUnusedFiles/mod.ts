import {  coreApp  } from "@app";
import { setTokens, setUser, grantAccess } from "@lib";
import { getUnusedFilesFn } from "./getUnusedFiles.fn.ts";
import { getUnusedFilesValidator } from "./getUnusedFiles.val.ts";

export const getUnusedFilesSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "getUnusedFiles",
    validationRunType: "get",
    validator: getUnusedFilesValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: getUnusedFilesFn,
  });
