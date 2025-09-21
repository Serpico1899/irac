import { object, string, optional, union, literal, boolean } from "../../../../../../deps.ts";

const getRevenueDashboardValidator = {
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
    category: optional(union([
      literal("all"),
      literal("workshops"),
      literal("products"),
      literal("courses"),
      literal("bookings")
    ])),
    includeRefunds: optional(boolean()),
    currency: optional(union([
      literal("IRR"),
      literal("USD")
    ])),
  },
  get: {
    _id: false,
    totalRevenue: true,
    monthlyRevenue: true,
    revenueGrowth: true,
    revenueByCategory: true,
    revenueByMonth: true,
    topRevenueItems: true,
    refundsTotal: true,
    netRevenue: true,
    averageOrderValue: true,
    totalTransactions: true,
    paymentMethodStats: true,
    currencyBreakdown: true,
  },
};

export const getRevenueDashboardValidator = object(getRevenueDashboardValidator);

export const schema = {
  details: {
    set: getRevenueDashboardValidator.set,
    get: getRevenueDashboardValidator.get,
  },
};
