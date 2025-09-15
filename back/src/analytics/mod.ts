import { getRevenueReportSetup } from "./getRevenueReport/mod.ts";
import { getUserStatisticsSetup } from "./getUserStatistics/mod.ts";

export const analyticsSetup = () => {
  // Revenue and financial analytics
  getRevenueReportSetup();

  // User behavior and engagement analytics
  getUserStatisticsSetup();
};
