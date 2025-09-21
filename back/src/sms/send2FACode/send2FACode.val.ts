import { boolean, enums, object, optional, size, string } from "@deps";
import { mobile_pattern } from "@model";

export const send2FACodeValidator = () => {
  return object({
    set: object({
      user_id: optional(string()),
      mobile: optional(mobile_pattern),
      action: enums(["enable", "disable", "verify", "setup"]),
      verification_id: optional(string()),
      code: optional(size(string(), 6)),
    }),
    get: optional(
      object({
        verification_id: optional(string()),
        mobile: optional(string()),
        expires_in: optional(string()),
        message: optional(string()),
        two_factor_enabled: optional(boolean()),
        backup_codes: optional(string()),
        user_id: optional(string()),
        setup_completed: optional(boolean()),
      }),
    ),
  });
};
