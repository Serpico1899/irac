import { generateDownloadLinkSetup } from "./generateDownloadLink/mod.ts";
import { validateAccessSetup } from "./validateAccess/mod.ts";
import { trackDownloadsSetup } from "./trackDownloads/mod.ts";

export const downloadSetup = () => {
  // Digital download link generation
  generateDownloadLinkSetup();

  // Access validation and security
  validateAccessSetup();

  // Download tracking and analytics
  trackDownloadsSetup();
};
