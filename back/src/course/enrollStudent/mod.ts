import { coreApp } from "../../../mod.ts";
import enrollStudentFn from "./enrollStudent.fn.ts";
import { enrollStudentValidator } from "./enrollStudent.val.ts";
import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser, throwError } from "@lib";

// Check if course exists and can accept enrollments
export const checkCourseForEnrollment = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const courseId = body?.details.set?.course_id;

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

// Check if user exists
export const checkUserExists = async () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const userId = body?.details.set?.user_id;

  if (!userId) {
    throwError("شناسه کاربر الزامی است");
  }

  const existingUser = await coreApp.odm.db
    .collection("users")
    .findOne({ _id: userId });

  if (!existingUser) {
    throwError("کاربر مورد نظر یافت نشد");
  }

  // Store user in context for later use
  const context = coreApp.contextFns.getContextModel() as MyContext;
  context.targetUser = existingUser;
};

// Validate course enrollment eligibility
export const validateEnrollmentEligibility = () => {
  const { existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  if (!existingCourse) {
    throwError("دوره مورد نظر یافت نشد");
  }

  // Check course status
  if (existingCourse.status !== "Active") {
    throwError(`امکان ثبت‌نام در دوره با وضعیت ${existingCourse.status} وجود ندارد`);
  }

  // Check registration deadline
  if (existingCourse.registration_deadline) {
    const now = new Date();
    const deadline = new Date(existingCourse.registration_deadline);

    if (deadline <= now) {
      throwError("مهلت ثبت‌نام در این دوره به پایان رسیده است");
    }
  }

  // Check course capacity
  if (existingCourse.max_students) {
    const currentEnrollments = existingCourse.total_students || 0;

    if (currentEnrollments >= existingCourse.max_students) {
      throwError("ظرفیت دوره تکمیل شده است");
    }
  }
};

// Check for existing enrollment
export const checkExistingEnrollment = async () => {
  const { body, existingCourse, targetUser }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const courseId = body?.details.set?.course_id;
  const userId = body?.details.set?.user_id;

  // Check if user is already enrolled
  const existingEnrollment = await coreApp.odm.db
    .collection("enrollments")
    .findOne({
      course: courseId,
      user: userId,
      status: { $in: ["Active", "Pending", "Completed"] }
    });

  if (existingEnrollment) {
    throwError(`این کاربر قبلاً در دوره ثبت‌نام کرده است (وضعیت: ${existingEnrollment.status})`);
  }
};

// Set enrollment defaults
export const setEnrollmentDefaults = () => {
  const { body, user, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const set = body?.details.set || {};

  // Set enrollment date
  set.enrollment_date = new Date();

  // Set enrolled by admin
  set.enrolled_by_admin = true;
  set.enrolled_by = user?._id?.toString();

  // Set default payment status based on course price
  if (!set.payment_status) {
    if (existingCourse?.is_free || existingCourse?.price === 0) {
      set.payment_status = "Free";
    } else {
      set.payment_status = "Pending"; // Admin can override this
    }
  }

  // Set default enrollment status
  if (!set.enrollment_status) {
    set.enrollment_status = "Active"; // Admin enrollment defaults to active
  }

  // Set course details for reference
  set.course_name = existingCourse?.name;
  set.course_type = existingCourse?.type;
  set.course_price = existingCourse?.price || 0;

  // Initialize progress tracking
  set.progress_percentage = 0;
  set.lessons_completed = 0;
  set.total_lessons = 0; // Will be updated based on course curriculum

  // Set completion requirements
  if (existingCourse?.completion_points) {
    set.completion_points_required = existingCourse.completion_points;
    set.completion_points_earned = 0;
  }

  body.details.set = set;
};

// Validate admin enrollment permissions
export const validateAdminEnrollmentPermissions = () => {
  const { body, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const set = body?.details.set || {};

  // Validate payment status options
  const validPaymentStatuses = ["Pending", "Paid", "Free", "Partial", "Refunded"];
  if (set.payment_status && !validPaymentStatuses.includes(set.payment_status)) {
    throwError("وضعیت پرداخت معتبر نیست");
  }

  // Validate enrollment status options
  const validEnrollmentStatuses = ["Active", "Pending", "Completed", "Suspended"];
  if (set.enrollment_status && !validEnrollmentStatuses.includes(set.enrollment_status)) {
    throwError("وضعیت ثبت‌نام معتبر نیست");
  }

  // If marking as paid, validate amount
  if (set.payment_status === "Paid" && set.payment_amount !== undefined) {
    if (set.payment_amount < 0) {
      throwError("مبلغ پرداخت نمی‌تواند منفی باشد");
    }

    // For non-free courses, validate payment amount
    if (!existingCourse?.is_free && existingCourse?.price) {
      if (set.payment_amount > existingCourse.price * 1.1) { // Allow 10% tolerance for fees
        throwError("مبلغ پرداخت بیش از قیمت دوره است");
      }
    }
  }
};

// Log admin enrollment
export const logAdminEnrollment = () => {
  const { user, existingCourse, targetUser, body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  console.log(`Admin enrollment initiated by user ${user?._id} (${user?.first_name} ${user?.last_name})`);
  console.log(`Enrolling user: ${targetUser?.first_name} ${targetUser?.last_name} (${targetUser?.email})`);
  console.log(`Course: ${existingCourse?.name} (ID: ${existingCourse?._id})`);
  console.log(`Payment status: ${body?.details.set?.payment_status}`);
  console.log(`Enrollment status: ${body?.details.set?.enrollment_status}`);
};

export const enrollStudentSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "enrollStudent",
    validationRunType: "create",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
      }),
      checkCourseForEnrollment,
      checkUserExists,
      validateEnrollmentEligibility,
      checkExistingEnrollment,
      setEnrollmentDefaults,
      validateAdminEnrollmentPermissions,
      logAdminEnrollment,
    ],
    validator: enrollStudentValidator(),
    fn: enrollStudentFn,
  });
