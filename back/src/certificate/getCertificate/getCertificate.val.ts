import {
  object,
  optional,
  string,
} from "@deps";

export const getCertificateValidator = () => {
  return object({
    set: object({
      enrollment_id: optional(string()),
      certificate_number: optional(string()),
    }),
    get: optional(object({})),
  });
};
