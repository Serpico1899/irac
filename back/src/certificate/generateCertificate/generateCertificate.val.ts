import {
  boolean,
  object,
  optional,
  string,
  defaulted,
} from "@deps";

export const generateCertificateValidator = () => {
  return object({
    set: object({
      enrollment_id: string(),
      template_id: optional(string()),
      force_generate: optional(boolean()),
    }),
    get: optional(object({})),
  });
};
