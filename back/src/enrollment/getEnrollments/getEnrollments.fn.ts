import { type ActFn } from "@deps";
import { enrollment } from "../../../mod.ts";

export const getEnrollmentsFn: ActFn = async (body) => {
  const {
    set: {
      page,
      limit,
      sort,
      status,
      user,
      course,
      enrollment_date_from,
      enrollment_date_to,
      progress_min,
      progress_max,
    },
    get,
  } = body.details;

  // Build filter object
  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (user) {
    filter["relations.user._ids"] = user;
  }

  if (course) {
    filter["relations.course._ids"] = course;
  }

  if (enrollment_date_from || enrollment_date_to) {
    filter.enrollment_date = {};
    if (enrollment_date_from) {
      filter.enrollment_date.$gte = new Date(enrollment_date_from);
    }
    if (enrollment_date_to) {
      filter.enrollment_date.$lte = new Date(enrollment_date_to);
    }
  }

  if (progress_min !== undefined || progress_max !== undefined) {
    filter.progress_percentage = {};
    if (progress_min !== undefined) {
      filter.progress_percentage.$gte = progress_min;
    }
    if (progress_max !== undefined) {
      filter.progress_percentage.$lte = progress_max;
    }
  }

  // Build sort object
  const sortObj: any = {};
  if (sort?.field && sort?.type) {
    sortObj[sort.field] = sort.type === "asc" ? 1 : -1;
  } else {
    sortObj.enrollment_date = -1; // Default sort by enrollment date descending
  }

  const enrollments = await enrollment.findMany({
    filter,
    projection: get,
    pagination: { page, limit },
    sort: sortObj,
  });

  return enrollments;
};
