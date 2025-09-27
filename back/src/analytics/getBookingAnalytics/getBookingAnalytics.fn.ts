import {
  ObjectId,
  ActFn
} from "@deps";
import {  order, invoice, course, booking, user  } from "@app";

export const getBookingAnalyticsFn: ActFn = async (body) => {
  const {
    dateFrom,
    dateTo,
    period = "30d",
    spaceId,
    userId,
    status = "all",
    bookingType = "all",
    includeRevenue = true,
    groupBy = "day"
  } = body.details;

  // Using models instead of direct database access

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

  try {
    // Base match conditions for bookings
    const bookingBaseMatch: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (spaceId) {
      bookingBaseMatch.spaceId = new ObjectId(spaceId);
    }
    if (userId) {
      bookingBaseMatch.userId = new ObjectId(userId);
    }
    if (status !== "all") {
      bookingBaseMatch.status = status;
    }
    if (bookingType !== "all") {
      bookingBaseMatch.spaceType = bookingType;
    }

    // Get total bookings with comprehensive data
    const bookingData = await mainDb.collection("bookings")
      .aggregate([
        { $match: bookingBaseMatch },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $addFields: {
            userName: { $arrayElemAt: ["$user.name", 0] },
            userEmail: { $arrayElemAt: ["$user.email", 0] },
            bookingDuration: {
              $divide: [
                { $subtract: ["$endTime", "$startTime"] },
                1000 * 60 * 60 // Convert to hours
              ]
            },
            bookingHour: { $hour: "$startTime" },
            bookingDayOfWeek: { $dayOfWeek: "$startTime" },
            bookingMonth: { $dateToString: { format: "%Y-%m", date: "$startTime" } },
            bookingDay: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } }
          }
        }
      ]).toArray();

    // Calculate basic metrics
    const totalBookings = bookingData.length;
    const confirmedBookings = bookingData.filter(b => b.status === "confirmed").length;
    const cancelledBookings = bookingData.filter(b => b.status === "cancelled").length;
    const completedBookings = bookingData.filter(b => b.status === "completed").length;

    // Calculate revenue if included
    let totalRevenue = 0;
    let averageBookingValue = 0;

    if (includeRevenue) {
      const revenueData = await mainDb.collection("payment_transactions")
        .aggregate([
          {
            $match: {
              type: "space_booking",
              status: "completed",
              createdAt: { $gte: startDate, $lte: endDate },
              ...(spaceId ? { itemId: new ObjectId(spaceId) } : {}),
              ...(userId ? { userId: new ObjectId(userId) } : {})
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
              avgValue: { $avg: "$amount" },
              count: { $sum: 1 }
            }
          }
        ]).toArray();

      const revenue = revenueData[0];
      if (revenue) {
        totalRevenue = revenue.totalRevenue;
        averageBookingValue = revenue.avgValue;
      }
    }

    // Calculate average booking duration
    const totalDuration = bookingData.reduce((sum, booking) => sum + (booking.bookingDuration || 0), 0);
    const averageBookingDuration = totalBookings > 0 ? totalDuration / totalBookings : 0;

    // Calculate cancellation rate
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    // Get booking trends based on groupBy parameter
    let bookingTrends: any[] = [];
    let groupByFormat: string;

    switch (groupBy) {
      case "week":
        groupByFormat = "%Y-W%U";
        break;
      case "month":
        groupByFormat = "%Y-%m";
        break;
      case "day":
      default:
        groupByFormat = "%Y-%m-%d";
        break;
    }

    if (groupBy !== "space" && groupBy !== "user") {
      bookingTrends = await mainDb.collection("bookings")
        .aggregate([
          { $match: bookingBaseMatch },
          {
            $group: {
              _id: { $dateToString: { format: groupByFormat, date: "$startTime" } },
              bookings: { $sum: 1 },
              confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
              cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
              avgDuration: {
                $avg: {
                  $divide: [
                    { $subtract: ["$endTime", "$startTime"] },
                    1000 * 60 * 60
                  ]
                }
              }
            }
          },
          { $sort: { "_id": 1 } }
        ]).toArray();
    }

    // Get popular spaces
    const popularSpaces = await mainDb.collection("bookings")
      .aggregate([
        { $match: bookingBaseMatch },
        {
          $group: {
            _id: "$spaceId",
            bookingsCount: { $sum: 1 },
            confirmedCount: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
            totalDuration: {
              $sum: {
                $divide: [
                  { $subtract: ["$endTime", "$startTime"] },
                  1000 * 60 * 60
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: "spaces", // Assuming you have a spaces collection
            localField: "_id",
            foreignField: "_id",
            as: "space"
          }
        },
        {
          $addFields: {
            spaceName: { $arrayElemAt: ["$space.name", 0] },
            spaceType: { $arrayElemAt: ["$space.type", 0] }
          }
        },
        { $sort: { bookingsCount: -1 } },
        { $limit: 10 }
      ]).toArray();

    // Calculate peak hours
    const hourlyBookings = Array(24).fill(0);
    bookingData.forEach(booking => {
      if (booking.bookingHour !== undefined) {
        hourlyBookings[booking.bookingHour]++;
      }
    });

    const peakHours = hourlyBookings
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate peak days (day of week)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dailyBookings = Array(7).fill(0);

    bookingData.forEach(booking => {
      if (booking.bookingDayOfWeek !== undefined) {
        dailyBookings[booking.bookingDayOfWeek - 1]++; // MongoDB dayOfWeek is 1-indexed
      }
    });

    const peakDays = dailyBookings
      .map((count, day) => ({ day: dayNames[day], dayNumber: day + 1, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Get user booking statistics
    const userBookingStats = await mainDb.collection("bookings")
      .aggregate([
        { $match: bookingBaseMatch },
        {
          $group: {
            _id: "$userId",
            bookingsCount: { $sum: 1 },
            confirmedCount: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
            totalDuration: {
              $sum: {
                $divide: [
                  { $subtract: ["$endTime", "$startTime"] },
                  1000 * 60 * 60
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $addFields: {
            userName: { $arrayElemAt: ["$user.name", 0] },
            userEmail: { $arrayElemAt: ["$user.email", 0] }
          }
        },
        { $sort: { bookingsCount: -1 } },
        { $limit: 10 }
      ]).toArray();

    // Calculate space utilization (occupancy rate)
    const spaceUtilization = await mainDb.collection("bookings")
      .aggregate([
        { $match: { ...bookingBaseMatch, status: "confirmed" } },
        {
          $group: {
            _id: "$spaceId",
            totalBookedHours: {
              $sum: {
                $divide: [
                  { $subtract: ["$endTime", "$startTime"] },
                  1000 * 60 * 60
                ]
              }
            },
            bookingsCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "spaces",
            localField: "_id",
            foreignField: "_id",
            as: "space"
          }
        },
        {
          $addFields: {
            spaceName: { $arrayElemAt: ["$space.name", 0] },
            spaceCapacity: { $arrayElemAt: ["$space.capacity", 0] },
            // Assuming 8 hours per day, calculate utilization
            availableHours: {
              $multiply: [
                8, // hours per day
                { $divide: [{ $subtract: [endDate, startDate] }, 1000 * 60 * 60 * 24] } // days in period
              ]
            }
          }
        },
        {
          $addFields: {
            utilizationRate: {
              $multiply: [
                { $divide: ["$totalBookedHours", "$availableHours"] },
                100
              ]
            }
          }
        },
        { $sort: { utilizationRate: -1 } }
      ]).toArray();

    // Get revenue by space
    const revenueBySpace = await mainDb.collection("payment_transactions")
      .aggregate([
        {
          $match: {
            type: "space_booking",
            status: "completed",
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$itemId",
            totalRevenue: { $sum: "$amount" },
            bookingsCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "spaces",
            localField: "_id",
            foreignField: "_id",
            as: "space"
          }
        },
        {
          $addFields: {
            spaceName: { $arrayElemAt: ["$space.name", 0] }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ]).toArray();

    // Calculate bookings by status
    const bookingsByStatus = [
      { status: "confirmed", count: confirmedBookings },
      { status: "cancelled", count: cancelledBookings },
      { status: "completed", count: completedBookings },
      { status: "pending", count: totalBookings - confirmedBookings - cancelledBookings - completedBookings }
    ].filter(item => item.count > 0);

    // Calculate monthly metrics
    const monthlyMetrics = await mainDb.collection("bookings")
      .aggregate([
        { $match: bookingBaseMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$startTime" } },
            totalBookings: { $sum: 1 },
            confirmedBookings: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
            cancelledBookings: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            avgDuration: {
              $avg: {
                $divide: [
                  { $subtract: ["$endTime", "$startTime"] },
                  1000 * 60 * 60
                ]
              }
            }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();

    // Calculate repeat booking rate
    const repeatBookingAnalysis = await mainDb.collection("bookings")
      .aggregate([
        { $match: bookingBaseMatch },
        {
          $group: {
            _id: "$userId",
            bookingsCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            repeatUsers: { $sum: { $cond: [{ $gt: ["$bookingsCount", 1] }, 1, 0] } }
          }
        }
      ]).toArray();

    const repeatData = repeatBookingAnalysis[0] || { totalUsers: 0, repeatUsers: 0 };
    const repeatBookingRate = repeatData.totalUsers > 0 ? (repeatData.repeatUsers / repeatData.totalUsers) * 100 : 0;

    // Calculate advance booking time
    const advanceBookingTimes = bookingData
      .map(booking => {
        const createdTime = new Date(booking.createdAt);
        const bookingTime = new Date(booking.startTime);
        return (bookingTime.getTime() - createdTime.getTime()) / (1000 * 60 * 60 * 24); // Days in advance
      })
      .filter(days => days >= 0);

    const averageAdvanceTime = advanceBookingTimes.length > 0
      ? advanceBookingTimes.reduce((sum, days) => sum + days, 0) / advanceBookingTimes.length
      : 0;

    // Overall occupancy rate calculation
    const totalAvailableHours = spaceUtilization.reduce((sum, space) => sum + (space.availableHours || 0), 0);
    const totalBookedHours = spaceUtilization.reduce((sum, space) => sum + (space.totalBookedHours || 0), 0);
    const occupancyRate = totalAvailableHours > 0 ? (totalBookedHours / totalAvailableHours) * 100 : 0;

    return {
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        averageBookingDuration: Math.round(averageBookingDuration * 100) / 100,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
        bookingTrends: bookingTrends.map(trend => ({
          period: trend._id,
          bookings: trend.bookings,
          confirmed: trend.confirmed,
          cancelled: trend.cancelled,
          avgDuration: Math.round((trend.avgDuration || 0) * 100) / 100
        })),
        popularSpaces: popularSpaces.map(space => ({
          spaceId: space._id,
          name: space.spaceName || "Unknown Space",
          type: space.spaceType || "Unknown",
          bookings: space.bookingsCount,
          confirmed: space.confirmedCount,
          totalDuration: Math.round(space.totalDuration * 100) / 100
        })),
        peakHours: peakHours.map(peak => ({
          hour: peak.hour,
          timeLabel: `${peak.hour}:00 - ${peak.hour + 1}:00`,
          bookings: peak.count
        })),
        peakDays: peakDays,
        userBookingStats: userBookingStats.map(user => ({
          userId: user._id,
          name: user.userName || "Unknown User",
          email: user.userEmail,
          bookings: user.bookingsCount,
          confirmed: user.confirmedCount,
          totalDuration: Math.round(user.totalDuration * 100) / 100
        })),
        spaceUtilization: spaceUtilization.map(space => ({
          spaceId: space._id,
          name: space.spaceName || "Unknown Space",
          bookedHours: Math.round(space.totalBookedHours * 100) / 100,
          availableHours: Math.round(space.availableHours * 100) / 100,
          utilizationRate: Math.round((space.utilizationRate || 0) * 100) / 100,
          bookingsCount: space.bookingsCount
        })),
        revenueBySpace: revenueBySpace.map(space => ({
          spaceId: space._id,
          name: space.spaceName || "Unknown Space",
          revenue: space.totalRevenue,
          bookings: space.bookingsCount,
          avgRevenuePerBooking: space.bookingsCount > 0 ? space.totalRevenue / space.bookingsCount : 0
        })),
        cancellationRate: Math.round(cancellationRate * 100) / 100,
        bookingsByStatus,
        monthlyMetrics: monthlyMetrics.map(metric => ({
          month: metric._id,
          totalBookings: metric.totalBookings,
          confirmedBookings: metric.confirmedBookings,
          cancelledBookings: metric.cancelledBookings,
          avgDuration: Math.round((metric.avgDuration || 0) * 100) / 100,
          cancellationRate: metric.totalBookings > 0 ? (metric.cancelledBookings / metric.totalBookings) * 100 : 0
        })),
        weeklyPatterns: peakDays,
        hourlyDistribution: peakHours,
        bookingDurationAnalysis: {
          average: averageBookingDuration,
          total: totalDuration,
          distribution: {
            shortBookings: bookingData.filter(b => (b.bookingDuration || 0) <= 1).length, // <= 1 hour
            mediumBookings: bookingData.filter(b => (b.bookingDuration || 0) > 1 && (b.bookingDuration || 0) <= 4).length, // 1-4 hours
            longBookings: bookingData.filter(b => (b.bookingDuration || 0) > 4).length // > 4 hours
          }
        },
        repeatBookingRate: Math.round(repeatBookingRate * 100) / 100,
        advanceBookingTime: Math.round(averageAdvanceTime * 100) / 100,
        seasonalTrends: monthlyMetrics, // Using monthly metrics as seasonal trends
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          period
        }
      }
    };

  } catch (error) {
    console.error("Error in getBookingAnalytics:", error);
    return {
      success: false,
      message: "خطا در دریافت آمار رزرو فضاها",
      error: error.message
    };
  }
};
