import { object, string, boolean, optional } from "@deps";
import {  coreApp  } from "@app";

export const serveFileValidator = () => {
  return object({
    set: object({
      fileId: string(),
      download: optional(boolean()),
      track: optional(boolean()),
    }),
    get: coreApp.schemas.selectStruct("file", 1),
  });
};
