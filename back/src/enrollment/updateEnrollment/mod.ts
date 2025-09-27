import {
  grantAccess,
  setTokens,
  setUser,
} from "@lib";
import {  coreApp  } from "@app";
import { updateEnrollmentFn } from "./updateEnrollment.fn.ts";
import { updateEnrollmentValidator } from "./updateEnrollment.val.ts";

export const updateEnrollmentSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "updateEnrollment",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
        users: "me",
      }),
    ],
    validator: updateEnrollmentValidator(),
    fn: updateEnrollmentFn,
  });
