import { createEnrollmentSetup } from "./createEnrollment/mod.ts";
import { updateEnrollmentSetup } from "./updateEnrollment/mod.ts";
import { deleteEnrollmentSetup } from "./deleteEnrollment/mod.ts";
import { getEnrollmentSetup } from "./getEnrollment/mod.ts";
import { getEnrollmentsSetup } from "./getEnrollments/mod.ts";
import { updateProgressSetup } from "./updateProgress/mod.ts";

export const enrollmentSetup = () => {
  createEnrollmentSetup();
  updateEnrollmentSetup();
  deleteEnrollmentSetup();
  getEnrollmentSetup();
  getEnrollmentsSetup();
  updateProgressSetup();
};
