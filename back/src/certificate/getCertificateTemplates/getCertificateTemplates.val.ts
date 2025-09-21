import {
  object,
  optional,
  string,
  boolean,
} from "@deps";

export const getCertificateTemplatesValidator = () => {
  return object({
    set: object({
      template_type: optional(string()),
      active_only: optional(boolean()),
    }),
    get: optional(object({})),
  });
};
