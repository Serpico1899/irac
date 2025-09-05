import { coreApp } from "../../../mod.ts";
import getCourseHandler from "./getCourse.fn.ts";
import { getCourseValidator } from "./getCourse.val.ts";

export const getCourseSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "getCourse",
    validator: getCourseValidator,
    fn: getCourseHandler,
  });
