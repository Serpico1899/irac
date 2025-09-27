import {  coreApp  } from "@app";
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

export const enrollment_status_array = [
  "Active",
  "Completed",
  "Dropped",
  "Suspended",
  "Pending_Payment",
];
export const enrollment_status_enums = enums(enrollment_status_array);



// Enrollment Model
export const enrollment_pure = {
  // Enrollment Details
  enrollment_date: defaulted(
    coerce(date(), string(), (value) => new Date(value)),
    new Date()
  ),
  status: defaulted(enrollment_status_enums, "Pending_Payment"),

  // Progress Tracking
  progress_percentage: defaulted(number(), 0),
  completed_date: optional(coerce(date(), string(), (value) => new Date(value))),

  // Points and Rewards
  points_earned: defaulted(number(), 0),
  points_used_for_enrollment: defaulted(number(), 0),

  // Payment Reference
  total_paid: number(), // Amount paid in Iranian Rial
  discount_applied: defaulted(number(), 0),

  // Group Enrollment
  is_group_enrollment: defaulted(boolean(), false),
  group_discount_percentage: defaulted(number(), 0),
  original_price: optional(number()), // Price before group discount
  group_savings: defaulted(number(), 0), // Amount saved through group discount

  // Course Specific
  attendance_count: defaulted(number(), 0),
  assignment_scores: optional(string()), // JSON array of scores
  final_grade: optional(number()),

  // Certificates
  certificate_issued: defaulted(boolean(), false),
  certificate_issue_date: optional(
    coerce(date(), string(), (value) => new Date(value))
  ),
  certificate_id: optional(string()), // Unique certificate number (e.g., IRAC-2024-ARCH-12345)
  certificate_hash: optional(string()), // Verification hash for security
  certificate_template_id: optional(string()), // Template used for certificate
  certificate_revoked: defaulted(boolean(), false),
  certificate_revoked_date: optional(
    coerce(date(), string(), (value) => new Date(value))
  ),
  certificate_revoked_reason: optional(string()),
  certificate_revoked_by: optional(string()), // Admin user ID who revoked

  // Administrative
  notes: optional(string()),

  ...createUpdateAt,
};

export const enrollment_relations = {
  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {
      enrollments: {
        schemaName: "enrollment",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },
  course: {
    schemaName: "course",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {
      enrollments: {
        schemaName: "enrollment",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },
  order: {
    schemaName: "order",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {
      enrollments: {
        schemaName: "enrollment",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },
  certificate: {
    schemaName: "file",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },

  // Group Relation (for group enrollments)
  group: {
    schemaName: "group",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {
      enrollments: {
        schemaName: "enrollment",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },
};

// Export models
export const enrollments = () =>
  coreApp.odm.newModel("enrollment", enrollment_pure, enrollment_relations);
