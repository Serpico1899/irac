import { coreApp } from "../mod.ts";
import {
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  optional,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const group_type_array = ["Regular", "Corporate"];
export const group_type_enums = enums(group_type_array);

export const group_status_array = ["Active", "Inactive", "Suspended", "Completed"];
export const group_status_enums = enums(group_status_array);

export const discount_tier_array = ["Tier1", "Tier2", "Tier3", "Tier4"]; // 3-5, 6-10, 11-20, 21+
export const discount_tier_enums = enums(discount_tier_array);

// Group Model
export const group_pure = {
  // Basic Group Information
  name: string(),
  description: optional(string()),
  group_code: string(), // Unique identifier for group joining

  // Group Configuration
  type: defaulted(group_type_enums, "Regular"),
  status: defaulted(group_status_enums, "Active"),

  // Member Management
  max_members: defaulted(number(), 50), // Maximum allowed members
  current_member_count: defaulted(number(), 1), // Current active members
  min_members_for_discount: defaulted(number(), 3), // Minimum for group discount

  // Discount Information
  discount_tier: optional(discount_tier_enums),
  current_discount_percentage: defaulted(number(), 0), // Calculated discount
  total_savings: defaulted(number(), 0), // Total amount saved by group

  // Corporate Specific Fields
  company_name: optional(string()),
  company_registration_number: optional(string()),
  company_address: optional(string()),
  company_phone: optional(string()),
  company_email: optional(string()),
  billing_contact_name: optional(string()),
  billing_contact_email: optional(string()),
  centralized_billing: defaulted(boolean(), false),

  // Enrollment Configuration
  auto_approve_members: defaulted(boolean(), true),
  allow_member_self_enroll: defaulted(boolean(), true),
  require_leader_approval: defaulted(boolean(), false),

  // Statistics
  total_enrollments: defaulted(number(), 0),
  completed_courses: defaulted(number(), 0),
  certificates_issued: defaulted(number(), 0),

  // Administrative
  notes: optional(string()),

  ...createUpdateAt,
};

export const group_relations = {
  // Group Leader
  leader: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {
      led_groups: {
        schemaName: "group",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  // Group Members
  members: {
    schemaName: "user",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {
      member_of_groups: {
        schemaName: "group",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  // Group Enrollments
  enrollments: {
    schemaName: "enrollment",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {
      group: {
        schemaName: "group",
        type: "single" as RelationDataType,
        optional: true,
      },
    },
  },

  // Company Logo (for corporate groups)
  company_logo: {
    schemaName: "file",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

// Group Member Model (for tracking individual member status)
export const group_member_pure = {
  // Member Status
  status: defaulted(enums(["Active", "Pending", "Removed", "Suspended"]), "Pending"),
  join_date: defaulted(
    coerce(date(), string(), (value) => new Date(value)),
    new Date()
  ),
  approved_date: optional(coerce(date(), string(), (value) => new Date(value))),
  removed_date: optional(coerce(date(), string(), (value) => new Date(value))),

  // Member Role in Group
  role: defaulted(enums(["Member", "CoLeader", "Admin"]), "Member"),
  can_invite_others: defaulted(boolean(), false),
  can_approve_members: defaulted(boolean(), false),

  // Member Statistics
  enrollments_count: defaulted(number(), 0),
  completed_courses: defaulted(number(), 0),
  total_savings: defaulted(number(), 0),

  // Administrative
  notes: optional(string()),

  ...createUpdateAt,
};

export const group_member_relations = {
  group: {
    schemaName: "group",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {
      group_members: {
        schemaName: "group_member",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {
      group_memberships: {
        schemaName: "group_member",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },

  approved_by: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

// Export models
export const groups = () =>
  coreApp.odm.newModel("group", group_pure, group_relations, {
    createIndex: {
      indexSpec: { "group_code": 1 },
      options: { unique: true },
    },
  });

export const group_members = () =>
  coreApp.odm.newModel("group_member", group_member_pure, group_member_relations, {
    createIndex: {
      indexSpec: { "group": 1, "user": 1 },
      options: { unique: true },
    },
  });
