import {
  ObjectId,
  ActFn,
  getMainDb
} from "../../../../../../../deps.ts";

export const getRevenueDashboardFn: ActFn = async (body) => {
  const {
    dateFrom,
    dateTo,
    period = "30d",
    category = "all",
    includeRefunds = true,
    currency = "IRR"
  } = body.details;

  const mainDb = await getMainDb();

  // Calculate date range
  const now = new Date();
  const endDate = dateTo ? new Date(dateTo) : now;
  let startDate: Date;

  if (dateFrom) {
    startDate = new Date(dateFrom);
  } else {
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date("2020-01-01");
    }
  }

  // Calculate previous period for growth comparison
  const periodLength = endDate.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - periodLength);
  const previousEndDate = new Date(startDate);

  try {
    // Base match conditions
    const baseMatch: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    const previousMatch: any = {
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    };

    // Category filter
    if (category !== "all") {
      // Add category filtering logic based on transaction type
      if (category === "courses") {
        baseMatch.type = "course_enrollment";
        previousMatch.type = "course_enrollment";
      } else if (category === "workshops") {
        baseMatch.type = "workshop_enrollment";
        previousMatch.type = "workshop_enrollment";
      } else if (category === "products") {
        baseMatch.type = "product_purchase";
        previousMatch.type = "product_purchase";
      } else if (category === "bookings") {
        baseMatch.type = "space_booking";
        previousMatch.type = "space_booking";
      }
    }

    // Get payment transactions
    const paymentTransactions = await mainDb.collection("payment_transactions")
      .aggregate([
        { $match: { ...baseMatch, status: "completed" } },
        {
          $lookup: {
            from: "invoices",
            localField: "invoiceId",
            foreignField: "_id",
            as: "invoice"
          }
        },
        { $unwind: { path: "$invoice", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalTransactions: { $sum: 1 },
            avgAmount: { $avg: "$amount" },
            byMonth: {
              $push: {
                month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                amount: "$amount",
                type: "$type",
                paymentMethod: "$paymentMethod"
              }
            }
          }
        }
      ]).toArray();

    // Get previous period data for growth calculation
    const previousTransactions = await mainDb.collection("payment_transactions")
      .aggregate([
        { $match: { ...previousMatch, status: "completed" } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalTransactions: { $sum: 1 }
          }
        }
      ]).toArray();

    // Get refunds if included
    let refundsData: any = { totalRefunds: 0 };
    if (includeRefunds) {
      const refunds = await mainDb.collection("payment_transactions")
        .aggregate([
          {
            $match: {
              ...baseMatch,
              status: "refunded"
            }
          },
          {
            $group: {
              _id: null,
              totalRefunds: { $sum: "$amount" },
              refundCount: { $sum: 1 }
            }
          }
        ]).toArray();

      refundsData = refunds[0] || { totalRefunds: 0, refundCount: 0 };
    }

    // Get revenue by category
    const revenueByCategory = await mainDb.collection("payment_transactions")
      .aggregate([
        { $match: { ...baseMatch, status: "completed" } },
        {
          $group: {
            _id: "$type",
            revenue: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } }
      ]).toArray();

    // Get monthly revenue breakdown
    const monthlyRevenue = await mainDb.collection("payment_transactions")
      .aggregate([
        { $match: { ...baseMatch, status: "completed" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$amount" },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();

    // Get payment method statistics
    const paymentMethodStats = await mainDb.collection("payment_transactions")
      .aggregate([
        { $match: { ...baseMatch, status: "completed" } },
        {
          $group: {
            _id: "$paymentMethod",
            revenue: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } }
      ]).toArray();

    // Get top revenue generating items
    const topRevenueItems = await mainDb.collection("payment_transactions")
      .aggregate([
        { $match: { ...baseMatch, status: "completed" } },
        {
          $lookup: {
            from: "courses",
            localField: "itemId",
            foreignField: "_id",
            as: "course"
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "itemId",
            foreignField: "_id",
            as: "product"
          }
        },
        {
          $addFields: {
            itemName: {
              $cond: [
                { $gt: [{ $size: "$course" }, 0] },
                { $arrayElemAt: ["$course.name", 0] },
                {
                  $cond: [
                    { $gt: [{ $size: "$product" }, 0] },
                    { $arrayElemAt: ["$product.name", 0] },
                    "Unknown Item"
                  ]
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: {
              itemId: "$itemId",
              itemName: "$itemName",
              type: "$type"
            },
            revenue: { $sum: "$amount" },
            enrollments: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]).toArray();

    // Calculate metrics
    const currentData = paymentTransactions[0] || {
      totalAmount: 0,
      totalTransactions: 0,
      avgAmount: 0
    };

    const previousData = previousTransactions[0] || {
      totalAmount: 0,
      totalTransactions: 0
    };

    const totalRevenue = currentData.totalAmount || 0;
    const previousRevenue = previousData.totalAmount || 0;
    const revenueGrowth = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const netRevenue = totalRevenue - (refundsData.totalRefunds || 0);
    const averageOrderValue = currentData.avgAmount || 0;
    const totalTransactions = currentData.totalTransactions || 0;

    // Format revenue by month for charts
    const revenueByMonth = monthlyRevenue.map(item => ({
      month: item._id,
      revenue: item.revenue,
      transactions: item.transactions
    }));

    // Format category breakdown
    const categoryBreakdown = revenueByCategory.map(item => ({
      category: item._id || "unknown",
      revenue: item.revenue,
      count: item.count,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
    }));

    // Format top items
    const topItems = topRevenueItems.map(item => ({
      itemId: item._id.itemId,
      name: item._id.itemName,
      type: item._id.type,
      revenue: item.revenue,
      enrollments: item.enrollments
    }));

    // Format payment methods
    const paymentMethods = paymentMethodStats.map(item => ({
      method: item._id || "unknown",
      revenue: item.revenue,
      count: item.count,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
    }));

    return {
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue: revenueByMonth,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        revenueByCategory: categoryBreakdown,
        revenueByMonth: revenueByMonth,
        topRevenueItems: topItems,
        refundsTotal: refundsData.totalRefunds || 0,
        netRevenue,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalTransactions,
        paymentMethodStats: paymentMethods,
        currencyBreakdown: {
          [currency]: totalRevenue
        },
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          period
        }
      }
    };

  } catch (error) {
    console.error("Error in getRevenueDashboard:", error);
    return {
      success: false,
      message: "خطا در دریافت گزارش درآمد",
      error: error.message
    };
  }
};
