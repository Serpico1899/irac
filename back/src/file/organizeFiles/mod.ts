import { coreApp } from "../../../mod.ts";
import { setTokens, setUser, grantAccess } from "@lib";
import { organizeFilesFn } from "./organizeFiles.fn.ts";
import { organizeFilesValidator } from "./organizeFiles.val.ts";

export const organizeFilesSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "organizeFiles",
    validationRunType: "update",
    validator: organizeFilesValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: organizeFilesFn,
  });
