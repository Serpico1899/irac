import { lesan, number, object, string, enums, optional, boolean } from "@deps";
import { coreApp } from "../../../mod.ts";
import { generateUniqueCode } from "@lib";
import { group_type_enums } from "../../../models/mod.ts";

const createGroupValidator = {
  set: {
    name: string(),
    description: optional(string()),
    type: optional(group_type_enums),
    max_members: optional(number()),
    min_members_for_discount: optional(number()),

    // Corporate specific fields
    company_name: optional(string()),
    company_registration_number: optional(string()),
    company_address: optional(string()),
    company_phone: optional(string()),
    company_email: optional(string()),
    billing_contact_name: optional(string()),
    billing_contact_email: optional(string()),
    centralized_billing: optional(boolean()),

    // Group configuration
    auto_approve_members: optional(boolean()),
    allow_member_self_enroll: optional(boolean()),
    require_leader_approval: optional(boolean()),

    notes: optional(string()),
  },
  get: object({
    name: string(),
    description: optional(string()),
    type: string(),
    group_code: string(),
    leader: object({}),
    current_member_count: number(),
    max_members: number(),
    company_name: optional(string()),
    centralized_billing: boolean(),
    auto_approve_members: boolean(),
    allow_member_self_enroll: boolean(),
    require_leader_approval: boolean(),
    created_at: string(),
    updated_at: string(),
  }),
};

export const createGroupFn = lesan.Fn(createGroupValidator, async (body, context, coreApp) => {
  // Check if user is authenticated
  if (!context?.user?._id) {
    throw new Error("User must be authenticated to create a group");
  }

  const groupModel = coreApp.odm.newModel("group", {}, {});
  const groupMemberModel = coreApp.odm.newModel("group_member", {}, {});

  try {
    // Generate unique group code
    let group_code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      group_code = generateUniqueCode(8, "GROUP");

      // Check if code already exists
      const existingGroup = await groupModel.findOne({
        filters: { group_code },
      });

      isUnique = !existingGroup;
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error("Unable to generate unique group code. Please try again.");
      }
    } while (!isUnique);

    // Validate corporate fields
    if (body.details.set.type === "Corporate") {
      if (!body.details.set.company_name) {
        throw new Error("Company name is required for corporate groups");
      }
    }

    // Create the group
    const groupData = {
      name: body.details.set.name,
      description: body.details.set.description,
      group_code: group_code!,
      type: body.details.set.type || "Regular",
      max_members: body.details.set.max_members || 50,
      min_members_for_discount: body.details.set.min_members_for_discount || 3,
      current_member_count: 1, // Leader is the first member

      // Corporate fields
      company_name: body.details.set.company_name,
      company_registration_number: body.details.set.company_registration_number,
      company_address: body.details.set.company_address,
      company_phone: body.details.set.company_phone,
      company_email: body.details.set.company_email,
      billing_contact_name: body.details.set.billing_contact_name,
      billing_contact_email: body.details.set.billing_contact_email,
      centralized_billing: body.details.set.centralized_billing || false,

      // Group configuration
      auto_approve_members: body.details.set.auto_approve_members !== false,
      allow_member_self_enroll: body.details.set.allow_member_self_enroll !== false,
      require_leader_approval: body.details.set.require_leader_approval || false,

      notes: body.details.set.notes,

      created_at: new Date(),
      updated_at: new Date(),
    };

    const createdGroup = await groupModel.insertOne({
      doc: groupData,
      relations: {
        leader: context.user._id,
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

    await groupMemberModel.insertOne({
      doc: groupMemberData,
      relations: {
        group: createdGroup._id,
        user: context.user._id,
        approved_by: context.user._id,
      },
    });

    // Get the complete group with relations
    const completeGroup = await groupModel.findOne({
      filters: { _id: createdGroup._id },
      relations: {
        leader: {
          users: {
            first_name: 1,
            last_name: 1,
            mobile: 1,
          },
        },
      },
    });

    return {
      success: true,
      body: {
        message: `گروه "${body.details.set.name}" با موفقیت ایجاد شد`,
        group: {
          _id: completeGroup!._id,
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
      },
    };
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error(`خطا در ایجاد گروه: ${error.message}`);
  }
});

export default createGroupFn;
