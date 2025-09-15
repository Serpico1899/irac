import { coreApp } from "../../../mod.ts";
import {
  booking,
  course,
  order,
  product,
  user,
} from "../../../mod.ts";

interface RevenueReportDetails {
  start_date?: Date;
  end_date?: Date;
  period?: string;
  source?: string;
  format?: string;
  category_id?: string;
  user_segment?: string;
  payment_status?: string;
  group_by?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
  currency?: string;
  timezone?: string;
  include_trends?: string;
  include_comparisons?: string;
  include_forecasts?: string;
}

interface RevenueData {
  total: number;
  count: number;
  average: number;
  date?: Date;
  source?: string;
  category?: string;
}

export const getRevenueReportFn = async ({ details }: { details: RevenueReportDetails }) => {
  try {
    const {
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: 30 days ago
      end_date = new Date(),
      period = "monthly",
      source = "all",
      format = "summary",
      category_id,
      user_segment = "all",
      payment_status = "paid",
      group_by = "date",
      sort_by = "date",
      sort_order = "desc",
      page = 1,
      limit = 10,
      currency = "IRR",
      include_trends = "true",
      include_comparisons = "false",
    } = details;

    const dateFilter = {
      created_at: {
        $gte: start_date,
        $lte: end_date
      }
    };

    const statusFilter = payment_status === "all" ? {} : {
      ...(payment_status === "paid" && { status: "completed" }),
      ...(payment_status === "pending" && { status: "pending" }),
      ...(payment_status === "refunded" && { status: "refunded" }),
    };

    let revenueData: RevenueData[] = [];
    let totalRevenue = 0;
    let totalTransactions = 0;

    // Calculate Product Revenue
    if (source === "all" || source === "products") {
      const productRevenue = await calculateProductRevenue(dateFilter, statusFilter, category_id);
      revenueData.push(...productRevenue.data);
      totalRevenue += productRevenue.total;
      totalTransactions += productRevenue.count;
    }

    // Calculate Course Revenue
    if (source === "all" || source === "courses") {
      const courseRevenue = await calculateCourseRevenue(dateFilter, statusFilter);
      revenueData.push(...courseRevenue.data);
      totalRevenue += courseRevenue.total;
      totalTransactions += courseRevenue.count;
    }

    // Calculate Booking Revenue
    if (source === "all" || source === "bookings") {
      const bookingRevenue = await calculateBookingRevenue(dateFilter, statusFilter);
      revenueData.push(...bookingRevenue.data);
      totalRevenue += bookingRevenue.total;
      totalTransactions += bookingRevenue.count;
    }

    // Calculate Digital Download Revenue
    if (source === "all" || source === "digital_downloads") {
      const digitalRevenue = await calculateDigitalRevenue(dateFilter, statusFilter);
      revenueData.push(...digitalRevenue.data);
      totalRevenue += digitalRevenue.total;
      totalTransactions += digitalRevenue.count;
    }

    // Group and aggregate data based on period and group_by
    const aggregatedData = await aggregateRevenueData(revenueData, period, group_by);

    // Sort data
    const sortedData = sortRevenueData(aggregatedData, sort_by, sort_order);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const paginatedData = sortedData.slice(startIndex, startIndex + limit);

    // Calculate trends if requested
    let trends = null;
    if (include_trends === "true") {
      trends = await calculateRevenueTrends(revenueData, period);
    }

    // Calculate comparisons if requested
    let comparisons = null;
    if (include_comparisons === "true") {
      comparisons = await calculateRevenueComparisons(dateFilter, source);
    }

    // Build response based on format
    const response = buildRevenueResponse(
      format,
      {
        data: paginatedData,
        summary: {
          total_revenue: totalRevenue,
          total_transactions: totalTransactions,
          average_transaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
          period_start: start_date,
          period_end: end_date,
          currency: currency,
        },
        trends,
        comparisons,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: sortedData.length,
          total_pages: Math.ceil(sortedData.length / limit),
        },
        filters: {
          source,
          period,
          user_segment,
          payment_status,
        }
      }
    );

    return {
      success: true,
      data: response,
      message: "Revenue report generated successfully"
    };

  } catch (error) {
    console.error("Revenue report generation failed:", error);
    return {
      success: false,
      error: "Failed to generate revenue report",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Helper function to calculate product revenue
async function calculateProductRevenue(dateFilter: any, statusFilter: any, category_id?: string) {
  try {
    const matchStage = {
      ...dateFilter,
      ...statusFilter,
      ...(category_id && { "items.product.category._id": coreApp.odm.ObjectId(category_id) })
    };

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            source: { $literal: "products" }
          },
          total: { $sum: "$items.total_price" },
          count: { $sum: 1 },
          average: { $avg: "$items.total_price" }
        }
      }
    ];

    const results = await order().find({ filters: matchStage });

    // Simplified data processing for now
    const total = results.reduce((sum: number, order: any) => {
      const orderTotal = order.items?.reduce((itemSum: number, item: any) => itemSum + (item.total_price || 0), 0) || 0;
      return sum + orderTotal;
    }, 0);

    const data: RevenueData[] = [{
      total: total,
      count: results.length,
      average: results.length > 0 ? total / results.length : 0,
      date: new Date(),
      source: "products"
    }];

    return { data, total: data[0].total, count: data[0].count };
  } catch (error) {
    console.error("Product revenue calculation failed:", error);
    return { data: [], total: 0, count: 0 };
  }
}

// Helper function to calculate course revenue
async function calculateCourseRevenue(dateFilter: any, statusFilter: any) {
  try {
    const pipeline = [
      { $match: { ...dateFilter, ...statusFilter, type: "course" } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            source: { $literal: "courses" }
          },
          total: { $sum: "$total_amount" },
          count: { $sum: 1 },
          average: { $avg: "$total_amount" }
        }
      }
    ];

    const results = await order().find({ filters: { ...dateFilter, ...statusFilter, type: "course" } });

    // Simplified data processing
    const total = results.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

    const data: RevenueData[] = [{
      total: total,
      count: results.length,
      average: results.length > 0 ? total / results.length : 0,
      date: new Date(),
      source: "courses"
    }];

    return { data, total: data[0].total, count: data[0].count };
  } catch (error) {
    console.error("Course revenue calculation failed:", error);
    return { data: [], total: 0, count: 0 };
  }
}

// Helper function to calculate booking revenue
async function calculateBookingRevenue(dateFilter: any, statusFilter: any) {
  try {
    const pipeline = [
      {
        $match: {
          ...dateFilter,
          payment_status: "paid",
          status: { $in: ["confirmed", "completed"] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            source: { $literal: "bookings" }
          },
          total: { $sum: "$total_price" },
          count: { $sum: 1 },
          average: { $avg: "$total_price" }
        }
      }
    ];

    const results = await booking().find({
      filters: {
        ...dateFilter,
        payment_status: "paid",
        status: { $in: ["confirmed", "completed"] }
      }
    });

    // Simplified data processing
    const total = results.reduce((sum: number, booking: any) => sum + (booking.total_price || 0), 0);

    const data: RevenueData[] = [{
      total: total,
      count: results.length,
      average: results.length > 0 ? total / results.length : 0,
      date: new Date(),
      source: "bookings"
    }];

    return { data, total: data[0].total, count: data[0].count };
  } catch (error) {
    console.error("Booking revenue calculation failed:", error);
    return { data: [], total: 0, count: 0 };
  }
}

// Helper function to calculate digital download revenue
async function calculateDigitalRevenue(dateFilter: any, statusFilter: any) {
  try {
    const pipeline = [
      {
        $match: {
          ...dateFilter,
          ...statusFilter,
          "items.product.type": "digital"
        }
      },
      { $unwind: "$items" },
      { $match: { "items.product.type": "digital" } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            source: { $literal: "digital_downloads" }
          },
          total: { $sum: "$items.total_price" },
          count: { $sum: 1 },
          average: { $avg: "$items.total_price" }
        }
      }
    ];

    const results = await order().find({
      filters: {
        ...dateFilter,
        ...statusFilter,
        "items.product.type": "digital"
      }
    });

    // Simplified data processing
    const total = results.reduce((sum: number, order: any) => {
      const digitalTotal = order.items?.reduce((itemSum: number, item: any) => {
        return item.product?.type === "digital" ? itemSum + (item.total_price || 0) : itemSum;
      }, 0) || 0;
      return sum + digitalTotal;
    }, 0);

    const data: RevenueData[] = [{
      total: total,
      count: results.length,
      average: results.length > 0 ? total / results.length : 0,
      date: new Date(),
      source: "digital_downloads"
    }];

    return { data, total: data[0].total, count: data[0].count };
  } catch (error) {
    console.error("Digital revenue calculation failed:", error);
    return { data: [], total: 0, count: 0 };
  }
}

// Helper function to aggregate revenue data
function aggregateRevenueData(data: RevenueData[], period: string, groupBy: string): RevenueData[] {
  const aggregated = new Map<string, RevenueData>();

  data.forEach(item => {
    let key = "";

    if (groupBy === "date") {
      key = formatDateByPeriod(item.date!, period);
    } else if (groupBy === "source") {
      key = item.source || "unknown";
    } else {
      key = item.date?.toISOString().split('T')[0] || "unknown";
    }

    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.total += item.total;
      existing.count += item.count;
      existing.average = existing.total / existing.count;
    } else {
      aggregated.set(key, { ...item });
    }
  });

  return Array.from(aggregated.values());
}

// Helper function to sort revenue data
function sortRevenueData(data: RevenueData[], sortBy: string, sortOrder: string): RevenueData[] {
  return data.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
        break;
      case "amount":
        comparison = a.total - b.total;
        break;
      case "count":
        comparison = a.count - b.count;
        break;
      default:
        comparison = (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });
}

// Helper function to calculate trends
async function calculateRevenueTrends(data: RevenueData[], period: string) {
  const sortedData = data.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));

  if (sortedData.length < 2) return null;

  const currentPeriod = sortedData[sortedData.length - 1];
  const previousPeriod = sortedData[sortedData.length - 2];

  const growth = previousPeriod.total > 0
    ? ((currentPeriod.total - previousPeriod.total) / previousPeriod.total) * 100
    : 0;

  return {
    current_period: currentPeriod.total,
    previous_period: previousPeriod.total,
    growth_rate: growth,
    growth_direction: growth > 0 ? "up" : growth < 0 ? "down" : "stable",
    trend_analysis: growth > 10 ? "strong_growth" : growth > 0 ? "growth" : growth < -10 ? "decline" : "stable"
  };
}

// Helper function to calculate comparisons
async function calculateRevenueComparisons(dateFilter: any, source: string) {
  // Compare with same period last year
  const currentStart = dateFilter.created_at.$gte;
  const currentEnd = dateFilter.created_at.$lte;

  const yearAgoStart = new Date(currentStart.getFullYear() - 1, currentStart.getMonth(), currentStart.getDate());
  const yearAgoEnd = new Date(currentEnd.getFullYear() - 1, currentEnd.getMonth(), currentEnd.getDate());

  // This would need similar calculation logic as main function but for comparison period
  // Simplified for now
  return {
    current_period: "Current data",
    comparison_period: "Year ago data",
    variance: "Calculated variance",
    notes: "Year-over-year comparison"
  };
}

// Helper function to format date by period
function formatDateByPeriod(date: Date, period: string): string {
  switch (period) {
    case "daily":
      return date.toISOString().split('T')[0];
    case "weekly":
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      return `${startOfWeek.toISOString().split('T')[0]}-week`;
    case "monthly":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    case "yearly":
      return String(date.getFullYear());
    default:
      return date.toISOString().split('T')[0];
  }
}

// Helper function to build response based on format
function buildRevenueResponse(format: string, data: any) {
  switch (format) {
    case "summary":
      return {
        summary: data.summary,
        trends: data.trends,
        pagination: data.pagination
      };
    case "detailed":
      return data;
    case "breakdown":
      return {
        summary: data.summary,
        breakdown_by_source: data.data,
        filters: data.filters
      };
    case "comparative":
      return {
        summary: data.summary,
        comparisons: data.comparisons,
        trends: data.trends
      };
    default:
      return data;
  }
}
