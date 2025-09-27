import { object, string, optional, union, literal, boolean, number } from "@deps";

const getTopPerformersStruct = {
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
    entityType: optional(union([
      literal("courses"),
      literal("instructors"),
      literal("users"),
      literal("spaces"),
      literal("categories"),
      literal("all")
    ])),
    metricType: optional(union([
      literal("revenue"),
      literal("enrollments"),
      literal("completions"),
      literal("ratings"),
      literal("bookings"),
      literal("engagement")
    ])),
    limit: optional(number()),
    includeInactive: optional(boolean()),
    minThreshold: optional(number()),
    categoryId: optional(string()),
    sortBy: optional(union([
      literal("revenue"),
      literal("count"),
      literal("rating"),
      literal("growth"),
      literal("engagement")
    ])),
    includeGrowth: optional(boolean()),
    includeDetails: optional(boolean()),
  },
  get: {
    _id: false,
    topCourses: true,
    topInstructors: true,
    topUsers: true,
    topSpaces: true,
    topCategories: true,
    overallMetrics: true,
    performanceComparison: true,
    growthAnalysis: true,
    engagementMetrics: true,
    revenueMetrics: true,
    qualityMetrics: true,
    trendsAnalysis: true,
    benchmarkData: true,
    achievementMilestones: true,
    competitiveAnalysis: true,
    recommendations: true,
    period: true,
  },
};

export const getTopPerformersValidator = object(getTopPerformersStruct);

export const schema = {
  details: {
    set: getTopPerformersStruct.set,
    get: getTopPerformersStruct.get,
  },
};
