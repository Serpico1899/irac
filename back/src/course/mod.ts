import { getCourseSetup } from "./getCourse/mod.ts";
import { getCoursesSetup } from "./getCourses/mod.ts";
import { completeCourseSetup } from "./completeCourse/mod.ts";
import { createCourseSetup } from "./createCourse/mod.ts";
import { updateCourseSetup } from "./updateCourse/mod.ts";
import { deleteCourseSetup } from "./deleteCourse/mod.ts";
import { activateCourseSetup } from "./activateCourse/mod.ts";
import { deactivateCourseSetup } from "./deactivateCourse/mod.ts";
import { enrollStudentSetup } from "./enrollStudent/mod.ts";
import { getCourseStatsSetup } from "./getCourseStats/mod.ts";
import { getCourseEnrollmentsSetup } from "./getCourseEnrollments/mod.ts";

export const courseSetup = () => {
  // Existing APIs
  getCourseSetup();
  getCoursesSetup();
  completeCourseSetup();

  // Core Course Management APIs
  createCourseSetup();
  updateCourseSetup();
  deleteCourseSetup();

  // Course Lifecycle APIs
  activateCourseSetup();
  deactivateCourseSetup();

  // Enrollment Management APIs
  enrollStudentSetup();

  // Analytics APIs
  getCourseStatsSetup();
  getCourseEnrollmentsSetup();
};
