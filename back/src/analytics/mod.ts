import { getRevenueReportSetup } from "./getRevenueReport/mod.ts";
import { getUserStatisticsSetup } from "./getUserStatistics/mod.ts";
import { getRevenueDashboardSetup } from "./getRevenueDashboard/mod.ts";
import { getUserEngagementSetup } from "./getUserEngagement/mod.ts";
import { getCoursePerformanceSetup } from "./getCoursePerformance/mod.ts";
import { getBookingAnalyticsSetup } from "./getBookingAnalytics/mod.ts";
import { getTopPerformersSetup } from "./getTopPerformers/mod.ts";
import { exportReportsSetup } from "./exportReports/mod.ts";

export const analyticsSetup = () => {
  // Revenue and financial analytics
  getRevenueReportSetup();
  getRevenueDashboardSetup();

  // User behavior and engagement analytics
  getUserStatisticsSetup();
  getUserEngagementSetup();

  // Course and content analytics
  getCoursePerformanceSetup();

  // Space booking analytics
  getBookingAnalyticsSetup();

  // Performance comparison analytics
  getTopPerformersSetup();

  // Report export functionality
  exportReportsSetup();
};
