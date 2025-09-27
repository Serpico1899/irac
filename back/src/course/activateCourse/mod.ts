import {  coreApp  } from "@app";
import activateCourseFn from "./activateCourse.fn.ts";
import { activateCourseValidator } from "./activateCourse.val.ts";
import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser, throwError } from "@lib";

// Check if course exists and can be activated
export const checkCourseForActivation = async () => {
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

// Validate course can be activated
export const validateCourseActivation = () => {
  const { existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  if (!existingCourse) {
    throwError("دوره مورد نظر یافت نشد");
  }

  // Check current status
  if (existingCourse.status !== "Draft") {
    throwError(`امکان فعال‌سازی دوره با وضعیت ${existingCourse.status} وجود ندارد. فقط دوره‌های پیش‌نویس قابل فعال‌سازی هستند`);
  }

  // Validate required fields
  const requiredFields = [
    { field: 'name', message: 'نام دوره الزامی است' },
    { field: 'description', message: 'توضیحات دوره الزامی است' },
    { field: 'level', message: 'سطح دوره الزامی است' },
    { field: 'type', message: 'نوع دوره الزامی است' },
  ];

  for (const { field, message } of requiredFields) {
    if (!existingCourse[field]) {
      throwError(message);
    }
  }

  // Validate price logic
  if (existingCourse.price === undefined || existingCourse.price === null) {
    throwError("قیمت دوره الزامی است");
  }

  if (existingCourse.price < 0) {
    throwError("قیمت دوره نمی‌تواند منفی باشد");
  }

  // Check if price is 0 but is_free is false
  if (existingCourse.price === 0 && !existingCourse.is_free) {
    throwError("دوره رایگان باید با فلگ is_free مشخص شود");
  }

  // Validate dates if provided
  const now = new Date();

  if (existingCourse.start_date) {
    const startDate = new Date(existingCourse.start_date);
    if (startDate <= now) {
      throwError("تاریخ شروع دوره باید در آینده باشد");
    }

    if (existingCourse.registration_deadline) {
      const registrationDeadline = new Date(existingCourse.registration_deadline);
      if (registrationDeadline >= startDate) {
        throwError("مهلت ثبت‌نام باید قبل از تاریخ شروع دوره باشد");
      }
    }

    if (existingCourse.end_date) {
      const endDate = new Date(existingCourse.end_date);
      if (endDate <= startDate) {
        throwError("تاریخ پایان دوره باید بعد از تاریخ شروع باشد");
      }
    }
  }

  // Validate capacity settings
  if (existingCourse.max_students && existingCourse.min_students) {
    if (existingCourse.max_students < existingCourse.min_students) {
      throwError("حداکثر دانشجو نمی‌تواند کمتر از حداقل دانشجو باشد");
    }
  }

  // Validate workshop-specific requirements
  if (existingCourse.type === "Workshop" || existingCourse.is_workshop) {
    if (!existingCourse.is_online && !existingCourse.workshop_location) {
      throwError("برای ورکشاپ حضوری آدرس محل برگزاری الزامی است");
    }

    if (existingCourse.is_online && !existingCourse.meeting_link) {
      console.warn("Warning: Online workshop activated without meeting link");
    }
  }

  // Check for instructor if required
  if (existingCourse.type !== "Seminar" && !existingCourse.instructor && !existingCourse.instructor_name) {
    throwError("برای این نوع دوره مشخص کردن مدرس الزامی است");
  }
};

// Set activation timestamp and default values
export const setActivationDefaults = () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  // Set activation timestamp
  body.details.set.activated_at = new Date();

  // Ensure status is set to Active
  body.details.set.status = "Active";

  // Set default sort order if not set (active courses get higher priority)
  if (body.details.set.sort_order === undefined) {
    body.details.set.sort_order = 10;
  }
};

// Log course activation
export const logCourseActivation = () => {
  const { user, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  console.log(`Course activation initiated by user ${user?._id} (${user?.first_name} ${user?.last_name})`);
  console.log(`Course to activate: ${existingCourse?.name} (ID: ${existingCourse?._id})`);
  console.log(`Course type: ${existingCourse?.type}, Previous status: ${existingCourse?.status}`);
};

export const activateCourseSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "activateCourse",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
      }),
      checkCourseForActivation,
      validateCourseActivation,
      setActivationDefaults,
      logCourseActivation,
    ],
    validator: activateCourseValidator(),
    fn: activateCourseFn,
  });
