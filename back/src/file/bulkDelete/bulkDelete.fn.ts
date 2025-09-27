import { type ActFn, ObjectId } from "@deps";
import {  coreApp, file, article, course, user  } from "@app";
import type { MyContext } from "@lib";

export const bulkDeleteFn: ActFn = async (body) => {
  const { user: currentUser }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: {
      file_ids,
      filters,
      confirm_bulk_delete = false,
      force_delete = false,
      max_files_limit = 100,
      reference_handling = "check_and_fail",
      delete_physical_files = false,
      backup_before_delete = false,
      batch_size = 20,
      continue_on_error = false,
      dry_run = false,
      ...rest
    },
    get,
  } = body.details;

  const results = {
    totalFiles: 0,
    processedFiles: 0,
    skippedFiles: 0,
    deletedFiles: [],
    errors: [],
    warnings: [],
    referencesFound: [],
    dryRun: dry_run,
    processingTime: 0
  };

  const startTime = Date.now();

  try {
    // Build query for files to delete
    let fileQuery: any = {};

    if (file_ids && file_ids.length > 0) {
      fileQuery._id = { $in: file_ids.map(id => new ObjectId(id)) };
    } else if (filters) {
      // Apply filters to find files to delete
      if (filters.category) {
        fileQuery.category = filters.category;
      }
      if (filters.file_type) {
        fileQuery.type = { $regex: filters.file_type, $options: 'i' };
      }
      if (filters.size_min || filters.size_max) {
        fileQuery.size = {};
        if (filters.size_min) fileQuery.size.$gte = filters.size_min;
        if (filters.size_max) fileQuery.size.$lte = filters.size_max;
      }
      if (filters.uploaded_before) {
        fileQuery.createdAt = { $lt: new Date(filters.uploaded_before) };
      }
      if (filters.uploader_id) {
        fileQuery['uploader._id'] = new ObjectId(filters.uploader_id);
      }
      if (filters.permissions) {
        fileQuery.permissions = filters.permissions;
      }
    } else {
      throw new Error("No file IDs or filters provided", { cause: 400 });
    }

    // Get files to delete
    const filesToDelete = await file.find({
      filter: fileQuery,
      projection: {
        _id: 1, name: 1, type: 1, size: 1, path: 1, url: 1,
        category: 1, createdAt: 1
      },
      relations: {
        uploader: {
          projection: { _id: 1, email: 1 }
        }
      },
      options: { limit: max_files_limit + 1 } // +1 to check if over limit
    });

    results.totalFiles = filesToDelete.docs.length;

    // Safety checks
    if (results.totalFiles === 0) {
      return {
        success: true,
        message: "No files found matching the criteria",
        ...results,
        processingTime: Date.now() - startTime
      };
    }

    if (results.totalFiles > max_files_limit) {
      throw new Error(`Too many files selected for deletion (${results.totalFiles}). Maximum allowed: ${max_files_limit}`, { cause: 403 });
    }

    if (results.totalFiles > 10 && !confirm_bulk_delete) {
      throw new Error(`Bulk deletion of ${results.totalFiles} files requires confirmation (confirm_bulk_delete=true)`, { cause: 403 });
    }

    // Filter unused files if specified
    let finalFilesToDelete = filesToDelete.docs;
    if (filters?.unused_only) {
      const unusedFiles = [];
      for (const fileDoc of filesToDelete.docs) {
        const hasReferences = await checkFileReferences(fileDoc._id);
        if (!hasReferences.hasReferences) {
          unusedFiles.push(fileDoc);
        } else {
          results.warnings.push(`Skipping referenced file: ${fileDoc.name}`);
        }
      }
      finalFilesToDelete = unusedFiles;
      results.totalFiles = unusedFiles.length;
    }

    // Check references for all files if needed
    if (reference_handling !== "ignore_references") {
      for (const fileDoc of finalFilesToDelete) {
        const referenceCheck = await checkFileReferences(fileDoc._id);
        if (referenceCheck.hasReferences) {
          results.referencesFound.push({
            fileId: fileDoc._id,
            fileName: fileDoc.name,
            references: referenceCheck.references
          });

          if (reference_handling === "check_and_fail" && !force_delete) {
            throw new Error(`File "${fileDoc.name}" has references and cannot be deleted safely. Use force_delete=true or change reference_handling.`, {
              cause: {
                code: 409,
                fileId: fileDoc._id,
                references: referenceCheck.references
              }
            });
          }

          if (reference_handling === "skip_referenced") {
            results.skippedFiles++;
            continue;
          }
        }
      }
    }

    // Process deletions in batches
    const batches = [];
    for (let i = 0; i < finalFilesToDelete.length; i += batch_size) {
      batches.push(finalFilesToDelete.slice(i, i + batch_size));
    }

    for (const batch of batches) {
      for (const fileDoc of batch) {
        try {
          // Skip if this file was marked to be skipped due to references
          if (reference_handling === "skip_referenced") {
            const hasRefs = results.referencesFound.some(ref => ref.fileId.toString() === fileDoc._id.toString());
            if (hasRefs) {
              continue;
            }
          }

          const deleteResult = await deleteIndividualFile(
            fileDoc,
            {
              reference_handling,
              delete_physical_files,
              backup_before_delete,
              dry_run
            }
          );

          if (deleteResult.success) {
            results.deletedFiles.push({
              fileId: fileDoc._id,
              fileName: fileDoc.name,
              size: fileDoc.size,
              referencesCleared: deleteResult.referencesCleared || 0,
              physicalDeleted: deleteResult.physicalDeleted || false
            });
            results.processedFiles++;
          } else {
            results.errors.push({
              fileId: fileDoc._id,
              fileName: fileDoc.name,
              error: deleteResult.error
            });

            if (!continue_on_error) {
              throw new Error(`Failed to delete file: ${deleteResult.error}`);
            }
          }

        } catch (error) {
          results.errors.push({
            fileId: fileDoc._id,
            fileName: fileDoc.name,
            error: error.message
          });

          if (!continue_on_error) {
            throw error;
          }
        }
      }
    }

    results.processingTime = Date.now() - startTime;

    // Calculate total space freed
    const totalSizeFreed = results.deletedFiles.reduce((total, file) => total + (file.size || 0), 0);

    // Log the bulk deletion for audit
    console.log(`[AUDIT] Bulk delete ${dry_run ? '(DRY RUN) ' : ''}completed by admin ${currentUser._id}: ${results.processedFiles}/${results.totalFiles} files deleted, ${formatFileSize(totalSizeFreed)} freed`);

    return {
      success: results.errors.length === 0,
      message: `Bulk deletion ${dry_run ? 'preview ' : ''}completed. ${results.processedFiles} files processed, ${results.errors.length} errors`,
      totalSpaceFreed: totalSizeFreed,
      totalSpaceFreedFormatted: formatFileSize(totalSizeFreed),
      ...results
    };

  } catch (error) {
    console.error(`[ERROR] Bulk delete failed:`, error);
    throw new Error(`Bulk delete failed: ${error.message}`, { cause: error.cause || 500 });
  }
};

// Helper function to delete individual file
async function deleteIndividualFile(
  fileDoc: any,
  options: any
): Promise<any> {
  try {
    let referencesCleared = 0;

    // Clean references if needed
    if (options.reference_handling === "clean_references") {
      const referenceCheck = await checkFileReferences(fileDoc._id);
      if (referenceCheck.hasReferences) {
        referencesCleared = await cleanFileReferences(fileDoc._id, referenceCheck.references);
      }
    }

    // Create backup if requested
    if (options.backup_before_delete && fileDoc.path && !options.dry_run) {
      try {
        const backupPath = `./backups/deleted_files/${Date.now()}_${fileDoc.name}`;
        await Deno.copyFile(`./public${fileDoc.path}`, backupPath);
      } catch (error) {
        console.warn(`Failed to create backup for ${fileDoc.name}: ${error.message}`);
      }
    }

    // Delete physical file if requested
    let physicalDeleted = false;
    if (options.delete_physical_files && fileDoc.path && !options.dry_run) {
      try {
        await Deno.remove(`./public${fileDoc.path}`);
        physicalDeleted = true;
      } catch (error) {
        console.warn(`Failed to delete physical file ${fileDoc.path}: ${error.message}`);
      }
    }

    // Delete from database
    if (!options.dry_run) {
      await file.deleteOne({
        filter: { _id: new ObjectId(fileDoc._id) },
        hardCascade: false
      });
    }

    return {
      success: true,
      referencesCleared,
      physicalDeleted
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to check file references
async function checkFileReferences(fileId: ObjectId): Promise<any> {
  const references = {
    articles: 0,
    courses: 0,
    users: 0
  };

  try {
    // Check articles
    const articleCount = await article.find({
      filter: {},
      projection: { _id: 1 },
      relations: {
        featured_image: {
          filters: { _id: fileId },
          projection: { _id: 1 }
        },
        gallery: {
          filters: { _id: fileId },
          projection: { _id: 1 }
        }
      },
      options: { limit: 10 }
    });

    references.articles = articleCount.docs.filter(a =>
      a.featured_image || (a.gallery && a.gallery.length > 0)
    ).length;

    // Check courses
    const courseCount = await course.find({
      filter: {},
      projection: { _id: 1 },
      relations: {
        featured_image: {
          filters: { _id: fileId },
          projection: { _id: 1 }
        },
        gallery: {
          filters: { _id: fileId },
          projection: { _id: 1 }
        }
      },
      options: { limit: 10 }
    });

    references.courses = courseCount.docs.filter(c =>
      c.featured_image || (c.gallery && c.gallery.length > 0)
    ).length;

    // Check users
    const userCount = await user.find({
      filter: {},
      projection: { _id: 1 },
      relations: {
        avatar: {
          filters: { _id: fileId },
          projection: { _id: 1 }
        },
        national_card: {
          filters: { _id: fileId },
          projection: { _id: 1 }
        }
      },
      options: { limit: 10 }
    });

    references.users = userCount.docs.filter(u =>
      u.avatar || u.national_card
    ).length;

    const totalReferences = references.articles + references.courses + references.users;

    return {
      hasReferences: totalReferences > 0,
      references,
      totalReferences
    };

  } catch (error) {
    console.error(`Error checking references for file ${fileId}:`, error);
    return {
      hasReferences: true, // Assume has references if check fails
      references,
      totalReferences: 1
    };
  }
}

// Helper function to clean file references
async function cleanFileReferences(fileId: ObjectId, references: any): Promise<number> {
  let cleanedCount = 0;

  try {
    // This would implement the actual reference cleaning
    // For now, just return 0 as it's complex to implement safely
    console.log(`[INFO] Would clean references for file ${fileId}:`, references);
    return cleanedCount;
  } catch (error) {
    console.error(`Error cleaning references for file ${fileId}:`, error);
    return 0;
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
