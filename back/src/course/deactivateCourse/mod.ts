import { coreApp } from "../../../mod.ts";
import deactivateCourseFn from "./deactivateCourse.fn.ts";
import { deactivateCourseValidator } from "./deactivateCourse.val.ts";
import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser, throwError } from "@lib";

// Check if course exists and can be deactivated
export const checkCourseForDeactivation = async () => {
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

// Validate course can be deactivated
export const validateCourseDeactivation = () => {
  const { existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  if (!existingCourse) {
    throwError("دوره مورد نظر یافت نشد");
  }

  // Check current status
  if (existingCourse.status !== "Active") {
    throwError(`امکان غیرفعال‌سازی دوره با وضعیت ${existingCourse.status} وجود ندارد. فقط دوره‌های فعال قابل غیرفعال‌سازی هستند`);
  }

  // Check if course has started
  const now = new Date();
  if (existingCourse.start_date && new Date(existingCourse.start_date) <= now) {
    // Course has already started - warn but don't prevent
    console.warn(`Warning: Deactivating course that has already started: ${existingCourse.name}`);
  }
};

// Handle existing enrollments
export const handleExistingEnrollments = async () => {
  const { body, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const courseId = body?.details.filter?._id;
  const deactivationAction = body?.details.set?.enrollment_action || "notify";

  // Count active enrollments
  const activeEnrollments = await coreApp.odm.db
    .collection("enrollments")
    .countDocuments({
      course: courseId,
      status: { $in: ["Active", "Pending"] }
    });

  if (activeEnrollments > 0) {
    console.log(`Course has ${activeEnrollments} active enrollments`);

    switch (deactivationAction) {
      case "cancel_enrollments":
        // Cancel all pending enrollments and mark active as cancelled
        await coreApp.odm.db.collection("enrollments").updateMany(
          {
            course: courseId,
            status: { $in: ["Active", "Pending"] }
          },
          {
            $set: {
              status: "Cancelled",
              cancellation_reason: "Course deactivated by admin",
              cancelled_at: new Date(),
              cancelled_by_admin: true
            }
          }
        );
        console.log(`Cancelled ${activeEnrollments} enrollments due to course deactivation`);
        break;

      case "transfer_enrollments":
        // This would require a target course - for now just log
        console.log("Enrollment transfer requested but not implemented in this version");
        break;

      case "notify":
      default:
        // Just proceed and log - enrollments remain but course is archived
        console.log(`Deactivating course with ${activeEnrollments} active enrollments - students will be notified`);
        break;
    }
  }

  // Store enrollment count in context for response
  const context = coreApp.contextFns.getContextModel() as MyContext;
  context.activeEnrollmentCount = activeEnrollments;
};

// Set deactivation details
export const setDeactivationDefaults = () => {
  const { body, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const set = body?.details.set || {};

  // Set deactivation timestamp
  set.deactivated_at = new Date();

  // Set status - default to Archived if not specified
  if (!set.status) {
    set.status = "Archived";
  }

  // Validate status transition
  const validDeactivationStatuses = ["Archived", "Sold_Out"];
  if (!validDeactivationStatuses.includes(set.status)) {
    throwError("وضعیت جدید باید یکی از موارد زیر باشد: Archived، Sold_Out");
  }

  // Lower sort order for deactivated courses
  if (set.sort_order === undefined) {
    set.sort_order = 0;
  }

  // Remove featured flag when deactivating
  if (existingCourse?.featured && set.remove_featured !== false) {
    set.featured = false;
  }

  body.details.set = set;
};

// Log course deactivation
export const logCourseDeactivation = () => {
  const { user, existingCourse, activeEnrollmentCount }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  console.log(`Course deactivation initiated by user ${user?._id} (${user?.first_name} ${user?.last_name})`);
  console.log(`Course to deactivate: ${existingCourse?.name} (ID: ${existingCourse?._id})`);
  console.log(`Course type: ${existingCourse?.type}, Current status: ${existingCourse?.status}`);
  console.log(`Active enrollments: ${activeEnrollmentCount || 0}`);
};

export const deactivateCourseSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "deactivateCourse",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
      }),
      checkCourseForDeactivation,
      validateCourseDeactivation,
      handleExistingEnrollments,
      setDeactivationDefaults,
      logCourseDeactivation,
    ],
    validator: deactivateCourseValidator(),
    fn: deactivateCourseFn,
  });
