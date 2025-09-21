import { boolean, object, optional, size, string } from "@deps";

export const verifyPhoneNumberValidator = () => {
  return object({
    set: object({
      verification_id: string(),
      code: size(string(), 6),
    }),
    get: optional(
      object({
        verified: optional(boolean()),
        mobile: optional(string()),
        purpose: optional(string()),
        user_exists: optional(boolean()),
        user_id: optional(string()),
        token: optional(string()),
        message: optional(string()),
      }),
    ),
  });
};
