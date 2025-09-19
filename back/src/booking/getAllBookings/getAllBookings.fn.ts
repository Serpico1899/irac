import { ActFn } from "@deps";
import { coreApp } from "@app";

export const getAllBookingsFn: ActFn = async (body) => {
  try {
    const filterOptions = body.details.set;
    const adminUserId = body.user?._id;

    if (!adminUserId) {
      return {
        success: false,
        message: "Admin authentication required",
        details: { auth_required: true },
      };
    }

    // Build MongoDB filters
    const filters = {};
    const aggregationPipeline = [];

    // Handle quick filters first (predefined combinations)
    if (filterOptions.quick_filter) {
      await applyQuickFilter(filters, filterOptions.quick_filter);
    }

    // Date range filters
    if (filterOptions.start_date || filterOptions.end_date) {
      filters.booking_date = {};
      if (filterOptions.start_date) {
        filters.booking_date.$gte = new Date(filterOptions.start_date);
      }
      if (filterOptions.end_date) {
        filters.booking_date.$lte = new Date(filterOptions.end_date);
      }
    }

    // Handle specific date filters
    if (filterOptions.today_only) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filters.booking_date = { $gte: today, $lt: tomorrow };
    }

    if (filterOptions.this_week_only) {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      filters.booking_date = { $gte: startOfWeek, $lt: endOfWeek };
    }

    if (filterOptions.this_month_only) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      filters.booking_date = { $gte: startOfMonth, $lt: endOfMonth };
    }

    if (filterOptions.upcoming_only) {
      filters.booking_date = { $gte: new Date() };
    }

    if (filterOptions.past_only) {
      filters.booking_date = { $lt: new Date() };
    }

    // Status filters
    if (filterOptions.status && filterOptions.status.length > 0) {
      filters.status = { $in: filterOptions.status };
    }

    if (filterOptions.payment_status && filterOptions.payment_status.length > 0) {
      filters.payment_status = { $in: filterOptions.payment_status };
    }

    // Space filters
    if (filterOptions.space_type && filterOptions.space_type.length > 0) {
      filters.space_type = { $in: filterOptions.space_type };
    }

    if (filterOptions.space_name) {
      filters.space_name = { $regex: filterOptions.space_name, $options: "i" };
    }

    // Customer search filters
    if (filterOptions.search_query) {
      filters.$or = [
        { customer_name: { $regex: filterOptions.search_query, $options: "i" } },
        { customer_email: { $regex: filterOptions.search_query, $options: "i" } },
        { customer_phone: { $regex: filterOptions.search_query, $options: "i" } },
        { company_name: { $regex: filterOptions.search_query, $options: "i" } },
        { booking_number: { $regex: filterOptions.search_query, $options: "i" } },
      ];
    }

    if (filterOptions.customer_name) {
      filters.customer_name = { $regex: filterOptions.customer_name, $options: "i" };
    }

    if (filterOptions.customer_email) {
      filters.customer_email = { $regex: filterOptions.customer_email, $options: "i" };
    }

    if (filterOptions.customer_phone) {
      filters.customer_phone = { $regex: filterOptions.customer_phone, $options: "i" };
    }

    if (filterOptions.company_name) {
      filters.company_name = { $regex: filterOptions.company_name, $options: "i" };
    }

    // Booking identification filters
    if (filterOptions.booking_number) {
      filters.booking_number = { $regex: filterOptions.booking_number, $options: "i" };
    }

    if (filterOptions.booking_id) {
      filters.booking_id = filterOptions.booking_id;
    }

    // Price range filters
    if (filterOptions.min_price || filterOptions.max_price) {
      filters.total_price = {};
      if (filterOptions.min_price) {
        filters.total_price.$gte = filterOptions.min_price;
      }
      if (filterOptions.max_price) {
        filters.total_price.$lte = filterOptions.max_price;
      }
    }

    // Time filters
    if (filterOptions.start_time) {
      filters.start_time = { $gte: filterOptions.start_time };
    }

    if (filterOptions.end_time) {
      filters.end_time = { $lte: filterOptions.end_time };
    }

    // Special requirement filters
    if (filterOptions.has_special_requirements !== undefined) {
      if (filterOptions.has_special_requirements) {
        filters.special_requirements = { $exists: true, $ne: null, $ne: "" };
      } else {
        filters.$or = [
          { special_requirements: { $exists: false } },
          { special_requirements: null },
          { special_requirements: "" },
        ];
      }
    }

    if (filterOptions.requires_catering !== undefined) {
      filters.catering_required = filterOptions.requires_catering;
    }

    if (filterOptions.is_recurring !== undefined) {
      filters.is_recurring = filterOptions.is_recurring;
    }

    if (filterOptions.is_workshop_booking !== undefined) {
      filters.is_workshop_booking = filterOptions.is_workshop_booking;
    }

    // Admin filters
    if (filterOptions.approved_by) {
      filters.approved_by = filterOptions.approved_by;
    }

    if (filterOptions.has_admin_notes !== undefined) {
      if (filterOptions.has_admin_notes) {
        filters.admin_notes = { $exists: true, $ne: null, $ne: "" };
      } else {
        filters.$or = [
          { admin_notes: { $exists: false } },
          { admin_notes: null },
          { admin_notes: "" },
        ];
      }
    }

    // Check-in status filters
    if (filterOptions.is_checked_in !== undefined) {
      filters.status = filterOptions.is_checked_in ? "checked_in" : { $ne: "checked_in" };
    }

    if (filterOptions.is_completed !== undefined) {
      filters.status = filterOptions.is_completed ? "completed" : { $ne: "completed" };
    }

    if (filterOptions.is_overdue) {
      const now = new Date();
      filters.$and = [
        { booking_date: { $lt: now } },
        { status: { $in: ["confirmed", "pending"] } },
      ];
    }

    // Rating filters
    if (filterOptions.min_rating || filterOptions.max_rating) {
      filters.rating = {};
      if (filterOptions.min_rating) {
        filters.rating.$gte = filterOptions.min_rating;
      }
      if (filterOptions.max_rating) {
        filters.rating.$lte = filterOptions.max_rating;
      }
    }

    if (filterOptions.has_feedback !== undefined) {
      if (filterOptions.has_feedback) {
        filters.feedback = { $exists: true, $ne: null, $ne: "" };
      } else {
        filters.$or = [
          { feedback: { $exists: false } },
          { feedback: null },
          { feedback: "" },
        ];
      }
    }

    // Advanced filters
    if (filterOptions.created_by_user) {
      filters.user = filterOptions.created_by_user;
    }

    if (filterOptions.last_updated_by) {
      filters.last_updated_by = filterOptions.last_updated_by;
    }

    // Cancellation filters
    if (filterOptions.cancelled_bookings !== undefined) {
      if (filterOptions.cancelled_bookings) {
        filters.status = "cancelled";
      } else {
        filters.status = { $ne: "cancelled" };
      }
    }

    if (filterOptions.cancelled_by) {
      filters.last_updated_by = filterOptions.cancelled_by;
      filters.status = "cancelled";
    }

    if (filterOptions.has_refund !== undefined) {
      if (filterOptions.has_refund) {
        filters.refund_amount = { $gt: 0 };
      } else {
        filters.$or = [
          { refund_amount: { $exists: false } },
          { refund_amount: 0 },
        ];
      }
    }

    // Workshop filters
    if (filterOptions.workshop_id) {
      filters.workshop = filterOptions.workshop_id;
    }

    if (filterOptions.workshop_session_id) {
      filters.workshop_session_id = filterOptions.workshop_session_id;
    }

    // Build sorting options
    const sortOptions = {};
    if (filterOptions.sort_by) {
      sortOptions[filterOptions.sort_by] = filterOptions.sort_direction === "desc" ? -1 : 1;
    } else if (filterOptions.multi_sort && filterOptions.multi_sort.length > 0) {
      filterOptions.multi_sort.forEach(sort => {
        sortOptions[sort.field] = sort.direction === "desc" ? -1 : 1;
      });
    } else {
      // Default sorting by creation date (newest first)
      sortOptions.created_at = -1;
    }

    // Handle grouping/aggregation
    if (filterOptions.group_by) {
      return await handleAggregation(filters, filterOptions.group_by, filterOptions);
    }

    // Handle summary only request
    if (filterOptions.summary_only) {
      return await getSummaryStats(filters);
    }

    // Pagination setup
    const page = filterOptions.page || 1;
    const pageSize = filterOptions.page_size || 20;
    const skip = (page - 1) * pageSize;

    // Relations setup
    const relations = filterOptions.include_relations !== false ? {
      user: { get: { name: 1, email: 1, phone: 1, _id: 1 } },
      order: { get: { order_number: 1, total_amount: 1, status: 1, _id: 1 } },
      wallet_transaction: { get: { transaction_id: 1, amount: 1, status: 1, _id: 1 } },
      workshop: { get: { title: 1, course_id: 1, _id: 1 } },
    } : {};

    // Execute the query
    const [bookings, totalCount] = await Promise.all([
      coreApp.odm.findMany("booking", {
        filters,
        sort: sortOptions,
        limit: pageSize,
        skip,
        relations,
      }),
      coreApp.odm.countDocuments("booking", { filters }),
    ]);

    // Handle export request
    if (filterOptions.export_format) {
      return await handleExport(
        bookings,
        filterOptions.export_format,
        filterOptions
      );
    }

    // Calculate additional statistics
    const statistics = await calculateBookingStatistics(bookings, filters);

    // Prepare response
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      success: true,
      body: {
        bookings,
        pagination: {
          current_page: page,
          page_size: pageSize,
          total_records: totalCount,
          total_pages: totalPages,
          has_next_page: hasNextPage,
          has_previous_page: hasPreviousPage,
          next_page: hasNextPage ? page + 1 : null,
          previous_page: hasPreviousPage ? page - 1 : null,
        },
        filters_applied: {
          ...filterOptions,
          total_filters: Object.keys(filters).length,
        },
        statistics,
        metadata: {
          query_time: new Date().toISOString(),
          admin_user_id: adminUserId.toString(),
          includes_relations: filterOptions.include_relations !== false,
          sorting: sortOptions,
        },
      },
      message: `Found ${totalCount} booking(s) matching the criteria.`,
    };

  } catch (error) {
    console.error("Error in getAllBookings function:", error);
    return {
      success: false,
      message: "Internal server error while retrieving bookings",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        admin_user_id: body.user?._id,
        timestamp: new Date().toISOString(),
      },
    };
  }

};

// Helper method to apply quick filters
async function applyQuickFilter(filters: any, quickFilter: string) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  switch (quickFilter) {
    case "pending_approval":
      filters.status = "pending";
      break;
    case "confirmed_today":
      filters.status = "confirmed";
      filters.booking_date = { $gte: today, $lt: tomorrow };
      break;
    case "checked_in_now":
      filters.status = "checked_in";
      break;
    case "overdue_checkins":
      filters.$and = [
        { booking_date: { $lt: now } },
        { status: { $in: ["confirmed", "pending"] } },
      ];
      break;
    case "requiring_attention":
      filters.$or = [
        { status: "pending" },
        { status: "no_show" },
        {
          $and: [
            { booking_date: { $lt: now } },
            { status: { $in: ["confirmed", "pending"] } },
          ]
        },
      ];
      break;
    case "high_value":
      filters.total_price = { $gte: 1000000 }; // Adjust based on currency
      break;
    case "recent_cancellations":
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filters.status = "cancelled";
      filters.cancelled_at = { $gte: weekAgo };
      break;
    case "recurring_bookings":
      filters.is_recurring = true;
      break;
    case "workshop_bookings":
      filters.is_workshop_booking = true;
      break;
  }
}

// Helper method to handle aggregation
async function handleAggregation(filters: any, groupBy: string, options: any) {
  const pipeline = [
    { $match: filters },
  ];

  let groupStage = {};
  switch (groupBy) {
    case "status":
      groupStage = {
        _id: "$status",
        count: { $sum: 1 },
        total_revenue: { $sum: "$total_price" },
        avg_price: { $avg: "$total_price" },
      };
      break;
    case "space_type":
      groupStage = {
        _id: "$space_type",
        count: { $sum: 1 },
        total_revenue: { $sum: "$total_price" },
        avg_capacity: { $avg: "$capacity_requested" },
      };
      break;
    case "booking_date":
      groupStage = {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$booking_date" } },
        count: { $sum: 1 },
        total_revenue: { $sum: "$total_price" },
      };
      break;
    case "payment_status":
      groupStage = {
        _id: "$payment_status",
        count: { $sum: 1 },
        total_amount: { $sum: "$total_price" },
      };
      break;
    case "month":
      groupStage = {
        _id: { $dateToString: { format: "%Y-%m", date: "$booking_date" } },
        count: { $sum: 1 },
        total_revenue: { $sum: "$total_price" },
      };
      break;
    case "week":
      groupStage = {
        _id: { $week: "$booking_date" },
        count: { $sum: 1 },
        total_revenue: { $sum: "$total_price" },
      };
      break;
    case "customer":
      groupStage = {
        _id: "$customer_name",
        count: { $sum: 1 },
        total_spent: { $sum: "$total_price" },
        avg_booking_value: { $avg: "$total_price" },
      };
      break;
  }

  pipeline.push({ $group: groupStage });
  pipeline.push({ $sort: { count: -1 } });

  const results = await coreApp.odm.aggregate("booking", pipeline);

  return {
    success: true,
    body: {
      aggregation_type: groupBy,
      results,
      total_groups: results.length,
      generated_at: new Date().toISOString(),
    },
    message: `Aggregated ${results.length} groups by ${groupBy}`,
  };
}

// Helper method to get summary statistics
async function getSummaryStats(filters: any) {
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
      }
    }
  ];

  const [summary] = await coreApp.odm.aggregate("booking", pipeline);

  const statusBreakdown = await coreApp.odm.aggregate("booking", [
    { $match: filters },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  return {
    success: true,
    body: {
      summary: summary || {
        total_bookings: 0,
        total_revenue: 0,
        avg_booking_value: 0,
        total_capacity_booked: 0,
        avg_duration: 0,
      },
      status_breakdown: statusBreakdown,
      generated_at: new Date().toISOString(),
    },
    message: "Summary statistics generated successfully",
  };
}

// Helper method to handle exports
async function handleExport(bookings: any[], format: string, options: any) {
  // This would implement actual file export functionality
  // For now, return the data in a format ready for export
  const exportData = bookings.map(booking => ({
    booking_number: booking.booking_number,
    booking_date: booking.booking_date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    space_type: booking.space_type,
    customer_name: booking.customer_name,
    customer_email: options.include_customer_details ? booking.customer_email : "[HIDDEN]",
    customer_phone: options.include_customer_details ? booking.customer_phone : "[HIDDEN]",
    status: booking.status,
    payment_status: booking.payment_status,
    total_price: options.include_payment_details ? booking.total_price : "[HIDDEN]",
    admin_notes: options.include_admin_notes ? booking.admin_notes : "[HIDDEN]",
  }));

  return {
    success: true,
    body: {
      export_format: format,
      export_data: exportData,
      total_records: exportData.length,
      export_timestamp: new Date().toISOString(),
      file_ready: true,
    },
    message: `Export prepared with ${exportData.length} records in ${format} format`,
  };
}

// Helper method to get basic stats
async function getBasicStats(filters: any) {
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

// Helper method to get revenue stats
async function getRevenueStats(filters: any) {
  return { total_revenue: 0 }; // Placeholder
}

// Helper method to get status breakdown
async function getStatusBreakdown(filters: any) {
  return []; // Placeholder
}

// Helper method to get space type breakdown
async function getSpaceTypeBreakdown(filters: any) {
  return []; // Placeholder
}

// Helper method to get time series data
async function getTimeSeriesData(filters: any, groupBy: string) {
  return []; // Placeholder
}

// Helper method to get customer stats
async function getCustomerStats(filters: any) {
  return {}; // Placeholder
}

// Helper method to calculate KPIs
async function calculateKPIs(filters: any, dateRange: any) {
  return {}; // Placeholder
}

// Helper method to calculate space efficiency
async function calculateSpaceEfficiency(filters: any) {
  return {}; // Placeholder
}

// Helper method to generate insights
async function generateInsights(basicStats: any, revenueStats: any, spaceTypeBreakdown: any) {
  return {}; // Placeholder
}

// Helper method to calculate changes
function calculateChanges(current: any, previous: any) {
  return {}; // Placeholder
}

// Helper method to calculate booking statistics
async function calculateBookingStatistics(bookings: any[], filters: any) {
  const stats = {
    revenue_stats: {
      total_revenue: 0,
      avg_booking_value: 0,
      highest_booking_value: 0,
      lowest_booking_value: 0,
    },
    status_distribution: {},
    space_type_distribution: {},
    capacity_stats: {
      total_capacity_booked: 0,
      avg_capacity_per_booking: 0,
    },
    time_stats: {
      avg_duration_hours: 0,
      most_popular_time_slot: null,
    },
  };

  if (bookings.length === 0) return stats;

  // Revenue calculations
  const revenues = bookings.map(b => b.total_price || 0);
  stats.revenue_stats.total_revenue = revenues.reduce((sum, r) => sum + r, 0);
  stats.revenue_stats.avg_booking_value = stats.revenue_stats.total_revenue / bookings.length;
  stats.revenue_stats.highest_booking_value = Math.max(...revenues);
  stats.revenue_stats.lowest_booking_value = Math.min(...revenues);

  // Status distribution
  bookings.forEach(booking => {
    stats.status_distribution[booking.status] = (stats.status_distribution[booking.status] || 0) + 1;
  });

  // Space type distribution
  bookings.forEach(booking => {
    stats.space_type_distribution[booking.space_type] = (stats.space_type_distribution[booking.space_type] || 0) + 1;
  });

  // Capacity stats
  const capacities = bookings.map(b => b.capacity_requested || 0);
  stats.capacity_stats.total_capacity_booked = capacities.reduce((sum, c) => sum + c, 0);
  stats.capacity_stats.avg_capacity_per_booking = stats.capacity_stats.total_capacity_booked / bookings.length;

  // Time stats
  const durations = bookings.filter(b => b.duration_hours).map(b => b.duration_hours);
  if (durations.length > 0) {
    stats.time_stats.avg_duration_hours = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  }

  // Most popular time slot
  const timeSlotCount = {};
  bookings.forEach(booking => {
    if (booking.start_time) {
      timeSlotCount[booking.start_time] = (timeSlotCount[booking.start_time] || 0) + 1;
    }
  });

  const mostPopularSlot = Object.entries(timeSlotCount).reduce((a, b) =>
    timeSlotCount[a[0]] > timeSlotCount[b[0]] ? a : b
    , ["", 0]);

  stats.time_stats.most_popular_time_slot = mostPopularSlot[0] || null;

  return stats;
}
