import { coreApp } from "../../../mod.ts";
import { getCoursesFn } from "./getCourses.fn.ts";
import { getCoursesValidator } from "./getCourses.val.ts";

export const getCoursesSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    fn: getCoursesFn,
    actName: "getCourses",
    validator: getCoursesValidator(),
  });
