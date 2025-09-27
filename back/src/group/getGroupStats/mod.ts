import { ActFn, ObjectId } from "@deps";
import { groups, group_members, enrollments } from "@model";

export interface GetGroupStatsInput {
  group_id: string;
  include_members?: boolean;
  include_enrollments?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetGroupStatsOutput {
  success: boolean;
  group_info: {
    _id: string;
    name: string;
    type: string;
    status: string;
    group_code: string;
    current_member_count: number;
    max_members: number;
    discount_percentage: number;
    total_savings: number;
    total_enrollments: number;
    completed_courses: number;
    certificates_issued: number;
    leader: any;
    company_name?: string;
  };
  members?: Array<{
    _id: string;
    user: any;
    status: string;
    role: string;
    join_date: string;
    enrollments_count: number;
    completed_courses: number;
    total_savings: number;
  }>;
  recent_enrollments?: Array<{
    _id: string;
    user: any;
    course: any;
    enrollment_date: string;
    status: string;
    progress_percentage: number;
    group_savings: number;
  }>;
  statistics: {
    active_members: number;
    pending_members: number;
    total_group_savings: number;
    average_savings_per_member: number;
    most_active_member?: any;
    completion_rate: number;
  };
}

const getGroupStatsHandler: ActFn = async (body) => {
  const {
    group_id,
    include_members = false,
    include_enrollments = false,
    limit = 20,
    offset = 0
  }: GetGroupStatsInput = body.details;

  try {
    // Check if user is authenticated
    if (!body.user?._id) {
      throw new Error("User must be authenticated to view group statistics");
    }

    // Find the group with leader information
    const group = await groups().findOne({
      filters: { _id: new ObjectId(group_id) },
      populate: {
        leader: {
          first_name: 1,
          last_name: 1,
          mobile: 1,
          email: 1,
        },
      },
    });

    if (!group) {
      throw new Error("گروه مورد نظر یافت نشد");
    }

    // Check if user has permission to view group stats
    const userMembership = await group_members().findOne({
      filters: {
        "group._id": new ObjectId(group_id),
        "user._id": new ObjectId(body.user._id),
      },
    });

    const isLeader = group.leader._id.toString() === body.user._id.toString();
    const hasPermission = isLeader ||
      userMembership?.role === "Admin" ||
      userMembership?.role === "CoLeader";

    if (!hasPermission) {
      throw new Error("شما اجازه مشاهده آمار این گروه را ندارید");
    }

    // Get group members statistics
    const memberStats = await group_members().aggregation().pipeline([
      { $match: { "group._id": new ObjectId(group_id) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total_savings: { $sum: "$total_savings" },
          completed_courses: { $sum: "$completed_courses" },
        }
      }
    ]);

    let activeMembers = 0;
    let pendingMembers = 0;
    let totalGroupSavings = 0;
    let totalCompletedCourses = 0;

    memberStats.forEach(stat => {
      if (stat._id === "Active") {
        activeMembers = stat.count;
        totalGroupSavings += stat.total_savings;
        totalCompletedCourses += stat.completed_courses;
      } else if (stat._id === "Pending") {
        pendingMembers = stat.count;
      }
    });

    // Find most active member
    const mostActiveResult = await group_members().findOne({
      filters: {
        "group._id": new ObjectId(group_id),
        status: "Active",
      },
      sort: { enrollments_count: -1 },
      populate: {
        user: {
          first_name: 1,
          last_name: 1,
          mobile: 1,
        },
      },
    });

    // Calculate completion rate
    const totalEnrollments = await enrollments().countDocuments({
      filters: {
        "group._id": new ObjectId(group_id),
      },
    });

    const completedEnrollments = await enrollments().countDocuments({
      filters: {
        "group._id": new ObjectId(group_id),
        status: "Completed",
      },
    });

    const completionRate = totalEnrollments > 0 ?
      (completedEnrollments / totalEnrollments) * 100 : 0;

    // Prepare basic group info
    const groupInfo = {
      _id: group._id.toString(),
      name: group.name,
      type: group.type,
      status: group.status || "Active",
      group_code: group.group_code,
      current_member_count: group.current_member_count,
      max_members: group.max_members,
      discount_percentage: group.current_discount_percentage || 0,
      total_savings: group.total_savings || 0,
      total_enrollments: totalEnrollments,
      completed_courses: totalCompletedCourses,
      certificates_issued: group.certificates_issued || 0,
      leader: group.leader,
      company_name: group.company_name,
    };

    let members;
    if (include_members) {
      members = await group_members().find({
        filters: { "group._id": new ObjectId(group_id) },
        limit,
        offset,
        sort: { join_date: -1 },
        populate: {
          user: {
            first_name: 1,
            last_name: 1,
            mobile: 1,
            email: 1,
          },
        },
      });

      members = members.map(member => ({
        _id: member._id.toString(),
        user: member.user,
        status: member.status,
        role: member.role,
        join_date: member.join_date.toISOString(),
        enrollments_count: member.enrollments_count,
        completed_courses: member.completed_courses,
        total_savings: member.total_savings,
      }));
    }

    let recentEnrollments;
    if (include_enrollments) {
      const enrollmentResults = await enrollments().find({
        filters: { "group._id": new ObjectId(group_id) },
        limit,
        sort: { created_at: -1 },
        populate: {
          user: {
            first_name: 1,
            last_name: 1,
            mobile: 1,
          },
          course: {
            name: 1,
            name_en: 1,
            featured_image: 1,
            price: 1,
          },
        },
      });

      recentEnrollments = enrollmentResults.map(enrollment => ({
        _id: enrollment._id.toString(),
        user: enrollment.user,
        course: enrollment.course,
        enrollment_date: enrollment.created_at.toISOString(),
        status: enrollment.status,
        progress_percentage: enrollment.progress_percentage || 0,
        group_savings: enrollment.group_discount_amount || 0,
      }));
    }

    const statistics = {
      active_members: activeMembers,
      pending_members: pendingMembers,
      total_group_savings: totalGroupSavings,
      average_savings_per_member: activeMembers > 0 ? totalGroupSavings / activeMembers : 0,
      most_active_member: mostActiveResult ? {
        user: mostActiveResult.user,
        enrollments_count: mostActiveResult.enrollments_count,
        completed_courses: mostActiveResult.completed_courses,
      } : undefined,
      completion_rate: Math.round(completionRate * 100) / 100,
    };

    const result: GetGroupStatsOutput = {
      success: true,
      group_info: groupInfo,
      members,
      recent_enrollments: recentEnrollments,
      statistics,
    };

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error("Error fetching group statistics:", error);
    return {
      success: false,
      message: `خطا در دریافت آمار گروه: ${error.message}`,
      error: error.message
    };
  }
};

export default getGroupStatsHandler;
