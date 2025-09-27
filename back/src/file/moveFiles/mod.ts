import {  coreApp  } from "@app";
import { setTokens, setUser, grantAccess } from "@lib";
import { moveFilesFn } from "./moveFiles.fn.ts";
import { moveFilesValidator } from "./moveFiles.val.ts";

export const moveFilesSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "moveFiles",
    validationRunType: "update",
    validator: moveFilesValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: moveFilesFn,
  });
