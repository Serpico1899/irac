import { type ActFn, ObjectId } from "@deps";
import { type MyContext } from "@lib";
import { coreApp } from "../../../mod.ts";

const getCourseStatsFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const context = coreApp.contextFns.getContextModel() as MyContext;
  const { analyticsStartDate, analyticsEndDate } = context;

  const {
    course_id,
    category_id,
    instructor_id,
    include_metrics,
    group_by,
    limit,
    popular_courses_limit,
    include_detailed_breakdown
  } = set;

  // Build base filters for database queries
  const baseFilter: any = {};
  if (course_id) {
    baseFilter._id = new ObjectId(course_id);
  }
  if (category_id) {
    baseFilter.category = new ObjectId(category_id);
  }
  if (instructor_id) {
    baseFilter.instructor = new ObjectId(instructor_id);
  }

  // Date filter for enrollments
  const enrollmentDateFilter: any = {};
  if (analyticsStartDate && analyticsEndDate) {
    enrollmentDateFilter.created_at = {
      $gte: analyticsStartDate,
      $lte: analyticsEndDate
    };
  }

  const stats: any = {
    timeframe: {
      start_date: analyticsStartDate,
      end_date: analyticsEndDate,
      period_days: Math.ceil((analyticsEndDate.getTime() - analyticsStartDate.getTime()) / (1000 * 60 * 60 * 24))
    },
    generated_at: new Date(),
    filters: {
      course_id: course_id || null,
      category_id: category_id || null,
      instructor_id: instructor_id || null
    }
  };

  try {
    // 1. Course Counts by Status and Type
    if (include_metrics.includes("course_counts")) {
      const courseCountsPipeline = [
        { $match: baseFilter },
        {
          $group: {
            _id: {
              status: "$status",
              type: "$type"
            },
            count: { $sum: 1 },
            total_students: { $sum: "$total_students" },
            avg_price: { $avg: "$price" },
            total_revenue_potential: { $sum: { $multiply: ["$price", "$total_students"] } }
          }
        },
        {
          $group: {
            _id: null,
            by_status: {
              $push: {
                status: "$_id.status",
                type: "$_id.type",
                count: "$count",
                total_students: "$total_students",
                avg_price: "$avg_price",
                revenue_potential: "$total_revenue_potential"
              }
            },
            total_courses: { $sum: "$count" },
            total_enrolled_students: { $sum: "$total_students" }
          }
        }
      ];

      const courseCounts = await coreApp.odm.db
        .collection("courses")
        .aggregate(courseCountsPipeline)
        .toArray();

      stats.course_counts = courseCounts[0] || {
        by_status: [],
        total_courses: 0,
        total_enrolled_students: 0
      };

      // Additional breakdown by type only
      const typeBreakdown = await coreApp.odm.db
        .collection("courses")
        .aggregate([
          { $match: baseFilter },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
              active_count: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
              avg_students: { $avg: "$total_students" },
              avg_rating: { $avg: "$average_rating" }
            }
          }
        ])
        .toArray();

      stats.course_counts.by_type = typeBreakdown;
    }

    // 2. Enrollment Statistics
    if (include_metrics.includes("enrollment_stats")) {
      const enrollmentFilter = { ...enrollmentDateFilter };
      if (course_id) {
        enrollmentFilter.course = new ObjectId(course_id);
      }

      const enrollmentStats = await coreApp.odm.db
        .collection("enrollments")
        .aggregate([
          { $match: enrollmentFilter },
          {
            $lookup: {
              from: "courses",
              localField: "course",
              foreignField: "_id",
              as: "courseInfo"
            }
          },
          { $unwind: "$courseInfo" },
          ...(category_id ? [{ $match: { "courseInfo.category": new ObjectId(category_id) } }] : []),
          ...(instructor_id ? [{ $match: { "courseInfo.instructor": new ObjectId(instructor_id) } }] : []),
          {
            $group: {
              _id: {
                status: "$status",
                course_type: "$courseInfo.type"
              },
              count: { $sum: 1 },
              total_amount: { $sum: "$payment_amount" },
              avg_progress: { $avg: "$progress_percentage" }
            }
          }
        ])
        .toArray();

      // Calculate completion rates
      const completionStats = await coreApp.odm.db
        .collection("enrollments")
        .aggregate([
          { $match: enrollmentFilter },
          {
            $group: {
              _id: null,
              total_enrollments: { $sum: 1 },
              completed_enrollments: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
              active_enrollments: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
              cancelled_enrollments: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
              avg_completion_time: { $avg: { $subtract: ["$completion_date", "$enrollment_date"] } }
            }
          }
        ])
        .toArray();

      const completionData = completionStats[0] || {};
      stats.enrollment_stats = {
        by_status: enrollmentStats,
        completion_rate: completionData.total_enrollments > 0
          ? (completionData.completed_enrollments / completionData.total_enrollments * 100).toFixed(2)
          : 0,
        total_enrollments: completionData.total_enrollments || 0,
        active_enrollments: completionData.active_enrollments || 0,
        completed_enrollments: completionData.completed_enrollments || 0,
        cancelled_enrollments: completionData.cancelled_enrollments || 0,
        avg_completion_days: completionData.avg_completion_time
          ? Math.round(completionData.avg_completion_time / (1000 * 60 * 60 * 24))
          : null
      };
    }

    // 3. Revenue Statistics
    if (include_metrics.includes("revenue_stats")) {
      const revenueStats = await coreApp.odm.db
        .collection("enrollments")
        .aggregate([
          { $match: { ...enrollmentDateFilter, payment_status: "Paid" } },
          {
            $lookup: {
              from: "courses",
              localField: "course",
              foreignField: "_id",
              as: "courseInfo"
            }
          },
          { $unwind: "$courseInfo" },
          ...(course_id ? [{ $match: { course: new ObjectId(course_id) } }] : []),
          ...(category_id ? [{ $match: { "courseInfo.category": new ObjectId(category_id) } }] : []),
          ...(instructor_id ? [{ $match: { "courseInfo.instructor": new ObjectId(instructor_id) } }] : []),
          {
            $group: {
              _id: {
                course_type: "$courseInfo.type",
                payment_method: "$payment_method"
              },
              total_revenue: { $sum: "$payment_amount" },
              transaction_count: { $sum: 1 },
              avg_transaction: { $avg: "$payment_amount" }
            }
          },
          {
            $group: {
              _id: null,
              total_revenue: { $sum: "$total_revenue" },
              total_transactions: { $sum: "$transaction_count" },
              by_type_and_method: { $push: "$$ROOT" }
            }
          }
        ])
        .toArray();

      // Monthly revenue trend
      const monthlyRevenue = await coreApp.odm.db
        .collection("enrollments")
        .aggregate([
          { $match: { ...enrollmentDateFilter, payment_status: "Paid" } },
          {
            $group: {
              _id: {
                year: { $year: "$payment_date" },
                month: { $month: "$payment_date" }
              },
              revenue: { $sum: "$payment_amount" },
              transactions: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
          { $limit: 12 } // Last 12 months
        ])
        .toArray();

      const revenueData = revenueStats[0] || {};
      stats.revenue_stats = {
        total_revenue: revenueData.total_revenue || 0,
        total_transactions: revenueData.total_transactions || 0,
        avg_transaction_amount: revenueData.total_transactions > 0
          ? (revenueData.total_revenue / revenueData.total_transactions).toFixed(2)
          : 0,
        by_type_and_method: revenueData.by_type_and_method || [],
        monthly_trend: monthlyRevenue
      };
    }

    // 4. Popular Courses
    if (include_metrics.includes("popular_courses")) {
      const popularCourses = await coreApp.odm.db
        .collection("courses")
        .aggregate([
          { $match: baseFilter },
          {
            $addFields: {
              popularity_score: {
                $add: [
                  { $multiply: ["$total_students", 3] },
                  { $multiply: ["$average_rating", 2] },
                  "$total_reviews"
                ]
              }
            }
          },
          {
            $lookup: {
              from: "enrollments",
              localField: "_id",
              foreignField: "course",
              as: "recent_enrollments",
              pipeline: [
                { $match: enrollmentDateFilter },
                { $count: "count" }
              ]
            }
          },
          {
            $addFields: {
              recent_enrollment_count: {
                $ifNull: [{ $arrayElemAt: ["$recent_enrollments.count", 0] }, 0]
              }
            }
          },
          { $sort: { popularity_score: -1, recent_enrollment_count: -1 } },
          { $limit: popular_courses_limit },
          {
            $project: {
              name: 1,
              name_en: 1,
              type: 1,
              status: 1,
              price: 1,
              total_students: 1,
              average_rating: 1,
              total_reviews: 1,
              popularity_score: 1,
              recent_enrollment_count: 1,
              instructor_name: 1
            }
          }
        ])
        .toArray();

      stats.popular_courses = popularCourses;
    }

    // 5. Instructor Performance
    if (include_metrics.includes("instructor_performance")) {
      const instructorStats = await coreApp.odm.db
        .collection("courses")
        .aggregate([
          { $match: { ...baseFilter, instructor: { $exists: true } } },
          {
            $lookup: {
              from: "users",
              localField: "instructor",
              foreignField: "_id",
              as: "instructorInfo"
            }
          },
          { $unwind: "$instructorInfo" },
          {
            $group: {
              _id: "$instructor",
              instructor_name: { $first: { $concat: ["$instructorInfo.first_name", " ", "$instructorInfo.last_name"] } },
              total_courses: { $sum: 1 },
              active_courses: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
              total_students: { $sum: "$total_students" },
              avg_rating: { $avg: "$average_rating" },
              total_reviews: { $sum: "$total_reviews" },
              avg_price: { $avg: "$price" },
              total_revenue_potential: { $sum: { $multiply: ["$price", "$total_students"] } }
            }
          },
          { $sort: { total_students: -1 } },
          { $limit: limit }
        ])
        .toArray();

      stats.instructor_performance = instructorStats;
    }

    // 6. Additional detailed breakdown if requested
    if (include_detailed_breakdown) {
      // Category performance
      const categoryStats = await coreApp.odm.db
        .collection("courses")
        .aggregate([
          { $match: { ...baseFilter, category: { $exists: true } } },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "categoryInfo"
            }
          },
          { $unwind: "$categoryInfo" },
          {
            $group: {
              _id: "$category",
              category_name: { $first: "$categoryInfo.name" },
              total_courses: { $sum: 1 },
              total_students: { $sum: "$total_students" },
              avg_rating: { $avg: "$average_rating" },
              avg_price: { $avg: "$price" }
            }
          },
          { $sort: { total_students: -1 } }
        ])
        .toArray();

      stats.category_performance = categoryStats;

      // Course status distribution over time
      const statusTrend = await coreApp.odm.db
        .collection("courses")
        .aggregate([
          { $match: baseFilter },
          {
            $group: {
              _id: {
                status: "$status",
                month: { $month: "$created_at" },
                year: { $year: "$created_at" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } },
          { $limit: 24 } // Last 24 months
        ])
        .toArray();

      stats.status_trend = statusTrend;
    }

    // 7. Summary metrics
    stats.summary = {
      total_courses: stats.course_counts?.total_courses || 0,
      total_active_courses: stats.course_counts?.by_status?.filter((s: any) => s.status === "Active").reduce((sum: number, item: any) => sum + item.count, 0) || 0,
      total_students: stats.course_counts?.total_enrolled_students || 0,
      total_revenue: stats.revenue_stats?.total_revenue || 0,
      avg_course_rating: 0, // Will be calculated below
      completion_rate: parseFloat(stats.enrollment_stats?.completion_rate || "0")
    };

    // Calculate average course rating
    if (stats.course_counts?.total_courses > 0) {
      const avgRatingResult = await coreApp.odm.db
        .collection("courses")
        .aggregate([
          { $match: { ...baseFilter, average_rating: { $gt: 0 } } },
          {
            $group: {
              _id: null,
              avg_rating: { $avg: "$average_rating" }
            }
          }
        ])
        .toArray();

      stats.summary.avg_course_rating = avgRatingResult[0]?.avg_rating?.toFixed(2) || 0;
    }

    console.log(`Course statistics generated successfully`);
    console.log(`Analyzed ${stats.summary.total_courses} courses with ${stats.summary.total_students} total students`);
    console.log(`Total revenue: ${stats.summary.total_revenue} IRR`);

    return {
      success: true,
      stats,
      message: "آمار دوره‌ها با موفقیت تولید شد",
      generated_at: new Date(),
      query_performance: {
        timeframe_days: stats.timeframe.period_days,
        total_courses_analyzed: stats.summary.total_courses
      }
    };

  } catch (error) {
    console.error("Error generating course statistics:", error);
    throw new Error("خطا در تولید آمار دوره‌ها: " + error.message);
  }
};

export default getCourseStatsFn;
