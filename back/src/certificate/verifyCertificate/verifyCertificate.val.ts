import {
  object,
  string,
  optional,
} from "@deps";

export const verifyCertificateValidator = () => {
  return object({
    set: object({
      certificate_number: string(),
    }),
    get: optional(object({})),
  });
};
