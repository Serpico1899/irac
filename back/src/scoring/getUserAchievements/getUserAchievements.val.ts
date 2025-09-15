import {
  boolean,
  number,
  object,
  optional,
  string,
  enums,
} from "@deps";

export const getUserAchievementsValidator = () => {
  return {
    set: object({
      user_id: optional(string()), // Optional - defaults to authenticated user
      include_locked: optional(boolean()), // Include achievements not yet earned
      category: optional(enums(["level", "activity", "purchase", "social", "streak", "all"])),
      limit: optional(number()),
      skip: optional(number()),
    }),
    get: object({}),
  };
};
