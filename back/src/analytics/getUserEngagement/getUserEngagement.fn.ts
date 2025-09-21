import {
  ObjectId,
  ActFn,
  getMainDb
} from "../../../../../../../deps.ts";

export const getUserEngagementFn: ActFn = async (body) => {
  const {
    dateFrom,
    dateTo,
    period = "30d",
    userLevel = "all",
    cohortSize = 100,
    includeInactive = false
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
    // Base match conditions for users
    const userBaseMatch: any = {};
    const userCurrentMatch: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };
    const userPreviousMatch: any = {
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    };

    // User level filter
    if (userLevel !== "all") {
      userBaseMatch.level = userLevel;
      userCurrentMatch.level = userLevel;
      userPreviousMatch.level = userLevel;
    }

    // Get total users
    const totalUsers = await mainDb.collection("users").countDocuments(userBaseMatch);

    // Get new users in current period
    const newUsers = await mainDb.collection("users").countDocuments(userCurrentMatch);

    // Get new users in previous period
    const previousNewUsers = await mainDb.collection("users").countDocuments(userPreviousMatch);

    // Calculate user growth
    const userGrowth = previousNewUsers > 0
      ? ((newUsers - previousNewUsers) / previousNewUsers) * 100
      : 0;

    // Get users by level distribution
    const usersByLevel = await mainDb.collection("users")
      .aggregate([
        { $match: userBaseMatch },
        {
          $group: {
            _id: "$level",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();

    // Get active users (users with activity in the period)
    const activeUsersData = await mainDb.collection("enrollments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$userId",
            lastActivity: { $max: "$createdAt" },
            totalEnrollments: { $sum: 1 }
          }
        },
        {
          $count: "activeUsers"
        }
      ]).toArray();

    const activeUsers = activeUsersData[0]?.activeUsers || 0;

    // Get daily active users
    const dailyActiveUsers = await mainDb.collection("enrollments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              userId: "$userId"
            }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            uniqueUsers: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();

    // Get monthly active users
    const monthlyActiveUsers = await mainDb.collection("enrollments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              userId: "$userId"
            }
          }
        },
        {
          $group: {
            _id: "$_id.month",
            uniqueUsers: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();

    // Calculate course completion rates
    const completionRates = await mainDb.collection("enrollments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
            completedEnrollments: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
              }
            }
          }
        }
      ]).toArray();

    const completionData = completionRates[0] || { totalEnrollments: 0, completedEnrollments: 0 };
    const courseCompletionRate = completionData.totalEnrollments > 0
      ? (completionData.completedEnrollments / completionData.totalEnrollments) * 100
      : 0;

    // Calculate retention rates (users who were active in month 1 and still active in month 2, 3, etc.)
    const retentionRates = await mainDb.collection("enrollments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(startDate.getTime() - 180 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              userId: "$userId",
              cohortMonth: { $dateToString: { format: "%Y-%m", date: { $min: "$createdAt" } } }
            },
            firstActivity: { $min: "$createdAt" },
            lastActivity: { $max: "$createdAt" }
          }
        },
        {
          $group: {
            _id: "$_id.cohortMonth",
            cohortSize: { $sum: 1 },
            month1Retained: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$lastActivity",
                      { $add: ["$firstActivity", 30 * 24 * 60 * 60 * 1000] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            month2Retained: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$lastActivity",
                      { $add: ["$firstActivity", 60 * 24 * 60 * 60 * 1000] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();

    // Get top active users
    const topActiveUsers = await mainDb.collection("enrollments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$userId",
            enrollmentCount: { $sum: 1 },
            lastActivity: { $max: "$createdAt" }
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
        { $unwind: "$user" },
        {
          $project: {
            userId: "$_id",
            userName: "$user.name",
            userEmail: "$user.email",
            enrollmentCount: 1,
            lastActivity: 1
          }
        },
        { $sort: { enrollmentCount: -1 } },
        { $limit: 10 }
      ]).toArray();

    // Calculate engagement funnel
    const engagementFunnel = await mainDb.collection("users")
      .aggregate([
        { $match: userBaseMatch },
        {
          $lookup: {
            from: "enrollments",
            localField: "_id",
            foreignField: "userId",
            as: "enrollments"
          }
        },
        {
          $addFields: {
            hasEnrollments: { $gt: [{ $size: "$enrollments" }, 0] },
            hasCompletedCourse: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$enrollments",
                      cond: { $eq: ["$$this.status", "completed"] }
                    }
                  }
                },
                0
              ]
            },
            enrollmentCount: { $size: "$enrollments" }
          }
        },
        {
          $group: {
            _id: null,
            totalSignups: { $sum: 1 },
            usersWithEnrollments: {
              $sum: { $cond: ["$hasEnrollments", 1, 0] }
            },
            usersWithCompletions: {
              $sum: { $cond: ["$hasCompletedCourse", 1, 0] }
            },
            multipleEnrollments: {
              $sum: { $cond: [{ $gt: ["$enrollmentCount", 1] }, 1, 0] }
            }
          }
        }
      ]).toArray();

    const funnelData = engagementFunnel[0] || {
      totalSignups: 0,
      usersWithEnrollments: 0,
      usersWithCompletions: 0,
      multipleEnrollments: 0
    };

    // Calculate churn rate (users who were active before but not in current period)
    const churnAnalysis = await mainDb.collection("enrollments")
      .aggregate([
        {
          $group: {
            _id: "$userId",
            lastActivity: { $max: "$createdAt" }
          }
        },
        {
          $group: {
            _id: null,
            totalActiveUsers: { $sum: 1 },
            churnedUsers: {
              $sum: {
                $cond: [
                  { $lt: ["$lastActivity", startDate] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray();

    const churnData = churnAnalysis[0] || { totalActiveUsers: 0, churnedUsers: 0 };
    const churnRate = churnData.totalActiveUsers > 0
      ? (churnData.churnedUsers / churnData.totalActiveUsers) * 100
      : 0;

    // Calculate lifetime value (based on payments)
    const lifetimeValue = await mainDb.collection("payment_transactions")
      .aggregate([
        {
          $match: {
            status: "completed"
          }
        },
        {
          $group: {
            _id: "$userId",
            totalSpent: { $sum: "$amount" },
            transactionCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            averageLTV: { $avg: "$totalSpent" },
            totalUsers: { $sum: 1 },
            totalRevenue: { $sum: "$totalSpent" }
          }
        }
      ]).toArray();

    const ltvData = lifetimeValue[0] || { averageLTV: 0, totalUsers: 0, totalRevenue: 0 };

    // Format daily active users for heatmap
    const activityHeatmap = dailyActiveUsers.map(item => ({
      date: item._id,
      value: item.uniqueUsers
    }));

    // Calculate conversion metrics
    const conversionMetrics = {
      signupToEnrollment: funnelData.totalSignups > 0
        ? (funnelData.usersWithEnrollments / funnelData.totalSignups) * 100
        : 0,
      enrollmentToCompletion: funnelData.usersWithEnrollments > 0
        ? (funnelData.usersWithCompletions / funnelData.usersWithEnrollments) * 100
        : 0,
      singleToMultiple: funnelData.usersWithEnrollments > 0
        ? (funnelData.multipleEnrollments / funnelData.usersWithEnrollments) * 100
        : 0
    };

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        userGrowth: Math.round(userGrowth * 100) / 100,
        dailyActiveUsers: dailyActiveUsers.map(item => ({
          date: item._id,
          users: item.uniqueUsers
        })),
        monthlyActiveUsers: monthlyActiveUsers.map(item => ({
          month: item._id,
          users: item.uniqueUsers
        })),
        retentionRates: retentionRates.map(item => ({
          cohort: item._id,
          cohortSize: item.cohortSize,
          month1Retention: item.cohortSize > 0 ? (item.month1Retained / item.cohortSize) * 100 : 0,
          month2Retention: item.cohortSize > 0 ? (item.month2Retained / item.cohortSize) * 100 : 0
        })),
        courseCompletionRate: Math.round(courseCompletionRate * 100) / 100,
        averageSessionDuration: 0, // Would need session tracking for accurate data
        usersByLevel: usersByLevel.map(item => ({
          level: item._id || "Unknown",
          count: item.count
        })),
        engagementFunnel: {
          totalSignups: funnelData.totalSignups,
          usersWithEnrollments: funnelData.usersWithEnrollments,
          usersWithCompletions: funnelData.usersWithCompletions,
          multipleEnrollments: funnelData.multipleEnrollments
        },
        topActiveUsers: topActiveUsers.map(user => ({
          userId: user.userId,
          name: user.userName,
          email: user.userEmail,
          enrollments: user.enrollmentCount,
          lastActivity: user.lastActivity
        })),
        churnRate: Math.round(churnRate * 100) / 100,
        lifetimeValue: {
          average: Math.round(ltvData.averageLTV * 100) / 100,
          total: ltvData.totalRevenue
        },
        conversionMetrics,
        activityHeatmap,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          period
        }
      }
    };

  } catch (error) {
    console.error("Error in getUserEngagement:", error);
    return {
      success: false,
      message: "خطا در دریافت آمار مشارکت کاربران",
      error: error.message
    };
  }
};
