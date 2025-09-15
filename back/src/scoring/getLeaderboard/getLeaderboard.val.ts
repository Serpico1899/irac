import {
  number,
  object,
  optional,
  enums,
} from "@deps";

export const getLeaderboardValidator = () => {
  return {
    set: object({
      limit: optional(number()),
      skip: optional(number()),
      timeframe: optional(enums(["all_time", "monthly", "weekly", "daily"])),
      include_user_rank: optional(number()), // Include current user's rank in response
    }),
    get: object({}),
  };
};
