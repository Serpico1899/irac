import {
  object,
  optional,
  string,
  record,
} from "@deps";

export const processDailyLoginValidator = () => {
  return {
    set: object({
      ip_address: optional(string()),
      user_agent: optional(string()),
      device_info: optional(string()),
      location: optional(string()),
      metadata: optional(record(string(), string())),
    }),
    get: object({}),
  };
};
