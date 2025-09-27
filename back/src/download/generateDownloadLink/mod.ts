import {  setAct  } from "@app";
import { generateDownloadLinkValidator } from "./generateDownloadLink.val.ts";
import { generateDownloadLinkFn } from "./generateDownloadLink.fn.ts";

export const generateDownloadLinkSetup = () => {
  setAct({
    schema: {
      details: generateDownloadLinkValidator.schema.details,
    },
    validator: generateDownloadLinkValidator,
    fn: generateDownloadLinkFn,
  });
};
