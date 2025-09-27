import { ActFn, ObjectId } from "@deps";
import { groups, group_members, users } from "@model";
import { generateUniqueCode } from "@lib";

export interface CreateGroupInput {
  name: string;
  description?: string;
  type?: "Regular" | "Corporate";
  max_members?: number;
  min_members_for_discount?: number;

  // Corporate specific fields
  company_name?: string;
  company_registration_number?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  billing_contact_name?: string;
  billing_contact_email?: string;
  centralized_billing?: boolean;

  // Group configuration
  auto_approve_members?: boolean;
  allow_member_self_enroll?: boolean;
  require_leader_approval?: boolean;

  notes?: string;
}

export interface CreateGroupOutput {
  message: string;
  group: {
    _id: string;
    name: string;
    description?: string;
    type: string;
    group_code: string;
    leader: any;
    current_member_count: number;
    max_members: number;
    company_name?: string;
    centralized_billing: boolean;
    auto_approve_members: boolean;
    allow_member_self_enroll: boolean;
    require_leader_approval: boolean;
    created_at: string;
    updated_at: string;
  };
}

const createGroupHandler: ActFn = async (body) => {
  const {
    name,
    description,
    type = "Regular",
    max_members = 50,
    min_members_for_discount = 3,
    company_name,
    company_registration_number,
    company_address,
    company_phone,
    company_email,
    billing_contact_name,
    billing_contact_email,
    centralized_billing = false,
    auto_approve_members = true,
    allow_member_self_enroll = true,
    require_leader_approval = false,
    notes
  }: CreateGroupInput = body.details;

  try {
    // Check if user is authenticated
    if (!body.user?._id) {
      throw new Error("User must be authenticated to create a group");
    }

    // Generate unique group code
    let group_code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      group_code = generateUniqueCode(8, "GROUP");

      // Check if code already exists
      const existingGroup = await groups().findOne({
        filters: { group_code },
      });

      isUnique = !existingGroup;
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error("Unable to generate unique group code. Please try again.");
      }
    } while (!isUnique);

    // Validate corporate fields
    if (type === "Corporate") {
      if (!company_name) {
        throw new Error("Company name is required for corporate groups");
      }
    }

    // Create the group
    const groupData = {
      name,
      description,
      group_code: group_code!,
      type,
      max_members,
      min_members_for_discount,
      current_member_count: 1, // Leader is the first member

      // Corporate fields
      company_name,
      company_registration_number,
      company_address,
      company_phone,
      company_email,
      billing_contact_name,
      billing_contact_email,
      centralized_billing,

      // Group configuration
      auto_approve_members,
      allow_member_self_enroll,
      require_leader_approval,

      notes,

      created_at: new Date(),
      updated_at: new Date(),
    };

    const createdGroup = await groups().insertOne({
      doc: groupData,
      relations: {
        leader: body.user._id,
      },
    });

    if (!createdGroup) {
      throw new Error("Failed to create group");
    }

    // Add the leader as the first group member
    const groupMemberData = {
      status: "Active",
      join_date: new Date(),
      approved_date: new Date(),
      role: "Admin",
      can_invite_others: true,
      can_approve_members: true,
      enrollments_count: 0,
      completed_courses: 0,
      total_savings: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await group_members().insertOne({
      doc: groupMemberData,
      relations: {
        group: createdGroup._id.toString(),
        user: body.user._id,
        approved_by: body.user._id,
      },
    });

    // Get the complete group with relations
    const completeGroup = await groups().findOne({
      filters: { _id: new ObjectId(createdGroup._id) },
      populate: {
        leader: {
          first_name: 1,
          last_name: 1,
          mobile: 1,
        },
      },
    });

    const result: CreateGroupOutput = {
      message: `گروه "${name}" با موفقیت ایجاد شد`,
      group: {
        _id: completeGroup!._id.toString(),
        name: completeGroup!.name,
        description: completeGroup!.description,
        type: completeGroup!.type,
        group_code: completeGroup!.group_code,
        leader: completeGroup!.leader,
        current_member_count: completeGroup!.current_member_count,
        max_members: completeGroup!.max_members,
        company_name: completeGroup!.company_name,
        centralized_billing: completeGroup!.centralized_billing,
        auto_approve_members: completeGroup!.auto_approve_members,
        allow_member_self_enroll: completeGroup!.allow_member_self_enroll,
        require_leader_approval: completeGroup!.require_leader_approval,
        created_at: completeGroup!.created_at.toISOString(),
        updated_at: completeGroup!.updated_at.toISOString(),
      },
    };

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Error creating group:", error);
    return {
      success: false,
      message: `خطا در ایجاد گروه: ${error.message}`,
      error: error.message
    };
  }
};

export default createGroupHandler;
