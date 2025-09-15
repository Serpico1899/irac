import {
  number,
  object,
  optional,
  string,
} from "@deps";

export const generateReferralCodeValidator = () => {
  return {
    set: object({
      campaign_id: optional(string()),
      custom_code: optional(string()),
      expiry_days: optional(number()),
    }),
    get: object({}),
  };
};
