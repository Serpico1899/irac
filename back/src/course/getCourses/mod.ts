import {  coreApp  } from "@app";
import getCoursesHandler from "./getCourses.fn.ts";
import { getCoursesValidator } from "./getCourses.val.ts";

export const getCoursesSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "getCourses",
    validator: getCoursesValidator,
    fn: getCoursesHandler,
  });
