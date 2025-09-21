import { getFilesSetup } from "./getFiles/mod.ts";
import { uploadFileSetup } from "./uploadFile/mod.ts";
import { serveFileSetup } from "./serveFile/mod.ts";
import { deleteFileSetup } from "./deleteFile/mod.ts";
import { updateFileMetadataSetup } from "./updateFileMetadata/mod.ts";
import { getFileDetailsSetup } from "./getFileDetails/mod.ts";
import { organizeFilesSetup } from "./organizeFiles/mod.ts";
import { moveFilesSetup } from "./moveFiles/mod.ts";
import { bulkUploadSetup } from "./bulkUpload/mod.ts";
import { bulkDeleteSetup } from "./bulkDelete/mod.ts";
import { getFileStatsSetup } from "./getFileStats/mod.ts";
import { getUnusedFilesSetup } from "./getUnusedFiles/mod.ts";
import { validateFileIntegritySetup } from "./validateFileIntegrity/mod.ts";

export const fileSetup = () => {
  // Basic file operations
  uploadFileSetup();
  getFilesSetup();
  serveFileSetup();

  // Core file management
  deleteFileSetup();
  updateFileMetadataSetup();
  getFileDetailsSetup();

  // File organization
  organizeFilesSetup();
  moveFilesSetup();

  // Bulk operations
  bulkUploadSetup();
  bulkDeleteSetup();

  // Analytics and maintenance
  getFileStatsSetup();
  getUnusedFilesSetup();
  validateFileIntegritySetup();
};
