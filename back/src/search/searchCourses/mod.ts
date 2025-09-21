import { coreApp } from "../../mod.ts";
import searchCoursesHandler from "./searchCourses.fn.ts";
import { searchCoursesValidator } from "./searchCourses.val.ts";

export const searchCoursesSetup = () =>
  coreApp.acts.setAct({
    schema: "search",
    actName: "searchCourses",
    validator: searchCoursesValidator,
    fn: searchCoursesHandler,
  });
