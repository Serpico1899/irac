import {
  grantAccess,
  setTokens,
  setUser,
} from "@lib";
import { coreApp } from "../../../mod.ts";
import { getEnrollmentFn } from "./getEnrollment.fn.ts";
import { getEnrollmentValidator } from "./getEnrollment.val.ts";

export const getEnrollmentSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "getEnrollment",
    validationRunType: "read",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
        users: "me",
      }),
    ],
    validator: getEnrollmentValidator(),
    fn: getEnrollmentFn,
  });
