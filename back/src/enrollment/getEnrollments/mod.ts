import {
  grantAccess,
  setTokens,
  setUser,
} from "@lib";
import {  coreApp  } from "@app";
import { getEnrollmentsFn } from "./getEnrollments.fn.ts";
import { getEnrollmentsValidator } from "./getEnrollments.val.ts";

export const getEnrollmentsSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "getEnrollments",
    validationRunType: "read",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
        users: "me",
      }),
    ],
    validator: getEnrollmentsValidator(),
    fn: getEnrollmentsFn,
  });
