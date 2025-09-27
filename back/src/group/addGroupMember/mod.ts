import { ActFn, ObjectId } from "@deps";
import { groups, group_members, users } from "@model";

export interface AddGroupMemberInput {
  group_id: string;
  user_id?: string;
  user_mobile?: string;
  user_email?: string;
  role?: "Member" | "CoLeader" | "Admin";
  can_invite_others?: boolean;
  can_approve_members?: boolean;
  auto_approve?: boolean;
  notes?: string;
}

export interface AddGroupMemberOutput {
  success: boolean;
  message: string;
  member?: {
    _id: string;
    user: any;
    status: string;
    role: string;
    join_date: string;
  };
}

const addGroupMemberHandler: ActFn = async (body) => {
  const {
    group_id,
    user_id,
    user_mobile,
    user_email,
    role = "Member",
    can_invite_others = false,
    can_approve_members = false,
    auto_approve = true,
    notes
  }: AddGroupMemberInput = body.details;

  try {
    // Check if user is authenticated
    if (!body.user?._id) {
      throw new Error("User must be authenticated to add group members");
    }

    // Validate input - at least one identifier must be provided
    if (!user_id && !user_mobile && !user_email) {
      throw new Error("User ID, mobile, or email must be provided");
    }

    // Find the group
    const group = await groups().findOne({
      filters: { _id: new ObjectId(group_id) },
      populate: {
        leader: {
          _id: 1,
          first_name: 1,
          last_name: 1,
        },
      },
    });

    if (!group) {
      throw new Error("گروه مورد نظر یافت نشد");
    }

    // Check if current user has permission to add members
    const currentUserMembership = await group_members().findOne({
      filters: {
        "group._id": new ObjectId(group_id),
        "user._id": new ObjectId(body.user._id),
      },
    });

    const isLeader = group.leader._id.toString() === body.user._id.toString();
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
      targetUser = await users().findOne({
        filters: { _id: new ObjectId(user_id) },
      });
    } else if (user_mobile) {
      targetUser = await users().findOne({
        filters: { mobile: user_mobile },
      });
    } else if (user_email) {
      targetUser = await users().findOne({
        filters: { email: user_email },
      });
    }

    if (!targetUser) {
      throw new Error("کاربر مورد نظر یافت نشد");
    }

    // Check if user is already a member
    const existingMembership = await group_members().findOne({
      filters: {
        "group._id": new ObjectId(group_id),
        "user._id": new ObjectId(targetUser._id),
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
    const shouldAutoApprove = auto_approve !== false &&
      (group.auto_approve_members || isLeader);

    // Create group member
    const memberData = {
      status: shouldAutoApprove ? "Active" : "Pending",
      join_date: new Date(),
      approved_date: shouldAutoApprove ? new Date() : undefined,
      role: role,
      can_invite_others: can_invite_others,
      can_approve_members: can_approve_members,
      enrollments_count: 0,
      completed_courses: 0,
      total_savings: 0,
      notes: notes,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const newMember = await group_members().insertOne({
      doc: memberData,
      relations: {
        group: group_id,
        user: targetUser._id.toString(),
        approved_by: shouldAutoApprove ? body.user._id : undefined,
      },
    });

    if (!newMember) {
      throw new Error("خطا در افزودن عضو به گروه");
    }

    // Update group member count if approved
    if (shouldAutoApprove) {
      await groups().updateOne({
        filters: { _id: new ObjectId(group_id) },
        update: {
          $inc: { current_member_count: 1 },
          $set: { updated_at: new Date() },
        },
      });
    }

    // Get the complete member data with user info
    const completeMember = await group_members().findOne({
      filters: { _id: new ObjectId(newMember._id) },
      populate: {
        user: {
          first_name: 1,
          last_name: 1,
          mobile: 1,
        },
      },
    });

    const statusMessage = shouldAutoApprove ?
      `${targetUser.first_name} ${targetUser.last_name} با موفقیت به گروه اضافه شد` :
      `درخواست عضویت ${targetUser.first_name} ${targetUser.last_name} ارسال شد و منتظر تأیید است`;

    const result: AddGroupMemberOutput = {
      success: true,
      message: statusMessage,
      member: completeMember ? {
        _id: completeMember._id.toString(),
        user: completeMember.user,
        status: completeMember.status,
        role: completeMember.role,
        join_date: completeMember.join_date.toISOString(),
      } : undefined,
    };

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error("Error adding group member:", error);
    return {
      success: false,
      message: `خطا در افزودن عضو: ${error.message}`,
      error: error.message
    };
  }
};

export default addGroupMemberHandler;
