import { coreApp } from "@app";
import { string, object, array, number, optional, boolean, enums } from "@deps";
import createGroupHandler from "./createGroup/mod.ts";
import addGroupMemberHandler from "./addGroupMember/mod.ts";
import calculateGroupDiscountHandler from "./calculateGroupDiscount/mod.ts";
import processGroupEnrollmentHandler from "./processGroupEnrollment/mod.ts";
import getGroupStatsHandler from "./getGroupStats/mod.ts";

// Validators
const createGroupValidator = {
  set: {
    name: string(),
    description: optional(string()),
    type: optional(enums(["Regular", "Corporate"])),
    max_members: optional(number()),
    min_members_for_discount: optional(number()),
    company_name: optional(string()),
    company_registration_number: optional(string()),
    company_address: optional(string()),
    company_phone: optional(string()),
    company_email: optional(string()),
    billing_contact_name: optional(string()),
    billing_contact_email: optional(string()),
    centralized_billing: optional(boolean()),
    auto_approve_members: optional(boolean()),
    allow_member_self_enroll: optional(boolean()),
    require_leader_approval: optional(boolean()),
    notes: optional(string()),
  },
  get: object({
    message: string(),
    group: object({
      _id: string(),
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
  }),
};

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

const calculateGroupDiscountValidator = {
  set: {
    group_id: string(),
    course_price: number(),
    member_count: optional(number()),
  },
  get: object({
    success: boolean(),
    discount_info: object({
      original_price: number(),
      discount_percentage: number(),
      discount_amount: number(),
      final_price: number(),
      discount_tier: string(),
      member_count: number(),
      savings_per_member: number(),
    }),
  }),
};

const processGroupEnrollmentValidator = {
  set: {
    group_id: string(),
    course_id: string(),
    enrollment_type: optional(enums(["bulk", "individual"])),
    member_ids: optional(array(string())),
    payment_method: optional(enums(["centralized", "individual"])),
    notes: optional(string()),
  },
  get: object({
    success: boolean(),
    enrollment_summary: object({
      group_name: string(),
      course_name: string(),
      total_members: number(),
      successful_enrollments: number(),
      failed_enrollments: number(),
      total_discount: number(),
      individual_price: number(),
      group_price: number(),
      savings_per_member: number(),
    }),
    enrollments: array(object({
      member_id: string(),
      user_name: string(),
      enrollment_status: enums(["success", "failed", "already_enrolled"]),
      error_message: optional(string()),
    })),
    payment_info: optional(object({
      payment_method: string(),
      total_amount: number(),
      discount_applied: number(),
      requires_payment: boolean(),
    })),
  }),
};

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

export const groupSetup = () => {
  // Group Management
  coreApp.acts.setAct({
    schema: "group",
    actName: "createGroup",
    validator: createGroupValidator,
    fn: createGroupHandler,
  });

  coreApp.acts.setAct({
    schema: "group",
    actName: "addGroupMember",
    validator: addGroupMemberValidator,
    fn: addGroupMemberHandler,
  });

  coreApp.acts.setAct({
    schema: "group",
    actName: "calculateGroupDiscount",
    validator: calculateGroupDiscountValidator,
    fn: calculateGroupDiscountHandler,
  });

  coreApp.acts.setAct({
    schema: "group",
    actName: "processGroupEnrollment",
    validator: processGroupEnrollmentValidator,
    fn: processGroupEnrollmentHandler,
  });

  coreApp.acts.setAct({
    schema: "group",
    actName: "getGroupStats",
    validator: getGroupStatsValidator,
    fn: getGroupStatsHandler,
  });

  return "Group Functions Loaded";
};
