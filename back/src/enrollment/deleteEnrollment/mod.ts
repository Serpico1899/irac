import {
  grantAccess,
  setTokens,
  setUser,
} from "@lib";
import { coreApp } from "../../../mod.ts";
import { deleteEnrollmentFn } from "./deleteEnrollment.fn.ts";
import { deleteEnrollmentValidator } from "./deleteEnrollment.val.ts";

export const deleteEnrollmentSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "deleteEnrollment",
    validationRunType: "delete",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
        users: "me",
      }),
    ],
    validator: deleteEnrollmentValidator(),
    fn: deleteEnrollmentFn,
  });
