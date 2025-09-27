import { enums, instance, object } from "@deps";
import {  coreApp  } from "@app";
import { createUpdateAt } from "@lib";

export const uploadFileValidator = () => {
  return object({
    set: object({
      formData: instance(FormData),
      type: enums(["video", "image", "doc"]),
      ...createUpdateAt,
    }),
    get: coreApp.schemas.selectStruct("file", 1),
  });
};
