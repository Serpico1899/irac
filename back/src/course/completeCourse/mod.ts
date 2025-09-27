import {  coreApp  } from "@app";
import { completeCourseValidator } from "./completeCourse.val.ts";
import { completeCourseFn } from "./completeCourse.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const completeCourseSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "completeCourse",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: completeCourseValidator(),
    fn: completeCourseFn,
  });
