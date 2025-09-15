import { getCourseSetup } from "./getCourse/mod.ts";
import { getCoursesSetup } from "./getCourses/mod.ts";
import { completeCourseSetup } from "./completeCourse/mod.ts";

export const courseSetup = () => {
  getCourseSetup();
  getCoursesSetup();
  completeCourseSetup();
};
