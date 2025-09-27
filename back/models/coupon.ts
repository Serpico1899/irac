import { coreApp } from "@app";
import {
  array,
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  object,
  optional,
  refine,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const coupon_type_array = [
  "percentage",
  "fixed_amount",
  "first_time_user",
  "course_specific",
  "category_specific",
  "bulk_purchase",
  "referral_bonus"
];
export const coupon_type_enums = enums(coupon_type_array);

export const coupon_status_array = [
  "active",
  "inactive",
  "expired",
  "suspended",
  "draft"
];
export const coupon_status_enums = enums(coupon_status_array);

export const coupon_applicable_to_array = [
  "all",
  "courses",
  "workshops",
  "products",
  "specific_items"
];
export const coupon_applicable_to_enums = enums(coupon_applicable_to_array);

// Validate positive amounts and percentages
export const coupon_positive_amount = refine(
  number(),
  "coupon_positive_amount",
  (value: number) => {
    return value >= 0;
  },
);

export const coupon_percentage = refine(
  number(),
  "coupon_percentage",
  (value: number) => {
    return value >= 0 && value <= 100;
  },
);

export const coupon_usage_limit = refine(
  number(),
  "coupon_usage_limit",
  (value: number) => {
    return value >= 0;
  },
);

// Coupon code validation (alphanumeric, uppercase, 6-20 characters)
export const coupon_code = refine(
  string(),
  "coupon_code",
  (value: string) => {
    const codePattern = /^[A-Z0-9]{3,20}$/;
    return codePattern.test(value);
  },
);

// Applicable items structure for specific coupons
export const coupon_applicable_item = object({
  item_type: enums(["course", "workshop", "product", "category"]),
  item_id: string(),
  item_name: optional(string()),
});

// Usage tracking structure
export const coupon_usage_record = object({
  user_id: string(),
  order_id: string(),
  used_at: coerce(date(), string(), (value) => new Date(value)),
  discount_amount: coupon_positive_amount,
});

export const coupon_model_pure = {
  // Basic Information
  code: coupon_code, // Coupon code (e.g., "WELCOME50", "FIRST100")
  name: string(), // Human-readable name
  name_en: optional(string()), // English name
  description: string(), // Description of the coupon
  description_en: optional(string()), // English description

  // Coupon Type and Value
  type: coupon_type_enums,
  discount_percentage: optional(coupon_percentage), // For percentage discounts (0-100)
  discount_amount: optional(coupon_positive_amount), // For fixed amount discounts (in IRR)
  max_discount_amount: optional(coupon_positive_amount), // Maximum discount for percentage coupons

  // Applicability
  applicable_to: defaulted(coupon_applicable_to_enums, "all"),
  applicable_items: optional(array(coupon_applicable_item)), // Specific items/categories
  minimum_order_amount: defaulted(coupon_positive_amount, 0), // Minimum order value to apply
  currency: defaulted(string(), "IRR"),

  // Usage Limitations
  usage_limit_total: optional(coupon_usage_limit), // Total usage limit across all users
  usage_limit_per_user: defaulted(coupon_usage_limit, 1), // Usage limit per user
  current_usage_count: defaulted(number(), 0), // Current total usage count

  // Time Limitations
  valid_from: coerce(date(), string(), (value) => new Date(value)),
  valid_until: optional(coerce(date(), string(), (value) => new Date(value))),

  // User Restrictions
  first_time_users_only: defaulted(boolean(), false),
  specific_user_groups: optional(array(string())), // User group IDs
  excluded_users: optional(array(string())), // User IDs to exclude

  // Combination Rules
  combinable_with_other_coupons: defaulted(boolean(), false),
  stackable: defaulted(boolean(), false),
  priority: defaulted(number(), 0), // Higher priority coupons apply first

  // Status and Visibility
  status: defaulted(coupon_status_enums, "draft"),
  is_public: defaulted(boolean(), true), // Can be found/used by anyone
  requires_admin_approval: defaulted(boolean(), false),

  // Referral and Campaign Tracking
  campaign_id: optional(string()), // Marketing campaign ID
  referral_source: optional(string()), // Where users can find this coupon
  auto_apply: defaulted(boolean(), false), // Auto-apply if conditions are met

  // Advanced Features
  bulk_discount_threshold: optional(number()), // Minimum quantity for bulk discounts
  category_restrictions: optional(array(string())), // Category IDs where coupon applies
  user_level_restrictions: optional(array(string())), // User level requirements

  // Tracking and Analytics
  click_count: defaulted(number(), 0), // How many times coupon was viewed
  application_count: defaulted(number(), 0), // How many times coupon was applied
  success_count: defaulted(number(), 0), // How many times coupon was successfully used

  // Admin Fields
  created_by: optional(string()), // Admin user ID who created the coupon
  notes: optional(string()), // Internal admin notes
  last_used_at: optional(coerce(date(), string(), (value) => new Date(value))),

  // Usage Records (embedded for quick access)
  recent_usage: optional(array(coupon_usage_record)), // Last few usage records

  ...createUpdateAt,
};

export const coupon_model_relations = {
  // Creator admin
  creator: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  // Orders where this coupon was used
  orders: {
    schemaName: "order",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  // Users who have used this coupon
  users_used: {
    schemaName: "user",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  // Related courses (for course-specific coupons)
  applicable_courses: {
    schemaName: "course",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
  // Related categories (for category-specific coupons)
  applicable_categories: {
    schemaName: "category",
    type: "multiple" as RelationDataType,
    optional: true,
    relatedRelations: {},
  },
};

export const coupon_models = () =>
  coreApp.odm.newModel(
    "coupon",
    coupon_model_pure,
    coupon_model_relations
  );
