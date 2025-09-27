import {
  ObjectId,
  ActFn
} from "@deps";
import {  order, invoice, course, booking, user, enrollment  } from "@app";

export const getTopPerformersFn: ActFn = async (body) => {
  const {
    dateFrom,
    dateTo,
    period = "30d",
    entityType = "all",
    metricType = "revenue",
    limit = 10,
    includeInactive = false,
    minThreshold = 0,
    categoryId,
    sortBy = "revenue",
    includeGrowth = true,
    includeDetails = true
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

  // Calculate previous period for growth comparison
  const periodLength = endDate.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - periodLength);
  const previousEndDate = new Date(startDate);

  try {
    let topCourses: any[] = [];
    let topInstructors: any[] = [];
    let topUsers: any[] = [];
    let topSpaces: any[] = [];
    let topCategories: any[] = [];

    // Get top courses if requested
    if (entityType === "all" || entityType === "courses") {
      const courseBaseMatch: any = {};
      if (categoryId) {
        courseBaseMatch.categoryId = new ObjectId(categoryId);
      }
      if (!includeInactive) {
        courseBaseMatch.status = "active";
      }

      topCourses = await mainDb.collection("courses")
        .aggregate([
          { $match: courseBaseMatch },
          // Join with enrollments
          {
            $lookup: {
              from: "enrollments",
              let: { courseId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$courseId", "$$courseId"] },
                    createdAt: { $gte: startDate, $lte: endDate }
                  }
                }
              ],
              as: "enrollments"
            }
          },
          // Join with payments
          {
            $lookup: {
              from: "payment_transactions",
              let: { courseId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$itemId", "$$courseId"] },
                    status: "completed",
                    createdAt: { $gte: startDate, $lte: endDate }
                  }
                }
              ],
              as: "payments"
            }
          },
          // Join with category
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category"
            }
          },
          // Join with instructor
          {
            $lookup: {
              from: "users",
              localField: "instructorId",
              foreignField: "_id",
              as: "instructor"
            }
          },
          // Calculate metrics
          {
            $addFields: {
              totalEnrollments: { $size: "$enrollments" },
              completedEnrollments: {
                $size: {
                  $filter: {
                    input: "$enrollments",
                    cond: { $eq: ["$$this.status", "completed"] }
                  }
                }
              },
              totalRevenue: { $sum: "$payments.amount" },
              completionRate: {
                $cond: [
                  { $gt: [{ $size: "$enrollments" }, 0] },
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $size: {
                              $filter: {
                                input: "$enrollments",
                                cond: { $eq: ["$$this.status", "completed"] }
                              }
                            }
                          },
                          { $size: "$enrollments" }
                        ]
                      },
                      100
                    ]
                  },
                  0
                ]
              },
              averageRating: { $ifNull: ["$rating", 0] },
              categoryName: { $arrayElemAt: ["$category.name", 0] },
              instructorName: { $arrayElemAt: ["$instructor.name", 0] }
            }
          },
          // Filter by minimum threshold
          {
            $match: {
              $expr: {
                $gte: [
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: [metricType, "revenue"] }, then: "$totalRevenue" },
                        { case: { $eq: [metricType, "enrollments"] }, then: "$totalEnrollments" },
                        { case: { $eq: [metricType, "completions"] }, then: "$completedEnrollments" },
                        { case: { $eq: [metricType, "ratings"] }, then: "$averageRating" }
                      ],
                      default: "$totalRevenue"
                    }
                  },
                  minThreshold
                ]
              }
            }
          },
          // Sort by specified metric
          {
            $sort: {
              [sortBy === "revenue" ? "totalRevenue" :
                sortBy === "count" ? "totalEnrollments" :
                  sortBy === "rating" ? "averageRating" :
                    sortBy === "engagement" ? "completionRate" :
                      "totalRevenue"]: -1
            }
          },
          { $limit: limit }
        ]).toArray();

      // Get growth data for courses if requested
      if (includeGrowth) {
        for (const course of topCourses) {
          const previousData = await mainDb.collection("enrollments")
            .aggregate([
              {
                $match: {
                  courseId: course._id,
                  createdAt: { $gte: previousStartDate, $lte: previousEndDate }
                }
              },
              {
                $group: {
                  _id: null,
                  previousEnrollments: { $sum: 1 },
                  previousCompletions: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                  }
                }
              }
            ]).toArray();

          const prevData = previousData[0] || { previousEnrollments: 0, previousCompletions: 0 };

          course.enrollmentGrowth = prevData.previousEnrollments > 0
            ? ((course.totalEnrollments - prevData.previousEnrollments) / prevData.previousEnrollments) * 100
            : 0;

          course.completionGrowth = prevData.previousCompletions > 0
            ? ((course.completedEnrollments - prevData.previousCompletions) / prevData.previousCompletions) * 100
            : 0;
        }
      }
    }

    // Get top instructors if requested
    if (entityType === "all" || entityType === "instructors") {
      topInstructors = await mainDb.collection("courses")
        .aggregate([
          {
            $match: {
              ...(categoryId ? { categoryId: new ObjectId(categoryId) } : {}),
              ...(!includeInactive ? { status: "active" } : {})
            }
          },
          // Join with enrollments
          {
            $lookup: {
              from: "enrollments",
              let: { courseId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$courseId", "$$courseId"] },
                    createdAt: { $gte: startDate, $lte: endDate }
                  }
                }
              ],
              as: "enrollments"
            }
          },
          // Join with payments
          {
            $lookup: {
              from: "payment_transactions",
              let: { courseId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$itemId", "$$courseId"] },
                    status: "completed",
                    createdAt: { $gte: startDate, $lte: endDate }
                  }
                }
              ],
              as: "payments"
            }
          },
          // Group by instructor
          {
            $group: {
              _id: "$instructorId",
              coursesCount: { $sum: 1 },
              totalEnrollments: { $sum: { $size: "$enrollments" } },
              totalCompletions: {
                $sum: {
                  $size: {
                    $filter: {
                      input: "$enrollments",
                      cond: { $eq: ["$$this.status", "completed"] }
                    }
                  }
                }
              },
              totalRevenue: { $sum: { $sum: "$payments.amount" } },
              averageRating: { $avg: "$rating" }
            }
          },
          // Join with instructor details
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "instructor"
            }
          },
          {
            $addFields: {
              instructorName: { $arrayElemAt: ["$instructor.name", 0] },
              instructorEmail: { $arrayElemAt: ["$instructor.email", 0] },
              completionRate: {
                $cond: [
                  { $gt: ["$totalEnrollments", 0] },
                  { $multiply: [{ $divide: ["$totalCompletions", "$totalEnrollments"] }, 100] },
                  0
                ]
              }
            }
          },
          // Filter by minimum threshold
          {
            $match: {
              $expr: {
                $gte: [
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: [metricType, "revenue"] }, then: "$totalRevenue" },
                        { case: { $eq: [metricType, "enrollments"] }, then: "$totalEnrollments" },
                        { case: { $eq: [metricType, "completions"] }, then: "$totalCompletions" },
                        { case: { $eq: [metricType, "ratings"] }, then: "$averageRating" }
                      ],
                      default: "$totalRevenue"
                    }
                  },
                  minThreshold
                ]
              }
            }
          },
          // Sort by specified metric
          {
            $sort: {
              [sortBy === "revenue" ? "totalRevenue" :
                sortBy === "count" ? "totalEnrollments" :
                  sortBy === "rating" ? "averageRating" :
                    sortBy === "engagement" ? "completionRate" :
                      "totalRevenue"]: -1
            }
          },
          { $limit: limit }
        ]).toArray();
    }

    // Get top users (students) if requested
    if (entityType === "all" || entityType === "users") {
      topUsers = await mainDb.collection("enrollments")
        .aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: "$userId",
              totalEnrollments: { $sum: 1 },
              completedCourses: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
              },
              activeCourses: {
                $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
              }
            }
          },
          // Join with payment data
          {
            $lookup: {
              from: "payment_transactions",
              let: { userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$userId", "$$userId"] },
                    status: "completed",
                    createdAt: { $gte: startDate, $lte: endDate }
                  }
                }
              ],
              as: "payments"
            }
          },
          // Join with user details
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
              userEmail: { $arrayElemAt: ["$user.email", 0] },
              totalSpent: { $sum: "$payments.amount" },
              completionRate: {
                $cond: [
                  { $gt: ["$totalEnrollments", 0] },
                  { $multiply: [{ $divide: ["$completedCourses", "$totalEnrollments"] }, 100] },
                  0
                ]
              }
            }
          },
          // Filter by minimum threshold
          {
            $match: {
              $expr: {
                $gte: [
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: [metricType, "revenue"] }, then: "$totalSpent" },
                        { case: { $eq: [metricType, "enrollments"] }, then: "$totalEnrollments" },
                        { case: { $eq: [metricType, "completions"] }, then: "$completedCourses" },
                        { case: { $eq: [metricType, "engagement"] }, then: "$completionRate" }
                      ],
                      default: "$totalEnrollments"
                    }
                  },
                  minThreshold
                ]
              }
            }
          },
          {
            $sort: {
              [sortBy === "revenue" ? "totalSpent" :
                sortBy === "count" ? "totalEnrollments" :
                  sortBy === "engagement" ? "completionRate" :
                    "totalEnrollments"]: -1
            }
          },
          { $limit: limit }
        ]).toArray();
    }

    // Get top spaces if requested
    if (entityType === "all" || entityType === "spaces") {
      topSpaces = await mainDb.collection("bookings")
        .aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: "$spaceId",
              totalBookings: { $sum: 1 },
              confirmedBookings: {
                $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
              },
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
          // Join with revenue data
          {
            $lookup: {
              from: "payment_transactions",
              let: { spaceId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$itemId", "$$spaceId"] },
                    type: "space_booking",
                    status: "completed",
                    createdAt: { $gte: startDate, $lte: endDate }
                  }
                }
              ],
              as: "payments"
            }
          },
          // Join with space details - note: assuming spaces collection exists
          {
            $addFields: {
              spaceName: { $toString: "$_id" }, // Fallback if spaces collection doesn't exist
              spaceType: "workspace", // Default type
              totalRevenue: { $sum: "$payments.amount" },
              utilizationRate: {
                $cond: [
                  { $gt: ["$totalBookings", 0] },
                  { $multiply: [{ $divide: ["$confirmedBookings", "$totalBookings"] }, 100] },
                  0
                ]
              }
            }
          },
          // Filter by minimum threshold
          {
            $match: {
              $expr: {
                $gte: [
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: [metricType, "revenue"] }, then: "$totalRevenue" },
                        { case: { $eq: [metricType, "bookings"] }, then: "$totalBookings" },
                        { case: { $eq: [metricType, "engagement"] }, then: "$utilizationRate" }
                      ],
                      default: "$totalBookings"
                    }
                  },
                  minThreshold
                ]
              }
            }
          },
          {
            $sort: {
              [sortBy === "revenue" ? "totalRevenue" :
                sortBy === "count" ? "totalBookings" :
                  sortBy === "engagement" ? "utilizationRate" :
                    "totalBookings"]: -1
            }
          },
          { $limit: limit }
        ]).toArray();
    }

    // Get top categories if requested
    if (entityType === "all" || entityType === "categories") {
      topCategories = await mainDb.collection("courses")
        .aggregate([
          {
            $match: {
              ...(!includeInactive ? { status: "active" } : {})
            }
          },
          // Join with enrollments
          {
            $lookup: {
              from: "enrollments",
              let: { courseId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$courseId", "$$courseId"] },
                    createdAt: { $gte: startDate, $lte: endDate }
                  }
                }
              ],
              as: "enrollments"
            }
          },
          // Join with payments
          {
            $lookup: {
              from: "payment_transactions",
              let: { courseId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$itemId", "$$courseId"] },
                    status: "completed",
                    createdAt: { $gte: startDate, $lte: endDate }
                  }
                }
              ],
              as: "payments"
            }
          },
          // Group by category
          {
            $group: {
              _id: "$categoryId",
              coursesCount: { $sum: 1 },
              totalEnrollments: { $sum: { $size: "$enrollments" } },
              totalCompletions: {
                $sum: {
                  $size: {
                    $filter: {
                      input: "$enrollments",
                      cond: { $eq: ["$$this.status", "completed"] }
                    }
                  }
                }
              },
              totalRevenue: { $sum: { $sum: "$payments.amount" } },
              averageRating: { $avg: "$rating" }
            }
          },
          // Join with category details
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "category"
            }
          },
          {
            $addFields: {
              categoryName: { $arrayElemAt: ["$category.name", 0] },
              completionRate: {
                $cond: [
                  { $gt: ["$totalEnrollments", 0] },
                  { $multiply: [{ $divide: ["$totalCompletions", "$totalEnrollments"] }, 100] },
                  0
                ]
              }
            }
          },
          // Filter by minimum threshold
          {
            $match: {
              $expr: {
                $gte: [
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: [metricType, "revenue"] }, then: "$totalRevenue" },
                        { case: { $eq: [metricType, "enrollments"] }, then: "$totalEnrollments" },
                        { case: { $eq: [metricType, "completions"] }, then: "$totalCompletions" },
                        { case: { $eq: [metricType, "ratings"] }, then: "$averageRating" }
                      ],
                      default: "$totalRevenue"
                    }
                  },
                  minThreshold
                ]
              }
            }
          },
          {
            $sort: {
              [sortBy === "revenue" ? "totalRevenue" :
                sortBy === "count" ? "totalEnrollments" :
                  sortBy === "rating" ? "averageRating" :
                    sortBy === "engagement" ? "completionRate" :
                      "totalRevenue"]: -1
            }
          },
          { $limit: limit }
        ]).toArray();
    }

    // Calculate overall metrics
    const overallMetrics = {
      totalRevenue: [...topCourses, ...topSpaces].reduce((sum, item) => sum + (item.totalRevenue || 0), 0),
      totalEnrollments: [...topCourses, ...topInstructors].reduce((sum, item) => sum + (item.totalEnrollments || 0), 0),
      totalBookings: topSpaces.reduce((sum, space) => sum + (space.totalBookings || 0), 0),
      averageRating: topCourses.length > 0 ? topCourses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / topCourses.length : 0,
      averageCompletionRate: topCourses.length > 0 ? topCourses.reduce((sum, course) => sum + (course.completionRate || 0), 0) / topCourses.length : 0
    };

    // Generate recommendations based on performance data
    const recommendations = [];

    if (topCourses.length > 0) {
      const lowPerformingCourses = topCourses.filter(course => (course.completionRate || 0) < 30);
      if (lowPerformingCourses.length > 0) {
        recommendations.push({
          type: "improvement",
          category: "courses",
          message: `${lowPerformingCourses.length} دوره با نرخ تکمیل کم شناسایی شد`,
          action: "بررسی محتوا و بهبود کیفیت دوره‌ها"
        });
      }

      const highRevenueCourses = topCourses.filter(course => (course.totalRevenue || 0) > overallMetrics.totalRevenue / topCourses.length * 2);
      if (highRevenueCourses.length > 0) {
        recommendations.push({
          type: "opportunity",
          category: "courses",
          message: `${highRevenueCourses.length} دوره پرفروش شناسایی شد`,
          action: "ایجاد دوره‌های مشابه یا پیشرفته"
        });
      }
    }

    if (topInstructors.length > 0) {
      const topInstructor = topInstructors[0];
      if (topInstructor.totalRevenue > 0) {
        recommendations.push({
          type: "recognition",
          category: "instructors",
          message: `${topInstructor.instructorName} بهترین عملکرد را داشته`,
          action: "تقدیر و ترویج روش‌های تدریس موثر"
        });
      }
    }

    return {
      success: true,
      data: {
        topCourses: topCourses.map(course => ({
          courseId: course._id,
          name: course.name,
          categoryName: course.categoryName || "Unknown",
          instructorName: course.instructorName || "Unknown",
          enrollments: course.totalEnrollments,
          completions: course.completedEnrollments,
          revenue: course.totalRevenue,
          completionRate: Math.round((course.completionRate || 0) * 100) / 100,
          rating: Math.round((course.averageRating || 0) * 100) / 100,
          enrollmentGrowth: includeGrowth ? Math.round((course.enrollmentGrowth || 0) * 100) / 100 : undefined,
          completionGrowth: includeGrowth ? Math.round((course.completionGrowth || 0) * 100) / 100 : undefined
        })),
        topInstructors: topInstructors.map(instructor => ({
          instructorId: instructor._id,
          name: instructor.instructorName || "Unknown",
          email: instructor.instructorEmail,
          coursesCount: instructor.coursesCount,
          enrollments: instructor.totalEnrollments,
          completions: instructor.totalCompletions,
          revenue: instructor.totalRevenue,
          completionRate: Math.round((instructor.completionRate || 0) * 100) / 100,
          averageRating: Math.round((instructor.averageRating || 0) * 100) / 100
        })),
        topUsers: topUsers.map(user => ({
          userId: user._id,
          name: user.userName || "Unknown",
          email: user.userEmail,
          enrollments: user.totalEnrollments,
          completions: user.completedCourses,
          activeCourses: user.activeCourses,
          totalSpent: user.totalSpent,
          completionRate: Math.round((user.completionRate || 0) * 100) / 100
        })),
        topSpaces: topSpaces.map(space => ({
          spaceId: space._id,
          name: space.spaceName || "Unknown Space",
          type: space.spaceType || "Unknown",
          bookings: space.totalBookings,
          confirmed: space.confirmedBookings,
          revenue: space.totalRevenue,
          totalDuration: Math.round((space.totalDuration || 0) * 100) / 100,
          utilizationRate: Math.round((space.utilizationRate || 0) * 100) / 100
        })),
        topCategories: topCategories.map(category => ({
          categoryId: category._id,
          name: category.categoryName || "Unknown",
          coursesCount: category.coursesCount,
          enrollments: category.totalEnrollments,
          completions: category.totalCompletions,
          revenue: category.totalRevenue,
          completionRate: Math.round((category.completionRate || 0) * 100) / 100,
          averageRating: Math.round((category.averageRating || 0) * 100) / 100
        })),
        overallMetrics: {
          totalRevenue: Math.round(overallMetrics.totalRevenue * 100) / 100,
          totalEnrollments: overallMetrics.totalEnrollments,
          totalBookings: overallMetrics.totalBookings,
          averageRating: Math.round(overallMetrics.averageRating * 100) / 100,
          averageCompletionRate: Math.round(overallMetrics.averageCompletionRate * 100) / 100
        },
        performanceComparison: {
          coursesVsInstructors: topCourses.length > 0 && topInstructors.length > 0 ? {
            avgCourseRevenue: topCourses.reduce((sum, course) => sum + (course.totalRevenue || 0), 0) / topCourses.length,
            avgInstructorRevenue: topInstructors.reduce((sum, instructor) => sum + (instructor.totalRevenue || 0), 0) / topInstructors.length
          } : null
        },
        growthAnalysis: includeGrowth ? {
          courseGrowthTrend: topCourses.length > 0 ? topCourses.reduce((sum, course) => sum + (course.enrollmentGrowth || 0), 0) / topCourses.length : 0,
          completionGrowthTrend: topCourses.length > 0 ? topCourses.reduce((sum, course) => sum + (course.completionGrowth || 0), 0) / topCourses.length : 0
        } : null,
        engagementMetrics: {
          avgCompletionRate: overallMetrics.averageCompletionRate,
          topPerformingCompletionRate: topCourses.length > 0 ? Math.max(...topCourses.map(course => course.completionRate || 0)) : 0,
          userEngagementScore: topUsers.length > 0 ? topUsers.reduce((sum, user) => sum + (user.completionRate || 0), 0) / topUsers.length : 0
        },
        revenueMetrics: {
          totalRevenue: overallMetrics.totalRevenue,
          avgRevenuePerCourse: topCourses.length > 0 ? overallMetrics.totalRevenue / topCourses.length : 0,
          topRevenueSource: topCourses.length > 0 ? topCourses[0].name : "N/A"
        },
        qualityMetrics: {
          averageRating: overallMetrics.averageRating,
          topRatedCourse: topCourses.length > 0 ? topCourses.reduce((prev, current) => ((current.averageRating || 0) > (prev.averageRating || 0)) ? current : prev).name : "N/A",
          ratingDistribution: {
            excellent: topCourses.filter(course => (course.averageRating || 0) >= 4.5).length,
            good: topCourses.filter(course => (course.averageRating || 0) >= 3.5 && (course.averageRating || 0) < 4.5).length,
            average: topCourses.filter(course => (course.averageRating || 0) >= 2.5 && (course.averageRating || 0) < 3.5).length,
            poor: topCourses.filter(course => (course.averageRating || 0) < 2.5).length
          }
        },
        trendsAnalysis: {
          topGrowingEntity: includeGrowth && topCourses.length > 0
            ? topCourses.reduce((prev, current) => ((current.enrollmentGrowth || 0) > (prev.enrollmentGrowth || 0)) ? current : prev).name
            : "N/A",
          mostEngaging: topCourses.length > 0
            ? topCourses.reduce((prev, current) => ((current.completionRate || 0) > (prev.completionRate || 0)) ? current : prev).name
            : "N/A"
        },
        benchmarkData: {
          industryAvgCompletionRate: 65, // Industry benchmark
          industryAvgRating: 4.2,
          companyVsIndustry: {
            completionRate: overallMetrics.averageCompletionRate - 65,
            rating: overallMetrics.averageRating - 4.2
          }
        },
        achievementMilestones: topCourses.filter(course =>
          (course.totalEnrollments > 100) ||
          (course.totalRevenue > 50000) ||
          (course.completionRate > 80)
        ).map(course => ({
          courseId: course._id,
          name: course.name,
          achievements: [
            ...(course.totalEnrollments > 100 ? ["100+ enrollments"] : []),
            ...(course.totalRevenue > 50000 ? ["50K+ revenue"] : []),
            ...(course.completionRate > 80 ? ["80%+ completion"] : [])
          ]
        })),
        competitiveAnalysis: {
          marketPosition: overallMetrics.averageRating > 4.0 ? "Strong" : overallMetrics.averageRating > 3.5 ? "Good" : "Needs Improvement",
          strengthAreas: [
            ...(overallMetrics.averageRating > 4.0 ? ["Quality"] : []),
            ...(overallMetrics.averageCompletionRate > 70 ? ["Engagement"] : []),
            ...(overallMetrics.totalRevenue > 100000 ? ["Revenue"] : [])
          ],
          improvementAreas: [
            ...(overallMetrics.averageRating < 4.0 ? ["Quality"] : []),
            ...(overallMetrics.averageCompletionRate < 70 ? ["Engagement"] : []),
            ...(overallMetrics.totalRevenue < 100000 ? ["Revenue"] : [])
          ]
        },
        recommendations,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          period
        }
      }
    };

  } catch (error) {
    console.error("Error in getTopPerformers:", error);
    return {
      success: false,
      message: "خطا در دریافت گزارش بهترین عملکردها",
      error: error.message
    };
  }
};
