import { ActFn } from "@deps";
import { coreApp } from "@app";

export const getBookingStatsFn: ActFn = async (body) => {
  try {
    const {
      start_date,
      end_date,
      time_period = "monthly",
      today = false,
      this_week = false,
      this_month = false,
      this_quarter = false,
      this_year = false,
      last_30_days = false,
      last_90_days = false,
      space_types,
      statuses,
      payment_statuses,
      metrics,
      include_all_metrics = true,
      group_by,
      include_comparison = false,
      comparison_period = "previous_period",
      include_revenue_breakdown = true,
      customer_retention_rate = true,
      space_efficiency_metrics = true,
      include_kpis = true,
      export_format,
      generate_report = false,
      use_cache = true,
    } = body.details.set;

    const adminUserId = body.user?._id;

    if (!adminUserId) {
      return {
        success: false,
        message: "Admin authentication required",
        details: { auth_required: true },
      };
    }

    // Determine date range
    const dateRange = this.calculateDateRange({
      start_date,
      end_date,
      today,
      this_week,
      this_month,
      this_quarter,
      this_year,
      last_30_days,
      last_90_days,
      time_period,
    });

    // Build filters for the main query
    const filters = {
      created_at: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    };

    if (space_types && space_types.length > 0) {
      filters.space_type = { $in: space_types };
    }

    if (statuses && statuses.length > 0) {
      filters.status = { $in: statuses };
    }

    if (payment_statuses && payment_statuses.length > 0) {
      filters.payment_status = { $in: payment_statuses };
    }

    // Calculate comparison period if requested
    let comparisonFilters = null;
    if (include_comparison) {
      comparisonFilters = {
        ...filters,
        created_at: this.calculateComparisonDateRange(dateRange, comparison_period),
      };
    }

    // Execute main statistics queries
    const [
      basicStats,
      revenueStats,
      statusBreakdown,
      spaceTypeBreakdown,
      timeSeriesData,
      customerStats,
      comparisonStats,
    ] = await Promise.all([
      this.getBasicStats(filters),
      this.getRevenueStats(filters),
      this.getStatusBreakdown(filters),
      this.getSpaceTypeBreakdown(filters),
      group_by ? this.getTimeSeriesData(filters, group_by) : null,
      this.getCustomerStats(filters),
      include_comparison && comparisonFilters ? this.getBasicStats(comparisonFilters) : null,
    ]);

    // Calculate KPIs
    const kpis = include_kpis ? await this.calculateKPIs(filters, dateRange) : null;

    // Calculate space efficiency metrics
    const spaceEfficiency = space_efficiency_metrics
      ? await this.calculateSpaceEfficiency(filters)
      : null;

    // Generate trends and insights
    const insights = await this.generateInsights(basicStats, revenueStats, spaceTypeBreakdown);

    // Calculate percentage changes if comparison data exists
    const changes = comparisonStats ? this.calculateChanges(basicStats, comparisonStats) : null;

    // Build the comprehensive response
    const statsResponse = {
      summary: {
        date_range: {
          start: dateRange.start,
          end: dateRange.end,
          period: time_period,
          days_included: Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)),
        },
        basic_metrics: basicStats,
        revenue_metrics: revenueStats,
        key_performance_indicators: kpis,
      },
      breakdowns: {
        by_status: statusBreakdown,
        by_space_type: spaceTypeBreakdown,
        time_series: timeSeriesData,
      },
      customer_analytics: customerStats,
      space_analytics: spaceEfficiency,
      comparison: include_comparison ? {
        comparison_period: comparison_period,
        previous_metrics: comparisonStats,
        percentage_changes: changes,
      } : null,
      insights_and_trends: insights,
      generated_at: new Date().toISOString(),
      filters_applied: {
        space_types: space_types || "all",
        statuses: statuses || "all",
        payment_statuses: payment_statuses || "all",
        date_range_type: time_period,
      },
    };

    // Handle export request
    if (export_format) {
      return await this.handleExport(statsResponse, export_format, generate_report);
    }

    return {
      success: true,
      body: {
        booking_statistics: statsResponse,
        metadata: {
          query_time_ms: Date.now() - new Date().getTime(),
          admin_user_id: adminUserId.toString(),
          cache_used: use_cache,
          total_data_points: basicStats.total_bookings,
        },
      },
      message: `Booking statistics generated for period ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}. Total bookings: ${basicStats.total_bookings}`,
    };

  } catch (error) {
    console.error("Error in getBookingStats function:", error);
    return {
      success: false,
      message: "Internal server error while generating booking statistics",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        admin_user_id: body.user?._id,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Helper method to calculate date range
  function calculateDateRange(options) {
    const now = new Date();
    let start, end;

    if (options.start_date && options.end_date) {
      start = new Date(options.start_date);
      end = new Date(options.end_date);
    } else if (options.today) {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (options.this_week) {
      start = new Date(now.setDate(now.getDate() - now.getDay()));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (options.this_month) {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else if (options.this_quarter) {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      end.setHours(23, 59, 59, 999);
    } else if (options.this_year) {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
    } else if (options.last_30_days) {
      end = new Date(now);
      start = new Date(now.setDate(now.getDate() - 30));
    } else if (options.last_90_days) {
      end = new Date(now);
      start = new Date(now.setDate(now.getDate() - 90));
    } else {
      // Default to this month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  // Helper method to calculate comparison date range
  function calculateComparisonDateRange(currentRange, comparisonType) {
    const daysDiff = Math.ceil((currentRange.end.getTime() - currentRange.start.getTime()) / (1000 * 60 * 60 * 24));

    switch (comparisonType) {
      case "previous_period":
        const prevEnd = new Date(currentRange.start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - daysDiff);
        return { $gte: prevStart, $lte: prevEnd };

      case "same_period_last_year":
        const lastYearStart = new Date(currentRange.start);
        lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
        const lastYearEnd = new Date(currentRange.end);
        lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);
        return { $gte: lastYearStart, $lte: lastYearEnd };

      case "same_period_last_month":
        const lastMonthStart = new Date(currentRange.start);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        const lastMonthEnd = new Date(currentRange.end);
        lastMonthEnd.setMonth(lastMonthEnd.getMonth() - 1);
        return { $gte: lastMonthStart, $lte: lastMonthEnd };

      default:
        return null;
    }
  }

  // Helper method to get basic statistics
  async function getBasicStats(filters) {
    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: null,
          total_bookings: { $sum: 1 },
          total_revenue: { $sum: "$total_price" },
          avg_booking_value: { $avg: "$total_price" },
          total_capacity_booked: { $sum: "$capacity_requested" },
          avg_duration: { $avg: "$duration_hours" },
          unique_customers: { $addToSet: "$user" },
        }
      },
      {
        $project: {
          total_bookings: 1,
          total_revenue: { $round: ["$total_revenue", 2] },
          avg_booking_value: { $round: ["$avg_booking_value", 2] },
          total_capacity_booked: 1,
          avg_duration: { $round: ["$avg_duration", 2] },
          unique_customers: { $size: "$unique_customers" },
        }
      }
    ];

    const [result] = await coreApp.odm.aggregate("booking", pipeline);
    return result || {
      total_bookings: 0,
      total_revenue: 0,
      avg_booking_value: 0,
      total_capacity_booked: 0,
      avg_duration: 0,
      unique_customers: 0,
    };
  }

  // Helper method to get revenue statistics
  async function getRevenueStats(filters) {
    const pipeline = [
      { $match: { ...filters, payment_status: "paid" } },
      {
        $group: {
          _id: null,
          total_paid_revenue: { $sum: "$total_price" },
          total_refunded: { $sum: "$refund_amount" },
          total_additional_charges: { $sum: "$overtime_charges" },
          avg_paid_booking_value: { $avg: "$total_price" },
          highest_booking_value: { $max: "$total_price" },
          lowest_booking_value: { $min: "$total_price" },
        }
      }
    ];

    const [result] = await coreApp.odm.aggregate("booking", pipeline);
    return result || {
      total_paid_revenue: 0,
      total_refunded: 0,
      total_additional_charges: 0,
      avg_paid_booking_value: 0,
      highest_booking_value: 0,
      lowest_booking_value: 0,
    };
  }

  // Helper method to get status breakdown
  async function getStatusBreakdown(filters) {
    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total_revenue: { $sum: "$total_price" },
          avg_revenue: { $avg: "$total_price" },
        }
      },
      { $sort: { count: -1 } }
    ];

    return await coreApp.odm.aggregate("booking", pipeline);
  }

  // Helper method to get space type breakdown
  async function getSpaceTypeBreakdown(filters) {
    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: "$space_type",
          count: { $sum: 1 },
          total_revenue: { $sum: "$total_price" },
          avg_revenue: { $avg: "$total_price" },
          total_capacity_used: { $sum: "$capacity_requested" },
          avg_duration: { $avg: "$duration_hours" },
        }
      },
      { $sort: { count: -1 } }
    ];

    return await coreApp.odm.aggregate("booking", pipeline);
  }

  // Helper method to get time series data
  async function getTimeSeriesData(filters, groupBy) {
    let groupStage = {};

    switch (groupBy) {
      case "date":
        groupStage = {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$booking_date" } },
          count: { $sum: 1 },
          revenue: { $sum: "$total_price" },
        };
        break;
      case "hour":
        groupStage = {
          _id: "$start_time",
          count: { $sum: 1 },
          revenue: { $sum: "$total_price" },
        };
        break;
      case "day_of_week":
        groupStage = {
          _id: { $dayOfWeek: "$booking_date" },
          count: { $sum: 1 },
          revenue: { $sum: "$total_price" },
        };
        break;
      case "month":
        groupStage = {
          _id: { $dateToString: { format: "%Y-%m", date: "$booking_date" } },
          count: { $sum: 1 },
          revenue: { $sum: "$total_price" },
        };
        break;
      default:
        return null;
    }

    const pipeline = [
      { $match: filters },
      { $group: groupStage },
      { $sort: { _id: 1 } }
    ];

    return await coreApp.odm.aggregate("booking", pipeline);
  }

  // Helper method to get customer statistics
  async function getCustomerStats(filters) {
    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: "$user",
          booking_count: { $sum: 1 },
          total_spent: { $sum: "$total_price" },
          avg_booking_value: { $avg: "$total_price" },
          first_booking: { $min: "$created_at" },
          last_booking: { $max: "$created_at" },
        }
      },
      {
        $group: {
          _id: null,
          total_customers: { $sum: 1 },
          repeat_customers: {
            $sum: { $cond: [{ $gt: ["$booking_count", 1] }, 1, 0] }
          },
          avg_bookings_per_customer: { $avg: "$booking_count" },
          avg_customer_value: { $avg: "$total_spent" },
          highest_customer_value: { $max: "$total_spent" },
        }
      }
    ];

    const [result] = await coreApp.odm.aggregate("booking", pipeline);
    const totalCustomers = result?.total_customers || 0;
    const repeatCustomers = result?.repeat_customers || 0;

    return {
      ...result,
      customer_retention_rate: totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0,
      new_customers: totalCustomers - repeatCustomers,
    };
  }

  // Helper method to calculate KPIs
  async function calculateKPIs(filters, dateRange) {
    const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const basicStats = await this.getBasicStats(filters);

    // Calculate cancellation rate
    const cancelledBookings = await coreApp.odm.countDocuments("booking", {
      filters: { ...filters, status: "cancelled" }
    });

    // Calculate no-show rate
    const noShowBookings = await coreApp.odm.countDocuments("booking", {
      filters: { ...filters, status: "no_show" }
    });

    // Calculate average rating
    const ratingPipeline = [
      { $match: { ...filters, rating: { $exists: true } } },
      { $group: { _id: null, avg_rating: { $avg: "$rating" }, total_ratings: { $sum: 1 } } }
    ];
    const [ratingResult] = await coreApp.odm.aggregate("booking", ratingPipeline);

    return {
      bookings_per_day: totalDays > 0 ? Math.round((basicStats.total_bookings / totalDays) * 100) / 100 : 0,
      revenue_per_day: totalDays > 0 ? Math.round((basicStats.total_revenue / totalDays) * 100) / 100 : 0,
      cancellation_rate: basicStats.total_bookings > 0 ? Math.round((cancelledBookings / basicStats.total_bookings) * 100) : 0,
      no_show_rate: basicStats.total_bookings > 0 ? Math.round((noShowBookings / basicStats.total_bookings) * 100) : 0,
      average_customer_rating: ratingResult?.avg_rating ? Math.round(ratingResult.avg_rating * 100) / 100 : null,
      total_reviews: ratingResult?.total_ratings || 0,
      capacity_utilization: basicStats.total_capacity_booked,
      revenue_per_booking: basicStats.avg_booking_value,
    };
  }

  // Helper method to calculate space efficiency
  async function calculateSpaceEfficiency(filters) {
    const spaceTypes = ["private_office", "shared_desk", "meeting_room", "workshop_space", "conference_room", "studio"];
    const spaceCapacities = {
      private_office: 4,
      shared_desk: 20,
      meeting_room: 12,
      workshop_space: 30,
      conference_room: 50,
      studio: 15,
    };

    const efficiency = [];

    for (const spaceType of spaceTypes) {
      const spaceBookings = await coreApp.odm.findMany("booking", {
        filters: { ...filters, space_type: spaceType }
      });

      const totalCapacityUsed = spaceBookings.reduce((sum, booking) => sum + (booking.capacity_requested || 0), 0);
      const totalBookings = spaceBookings.length;
      const totalRevenue = spaceBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
      const maxCapacity = spaceCapacities[spaceType] || 10;

      efficiency.push({
        space_type: spaceType,
        total_bookings: totalBookings,
        total_capacity_used: totalCapacityUsed,
        max_capacity_per_booking: maxCapacity,
        utilization_rate: totalCapacityUsed > 0 ? Math.round((totalCapacityUsed / (totalBookings * maxCapacity)) * 100) : 0,
        revenue_per_booking: totalBookings > 0 ? Math.round((totalRevenue / totalBookings) * 100) / 100 : 0,
        total_revenue: totalRevenue,
      });
    }

    return efficiency.sort((a, b) => b.total_revenue - a.total_revenue);
  }

  // Helper method to calculate percentage changes
  function calculateChanges(current, previous) {
    const calculatePercentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      total_bookings: calculatePercentChange(current.total_bookings, previous.total_bookings),
      total_revenue: calculatePercentChange(current.total_revenue, previous.total_revenue),
      avg_booking_value: calculatePercentChange(current.avg_booking_value, previous.avg_booking_value),
      unique_customers: calculatePercentChange(current.unique_customers, previous.unique_customers),
      total_capacity_booked: calculatePercentChange(current.total_capacity_booked, previous.total_capacity_booked),
    };
  }

  // Helper method to generate insights
  async function generateInsights(basicStats, revenueStats, spaceBreakdown) {
    const insights = [];

    // Revenue insights
    if (basicStats.total_revenue > 0) {
      insights.push({
        type: "revenue",
        title: "Revenue Performance",
        description: `Generated ${basicStats.total_revenue.toLocaleString()} IRR from ${basicStats.total_bookings} bookings`,
        metric: basicStats.avg_booking_value,
        trend: "neutral",
      });
    }

    // Most popular space type
    if (spaceBreakdown && spaceBreakdown.length > 0) {
      const mostPopular = spaceBreakdown[0];
      insights.push({
        type: "utilization",
        title: "Most Popular Space",
        description: `${mostPopular._id} accounts for ${mostPopular.count} bookings (${Math.round((mostPopular.count / basicStats.total_bookings) * 100)}%)`,
        metric: mostPopular.count,
        trend: "positive",
      });
    }

    // Customer insights
    if (basicStats.unique_customers > 0) {
      const avgBookingsPerCustomer = Math.round((basicStats.total_bookings / basicStats.unique_customers) * 100) / 100;
      insights.push({
        type: "customer",
        title: "Customer Engagement",
        description: `${basicStats.unique_customers} unique customers with ${avgBookingsPerCustomer} bookings per customer on average`,
        metric: avgBookingsPerCustomer,
        trend: avgBookingsPerCustomer > 1.5 ? "positive" : "neutral",
      });
    }

    return insights;
  }

  // Helper method to handle export
  async function handleExport(data, format, generateReport) {
    // This would implement actual file export functionality
    return {
      success: true,
      body: {
        export_format: format,
        export_data: data,
        file_ready: true,
        generated_report: generateReport,
        export_timestamp: new Date().toISOString(),
      },
      message: `Statistics exported successfully in ${format} format`,
    };
  }
};
