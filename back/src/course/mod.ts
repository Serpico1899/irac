import { getCoursesSetup } from "./getCourses/mod.ts";
import { getCourseSetup } from "./getCourse/mod.ts";

export const courseSetup = () => {
  getCoursesSetup();
  getCourseSetup();
};
