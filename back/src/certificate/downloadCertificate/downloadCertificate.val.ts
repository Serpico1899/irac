import {
  object,
  optional,
  string,
  union,
  literal,
} from "@deps";

export const downloadCertificateValidator = () => {
  return object({
    set: object({
      certificate_number: string(),
      format: optional(union([
        literal("pdf"),
        literal("png"),
      ])),
    }),
    get: optional(object({})),
  });
};
