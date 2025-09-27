import {  setAct  } from "@app";
import { trackDownloadsValidator } from "./trackDownloads.val.ts";
import { trackDownloadsFn } from "./trackDownloads.fn.ts";

export const trackDownloadsSetup = () => {
  setAct({
    schema: {
      details: trackDownloadsValidator.schema.details,
    },
    validator: trackDownloadsValidator,
    fn: trackDownloadsFn,
  });
};
