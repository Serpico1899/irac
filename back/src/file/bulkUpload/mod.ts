import { coreApp } from "../../../mod.ts";
import { setTokens, setUser, grantAccess } from "@lib";
import { bulkUploadFn } from "./bulkUpload.fn.ts";
import { bulkUploadValidator } from "./bulkUpload.val.ts";

export const bulkUploadSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "bulkUpload",
    validationRunType: "create",
    validator: bulkUploadValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: bulkUploadFn,
  });
