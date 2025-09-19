import { coreApp } from "../../../mod.ts";
import updateCourseFn from "./updateCourse.fn.ts";
import { updateCourseValidator } from "./updateCourse.val.ts";
import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser, throwError } from "@lib";

// Check if course exists and user has permission to update it
export const checkCourseExists = async () => {
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

// Update slug if name changes
export const updateCourseSlug = async () => {
  const { body, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { name } = body?.details.set || {};

  // Only update slug if name is being changed
  if (!name || existingCourse?.name === name) {
    return;
  }

  // Generate new slug from updated name
  const baseSlug = name
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '') // Keep Persian, English, numbers, spaces, hyphens
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Check if slug exists (excluding current course)
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingCourse = await coreApp.odm.db
      .collection("courses")
      .findOne({
        slug,
        _id: { $ne: body.details.filter._id }
      });

    if (!existingCourse) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Add slug to the body
  body.details.set.slug = slug;
};

// Validate course dates for updates
export const validateCourseUpdateDates = () => {
  const { body, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const updateData = body?.details.set || {};

  // Use existing data as fallback
  const start_date = updateData.start_date || existingCourse?.start_date;
  const end_date = updateData.end_date || existingCourse?.end_date;
  const registration_deadline = updateData.registration_deadline || existingCourse?.registration_deadline;

  const now = new Date();

  // Only validate future start dates for courses not yet started
  if (updateData.start_date && new Date(updateData.start_date) <= now) {
    // Check if course hasn't started yet
    if (!existingCourse?.start_date || new Date(existingCourse.start_date) > now) {
      throwError("تاریخ شروع دوره باید در آینده باشد");
    }
  }

  if (end_date && start_date && new Date(end_date) <= new Date(start_date)) {
    throwError("تاریخ پایان دوره باید بعد از تاریخ شروع باشد");
  }

  if (registration_deadline && start_date &&
    new Date(registration_deadline) >= new Date(start_date)) {
    throwError("مهلت ثبت‌نام باید قبل از تاریخ شروع دوره باشد");
  }
};

// Validate status changes
export const validateStatusChange = () => {
  const { body, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const newStatus = body?.details.set?.status;
  const currentStatus = existingCourse?.status;

  if (!newStatus || newStatus === currentStatus) {
    return;
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    "Draft": ["Active", "Archived"],
    "Active": ["Archived", "Sold_Out"],
    "Archived": ["Draft", "Active"],
    "Sold_Out": ["Active", "Archived"]
  };

  const allowedStatuses = validTransitions[currentStatus] || [];

  if (!allowedStatuses.includes(newStatus)) {
    throwError(`امکان تغییر وضعیت از ${currentStatus} به ${newStatus} وجود ندارد`);
  }

  // Additional validations for specific status changes
  if (newStatus === "Active") {
    // Validate required fields for active courses
    const name = body.details.set.name || existingCourse?.name;
    const description = body.details.set.description || existingCourse?.description;
    const price = body.details.set.price !== undefined ? body.details.set.price : existingCourse?.price;

    if (!name || !description || price === undefined || price < 0) {
      throwError("دوره باید دارای نام، توضیحات و قیمت معتبر باشد تا بتوان آن را فعال کرد");
    }
  }
};

// Handle pricing logic updates
export const updatePricingLogic = () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const set = body?.details.set;

  if (!set) return;

  // Update is_free flag based on price
  if (set.price !== undefined) {
    if (set.is_free === undefined) {
      set.is_free = set.price === 0;
    }
  }

  // Update workshop flag based on type
  if (set.type === "Workshop") {
    set.is_workshop = true;
  } else if (set.type && set.type !== "Workshop") {
    set.is_workshop = false;
  }
};

export const updateCourseSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "updateCourse",
    validationRunType: "update",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
      }),
      checkCourseExists,
      validateCourseUpdateDates,
      validateStatusChange,
      updatePricingLogic,
      updateCourseSlug,
    ],
    validator: updateCourseValidator(),
    fn: updateCourseFn,
  });
