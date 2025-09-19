import { type ActFn, ObjectId } from "@deps";
import { type MyContext } from "@lib";
import { coreApp } from "../../../mod.ts";

const getCourseEnrollmentsFn: ActFn = async (body) => {
  const { set, get } = body.details;
  const context = coreApp.contextFns.getContextModel() as MyContext;
  const { existingCourse, enrollmentFilters, searchQuery } = context;

  const {
    page,
    limit,
    sort_by,
    sort_order,
    include_fields,
    min_progress,
    max_progress,
    export_format,
    include_summary_stats
  } = set;

  try {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline: any[] = [
      // Match enrollments for this course
      { $match: enrollmentFilters }
    ];

    // Add progress range filter if specified
    if (min_progress !== undefined || max_progress !== undefined) {
      const progressFilter: any = {};
      if (min_progress !== undefined) {
        progressFilter.$gte = min_progress;
      }
      if (max_progress !== undefined) {
        progressFilter.$lte = max_progress;
      }
      pipeline.push({
        $match: { progress_percentage: progressFilter }
      });
    }

    // Join with user data
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
        pipeline: [
          {
            $project: {
              first_name: 1,
              last_name: 1,
              email: 1,
              mobile: 1,
              level: 1,
              created_at: 1,
              profile_image: 1,
              city: 1,
              province: 1
            }
          }
        ]
      }
    });

    pipeline.push({ $unwind: "$userInfo" });

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim()) {
      const searchRegex = new RegExp(searchQuery.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { "userInfo.first_name": searchRegex },
            { "userInfo.last_name": searchRegex },
            { "userInfo.email": searchRegex },
            { "userInfo.mobile": searchRegex },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"] },
                  regex: searchQuery.trim(),
                  options: "i"
                }
              }
            }
          ]
        }
      });
    }

    // Add computed fields
    pipeline.push({
      $addFields: {
        user_full_name: { $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"] },
        enrollment_duration_days: {
          $cond: {
            if: "$completion_date",
            then: {
              $divide: [
                { $subtract: ["$completion_date", "$enrollment_date"] },
                1000 * 60 * 60 * 24
              ]
            },
            else: {
              $divide: [
                { $subtract: [new Date(), "$enrollment_date"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        is_overdue: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$status", "Active"] },
                { $ne: ["$completion_date", null] },
                { $lt: ["$completion_date", new Date()] }
              ]
            },
            then: true,
            else: false
          }
        }
      }
    });

    // Count total documents for pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await coreApp.odm.db
      .collection("enrollments")
      .aggregate(countPipeline)
      .toArray();

    const totalCount = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Apply sorting
    const sortObj: any = {};
    switch (sort_by) {
      case "user_name":
        sortObj["userInfo.first_name"] = sort_order === "asc" ? 1 : -1;
        sortObj["userInfo.last_name"] = sort_order === "asc" ? 1 : -1;
        break;
      case "enrollment_date":
        sortObj.enrollment_date = sort_order === "asc" ? 1 : -1;
        break;
      case "progress_percentage":
        sortObj.progress_percentage = sort_order === "asc" ? 1 : -1;
        break;
      case "payment_amount":
        sortObj.payment_amount = sort_order === "asc" ? 1 : -1;
        break;
      case "completion_date":
        sortObj.completion_date = sort_order === "asc" ? 1 : -1;
        break;
      default:
        sortObj.enrollment_date = -1; // Default: newest first
    }

    pipeline.push({ $sort: sortObj });

    // Apply pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Project fields based on include_fields
    const projectFields: any = {
      _id: 1,
      status: 1,
      enrollment_date: 1,
      user_full_name: 1,
      enrollment_duration_days: 1,
      is_overdue: 1
    };

    if (include_fields.includes("user_details")) {
      projectFields.userInfo = 1;
    }

    if (include_fields.includes("payment_info")) {
      projectFields.payment_status = 1;
      projectFields.payment_amount = 1;
      projectFields.payment_method = 1;
      projectFields.payment_date = 1;
      projectFields.payment_reference = 1;
      projectFields.discount_applied = 1;
      projectFields.discount_amount = 1;
      projectFields.final_amount = 1;
    }

    if (include_fields.includes("progress_info")) {
      projectFields.progress_percentage = 1;
      projectFields.lessons_completed = 1;
      projectFields.total_lessons = 1;
      projectFields.completion_points_earned = 1;
      projectFields.completion_points_required = 1;
      projectFields.completion_date = 1;
    }

    if (include_fields.includes("enrollment_info")) {
      projectFields.enrolled_by_admin = 1;
      projectFields.admin_notes = 1;
      projectFields.source = 1;
      projectFields.referral_code = 1;
      projectFields.certificate_issued = 1;
      projectFields.certificate_number = 1;
    }

    pipeline.push({ $project: projectFields });

    // Execute the main query
    const enrollments = await coreApp.odm.db
      .collection("enrollments")
      .aggregate(pipeline)
      .toArray();

    // Generate summary statistics if requested
    let summaryStats: any = null;
    if (include_summary_stats) {
      const statsResult = await coreApp.odm.db
        .collection("enrollments")
        .aggregate([
          { $match: { course: existingCourse._id } },
          {
            $group: {
              _id: null,
              total_enrollments: { $sum: 1 },
              active_enrollments: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
              completed_enrollments: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
              cancelled_enrollments: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
              pending_enrollments: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
              total_revenue: { $sum: { $cond: [{ $eq: ["$payment_status", "Paid"] }, "$payment_amount", 0] } },
              avg_progress: { $avg: "$progress_percentage" },
              avg_completion_time: {
                $avg: {
                  $cond: [
                    { $and: [{ $ne: ["$completion_date", null] }, { $ne: ["$enrollment_date", null] }] },
                    { $divide: [{ $subtract: ["$completion_date", "$enrollment_date"] }, 1000 * 60 * 60 * 24] },
                    null
                  ]
                }
              }
            }
          }
        ])
        .toArray();

      const stats = statsResult[0] || {};
      summaryStats = {
        total_enrollments: stats.total_enrollments || 0,
        active_enrollments: stats.active_enrollments || 0,
        completed_enrollments: stats.completed_enrollments || 0,
        cancelled_enrollments: stats.cancelled_enrollments || 0,
        pending_enrollments: stats.pending_enrollments || 0,
        completion_rate: stats.total_enrollments > 0
          ? ((stats.completed_enrollments / stats.total_enrollments) * 100).toFixed(2)
          : 0,
        total_revenue: stats.total_revenue || 0,
        avg_progress: stats.avg_progress ? stats.avg_progress.toFixed(2) : 0,
        avg_completion_days: stats.avg_completion_time ? Math.round(stats.avg_completion_time) : null
      };

      // Add status distribution
      const statusBreakdown = await coreApp.odm.db
        .collection("enrollments")
        .aggregate([
          { $match: { course: existingCourse._id } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              total_amount: { $sum: "$payment_amount" }
            }
          }
        ])
        .toArray();

      summaryStats.status_breakdown = statusBreakdown;

      // Add payment status breakdown
      const paymentBreakdown = await coreApp.odm.db
        .collection("enrollments")
        .aggregate([
          { $match: { course: existingCourse._id } },
          {
            $group: {
              _id: "$payment_status",
              count: { $sum: 1 },
              total_amount: { $sum: "$payment_amount" }
            }
          }
        ])
        .toArray();

      summaryStats.payment_breakdown = paymentBreakdown;
    }

    const response = {
      success: true,
      course: {
        _id: existingCourse._id,
        name: existingCourse.name,
        name_en: existingCourse.name_en,
        type: existingCourse.type,
        status: existingCourse.status,
        total_students: existingCourse.total_students || 0
      },
      enrollments,
      pagination: {
        current_page: page,
        per_page: limit,
        total_count: totalCount,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1
      },
      filters: {
        enrollment_status: enrollmentFilters.status,
        payment_status: enrollmentFilters.payment_status,
        search_query: searchQuery,
        progress_range: {
          min: min_progress,
          max: max_progress
        }
      },
      sorting: {
        sort_by: sort_by,
        sort_order: sort_order
      },
      message: `${totalCount} ثبت‌نام برای دوره ${existingCourse.name} یافت شد`,
      generated_at: new Date()
    };

    if (summaryStats) {
      response.summary_stats = summaryStats;
    }

    console.log(`Retrieved ${enrollments.length} enrollments for course ${existingCourse.name} (Page ${page}/${totalPages})`);
    console.log(`Total enrollments: ${totalCount}, Search: ${searchQuery || 'none'}`);

    return response;

  } catch (error) {
    console.error("Error retrieving course enrollments:", error);
    throw new Error("خطا در دریافت لیست ثبت‌نام‌های دوره: " + error.message);
  }
};

export default getCourseEnrollmentsFn;
