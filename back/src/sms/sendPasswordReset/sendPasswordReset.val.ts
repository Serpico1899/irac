import { object, optional, size, string } from "@deps";
import { mobile_pattern } from "@model";

export const sendPasswordResetValidator = () => {
  return object({
    set: object({
      mobile: mobile_pattern,
      verification_id: optional(string()),
      new_password: optional(size(string(), 8, 128)),
    }),
    get: optional(
      object({
        verification_id: optional(string()),
        mobile: optional(string()),
        expires_in: optional(string()),
        message: optional(string()),
        reset_completed: optional(string()),
      }),
    ),
  });
};
