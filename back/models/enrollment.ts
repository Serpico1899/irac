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

export const enrollment_status_array = [
  "Active",
  "Completed",
  "Dropped",
  "Suspended",
  "Pending_Payment",
];
export const enrollment_status_enums = enums(enrollment_status_array);

export const payment_status_array = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
  "Partially_Refunded",
];
export const payment_status_enums = enums(payment_status_array);

export const payment_method_array = [
  "Online_Gateway",
  "Bank_Transfer",
  "Cash",
  "Points",
  "Mixed", // Points + Cash
];
export const payment_method_enums = enums(payment_method_array);

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

  // Course Specific
  attendance_count: defaulted(number(), 0),
  assignment_scores: optional(string()), // JSON array of scores
  final_grade: optional(number()),

  // Certificates
  certificate_issued: defaulted(boolean(), false),
  certificate_issue_date: optional(
    coerce(date(), string(), (value) => new Date(value))
  ),

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
};

// Order Model
export const order_pure = {
  // Order Information
  order_number: string(), // Unique order identifier
  order_date: defaulted(
    coerce(date(), string(), (value) => new Date(value)),
    new Date()
  ),

  // Payment Details
  subtotal: number(), // Before discounts in Iranian Rial
  discount_amount: defaulted(number(), 0),
  points_discount: defaulted(number(), 0),
  total_amount: number(), // Final amount in Iranian Rial

  // Payment Processing
  payment_status: defaulted(payment_status_enums, "Pending"),
  payment_method: payment_method_enums,
  payment_gateway_response: optional(string()), // JSON response
  transaction_id: optional(string()),
  payment_date: optional(coerce(date(), string(), (value) => new Date(value))),

  // Discount Information
  coupon_code: optional(string()),
  coupon_discount_percentage: defaulted(number(), 0),
  points_used: defaulted(number(), 0),
  points_earned: defaulted(number(), 0),

  // Order Items (JSON structure)
  items: string(), // JSON array of {courseId, price, discountApplied}

  // Billing Information
  billing_name: optional(string()),
  billing_mobile: optional(string()),
  billing_national_id: optional(string()),
  billing_address: optional(string()),

  // Administrative
  notes: optional(string()),
  refund_amount: defaulted(number(), 0),
  refund_reason: optional(string()),
  refund_date: optional(coerce(date(), string(), (value) => new Date(value))),

  ...createUpdateAt,
};

export const order_relations = {
  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {
      orders: {
        schemaName: "order",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },
  courses: {
    schemaName: "course",
    type: "multiple" as RelationDataType,
    optional: false,
    relatedRelations: {
      orders: {
        schemaName: "order",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },
  processed_by: {
    schemaName: "user", // Admin who processed the order
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {
      processed_orders: {
        schemaName: "order",
        type: "multiple" as RelationDataType,
        optional: true,
      },
    },
  },
};

// Export models
export const enrollments = () =>
  coreApp.odm.newModel("enrollment", enrollment_pure, enrollment_relations, {
    createIndex: [
      {
        indexSpec: { "user._id": 1, "course._id": 1 },
        options: { unique: true },
      },
      {
        indexSpec: { status: 1, enrollment_date: -1 },
        options: {},
      },
      {
        indexSpec: { completed_date: -1 },
        options: { sparse: true },
      },
    ],
  });

export const orders = () =>
  coreApp.odm.newModel("order", order_pure, order_relations, {
    createIndex: [
      {
        indexSpec: { order_number: 1 },
        options: { unique: true },
      },
      {
        indexSpec: { "user._id": 1, order_date: -1 },
        options: {},
      },
      {
        indexSpec: { payment_status: 1, order_date: -1 },
        options: {},
      },
      {
        indexSpec: { transaction_id: 1 },
        options: { sparse: true },
      },
    ],
  });
