import {
  object,
  optional,
  record,
  string,
} from "@deps";

export const applyReferralCodeValidator = () => {
  return {
    set: object({
      referral_code: string(),
      ip_address: optional(string()),
      user_agent: optional(string()),
      metadata: optional(record(string(), string())),
    }),
    get: object({}),
  };
};
