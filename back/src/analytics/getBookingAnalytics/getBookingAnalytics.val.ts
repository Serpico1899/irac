import { object, string, optional, union, literal, boolean } from "../../../../../../deps.ts";

const getBookingAnalyticsValidator = {
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
    spaceId: optional(string()),
    userId: optional(string()),
    status: optional(union([
      literal("all"),
      literal("confirmed"),
      literal("pending"),
      literal("cancelled"),
      literal("completed")
    ])),
    bookingType: optional(union([
      literal("all"),
      literal("meeting_room"),
      literal("workspace"),
      literal("event_space"),
      literal("private_office")
    ])),
    includeRevenue: optional(boolean()),
    groupBy: optional(union([
      literal("day"),
      literal("week"),
      literal("month"),
      literal("space"),
      literal("user")
    ])),
  },
  get: {
    _id: false,
    totalBookings: true,
    confirmedBookings: true,
    cancelledBookings: true,
    totalRevenue: true,
    occupancyRate: true,
    averageBookingDuration: true,
    averageBookingValue: true,
    bookingTrends: true,
    popularSpaces: true,
    peakHours: true,
    peakDays: true,
    userBookingStats: true,
    spaceUtilization: true,
    revenueBySpace: true,
    cancellationRate: true,
    bookingsByStatus: true,
    monthlyMetrics: true,
    weeklyPatterns: true,
    hourlyDistribution: true,
    bookingDurationAnalysis: true,
    repeatBookingRate: true,
    advanceBookingTime: true,
    seasonalTrends: true,
  },
};

export const getBookingAnalyticsValidator = object(getBookingAnalyticsValidator);

export const schema = {
  details: {
    set: getBookingAnalyticsValidator.set,
    get: getBookingAnalyticsValidator.get,
  },
};
