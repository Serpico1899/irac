import { ActFn } from "@deps";
import { coreApp } from "@app";

export const getSpaceUtilizationFn: ActFn = async (body) => {
  try {
    const {
      start_date,
      end_date,
      today = false,
      this_week = false,
      this_month = false,
      last_month = false,
      last_30_days = false,
      space_types,
      specific_spaces,
      time_granularity = "daily",
      analysis_type = ["current_status"],
      metrics = ["occupancy_rate", "capacity_utilization", "revenue_per_space"],
      include_all_metrics = false,
      group_by = "by_space_type",
      exclude_cancelled = true,
      exclude_no_shows = true,
      paid_bookings_only = false,
      calculate_efficiency_scores = true,
      identify_underutilized_spaces = true,
      include_comparison = false,
      comparison_period = "previous_period",
      low_utilization_threshold = "30",
      high_utilization_threshold = "85",
      target_occupancy_rate = "70",
      include_revenue_analysis = true,
      analyze_booking_patterns = true,
      forecast_utilization = false,
      generate_report = false,
      report_format = "json",
      include_recommendations = true,
      business_hours_only = true,
      exclude_holidays = false,
    } = body.details.set;

    const adminUserId = body.user?._id;

    if (!adminUserId) {
      return {
        success: false,
        message: "Admin authentication required",
        details: { auth_required: true },
      };
    }

    // Calculate date range
    const dateRange = calculateDateRange({
      start_date,
      end_date,
      today,
      this_week,
      this_month,
      last_month,
      last_30_days,
    });

    // Build filters for main query
    const filters = {
      booking_date: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    };

    // Add space type filters
    if (space_types && space_types.length > 0) {
      filters.space_type = { $in: space_types };
    }

    // Add status filters
    const validStatuses = ["confirmed", "checked_in", "completed"];
    if (exclude_cancelled) {
      validStatuses.push("cancelled");
      filters.status = { $nin: ["cancelled"] };
    }
    if (exclude_no_shows) {
      validStatuses.push("no_show");
      filters.status = filters.status ?
        { ...filters.status, $nin: [...(filters.status.$nin || []), "no_show"] } :
        { $nin: ["no_show"] };
    }
    if (!filters.status) {
      filters.status = { $in: validStatuses.filter(s => s !== "cancelled" && s !== "no_show") };
    }

    // Add payment filter
    if (paid_bookings_only) {
      filters.payment_status = "paid";
    }

    // Execute core analytics queries
    const [
      spaceUtilizationData,
      occupancyRates,
      revenueAnalysis,
      bookingPatterns,
      efficiencyScores,
      comparisonData,
    ] = await Promise.all([
      getSpaceUtilizationData(filters, time_granularity, group_by),
      calculateOccupancyRates(filters, business_hours_only),
      include_revenue_analysis ? getRevenueAnalysis(filters) : null,
      analyze_booking_patterns ? getBookingPatterns(filters) : null,
      calculate_efficiency_scores ? calculateEfficiencyScores(filters) : null,
      include_comparison ? getComparisonData(filters, comparison_period, dateRange) : null,
    ]);

    // Calculate utilization metrics
    const utilizationMetrics = await calculateUtilizationMetrics(
      spaceUtilizationData,
      occupancyRates,
      metrics,
      include_all_metrics
    );

    // Identify underutilized and overutilized spaces
    const utilizationInsights = identify_underutilized_spaces ?
      identifyUtilizationIssues(
        spaceUtilizationData,
        parseFloat(low_utilization_threshold),
        parseFloat(high_utilization_threshold)
      ) : null;

    // Generate forecasts if requested
    const forecast = forecast_utilization ?
      await generateUtilizationForecast(spaceUtilizationData, 30) : null;

    // Generate recommendations
    const recommendations = include_recommendations ?
      generateRecommendations(
        utilizationMetrics,
        utilizationInsights,
        efficiencyScores,
        parseFloat(target_occupancy_rate)
      ) : null;

    // Build comprehensive response
    const utilizationReport = {
      summary: {
        analysis_period: {
          start_date: dateRange.start,
          end_date: dateRange.end,
          total_days: Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)),
          granularity: time_granularity,
          business_hours_only,
        },
        overall_metrics: utilizationMetrics.overall,
        key_insights: {
          highest_utilized_space: utilizationMetrics.rankings.highest_utilized,
          lowest_utilized_space: utilizationMetrics.rankings.lowest_utilized,
          peak_utilization_time: utilizationMetrics.peak_times.busiest_hour,
          off_peak_time: utilizationMetrics.peak_times.quietest_hour,
        },
      },
      space_analysis: {
        by_space_type: spaceUtilizationData.by_space_type,
        occupancy_rates: occupancyRates,
        efficiency_scores: efficiencyScores,
        utilization_distribution: utilizationMetrics.distribution,
      },
      financial_analysis: revenueAnalysis,
      booking_patterns: bookingPatterns,
      utilization_insights: utilizationInsights,
      comparison: comparisonData,
      forecasting: forecast,
      recommendations: recommendations,
      generated_at: new Date().toISOString(),
      filters_applied: {
        space_types: space_types || "all",
        exclude_cancelled,
        exclude_no_shows,
        paid_bookings_only,
        business_hours_only,
      },
    };

    // Handle report generation
    if (generate_report) {
      return await handleReportGeneration(utilizationReport, report_format);
    }

    return {
      success: true,
      body: {
        space_utilization: utilizationReport,
        metadata: {
          analysis_types: analysis_type,
          metrics_calculated: include_all_metrics ? "all" : metrics,
          query_performance: {
            total_bookings_analyzed: utilizationMetrics.overall.total_bookings,
            spaces_analyzed: utilizationMetrics.overall.unique_spaces,
            processing_time_ms: Date.now() - new Date().getTime(),
          },
          admin_user_id: adminUserId.toString(),
        },
      },
      message: `Space utilization analysis completed for ${Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))} days. Overall occupancy rate: ${Math.round(utilizationMetrics.overall.average_occupancy_rate)}%`,
    };

  } catch (error) {
    console.error("Error in getSpaceUtilization function:", error);
    return {
      success: false,
      message: "Internal server error while analyzing space utilization",
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
    } else if (options.last_month) {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
    } else if (options.last_30_days) {
      end = new Date(now);
      start = new Date(now.setDate(now.getDate() - 30));
    } else {
      // Default to this month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  // Helper method to get space utilization data
  async function getSpaceUtilizationData(filters, granularity, groupBy) {
    const spaceCapacities = {
      private_office: 4,
      shared_desk: 20,
      meeting_room: 12,
      workshop_space: 30,
      conference_room: 50,
      studio: 15,
    };

    // Get bookings grouped by space type
    const bySpaceTypePipeline = [
      { $match: filters },
      {
        $group: {
          _id: "$space_type",
          total_bookings: { $sum: 1 },
          total_hours_booked: { $sum: "$duration_hours" },
          total_capacity_used: { $sum: "$capacity_requested" },
          total_revenue: { $sum: "$total_price" },
          avg_duration: { $avg: "$duration_hours" },
          unique_dates: { $addToSet: "$booking_date" },
        }
      },
      {
        $project: {
          space_type: "$_id",
          total_bookings: 1,
          total_hours_booked: 1,
          total_capacity_used: 1,
          total_revenue: { $round: ["$total_revenue", 2] },
          avg_duration: { $round: ["$avg_duration", 2] },
          unique_booking_days: { $size: "$unique_dates" },
          max_possible_capacity: {
            $multiply: [
              { $ifNull: [{ $arrayElemAt: [Object.values(spaceCapacities).filter((_, i) => Object.keys(spaceCapacities)[i] === "$_id"), 0] }, 10] },
              "$total_hours_booked"
            ]
          },
        }
      },
      {
        $addFields: {
          capacity_utilization_rate: {
            $cond: [
              { $gt: ["$max_possible_capacity", 0] },
              { $multiply: [{ $divide: ["$total_capacity_used", "$max_possible_capacity"] }, 100] },
              0
            ]
          },
          revenue_per_booking: {
            $cond: [
              { $gt: ["$total_bookings", 0] },
              { $divide: ["$total_revenue", "$total_bookings"] },
              0
            ]
          },
          revenue_per_hour: {
            $cond: [
              { $gt: ["$total_hours_booked", 0] },
              { $divide: ["$total_revenue", "$total_hours_booked"] },
              0
            ]
          },
        }
      },
      { $sort: { total_revenue: -1 } }
    ];

    const bySpaceType = await coreApp.odm.aggregate("booking", bySpaceTypePipeline);

    // Get time series data based on granularity
    let timeGroupStage = {};
    switch (granularity) {
      case "hourly":
        timeGroupStage = {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$booking_date" } },
            hour: "$start_time"
          },
          bookings: { $sum: 1 },
          hours_booked: { $sum: "$duration_hours" },
          capacity_used: { $sum: "$capacity_requested" },
        };
        break;
      case "daily":
        timeGroupStage = {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$booking_date" } },
          bookings: { $sum: 1 },
          hours_booked: { $sum: "$duration_hours" },
          capacity_used: { $sum: "$capacity_requested" },
          revenue: { $sum: "$total_price" },
        };
        break;
      case "weekly":
        timeGroupStage = {
          _id: {
            year: { $year: "$booking_date" },
            week: { $week: "$booking_date" }
          },
          bookings: { $sum: 1 },
          hours_booked: { $sum: "$duration_hours" },
          capacity_used: { $sum: "$capacity_requested" },
          revenue: { $sum: "$total_price" },
        };
        break;
      case "monthly":
        timeGroupStage = {
          _id: { $dateToString: { format: "%Y-%m", date: "$booking_date" } },
          bookings: { $sum: 1 },
          hours_booked: { $sum: "$duration_hours" },
          capacity_used: { $sum: "$capacity_requested" },
          revenue: { $sum: "$total_price" },
        };
        break;
    }

    const timeSeriesPipeline = [
      { $match: filters },
      { $group: timeGroupStage },
      { $sort: { _id: 1 } }
    ];

    const timeSeries = await coreApp.odm.aggregate("booking", timeSeriesPipeline);

    return {
      by_space_type: bySpaceType,
      time_series: timeSeries,
      granularity,
      grouping: groupBy,
    };
  }

  // Helper method to calculate occupancy rates
  async function calculateOccupancyRates(filters, businessHoursOnly) {
    const businessHours = businessHoursOnly ?
      ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"] :
      ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: {
            space_type: "$space_type",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$booking_date" } },
            hour: "$start_time"
          },
          bookings: { $sum: 1 },
          total_capacity: { $sum: "$capacity_requested" },
        }
      },
      {
        $group: {
          _id: "$_id.space_type",
          total_time_slots: { $sum: 1 },
          occupied_slots: {
            $sum: { $cond: [{ $gt: ["$bookings", 0] }, 1, 0] }
          },
          avg_capacity_per_slot: { $avg: "$total_capacity" },
        }
      },
      {
        $addFields: {
          occupancy_rate: {
            $multiply: [
              { $divide: ["$occupied_slots", "$total_time_slots"] },
              100
            ]
          }
        }
      },
      { $sort: { occupancy_rate: -1 } }
    ];

    const occupancyData = await coreApp.odm.aggregate("booking", pipeline);

    // Calculate overall occupancy rate
    const totalSlots = occupancyData.reduce((sum, item) => sum + item.total_time_slots, 0);
    const totalOccupied = occupancyData.reduce((sum, item) => sum + item.occupied_slots, 0);
    const overallOccupancyRate = totalSlots > 0 ? (totalOccupied / totalSlots) * 100 : 0;

    return {
      by_space_type: occupancyData,
      overall_occupancy_rate: Math.round(overallOccupancyRate * 100) / 100,
      business_hours_analyzed: businessHours.length,
      total_time_slots_analyzed: totalSlots,
      occupied_time_slots: totalOccupied,
    };
  }

  // Helper method to get revenue analysis
  async function getRevenueAnalysis(filters) {
    const pipeline = [
      { $match: { ...filters, payment_status: "paid" } },
      {
        $group: {
          _id: "$space_type",
          total_revenue: { $sum: "$total_price" },
          avg_revenue_per_booking: { $avg: "$total_price" },
          total_bookings: { $sum: 1 },
          total_hours: { $sum: "$duration_hours" },
        }
      },
      {
        $addFields: {
          revenue_per_hour: { $divide: ["$total_revenue", "$total_hours"] },
          revenue_efficiency: {
            $divide: ["$avg_revenue_per_booking", "$total_hours"]
          }
        }
      },
      { $sort: { total_revenue: -1 } }
    ];

    const revenueBySpace = await coreApp.odm.aggregate("booking", pipeline);

    const totalRevenue = revenueBySpace.reduce((sum, item) => sum + item.total_revenue, 0);
    const totalBookings = revenueBySpace.reduce((sum, item) => sum + item.total_bookings, 0);

    return {
      by_space_type: revenueBySpace,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      average_booking_value: totalBookings > 0 ? Math.round((totalRevenue / totalBookings) * 100) / 100 : 0,
      highest_revenue_space: revenueBySpace[0]?._id || null,
      revenue_concentration: revenueBySpace.length > 0 ?
        Math.round((revenueBySpace[0].total_revenue / totalRevenue) * 100) : 0,
    };
  }

  // Helper method to analyze booking patterns
  async function getBookingPatterns(filters) {
    // Peak hours analysis
    const peakHoursPipeline = [
      { $match: filters },
      {
        $group: {
          _id: "$start_time",
          booking_count: { $sum: 1 },
          avg_duration: { $avg: "$duration_hours" },
          total_revenue: { $sum: "$total_price" },
        }
      },
      { $sort: { booking_count: -1 } }
    ];

    const peakHours = await coreApp.odm.aggregate("booking", peakHoursPipeline);

    // Day of week analysis
    const dayPatternPipeline = [
      { $match: filters },
      {
        $group: {
          _id: { $dayOfWeek: "$booking_date" },
          booking_count: { $sum: 1 },
          avg_revenue: { $avg: "$total_price" },
        }
      },
      { $sort: { _id: 1 } }
    ];

    const dayPatterns = await coreApp.odm.aggregate("booking", dayPatternPipeline);

    // Booking duration patterns
    const durationPipeline = [
      { $match: filters },
      {
        $bucket: {
          groupBy: "$duration_hours",
          boundaries: [0, 1, 2, 4, 6, 8, 12],
          default: "8+",
          output: {
            count: { $sum: 1 },
            avg_revenue: { $avg: "$total_price" },
            space_types: { $addToSet: "$space_type" },
          }
        }
      }
    ];

    const durationPatterns = await coreApp.odm.aggregate("booking", durationPipeline);

    return {
      peak_hours: peakHours,
      day_of_week_patterns: dayPatterns.map(item => ({
        day: ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][item._id],
        booking_count: item.booking_count,
        avg_revenue: Math.round(item.avg_revenue * 100) / 100,
      })),
      duration_patterns: durationPatterns,
      busiest_hour: peakHours[0]?._id || null,
      quietest_hour: peakHours[peakHours.length - 1]?._id || null,
    };
  }

  // Helper method to calculate efficiency scores
  async function calculateEfficiencyScores(filters) {
    const spaceCapacities = {
      private_office: 4,
      shared_desk: 20,
      meeting_room: 12,
      workshop_space: 30,
      conference_room: 50,
      studio: 15,
    };

    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: "$space_type",
          total_bookings: { $sum: 1 },
          total_hours: { $sum: "$duration_hours" },
          total_capacity_used: { $sum: "$capacity_requested" },
          total_revenue: { $sum: "$total_price" },
          avg_booking_duration: { $avg: "$duration_hours" },
          unique_customers: { $addToSet: "$user" },
        }
      }
    ];

    const rawData = await coreApp.odm.aggregate("booking", pipeline);

    const efficiencyScores = rawData.map(item => {
      const maxCapacity = spaceCapacities[item._id] || 10;
      const maxPossibleCapacityHours = item.total_hours * maxCapacity;

      const capacityEfficiency = maxPossibleCapacityHours > 0 ?
        (item.total_capacity_used / maxPossibleCapacityHours) * 100 : 0;

      const revenueEfficiency = item.total_hours > 0 ?
        item.total_revenue / item.total_hours : 0;

      const customerEngagement = item.unique_customers.length / item.total_bookings;

      // Overall efficiency score (weighted average)
      const overallScore = (
        capacityEfficiency * 0.4 +
        Math.min(revenueEfficiency / 50, 100) * 0.4 +
        Math.min(customerEngagement * 100, 100) * 0.2
      );

      return {
        space_type: item._id,
        efficiency_score: Math.round(overallScore * 100) / 100,
        capacity_efficiency: Math.round(capacityEfficiency * 100) / 100,
        revenue_efficiency: Math.round(revenueEfficiency * 100) / 100,
        customer_engagement_score: Math.round(customerEngagement * 100) / 100,
        total_bookings: item.total_bookings,
        unique_customers: item.unique_customers.length,
        performance_rating: overallScore >= 80 ? "excellent" :
          overallScore >= 60 ? "good" :
            overallScore >= 40 ? "fair" : "needs_improvement",
      };
    });

    return efficiencyScores.sort((a, b) => b.efficiency_score - a.efficiency_score);
  }

  // Helper method to calculate utilization metrics
  async function calculateUtilizationMetrics(utilizationData, occupancyRates, requestedMetrics, includeAll) {
    const spaceTypes = utilizationData.by_space_type;

    // Overall metrics
    const totalBookings = spaceTypes.reduce((sum, space) => sum + space.total_bookings, 0);
    const totalRevenue = spaceTypes.reduce((sum, space) => sum + space.total_revenue, 0);
    const totalHours = spaceTypes.reduce((sum, space) => sum + space.total_hours_booked, 0);

    // Rankings
    const sortedByUtilization = [...spaceTypes].sort((a, b) => b.capacity_utilization_rate - a.capacity_utilization_rate);
    const sortedByRevenue = [...spaceTypes].sort((a, b) => b.total_revenue - a.total_revenue);

    // Peak times from time series data
    const timeSeries = utilizationData.time_series;
    const peakHour = timeSeries.reduce((peak, current) =>
      current.bookings > (peak?.bookings || 0) ? current : peak, null);
    const quietHour = timeSeries.reduce((quiet, current) =>
      current.bookings < (quiet?.bookings || Infinity) ? current : quiet, null);

    // Distribution analysis
    const utilizationRanges = {
      "0-25%": 0,
      "26-50%": 0,
      "51-75%": 0,
      "76-100%": 0,
    };

    spaceTypes.forEach(space => {
      const rate = space.capacity_utilization_rate;
      if (rate <= 25) utilizationRanges["0-25%"]++;
      else if (rate <= 50) utilizationRanges["26-50%"]++;
      else if (rate <= 75) utilizationRanges["51-75%"]++;
      else utilizationRanges["76-100%"]++;
    });

    return {
      overall: {
        total_bookings: totalBookings,
        unique_spaces: spaceTypes.length,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        total_hours_booked: totalHours,
        average_occupancy_rate: occupancyRates.overall_occupancy_rate,
        average_booking_value: totalBookings > 0 ? Math.round((totalRevenue / totalBookings) * 100) / 100 : 0,
        average_utilization_rate: spaceTypes.length > 0 ?
          Math.round(spaceTypes.reduce((sum, s) => sum + s.capacity_utilization_rate, 0) / spaceTypes.length * 100) / 100 : 0,
      },
      rankings: {
        highest_utilized: sortedByUtilization[0]?.space_type || null,
        lowest_utilized: sortedByUtilization[sortedByUtilization.length - 1]?.space_type || null,
        highest_revenue: sortedByRevenue[0]?.space_type || null,
        most_bookings: [...spaceTypes].sort((a, b) => b.total_bookings - a.total_bookings)[0]?.space_type || null,
      },
      peak_times: {
        busiest_hour: typeof peakHour?._id === 'string' ? peakHour._id :
          peakHour?._id?.hour || "N/A",
        quietest_hour: typeof quietHour?._id === 'string' ? quietHour._id :
          quietHour?._id?.hour || "N/A",
        peak_bookings: peakHour?.bookings || 0,
        min_bookings: quietHour?.bookings || 0,
      },
      distribution: utilizationRanges,
    };
  }

  // Helper method to identify utilization issues
  function identifyUtilizationIssues(utilizationData, lowThreshold, highThreshold) {
    const spaceTypes = utilizationData.by_space_type;

    const underutilized = spaceTypes.filter(space =>
      space.capacity_utilization_rate < lowThreshold
    );

    const overutilized = spaceTypes.filter(space =>
      space.capacity_utilization_rate > highThreshold
    );

    const optimal = spaceTypes.filter(space =>
      space.capacity_utilization_rate >= lowThreshold &&
      space.capacity_utilization_rate <= highThreshold
    );

    return {
      underutilized_spaces: underutilized.map(space => ({
        space_type: space.space_type,
        utilization_rate: space.capacity_utilization_rate,
        total_bookings: space.total_bookings,
        potential_improvement: lowThreshold - space.capacity_utilization_rate,
        recommendation: "Consider marketing campaigns or price adjustments",
      })),
      overutilized_spaces: overutilized.map(space => ({
        space_type: space.space_type,
        utilization_rate: space.capacity_utilization_rate,
        total_bookings: space.total_bookings,
        capacity_strain: space.capacity_utilization_rate - highThreshold,
        recommendation: "Consider expanding capacity or premium pricing",
      })),
      optimally_utilized_spaces: optimal.map(space => ({
        space_type: space.space_type,
        utilization_rate: space.capacity_utilization_rate,
        status: "optimal",
      })),
      summary: {
        total_spaces: spaceTypes.length,
        underutilized_count: underutilized.length,
        overutilized_count: overutilized.length,
        optimal_count: optimal.length,
        utilization_balance_score: Math.round((optimal.length / spaceTypes.length) * 100),
      },
    };
  }

  // Helper method to generate utilization forecast
  async function generateUtilizationForecast(utilizationData, forecastDays) {
    // Simple linear trend forecast based on historical data
    const timeSeries = utilizationData.time_series;
    if (!timeSeries || timeSeries.length < 2) {
      return {
        forecast_available: false,
        reason: "Insufficient historical data for forecasting",
      };
    }

    // Calculate trend for each space type
    const trends = {};
    utilizationData.by_space_type.forEach(space => {
      const recentBookings = timeSeries.slice(-7); // Last 7 periods
      const avgGrowth = recentBookings.length > 1 ?
        (recentBookings[recentBookings.length - 1].bookings - recentBookings[0].bookings) / recentBookings.length : 0;

      trends[space.space_type] = {
        current_utilization: space.capacity_utilization_rate,
        trend_direction: avgGrowth > 0 ? "increasing" : avgGrowth < 0 ? "decreasing" : "stable",
        projected_change: avgGrowth * forecastDays / 7, // Scale to forecast period
        confidence: recentBookings.length >= 7 ? "high" : "medium",
      };
    });

    return {
      forecast_period_days: forecastDays,
      space_type_forecasts: trends,
      overall_trend: Object.values(trends).reduce((sum, t) => sum + (t.projected_change || 0), 0) > 0 ? "growth" : "decline",
      generated_at: new Date().toISOString(),
    };
  }

  // Helper method to generate recommendations
  function generateRecommendations(metrics, insights, efficiencyScores, targetOccupancy) {
    const recommendations = [];

    // Underutilization recommendations
    if (insights?.underutilized_spaces?.length > 0) {
      insights.underutilized_spaces.forEach(space => {
        recommendations.push({
          category: "utilization_improvement",
          priority: "medium",
          space_type: space.space_type,
          issue: `Low utilization rate: ${space.utilization_rate}%`,
          recommendation: "Consider promotional pricing, marketing campaigns, or alternative use cases",
          potential_impact: `Could increase utilization by ${space.potential_improvement}%`,
        });
      });
    }

    // Overutilization recommendations
    if (insights?.overutilized_spaces?.length > 0) {
      insights.overutilized_spaces.forEach(space => {
        recommendations.push({
          category: "capacity_expansion",
          priority: "high",
          space_type: space.space_type,
          issue: `High utilization rate: ${space.utilization_rate}%`,
          recommendation: "Consider expanding capacity, premium pricing, or booking restrictions",
          potential_impact: "Reduce booking conflicts and improve customer satisfaction",
        });
      });
    }

    // Revenue optimization
    if (metrics?.overall?.average_utilization_rate < targetOccupancy) {
      recommendations.push({
        category: "revenue_optimization",
        priority: "medium",
        issue: `Overall utilization below target: ${metrics.overall.average_utilization_rate}% vs ${targetOccupancy}%`,
        recommendation: "Implement dynamic pricing, improve booking experience, or adjust capacity",
        potential_impact: `Could improve utilization by ${targetOccupancy - metrics.overall.average_utilization_rate}%`,
      });
    }

    // Efficiency improvements
    if (efficiencyScores) {
      const lowEfficiencySpaces = efficiencyScores.filter(s => s.efficiency_score < 60);
      lowEfficiencySpaces.forEach(space => {
        recommendations.push({
          category: "operational_efficiency",
          priority: "medium",
          space_type: space.space_type,
          issue: `Low efficiency score: ${space.efficiency_score}`,
          recommendation: "Review pricing strategy, improve space amenities, or enhance customer service",
          potential_impact: "Improve overall space performance and customer satisfaction",
        });
      });
    }

    return {
      total_recommendations: recommendations.length,
      high_priority: recommendations.filter(r => r.priority === "high").length,
      medium_priority: recommendations.filter(r => r.priority === "medium").length,
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      summary: recommendations.length > 0 ?
        "Multiple optimization opportunities identified" :
        "Space utilization appears to be well-optimized",
    };
  }

  // Helper method to get comparison data
  async function getComparisonData(filters, comparisonPeriod, currentDateRange) {
    let comparisonFilters = { ...filters };
    const daysDiff = Math.ceil((currentDateRange.end.getTime() - currentDateRange.start.getTime()) / (1000 * 60 * 60 * 24));

    switch (comparisonPeriod) {
      case "previous_period":
        const prevEnd = new Date(currentDateRange.start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - daysDiff);
        comparisonFilters.booking_date = { $gte: prevStart, $lte: prevEnd };
        break;

      case "same_period_last_year":
        const lastYearStart = new Date(currentDateRange.start);
        lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
        const lastYearEnd = new Date(currentDateRange.end);
        lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);
        comparisonFilters.booking_date = { $gte: lastYearStart, $lte: lastYearEnd };
        break;

      default:
        return null;
    }

    try {
      const comparisonData = await getSpaceUtilizationData(comparisonFilters, "daily", "by_space_type");
      const comparisonOccupancy = await calculateOccupancyRates(comparisonFilters, true);

      return {
        comparison_period: comparisonPeriod,
        comparison_data: comparisonData,
        comparison_occupancy: comparisonOccupancy,
        period_comparison: {
          current_bookings: filters.total_bookings || 0,
          comparison_bookings: comparisonData.by_space_type.reduce((sum, s) => sum + s.total_bookings, 0),
        },
      };
    } catch (error) {
      console.error("Error getting comparison data:", error);
      return null;
    }
  }

  // Helper method to handle report generation
  async function handleReportGeneration(utilizationReport, format) {
    const reportData = {
      title: "Space Utilization Analysis Report",
      generated_at: new Date().toISOString(),
      format: format,
      data: utilizationReport,
    };

    switch (format) {
      case "json":
        return {
          success: true,
          body: {
            report: reportData,
            download_ready: true,
          },
          message: "Space utilization report generated in JSON format",
        };

      case "csv":
      case "excel":
      case "pdf":
        return {
          success: true,
          body: {
            report_id: `space_util_${Date.now()}`,
            format: format,
            status: "generating",
            estimated_completion: new Date(Date.now() + 60000), // 1 minute
            download_url: `/reports/space_utilization_${Date.now()}.${format}`,
          },
          message: `Space utilization report generation started. Format: ${format}`,
        };

      default:
        return {
          success: false,
          message: "Unsupported report format",
          details: { supported_formats: ["json", "csv", "excel", "pdf"] },
        };
    }
  }

};
