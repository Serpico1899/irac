import { coreApp } from "../mod.ts";
import {
  array,
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  optional,
  refine,
  type RelationDataType,
  string,
} from "@deps";
import { createUpdateAt } from "@lib";

export const user_achievement_array = [
  "first_purchase",
  "course_master",
  "early_bird",
  "social_butterfly",
  "loyal_customer",
  "big_spender",
  "referral_champion",
  "workshop_enthusiast",
  "daily_login_streak_7",
  "daily_login_streak_30",
  "daily_login_streak_100",
  "level_up_5",
  "level_up_10",
  "level_up_25",
  "level_up_50",
  "review_master",
  "profile_perfectionist",
  "community_contributor"
];
export const user_achievement_enums = enums(user_achievement_array);

export const level_status_array = [
  "active",
  "frozen",
  "penalty"
];
export const level_status_enums = enums(level_status_array);

// Validate that points are not negative
export const non_negative_points = refine(
  number(),
  "non_negative_points",
  (value: number) => {
    return value >= 0;
  },
);

// Validate that level is positive
export const positive_level = refine(
  number(),
  "positive_level",
  (value: number) => {
    return value >= 1;
  },
);

export const user_level_pure = {
  current_points: defaulted(non_negative_points, 0),
  total_lifetime_points: defaulted(non_negative_points, 0),
  level: defaulted(positive_level, 1),
  status: defaulted(level_status_enums, "active"),

  // Achievement tracking
  achievements: defaulted(array(string()), []),
  achievement_count: defaulted(number(), 0),

  // Level progression tracking
  points_to_next_level: defaulted(number(), 500), // Points needed for next level
  level_progress_percentage: defaulted(number(), 0), // 0-100

  // Activity tracking
  last_points_earned_at: optional(coerce(date(), string(), (value) => new Date(value))),
  last_level_up_at: optional(coerce(date(), string(), (value) => new Date(value))),
  last_achievement_at: optional(coerce(date(), string(), (value) => new Date(value))),

  // Statistics for analytics
  total_purchases: defaulted(number(), 0),
  total_courses_completed: defaulted(number(), 0),
  total_referrals: defaulted(number(), 0),
  total_logins: defaulted(number(), 0),
  daily_login_streak: defaulted(number(), 0),
  max_daily_login_streak: defaulted(number(), 0),

  // Points breakdown
  points_from_purchases: defaulted(number(), 0),
  points_from_courses: defaulted(number(), 0),
  points_from_referrals: defaulted(number(), 0),
  points_from_activities: defaulted(number(), 0),
  points_from_bonuses: defaulted(number(), 0),

  // Penalty tracking
  total_penalties: defaulted(number(), 0),
  points_lost_penalties: defaulted(number(), 0),

  // Multiplier and bonus tracking
  current_multiplier: defaulted(number(), 1.0), // Point earning multiplier
  bonus_expires_at: optional(coerce(date(), string(), (value) => new Date(value))),

  // Leaderboard and ranking
  rank_position: optional(number()),
  rank_updated_at: optional(coerce(date(), string(), (value) => new Date(value))),

  // Admin fields
  is_frozen: defaulted(boolean(), false),
  freeze_reason: optional(string()),
  admin_notes: optional(string()),
  manual_adjustments: defaulted(number(), 0),

  ...createUpdateAt,
};

export const user_level_relations = {
  user: {
    schemaName: "user",
    type: "single" as RelationDataType,
    optional: false,
    relatedRelations: {},
  },
};

export const user_levels = () =>
  coreApp.odm.newModel("user_level", user_level_pure, user_level_relations, {
    createIndex: {
      indexSpec: { "user": 1 },
      options: { unique: true },
    },
  });
