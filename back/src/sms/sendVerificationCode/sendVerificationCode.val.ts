import { enums, object, optional, string } from "@deps";
import { mobile_pattern } from "@model";

export const sendVerificationCodeValidator = () => {
  return object({
    set: object({
      mobile: mobile_pattern,
      purpose: optional(enums(["login", "register", "password_reset", "2fa"])),
      locale: optional(string()),
    }),
    get: optional(
      object({
        verification_id: string(),
        mobile: string(),
        expires_in: string(),
        message: string(),
        can_resend_after: string(),
      }),
    ),
  });
};
