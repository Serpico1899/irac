import { coreApp } from "../../../mod.ts";
import deleteCourseFn from "./deleteCourse.fn.ts";
import { deleteCourseValidator } from "./deleteCourse.val.ts";
import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser, throwError } from "@lib";

// Check if course exists
export const checkCourseExistsForDelete = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const courseId = body?.details.filter?._id;

  if (!courseId) {
    throwError("شناسه دوره الزامی است");
  }

  const existingCourse = await coreApp.odm.db
    .collection("courses")
    .findOne({ _id: courseId });

  if (!existingCourse) {
    throwError("دوره مورد نظر یافت نشد");
  }

  // Store course in context for later use
  const context = coreApp.contextFns.getContextModel() as MyContext;
  context.existingCourse = existingCourse;
};

// Check for existing enrollments
export const checkExistingEnrollments = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const courseId = body?.details.filter?._id;

  // Check for active enrollments
  const activeEnrollments = await coreApp.odm.db
    .collection("enrollments")
    .countDocuments({
      course: courseId,
      status: { $in: ["Active", "Completed"] }
    });

  if (activeEnrollments > 0) {
    throwError(`امکان حذف دوره وجود ندارد. ${activeEnrollments} دانشجو در این دوره ثبت‌نام کرده‌اند`);
  }

  // Check for pending enrollments
  const pendingEnrollments = await coreApp.odm.db
    .collection("enrollments")
    .countDocuments({
      course: courseId,
      status: "Pending"
    });

  if (pendingEnrollments > 0) {
    throwError(`امکان حذف دوره وجود ندارد. ${pendingEnrollments} ثبت‌نام در انتظار تایید وجود دارد`);
  }
};

// Validate course can be deleted
export const validateCourseDeletion = () => {
  const { existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  // Don't allow deletion of active courses with recent activity
  if (existingCourse?.status === "Active") {
    const now = new Date();
    const courseStart = existingCourse.start_date ? new Date(existingCourse.start_date) : null;

    // If course has started or starting within 7 days, don't allow deletion
    if (courseStart && courseStart.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      throwError("امکان حذف دوره فعال که شروع شده یا در حال شروع است وجود ندارد");
    }
  }

  // Additional validation for featured courses
  if (existingCourse?.featured) {
    // You might want to warn admin but not prevent deletion
    console.warn(`Warning: Deleting featured course: ${existingCourse.name}`);
  }
};

// Log course deletion for audit
export const logCourseDeletion = () => {
  const { user, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  console.log(`Course deletion initiated by user ${user?._id} (${user?.first_name} ${user?.last_name})`);
  console.log(`Course to delete: ${existingCourse?.name} (ID: ${existingCourse?._id})`);
  console.log(`Course status: ${existingCourse?.status}, Type: ${existingCourse?.type}`);
};

export const deleteCourseSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "deleteCourse",
    validationRunType: "delete",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
      }),
      checkCourseExistsForDelete,
      checkExistingEnrollments,
      validateCourseDeletion,
      logCourseDeletion,
    ],
    validator: deleteCourseValidator(),
    fn: deleteCourseFn,
  });
