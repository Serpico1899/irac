import {
  grantAccess,
  setTokens,
  setUser,
} from "@lib";
import { coreApp } from "../../../mod.ts";
import { updateProgressFn } from "./updateProgress.fn.ts";
import { updateProgressValidator } from "./updateProgress.val.ts";

export const updateProgressSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "updateProgress",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
        users: "me",
      }),
    ],
    validator: updateProgressValidator(),
    fn: updateProgressFn,
  });
