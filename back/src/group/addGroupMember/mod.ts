import { lesan, string, object, optional, boolean, enums } from "@deps";
import { coreApp } from "../../../mod.ts";

const addGroupMemberValidator = {
  set: {
    group_id: string(),
    user_id: optional(string()),
    user_mobile: optional(string()),
    user_email: optional(string()),
    role: optional(enums(["Member", "CoLeader", "Admin"])),
    can_invite_others: optional(boolean()),
    can_approve_members: optional(boolean()),
    auto_approve: optional(boolean()),
    notes: optional(string()),
  },
  get: object({
    success: boolean(),
    message: string(),
    member: optional(object({
      _id: string(),
      user: object({}),
      status: string(),
      role: string(),
      join_date: string(),
    })),
  }),
};

export const addGroupMemberFn = lesan.Fn(addGroupMemberValidator, async (body, context, coreApp) => {
  // Check if user is authenticated
  if (!context?.user?._id) {
    throw new Error("User must be authenticated to add group members");
  }

  const groupModel = coreApp.odm.newModel("group", {}, {});
  const groupMemberModel = coreApp.odm.newModel("group_member", {}, {});
  const userModel = coreApp.odm.newModel("user", {}, {});

  try {
    const { group_id, user_id, user_mobile, user_email } = body.details.set;

    // Validate input - at least one identifier must be provided
    if (!user_id && !user_mobile && !user_email) {
      throw new Error("User ID, mobile, or email must be provided");
    }

    // Find the group
    const group = await groupModel.findOne({
      filters: { _id: group_id },
      relations: {
        leader: {
          users: {
            _id: 1,
            first_name: 1,
            last_name: 1,
          },
        },
      },
    });

    if (!group) {
      throw new Error("گروه مورد نظر یافت نشد");
    }

    // Check if current user has permission to add members
    const currentUserMembership = await groupMemberModel.findOne({
      filters: {
        group: group_id,
        user: context.user._id,
      },
    });

    const isLeader = group.leader._id.toString() === context.user._id.toString();
    const canAddMembers = currentUserMembership?.can_approve_members ||
      currentUserMembership?.role === "Admin" ||
      isLeader;

    if (!canAddMembers) {
      throw new Error("شما اجازه افزودن عضو به این گروه را ندارید");
    }

    // Check group capacity
    if (group.current_member_count >= group.max_members) {
      throw new Error(`حداکثر ظرفیت گروه (${group.max_members} نفر) تکمیل شده است`);
    }

    // Find the target user
    let targetUser;
    if (user_id) {
      targetUser = await userModel.findOne({
        filters: { _id: user_id },
      });
    } else if (user_mobile) {
      targetUser = await userModel.findOne({
        filters: { mobile: user_mobile },
      });
    } else if (user_email) {
      // Assuming user model has email field, or search by mobile as proxy
      targetUser = await userModel.findOne({
        filters: { mobile: user_email }, // Adjust based on actual schema
      });
    }

    if (!targetUser) {
      throw new Error("کاربر مورد نظر یافت نشد");
    }

    // Check if user is already a member
    const existingMembership = await groupMemberModel.findOne({
      filters: {
        group: group_id,
        user: targetUser._id,
      },
    });

    if (existingMembership) {
      if (existingMembership.status === "Active") {
        throw new Error("این کاربر قبلاً عضو گروه است");
      } else if (existingMembership.status === "Pending") {
        throw new Error("درخواست عضویت این کاربر در انتظار تأیید است");
      }
    }

    // Determine if member should be auto-approved
    const shouldAutoApprove = body.details.set.auto_approve !== false &&
      (group.auto_approve_members || isLeader);

    // Create group member
    const memberData = {
      status: shouldAutoApprove ? "Active" : "Pending",
      join_date: new Date(),
      approved_date: shouldAutoApprove ? new Date() : undefined,
      role: body.details.set.role || "Member",
      can_invite_others: body.details.set.can_invite_others || false,
      can_approve_members: body.details.set.can_approve_members || false,
      enrollments_count: 0,
      completed_courses: 0,
      total_savings: 0,
      notes: body.details.set.notes,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const newMember = await groupMemberModel.insertOne({
      doc: memberData,
      relations: {
        group: group_id,
        user: targetUser._id,
        approved_by: shouldAutoApprove ? context.user._id : undefined,
      },
    });

    if (!newMember) {
      throw new Error("خطا در افزودن عضو به گروه");
    }

    // Update group member count if approved
    if (shouldAutoApprove) {
      await groupModel.updateOne({
        filters: { _id: group_id },
        update: {
          $inc: { current_member_count: 1 },
          $set: { updated_at: new Date() },
        },
      });
    }

    // Get the complete member data with user info
    const completeMember = await groupMemberModel.findOne({
      filters: { _id: newMember._id },
      relations: {
        user: {
          users: {
            first_name: 1,
            last_name: 1,
            mobile: 1,
          },
        },
      },
    });

    const statusMessage = shouldAutoApprove ?
      `${targetUser.first_name} ${targetUser.last_name} با موفقیت به گروه اضافه شد` :
      `درخواست عضویت ${targetUser.first_name} ${targetUser.last_name} ارسال شد و منتظر تأیید است`;

    return {
      success: true,
      body: {
        success: true,
        message: statusMessage,
        member: completeMember ? {
          _id: completeMember._id,
          user: completeMember.user,
          status: completeMember.status,
          role: completeMember.role,
          join_date: completeMember.join_date.toISOString(),
        } : undefined,
      },
    };

  } catch (error) {
    console.error("Error adding group member:", error);
    throw new Error(`خطا در افزودن عضو: ${error.message}`);
  }
});

export default addGroupMemberFn;
