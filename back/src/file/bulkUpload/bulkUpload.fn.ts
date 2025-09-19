import { type ActFn, ObjectId, ensureDir } from "@deps";
import { coreApp, file } from "../../../mod.ts";
import type { MyContext } from "@lib";

export const bulkUploadFn: ActFn = async (body) => {
  const { user }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: {
      files = [],
      global_metadata = {},
      organization = {},
      naming = {},
      processing = {},
      batch_options = {},
      dry_run = false,
      ...rest
    },
    get,
  } = body.details;

  const results = {
    totalFiles: files.length,
    successfulUploads: 0,
    failedUploads: 0,
    skippedFiles: 0,
    uploadedFiles: [],
    errors: [],
    warnings: [],
    dryRun: dry_run,
    processingTime: 0
  };

  const startTime = Date.now();

  try {
    if (files.length === 0) {
      return {
        success: false,
        message: "No files provided for upload",
        ...results,
        processingTime: Date.now() - startTime
      };
    }

    // Validate file limits
    const maxFiles = processing?.max_file_size ? 100 : 50;
    if (files.length > maxFiles) {
      throw new Error(`Too many files. Maximum allowed: ${maxFiles}`, { cause: 400 });
    }

    // Process files in batches
    const batchSize = batch_options?.batch_size || 10;
    const batches = [];
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      for (const fileItem of batch) {
        try {
          const uploadResult = await processIndividualFile(
            fileItem,
            user,
            global_metadata,
            organization,
            naming,
            processing,
            dry_run,
            get
          );

          if (uploadResult.success) {
            results.uploadedFiles.push(uploadResult.file);
            results.successfulUploads++;
          } else {
            results.errors.push({
              fileName: fileItem.originalName || 'unknown',
              error: uploadResult.error
            });
            results.failedUploads++;
          }

        } catch (error) {
          results.errors.push({
            fileName: fileItem.originalName || 'unknown',
            error: error.message
          });
          results.failedUploads++;

          if (!batch_options?.continue_on_error) {
            throw error;
          }
        }
      }

      // Add delay between batches if specified
      if (batch_options?.delay_between_batches && batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, batch_options.delay_between_batches));
      }
    }

    results.processingTime = Date.now() - startTime;

    // Log the bulk upload for audit
    console.log(`[AUDIT] Bulk upload ${dry_run ? '(DRY RUN) ' : ''}completed by admin ${user._id}: ${results.successfulUploads}/${results.totalFiles} files uploaded successfully`);

    return {
      success: results.failedUploads === 0,
      message: `Bulk upload ${dry_run ? 'preview ' : ''}completed. ${results.successfulUploads} successful, ${results.failedUploads} failed`,
      ...results
    };

  } catch (error) {
    console.error(`[ERROR] Bulk upload failed:`, error);
    throw new Error(`Bulk upload failed: ${error.message}`, { cause: error.cause || 500 });
  }
};

// Helper function to process individual file
async function processIndividualFile(
  fileItem: any,
  user: any,
  globalMetadata: any,
  organization: any,
  naming: any,
  processing: any,
  dryRun: boolean,
  projection: any
): Promise<any> {
  try {
    const fileToUpload: File = fileItem.formData?.get("file") as File;

    if (!fileToUpload) {
      return {
        success: false,
        error: "No file found in form data"
      };
    }

    // Validate file size if specified
    if (processing?.max_file_size && fileToUpload.size > processing.max_file_size) {
      return {
        success: false,
        error: `File too large: ${fileToUpload.size} bytes (max: ${processing.max_file_size})`
      };
    }

    // Validate file type if specified
    if (processing?.allowed_types && processing.allowed_types.length > 0) {
      const isAllowed = processing.allowed_types.some((type: string) =>
        fileToUpload.type.toLowerCase().includes(type.toLowerCase())
      );
      if (!isAllowed) {
        return {
          success: false,
          error: `File type not allowed: ${fileToUpload.type}`
        };
      }
    }

    // Determine file organization
    const fileType = fileItem.type || detectFileType(fileToUpload.type);
    const category = fileItem.category || globalMetadata?.category || getDefaultCategory(fileType, organization);

    // Generate file name
    let fileName = fileToUpload.name;
    if (naming?.sanitize_names) {
      fileName = sanitizeFileName(fileName);
    }
    if (naming?.add_timestamps) {
      const timestamp = Date.now();
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      const extension = fileName.substring(fileName.lastIndexOf('.')) || '';
      fileName = `${nameWithoutExt}_${timestamp}${extension}`;
    }

    // Determine upload directory
    const uploadDir = getUploadDirectory(fileType, organization);

    if (!dryRun) {
      await ensureDir(uploadDir);

      // Handle duplicate names
      if (naming?.handle_duplicates === "rename") {
        fileName = await getUniqueFileName(`${uploadDir}/${fileName}`);
      }

      // Write file to disk
      const finalFileName = `${new ObjectId()}-${fileName}`;
      await Deno.writeFile(`${uploadDir}/${finalFileName}`, fileToUpload.stream());

      const relativePath = `${uploadDir.replace("./public", "")}/${finalFileName}`;
      const publicUrl = relativePath;

      // Save to database
      const savedFile = await file.insertOne({
        doc: {
          name: finalFileName,
          type: fileToUpload.type,
          size: fileToUpload.size,
          path: relativePath,
          url: publicUrl,
          category: category,
          tags: [...(fileItem.tags || []), ...(globalMetadata?.tags || [])],
          description: fileItem.description || globalMetadata?.description_template,
          alt_text: fileItem.alt_text,
          permissions: globalMetadata?.permissions || "public",
        },
        relations: {
          uploader: {
            _ids: new ObjectId(user._id),
            relatedRelations: {
              uploadedAssets: true,
            },
          },
        },
        projection: projection,
      });

      return {
        success: true,
        file: savedFile
      };
    } else {
      // Dry run - return preview
      return {
        success: true,
        file: {
          name: fileName,
          type: fileToUpload.type,
          size: fileToUpload.size,
          category: category,
          preview: true
        }
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper functions
function detectFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'doc';
}

function getDefaultCategory(fileType: string, organization: any): string {
  if (organization?.strategy === 'by_type') {
    return fileType === 'image' ? 'images' : fileType === 'video' ? 'videos' : 'documents';
  }
  return 'general';
}

function getUploadDirectory(fileType: string, organization: any): string {
  const basePath = organization?.base_path || './public/uploads';

  if (organization?.separate_by_type) {
    return `${basePath}/${fileType}s`;
  }

  if (organization?.create_date_folders) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${basePath}/${year}/${month}`;
  }

  return fileType === "image"
    ? `${basePath}/images`
    : fileType === "video"
      ? `${basePath}/videos`
      : `${basePath}/docs`;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function getUniqueFileName(filePath: string): Promise<string> {
  const pathParts = filePath.split('/');
  let fileName = pathParts.pop() || '';
  const directory = pathParts.join('/');

  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  const extension = fileName.substring(fileName.lastIndexOf('.')) || '';

  let counter = 1;
  let uniquePath = filePath;

  try {
    while (await fileExists(uniquePath)) {
      fileName = `${nameWithoutExt}_${counter}${extension}`;
      uniquePath = `${directory}/${fileName}`;
      counter++;

      if (counter > 1000) {
        throw new Error('Could not generate unique filename');
      }
    }
  } catch {
    // File doesn't exist, use original name
  }

  return fileName;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}
