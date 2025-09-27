import {  coreApp  } from "@app";
import { setTokens, setUser, grantAccess } from "@lib";
import { deleteFileFn } from "./deleteFile.fn.ts";
import { deleteFileValidator } from "./deleteFile.val.ts";

export const deleteFileSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "deleteFile",
    validationRunType: "delete",
    validator: deleteFileValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: deleteFileFn,
  });
