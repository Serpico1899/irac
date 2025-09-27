import {  coreApp  } from "@app";
import createCourseFn from "./createCourse.fn.ts";
import { createCourseValidator } from "./createCourse.val.ts";

export const createCourseSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "createCourse",
    validator: createCourseValidator,
    fn: createCourseFn,
  });
