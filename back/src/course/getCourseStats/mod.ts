import {  coreApp  } from "@app";
import getCourseStatsFn from "./getCourseStats.fn.ts";
import { getCourseStatsValidator } from "./getCourseStats.val.ts";
import type { MyContext } from "@lib";
import { grantAccess, setTokens, setUser, throwError } from "@lib";

// Prepare analytics timeframe
export const prepareAnalyticsTimeframe = () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { timeframe, start_date, end_date } = body?.details.set || {};

  let analyticsStartDate: Date;
  let analyticsEndDate: Date = new Date(); // Default to now

  if (start_date && end_date) {
    analyticsStartDate = new Date(start_date);
    analyticsEndDate = new Date(end_date);
  } else {
    // Set default timeframe based on request
    switch (timeframe) {
      case "week":
        analyticsStartDate = new Date();
        analyticsStartDate.setDate(analyticsStartDate.getDate() - 7);
        break;
      case "month":
        analyticsStartDate = new Date();
        analyticsStartDate.setMonth(analyticsStartDate.getMonth() - 1);
        break;
      case "quarter":
        analyticsStartDate = new Date();
        analyticsStartDate.setMonth(analyticsStartDate.getMonth() - 3);
        break;
      case "year":
        analyticsStartDate = new Date();
        analyticsStartDate.setFullYear(analyticsStartDate.getFullYear() - 1);
        break;
      case "all":
      default:
        analyticsStartDate = new Date("2020-01-01"); // Project start date
        break;
    }
  }

  // Store dates in context
  const context = coreApp.contextFns.getContextModel() as MyContext;
  context.analyticsStartDate = analyticsStartDate;
  context.analyticsEndDate = analyticsEndDate;
};

// Validate analytics parameters
export const validateAnalyticsParams = () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { course_id, category_id, instructor_id } = body?.details.set || {};

  // If specific course requested, check if it exists
  if (course_id) {
    // This will be validated in the function since we need async operation
    return;
  }

  // If specific category requested, validate format
  if (category_id && typeof category_id !== "string") {
    throwError("شناسه دسته‌بندی معتبر نیست");
  }

  // If specific instructor requested, validate format
  if (instructor_id && typeof instructor_id !== "string") {
    throwError("شناسه مدرس معتبر نیست");
  }
};

// Set default analytics options
export const setAnalyticsDefaults = () => {
  const { body }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const set = body?.details.set || {};

  // Set default metrics to include
  if (!set.include_metrics) {
    set.include_metrics = [
      "course_counts",
      "enrollment_stats",
      "revenue_stats",
      "popular_courses",
      "instructor_performance"
    ];
  }

  // Set default grouping
  if (!set.group_by) {
    set.group_by = "course_type";
  }

  // Set default limits
  if (!set.limit) {
    set.limit = 50;
  }

  if (!set.popular_courses_limit) {
    set.popular_courses_limit = 10;
  }

  body.details.set = set;
};

// Log analytics request
export const logAnalyticsRequest = () => {
  const { user, body, analyticsStartDate, analyticsEndDate }: MyContext = coreApp.contextFns
    .getContextModel() as MyContext;

  const { course_id, category_id, instructor_id, timeframe } = body?.details.set || {};

  console.log(`Course analytics requested by user ${user?._id} (${user?.first_name} ${user?.last_name})`);
  console.log(`Timeframe: ${timeframe || 'custom'} (${analyticsStartDate?.toISOString()} to ${analyticsEndDate?.toISOString()})`);
  console.log(`Filters - Course: ${course_id || 'all'}, Category: ${category_id || 'all'}, Instructor: ${instructor_id || 'all'}`);
};

export const getCourseStatsSetup = () =>
  coreApp.acts.setAct({
    schema: "course",
    actName: "getCourseStats",
    validationRunType: "read",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Admin"],
      }),
      prepareAnalyticsTimeframe,
      validateAnalyticsParams,
      setAnalyticsDefaults,
      logAnalyticsRequest,
    ],
    validator: getCourseStatsValidator(),
    fn: getCourseStatsFn,
  });
