import {
  object,
  optional,
  string,
} from "@deps";

export const revokeCertificateValidator = () => {
  return object({
    set: object({
      certificate_number: optional(string()),
      enrollment_id: optional(string()),
      reason: string(),
    }),
    get: optional(object({})),
  });
};
