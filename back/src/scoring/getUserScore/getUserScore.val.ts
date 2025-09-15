import {
  object,
  optional,
  string,
} from "@deps";

export const getUserScoreValidator = () => {
  return {
    set: object({
      user_id: optional(string()), // Optional - defaults to authenticated user
    }),
    get: object({}),
  };
};
