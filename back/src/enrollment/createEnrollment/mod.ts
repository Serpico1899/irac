import type { Infer } from "@deps";
import {
  grantAccess,
  type MyContext,
  setTokens,
  setUser,
  throwError,
} from "@lib";
import { coreApp } from "../../../mod.ts";
import { createEnrollmentFn } from "./createEnrollment.fn.ts";
import { createEnrollmentValidator } from "./createEnrollment.val.ts";

export const checkEnrollmentDuplicate = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { course, user } = body?.details.set;

  if (!course || !user) {
    return;
  }

  // Check if user is already enrolled in this course
  const existingEnrollment = await coreApp.odm.db
    .collection("enrollments")
    .findOne({
      "relations.course._ids": course,
      "relations.user._ids": user,
      status: { $in: ["Active", "Pending_Payment"] }
    });

  if (existingEnrollment) {
    throwError("User is already enrolled in this course");
  }
};

export const createEnrollmentSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "createEnrollment",
    validationRunType: "create",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
        users: "me",
      }),
      checkEnrollmentDuplicate,
    ],
    validator: createEnrollmentValidator(),
    fn: createEnrollmentFn,
  });
