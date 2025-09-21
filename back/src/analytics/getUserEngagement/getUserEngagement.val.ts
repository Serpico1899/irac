import { object, string, optional, union, literal, boolean, number } from "../../../../../../deps.ts";

const getUserEngagementValidator = {
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
    userLevel: optional(union([
      literal("all"),
      literal("Normal"),
      literal("Manager"),
      literal("Ghost")
    ])),
    cohortSize: optional(number()),
    includeInactive: optional(boolean()),
  },
  get: {
    _id: false,
    totalUsers: true,
    activeUsers: true,
    newUsers: true,
    userGrowth: true,
    dailyActiveUsers: true,
    monthlyActiveUsers: true,
    retentionRates: true,
    courseCompletionRate: true,
    averageSessionDuration: true,
    usersByLevel: true,
    engagementFunnel: true,
    topActiveUsers: true,
    churnRate: true,
    lifetimeValue: true,
    conversionMetrics: true,
    activityHeatmap: true,
  },
};

export const getUserEngagementValidator = object(getUserEngagementValidator);

export const schema = {
  details: {
    set: getUserEngagementValidator.set,
    get: getUserEngagementValidator.get,
  },
};
