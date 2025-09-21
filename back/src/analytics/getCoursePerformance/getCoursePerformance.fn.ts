import {
  ObjectId,
  ActFn,
  getMainDb
} from "../../../../../../../deps.ts";

export const getCoursePerformanceFn: ActFn = async (body) => {
  const {
    dateFrom,
    dateTo,
    period = "30d",
    courseId,
    categoryId,
    instructorId,
    status = "all",
    minEnrollments = "0",
    sortBy = "enrollments",
    limit = "10"
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

  try {
    // Base match conditions for courses
    const courseBaseMatch: any = {};

    if (courseId) {
      courseBaseMatch._id = new ObjectId(courseId);
    }
    if (categoryId) {
      courseBaseMatch.categoryId = new ObjectId(categoryId);
    }
    if (instructorId) {
      courseBaseMatch.instructorId = new ObjectId(instructorId);
    }
    if (status !== "all") {
      courseBaseMatch.status = status;
    }

    // Enrollment match conditions
    const enrollmentMatch: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Get total courses count
    const totalCourses = await mainDb.collection("courses").countDocuments(courseBaseMatch);

    // Get active courses count
    const activeCourses = await mainDb.collection("courses").countDocuments({
      ...courseBaseMatch,
      status: "active"
    });

    // Get comprehensive course performance data
    const coursePerformanceData = await mainDb.collection("courses")
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
                  ...enrollmentMatch
                }
              }
            ],
            as: "enrollments"
          }
        },
        // Join with payment transactions
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
        // Join with categories
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category"
          }
        },
        // Join with instructors (users)
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
            activeEnrollments: {
              $size: {
                $filter: {
                  input: "$enrollments",
                  cond: { $eq: ["$$this.status", "active"] }
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
            categoryName: { $arrayElemAt: ["$category.name", 0] },
            instructorName: { $arrayElemAt: ["$instructor.name", 0] }
          }
        },
        // Filter by minimum enrollments
        {
          $match: {
            totalEnrollments: { $gte: parseInt(minEnrollments) }
          }
        }
      ]).toArray();

    // Calculate aggregate metrics
    const totalEnrollments = coursePerformanceData.reduce((sum, course) => sum + course.totalEnrollments, 0);
    const totalRevenue = coursePerformanceData.reduce((sum, course) => sum + course.totalRevenue, 0);
    const averageCompletionRate = coursePerformanceData.length > 0
      ? coursePerformanceData.reduce((sum, course) => sum + course.completionRate, 0) / coursePerformanceData.length
      : 0;

    // Get average rating (assuming we have ratings)
    const averageRating = await mainDb.collection("courses")
      .aggregate([
        { $match: courseBaseMatch },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 }
          }
        }
      ]).toArray();

    const ratingData = averageRating[0] || { avgRating: 0, totalRatings: 0 };

    // Sort courses based on criteria
    let sortField: string;
    let sortOrder: number = -1; // Default descending

    switch (sortBy) {
      case "revenue":
        sortField = "totalRevenue";
        break;
      case "completion":
        sortField = "completionRate";
        break;
      case "rating":
        sortField = "rating";
        break;
      case "recent":
        sortField = "createdAt";
        break;
      default:
        sortField = "totalEnrollments";
    }

    coursePerformanceData.sort((a, b) => {
      const aValue = a[sortField] || 0;
      const bValue = b[sortField] || 0;
      return sortOrder * (bValue - aValue);
    });

    // Get top performing courses
    const topPerformingCourses = coursePerformanceData
      .slice(0, parseInt(limit))
      .map(course => ({
        courseId: course._id,
        name: course.name,
        categoryName: course.categoryName,
        instructorName: course.instructorName,
        enrollments: course.totalEnrollments,
        revenue: course.totalRevenue,
        completionRate: Math.round(course.completionRate * 100) / 100,
        rating: course.rating || 0,
        status: course.status
      }));

    // Get underperforming courses (low completion rate or low enrollments)
    const underperformingCourses = coursePerformanceData
      .filter(course => course.completionRate < 30 || course.totalEnrollments < 5)
      .slice(0, parseInt(limit))
      .map(course => ({
        courseId: course._id,
        name: course.name,
        categoryName: course.categoryName,
        enrollments: course.totalEnrollments,
        completionRate: Math.round(course.completionRate * 100) / 100,
        issues: [
          ...(course.completionRate < 30 ? ["Low completion rate"] : []),
          ...(course.totalEnrollments < 5 ? ["Low enrollment"] : [])
        ]
      }));

    // Get enrollment trends by month
    const enrollmentTrends = await mainDb.collection("enrollments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            ...(courseId ? { courseId: new ObjectId(courseId) } : {})
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            enrollments: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
            }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();

    // Get revenue by course (top courses by revenue)
    const revenueByCourse = coursePerformanceData
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, parseInt(limit))
      .map(course => ({
        courseId: course._id,
        name: course.name,
        revenue: course.totalRevenue,
        enrollments: course.totalEnrollments
      }));

    // Get completion rates by course
    const completionRatesByCourse = coursePerformanceData
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, parseInt(limit))
      .map(course => ({
        courseId: course._id,
        name: course.name,
        completionRate: Math.round(course.completionRate * 100) / 100,
        totalEnrollments: course.totalEnrollments,
        completedEnrollments: course.completedEnrollments
      }));

    // Get category performance
    const categoryPerformance = await mainDb.collection("courses")
      .aggregate([
        { $match: courseBaseMatch },
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
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $group: {
            _id: "$categoryId",
            categoryName: { $first: { $arrayElemAt: ["$category.name", 0] } },
            coursesCount: { $sum: 1 },
            totalEnrollments: { $sum: { $size: "$enrollments" } },
            avgCompletionRate: {
              $avg: {
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
              }
            }
          }
        },
        { $sort: { totalEnrollments: -1 } }
      ]).toArray();

    // Get instructor performance
    const instructorPerformance = await mainDb.collection("courses")
      .aggregate([
        { $match: courseBaseMatch },
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
        {
          $lookup: {
            from: "users",
            localField: "instructorId",
            foreignField: "_id",
            as: "instructor"
          }
        },
        {
          $group: {
            _id: "$instructorId",
            instructorName: { $first: { $arrayElemAt: ["$instructor.name", 0] } },
            coursesCount: { $sum: 1 },
            totalEnrollments: { $sum: { $size: "$enrollments" } },
            avgCompletionRate: {
              $avg: {
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
              }
            }
          }
        },
        { $sort: { totalEnrollments: -1 } }
      ]).toArray();

    // Get monthly metrics
    const monthlyMetrics = enrollmentTrends.map(item => ({
      month: item._id,
      enrollments: item.enrollments,
      completions: item.completed,
      completionRate: item.enrollments > 0 ? (item.completed / item.enrollments) * 100 : 0
    }));

    // Calculate satisfaction metrics (placeholder - would need actual ratings/feedback data)
    const satisfactionMetrics = {
      averageRating: Math.round(ratingData.avgRating * 100) / 100,
      totalRatings: ratingData.totalRatings,
      recommendationRate: 85, // Placeholder
      npsScore: 42 // Placeholder
    };

    // Calculate engagement metrics
    const engagementMetrics = {
      averageCompletionTime: 0, // Would need session/progress tracking
      dropoffRate: averageCompletionRate > 0 ? 100 - averageCompletionRate : 0,
      activeStudentsRatio: totalEnrollments > 0 ? (activeCourses / totalCourses) * 100 : 0
    };

    // Dropoff analysis
    const dropoffAnalysis = await mainDb.collection("enrollments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ["active", "cancelled", "completed"] }
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]).toArray();

    const dropoffData = {
      completed: dropoffAnalysis.find(item => item._id === "completed")?.count || 0,
      active: dropoffAnalysis.find(item => item._id === "active")?.count || 0,
      cancelled: dropoffAnalysis.find(item => item._id === "cancelled")?.count || 0
    };

    return {
      success: true,
      data: {
        totalCourses,
        activeCourses,
        totalEnrollments,
        totalRevenue,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
        averageRating: Math.round(ratingData.avgRating * 100) / 100,
        coursePerformanceList: topPerformingCourses,
        topPerformingCourses,
        underperformingCourses,
        enrollmentTrends: enrollmentTrends.map(item => ({
          month: item._id,
          enrollments: item.enrollments,
          completed: item.completed
        })),
        revenueByCourse,
        completionRatesByCourse,
        categoryPerformance: categoryPerformance.map(cat => ({
          categoryId: cat._id,
          name: cat.categoryName || "Unknown",
          coursesCount: cat.coursesCount,
          totalEnrollments: cat.totalEnrollments,
          avgCompletionRate: Math.round(cat.avgCompletionRate * 100) / 100
        })),
        instructorPerformance: instructorPerformance.map(inst => ({
          instructorId: inst._id,
          name: inst.instructorName || "Unknown",
          coursesCount: inst.coursesCount,
          totalEnrollments: inst.totalEnrollments,
          avgCompletionRate: Math.round(inst.avgCompletionRate * 100) / 100
        })),
        monthlyMetrics,
        satisfactionMetrics,
        engagementMetrics,
        dropoffAnalysis: {
          total: dropoffData.completed + dropoffData.active + dropoffData.cancelled,
          completed: dropoffData.completed,
          active: dropoffData.active,
          cancelled: dropoffData.cancelled,
          dropoffRate: (dropoffData.cancelled / (dropoffData.completed + dropoffData.active + dropoffData.cancelled)) * 100 || 0
        },
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          period
        }
      }
    };

  } catch (error) {
    console.error("Error in getCoursePerformance:", error);
    return {
      success: false,
      message: "خطا در دریافت گزارش عملکرد دوره‌ها",
      error: error.message
    };
  }
};
