import {
  boolean,
  enums,
  object,
  optional,
  string,
} from "@deps";

export const getReferralStatsValidator = () => {
  return {
    set: object({
      user_id: optional(string()), // Optional - defaults to authenticated user
      include_detailed_history: optional(boolean()),
      timeframe: optional(enums(["all_time", "last_30_days", "last_90_days", "this_year"])),
    }),
    get: object({}),
  };
};
