import { coreApp } from "../../../mod.ts";
import getCourseEnrollmentsFn from "./getCourseEnrollments.fn.ts";
import { getCourseEnrollmentsValidator } from "./getCourseEnrollments.val.ts";
import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser, throwError } from "@lib";

// Check if course exists
export const checkCourseExistsForEnrollments = async () => {
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

// Prepare enrollment filters
export const prepareEnrollmentFilters = () => {
  const { body, existingCourse }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const {
    enrollment_status,
    payment_status,
    enrolled_after,
    enrolled_before,
    search_query,
    include_cancelled
  } = body?.details.set || {};

  const filters: any = {
    course: existingCourse._id
  };

  // Filter by enrollment status
  if (enrollment_status) {
    if (Array.isArray(enrollment_status)) {
      filters.status = { $in: enrollment_status };
    } else {
      filters.status = enrollment_status;
    }
  } else if (!include_cancelled) {
    // Exclude cancelled enrollments by default
    filters.status = { $ne: "Cancelled" };
  }

  // Filter by payment status
  if (payment_status) {
    if (Array.isArray(payment_status)) {
      filters.payment_status = { $in: payment_status };
    } else {
      filters.payment_status = payment_status;
    }
  }

  // Date range filters
  if (enrolled_after || enrolled_before) {
    filters.enrollment_date = {};
    if (enrolled_after) {
      filters.enrollment_date.$gte = new Date(enrolled_after);
    }
    if (enrolled_before) {
      filters.enrollment_date.$lte = new Date(enrolled_before);
    }
  }

  // Store filters in context
  const context = coreApp.contextFns.getContextModel() as MyContext;
  context.enrollmentFilters = filters;
  context.searchQuery = search_query;
};

// Set pagination defaults
export const setPaginationDefaults = () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const set = body?.details.set || {};

  // Set default page and limit
  if (!set.page || set.page < 1) {
    set.page = 1;
  }

  if (!set.limit) {
    set.limit = 20;
  } else if (set.limit > 100) {
    set.limit = 100; // Max 100 per page
  }

  // Set default sort
  if (!set.sort_by) {
    set.sort_by = "enrollment_date";
  }

  if (!set.sort_order) {
    set.sort_order = "desc"; // Newest first
  }

  // Set default fields to include
  if (!set.include_fields) {
    set.include_fields = [
      "user_details",
      "payment_info",
      "progress_info",
      "enrollment_info"
    ];
  }

  body.details.set = set;
};

// Validate query parameters
export const validateQueryParams = () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const {
    page,
    limit,
    sort_by,
    sort_order,
    min_progress,
    max_progress
  } = body?.details.set || {};

  // Validate pagination
  if (page && (page < 1 || page > 10000)) {
    throwError("شماره صفحه معتبر نیست");
  }

  if (limit && (limit < 1 || limit > 100)) {
    throwError("تعداد نتایج در هر صفحه باید بین 1 تا 100 باشد");
  }

  // Validate sort parameters
  const validSortFields = [
    "enrollment_date",
    "progress_percentage",
    "payment_amount",
    "completion_date",
    "user_name"
  ];

  if (sort_by && !validSortFields.includes(sort_by)) {
    throwError("فیلد مرتب‌سازی معتبر نیست");
  }

  const validSortOrders = ["asc", "desc"];
  if (sort_order && !validSortOrders.includes(sort_order)) {
    throwError("نوع مرتب‌سازی معتبر نیست");
  }

  // Validate progress range
  if (min_progress !== undefined && (min_progress < 0 || min_progress > 100)) {
    throwError("حداقل پیشرفت باید بین 0 تا 100 باشد");
  }

  if (max_progress !== undefined && (max_progress < 0 || max_progress > 100)) {
    throwError("حداکثر پیشرفت باید بین 0 تا 100 باشد");
  }

  if (min_progress !== undefined && max_progress !== undefined && min_progress > max_progress) {
    throwError("حداقل پیشرفت نمی‌تواند بیشتر از حداکثر پیشرفت باشد");
  }
};

// Log enrollment query
export const logEnrollmentQuery = () => {
  const { user, existingCourse, body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { page, limit, enrollment_status, payment_status } = body?.details.set || {};

  console.log(`Course enrollments query by user ${user?._id} (${user?.first_name} ${user?.last_name})`);
  console.log(`Course: ${existingCourse?.name} (ID: ${existingCourse?._id})`);
  console.log(`Page: ${page}, Limit: ${limit}`);
  console.log(`Filters - Status: ${enrollment_status || 'all'}, Payment: ${payment_status || 'all'}`);
};

export const getCourseEnrollmentsSetup = () =>
  coreApp.acts.setAct({
    schema: "enrollment",
    actName: "getCourseEnrollments",
    validationRunType: "read",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
      }),
      checkCourseExistsForEnrollments,
      prepareEnrollmentFilters,
      setPaginationDefaults,
      validateQueryParams,
      logEnrollmentQuery,
    ],
    validator: getCourseEnrollmentsValidator(),
    fn: getCourseEnrollmentsFn,
  });
