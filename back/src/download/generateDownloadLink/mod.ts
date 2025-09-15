import { setAct } from "../../../mod.ts";
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
