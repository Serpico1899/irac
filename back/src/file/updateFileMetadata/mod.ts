import { coreApp } from "../../../mod.ts";
import { setTokens, setUser, grantAccess } from "@lib";
import { updateFileMetadataFn } from "./updateFileMetadata.fn.ts";
import { updateFileMetadataValidator } from "./updateFileMetadata.val.ts";

export const updateFileMetadataSetup = () =>
  coreApp.acts.setAct({
    schema: "file",
    actName: "updateFileMetadata",
    validationRunType: "update",
    validator: updateFileMetadataValidator(),
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    fn: updateFileMetadataFn,
  });
