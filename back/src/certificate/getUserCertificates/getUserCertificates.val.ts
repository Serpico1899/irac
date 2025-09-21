import {
  object,
  optional,
  string,
  number,
  union,
  literal,
} from "@deps";

export const getUserCertificatesValidator = () => {
  return object({
    set: object({
      user_id: optional(string()),
      status: optional(union([
        literal("active"),
        literal("revoked"),
      ])),
      limit: optional(number()),
      offset: optional(number()),
    }),
    get: optional(object({})),
  });
};
