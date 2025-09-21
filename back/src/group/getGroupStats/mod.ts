import { lesan, string, object, array, number, optional, boolean } from "@deps";
import { coreApp } from "../../../mod.ts";

const getGroupStatsValidator = {
  set: {
    group_id: string(),
    include_members: optional(boolean()),
    include_enrollments: optional(boolean()),
    limit: optional(number()),
    offset: optional(number()),
  },
  get: object({
    success: boolean(),
    group_info: object({
      _id: string(),
      name: string(),
      type: string(),
      status: string(),
      group_code: string(),
      current_member_count: number(),
      max_members: number(),
      discount_percentage: number(),
      total_savings: number(),
      total_enrollments: number(),
      completed_courses: number(),
      certificates_issued: number(),
      leader: object({}),
      company_name: optional(string()),
    }),
    members: optional(array(object({
      _id: string(),
      user: object({}),
      status: string(),
      role: string(),
      join_date: string(),
      enrollments_count: number(),
      completed_courses: number(),
      total_savings: number(),
    }))),
    recent_enrollments: optional(array(object({
      _id: string(),
      user: object({}),
      course: object({}),
      enrollment_date: string(),
      status: string(),
      progress_percentage: number(),
      group_savings: number(),
    }))),
    statistics: object({
      active_members: number(),
      pending_members: number(),
      total_group_savings: number(),
      average_savings_per_member: number(),
      most_active_member: optional(object({})),
      completion_rate: number(),
    }),
  }),
};

export const getGroupStatsFn = lesan.Fn(getGroupStatsValidator, async (body, context, coreApp) => {
  // Check if user is authenticated
  if (!context?.user?._id) {
    throw new Error("User must be authenticated to view group statistics");
  }

  const groupModel = coreApp.odm.newModel("group", {}, {});
  const groupMemberModel = coreApp.odm.newModel("group_member", {}, {});
  const enrollmentModel = coreApp.odm.newModel("enrollment", {}, {});

  try {
    const {
      group_id,
      include_members = true,
      include_enrollments = true,
      limit = 50,
      offset = 0
    } = body.details.set;

    // Find and validate the group
    const group = await groupModel.findOne({
      filters: { _id: group_id },
      relations: {
        leader: {
          users: {
            _id: 1,
            first_name: 1,
            last_name: 1,
            mobile: 1,
          },
        },
      },
    });

    if (!group) {
      throw new Error("گروه مورد نظر یافت نشد");
    }

    // Check if current user has permission to view group statistics
    const currentUserMembership = await groupMemberModel.findOne({
      filters: {
        group: group_id,
        user: context.user._id,
      },
    });

    const isLeader = group.leader._id.toString() === context.user._id.toString();
    const isMember = !!currentUserMembership;
    const canViewStats = currentUserMembership?.role === "Admin" ||
      currentUserMembership?.role === "CoLeader" ||
      isLeader;

    if (!canViewStats && !isMember) {
      throw new Error("شما اجازه مشاهده آمار این گروه را ندارید");
    }

    // Prepare group basic info
    const groupInfo = {
      _id: group._id,
      name: group.name,
      type: group.type,
      status: group.status,
      group_code: group.group_code,
      current_member_count: group.current_member_count,
      max_members: group.max_members,
      discount_percentage: group.current_discount_percentage,
      total_savings: group.total_savings,
      total_enrollments: group.total_enrollments,
      completed_courses: group.completed_courses,
      certificates_issued: group.certificates_issued,
      leader: group.leader,
      company_name: group.company_name,
    };

    let members = undefined;
    let recentEnrollments = undefined;

    // Get group members if requested
    if (include_members && canViewStats) {
      const membersList = await groupMemberModel.findMany({
        filters: { group: group_id },
        relations: {
          user: {
            users: {
              _id: 1,
              first_name: 1,
              last_name: 1,
              mobile: 1,
            },
          },
        },
        sorts: { join_date: -1 },
        limit,
        offset,
      });

      members = membersList.map(member => ({
        _id: member._id,
        user: member.user,
        status: member.status,
        role: member.role,
        join_date: member.join_date.toISOString(),
        enrollments_count: member.enrollments_count,
        completed_courses: member.completed_courses,
        total_savings: member.total_savings,
      }));
    }

    // Get recent enrollments if requested
    if (include_enrollments && canViewStats) {
      const enrollmentsList = await enrollmentModel.findMany({
        filters: {
          group: group_id,
          is_group_enrollment: true,
        },
        relations: {
          user: {
            users: {
              _id: 1,
              first_name: 1,
              last_name: 1,
            },
          },
          course: {
            courses: {
              _id: 1,
              title: 1,
              price: 1,
            },
          },
        },
        sorts: { enrollment_date: -1 },
        limit: 10,
      });

      recentEnrollments = enrollmentsList.map(enrollment => ({
        _id: enrollment._id,
        user: enrollment.user,
        course: enrollment.course,
        enrollment_date: enrollment.enrollment_date.toISOString(),
        status: enrollment.status,
        progress_percentage: enrollment.progress_percentage,
        group_savings: enrollment.group_savings,
      }));
    }

    // Calculate detailed statistics
    const allMembers = await groupMemberModel.findMany({
      filters: { group: group_id },
    });

    const activeMembers = allMembers.filter(m => m.status === "Active").length;
    const pendingMembers = allMembers.filter(m => m.status === "Pending").length;

    const totalGroupSavings = group.total_savings;
    const averageSavingsPerMember = activeMembers > 0
      ? Math.round(totalGroupSavings / activeMembers)
      : 0;

    // Find most active member (by enrollments)
    let mostActiveMember = undefined;
    if (canViewStats && allMembers.length > 0) {
      const sortedMembers = allMembers.sort((a, b) => b.enrollments_count - a.enrollments_count);
      if (sortedMembers[0].enrollments_count > 0) {
        const topMember = await groupMemberModel.findOne({
          filters: { _id: sortedMembers[0]._id },
          relations: {
            user: {
              users: {
                _id: 1,
                first_name: 1,
                last_name: 1,
              },
            },
          },
        });

        if (topMember) {
          mostActiveMember = {
            user: topMember.user,
            enrollments_count: topMember.enrollments_count,
            completed_courses: topMember.completed_courses,
          };
        }
      }
    }

    // Calculate completion rate
    const totalEnrollments = group.total_enrollments;
    const completedCourses = group.completed_courses;
    const completionRate = totalEnrollments > 0
      ? Math.round((completedCourses / totalEnrollments) * 100)
      : 0;

    const statistics = {
      active_members: activeMembers,
      pending_members: pendingMembers,
      total_group_savings: totalGroupSavings,
      average_savings_per_member: averageSavingsPerMember,
      most_active_member: mostActiveMember,
      completion_rate: completionRate,
    };

    return {
      success: true,
      body: {
        success: true,
        group_info: groupInfo,
        members,
        recent_enrollments: recentEnrollments,
        statistics,
      },
    };

  } catch (error) {
    console.error("Error getting group statistics:", error);
    throw new Error(`خطا در دریافت آمار گروه: ${error.message}`);
  }
});

export default getGroupStatsFn;
