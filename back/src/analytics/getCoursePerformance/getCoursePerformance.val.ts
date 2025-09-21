import { object, string, optional, union, literal, boolean } from "../../../../../../deps.ts";

const getCoursePerformanceValidator = {
  set: {
    dateFrom: optional(string()),
    dateTo: optional(string()),
    period: optional(union([
      literal("7d"),
      literal("30d"),
      literal("90d"),
      literal("1y"),
      literal("all")
    ])),
    courseId: optional(string()),
    categoryId: optional(string()),
    instructorId: optional(string()),
    status: optional(union([
      literal("all"),
      literal("active"),
      literal("completed"),
      literal("cancelled")
    ])),
    minEnrollments: optional(string()),
    sortBy: optional(union([
      literal("enrollments"),
      literal("revenue"),
      literal("completion"),
      literal("rating"),
      literal("recent")
    ])),
    limit: optional(string()),
  },
  get: {
    _id: false,
    totalCourses: true,
    activeCourses: true,
    totalEnrollments: true,
    totalRevenue: true,
    averageCompletionRate: true,
    averageRating: true,
    coursePerformanceList: true,
    topPerformingCourses: true,
    underperformingCourses: true,
    enrollmentTrends: true,
    revenueByCourse: true,
    completionRatesByCourse: true,
    categoryPerformance: true,
    instructorPerformance: true,
    monthlyMetrics: true,
    satisfactionMetrics: true,
    engagementMetrics: true,
    dropoffAnalysis: true,
  },
};

export const getCoursePerformanceValidator = object(getCoursePerformanceValidator);

export const schema = {
  details: {
    set: getCoursePerformanceValidator.set,
    get: getCoursePerformanceValidator.get,
  },
};
