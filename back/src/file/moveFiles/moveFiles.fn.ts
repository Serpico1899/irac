import { type ActFn, ObjectId, ensureDir } from "@deps";
import {  coreApp, file, article, course, user  } from "@app";
import type { MyContext } from "@lib";

export const moveFilesFn: ActFn = async (body) => {
  const { user: currentUser }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: {
      file_ids,
      destination_category,
      destination_path,
      move_strategy = "both",
      preserve_structure = false,
      create_directories = true,
      handle_conflicts = "rename",
      rename_pattern,
      preserve_names = true,
      backup_before_move = false,
      verify_move = true,
      dry_run = false,
      batch_size = 20,
      skip_errors = false,
      update_references = true,
      filters,
      confirm_move = false,
      force_move = false,
      ...rest
    },
    get,
  } = body.details;

  // Validate required parameters
  if (!file_ids || file_ids.length === 0) {
    throw new Error("No file IDs provided for moving", { cause: 400 });
  }

  if (!destination_category && !destination_path && move_strategy !== "category_only") {
    throw new Error("Destination category or path is required", { cause: 400 });
  }

  const results = {
    strategy: move_strategy,
    totalFiles: 0,
    processedFiles: 0,
    skippedFiles: 0,
    failedFiles: 0,
    movedFiles: [],
    errors: [],
    warnings: [],
    backups: [],
    dryRun: dry_run,
    processingTime: 0
  };

  const startTime = Date.now();

  try {
    // Get files to move
    const fileObjectIds = file_ids.map(id => new ObjectId(id));
    const filesToMove = await file.find({
      filter: { _id: { $in: fileObjectIds } },
      projection: {
        _id: 1, name: 1, type: 1, size: 1, path: 1, url: 1,
        category: 1, tags: 1, createdAt: 1, updatedAt: 1
      },
      relations: {
        uploader: {
          projection: { _id: 1, email: 1 }
        }
      }
    });

    results.totalFiles = filesToMove.docs.length;

    if (results.totalFiles === 0) {
      return {
        ...results,
        success: false,
        message: "No files found with the provided IDs",
        processingTime: Date.now() - startTime
      };
    }

    // Apply filters if provided
    let filteredFiles = filesToMove.docs;
    if (filters) {
      filteredFiles = await applyMoveFilters(filteredFiles, filters);
      results.totalFiles = filteredFiles.length;
    }

    // Safety checks
    if (filteredFiles.length > 100 && !confirm_move) {
      throw new Error(`Moving ${filteredFiles.length} files requires confirmation (confirm_move=true)`, { cause: 403 });
    }

    // Check for dangerous operations
    const warningChecks = await performSafetyChecks(filteredFiles, move_strategy, destination_path, force_move);
    results.warnings = warningChecks.warnings;

    if (warningChecks.requiresConfirmation && !force_move) {
      throw new Error("This move operation has potential risks. Use force_move=true to proceed.", {
        cause: {
          code: 403,
          warnings: warningChecks.warnings,
          requiresConfirmation: true
        }
      });
    }

    // Prepare destination path
    if (destination_path && create_directories && !dry_run) {
      try {
        await ensureDir(`./public${destination_path}`);
      } catch (error) {
        results.warnings.push(`Failed to create destination directory: ${error.message}`);
      }
    }

    // Process files in batches
    const batches = [];
    for (let i = 0; i < filteredFiles.length; i += batch_size) {
      batches.push(filteredFiles.slice(i, i + batch_size));
    }

    for (const batch of batches) {
      for (const fileDoc of batch) {
        try {
          const moveResult = await moveIndividualFile(
            fileDoc,
            {
              destination_category,
              destination_path,
              move_strategy,
              preserve_structure,
              handle_conflicts,
              rename_pattern,
              preserve_names,
              backup_before_move,
              verify_move,
              update_references,
              dry_run
            }
          );

          if (moveResult.success) {
            results.movedFiles.push({
              fileId: fileDoc._id,
              fileName: fileDoc.name,
              from: moveResult.from,
              to: moveResult.to,
              changes: moveResult.changes
            });

            if (moveResult.backup) {
              results.backups.push(moveResult.backup);
            }

            results.processedFiles++;
          } else {
            if (skip_errors) {
              results.skippedFiles++;
              results.warnings.push(`Skipped file ${fileDoc.name}: ${moveResult.error}`);
            } else {
              throw new Error(moveResult.error || "Failed to move file");
            }
          }

        } catch (error) {
          results.errors.push({
            fileId: fileDoc._id,
            fileName: fileDoc.name,
            error: error.message
          });

          if (skip_errors) {
            results.failedFiles++;
          } else {
            throw error;
          }
        }
      }
    }

    results.processingTime = Date.now() - startTime;

    // Log the move operation for audit
    console.log(`[AUDIT] File move ${dry_run ? '(DRY RUN) ' : ''}completed by admin ${currentUser._id}: Strategy: ${move_strategy}, Files: ${results.processedFiles}/${results.totalFiles}, Failed: ${results.failedFiles}, Destination: ${destination_category || destination_path}`);

    return {
      success: results.failedFiles === 0,
      message: `File move ${dry_run ? 'preview ' : ''}completed. ${results.processedFiles} files processed, ${results.failedFiles} failed`,
      ...results
    };

  } catch (error) {
    console.error(`[ERROR] Failed to move files:`, error);
    throw new Error(`Failed to move files: ${error.message}`, { cause: error.cause || 500 });
  }
};

// Helper function to move individual file
async function moveIndividualFile(
  fileDoc: any,
  options: any
): Promise<any> {
  const result = {
    success: false,
    from: {
      category: fileDoc.category,
      path: fileDoc.path,
      url: fileDoc.url
    },
    to: {
      category: null,
      path: null,
      url: null
    },
    changes: [],
    backup: null,
    error: null
  };

  try {
    const updates: any = {};
    const changes: any[] = [];

    // Handle category move
    if (options.move_strategy === "category_only" || options.move_strategy === "both") {
      if (options.destination_category && fileDoc.category !== options.destination_category) {
        updates.category = options.destination_category;
        result.to.category = options.destination_category;
        changes.push({
          field: "category",
          from: fileDoc.category || "none",
          to: options.destination_category
        });
      }
    }

    // Handle physical file move
    if (options.move_strategy === "physical_only" || options.move_strategy === "both") {
      if (options.destination_path && fileDoc.path) {
        const currentPhysicalPath = `./public${fileDoc.path}`;
        const fileName = options.preserve_names ? fileDoc.name : generateNewFileName(fileDoc, options.rename_pattern);
        const newRelativePath = `${options.destination_path}/${fileName}`;
        const newPhysicalPath = `./public${newRelativePath}`;
        const newPublicUrl = newRelativePath;

        // Check for conflicts
        const conflictResult = await handleFileConflicts(
          newPhysicalPath,
          options.handle_conflicts,
          fileName,
          options.dry_run
        );

        const finalPhysicalPath = conflictResult.finalPath;
        const finalRelativePath = finalPhysicalPath.replace('./public', '');
        const finalFileName = finalPhysicalPath.split('/').pop() || fileName;

        // Create backup if requested
        if (options.backup_before_move && !options.dry_run) {
          const backupPath = `${currentPhysicalPath}.backup.${Date.now()}`;
          try {
            await Deno.copyFile(currentPhysicalPath, backupPath);
            result.backup = {
              original: currentPhysicalPath,
              backup: backupPath,
              createdAt: new Date()
            };
          } catch (error) {
            console.warn(`Failed to create backup for ${currentPhysicalPath}: ${error.message}`);
          }
        }

        // Move physical file
        if (!options.dry_run) {
          try {
            // Check if source file exists
            const sourceExists = await fileExists(currentPhysicalPath);
            if (!sourceExists) {
              result.error = `Source file does not exist: ${currentPhysicalPath}`;
              return result;
            }

            // Perform the move
            await Deno.rename(currentPhysicalPath, finalPhysicalPath);

            // Verify move if requested
            if (options.verify_move) {
              const destExists = await fileExists(finalPhysicalPath);
              if (!destExists) {
                result.error = `Move verification failed: destination file does not exist`;
                return result;
              }
            }
          } catch (error) {
            result.error = `Failed to move physical file: ${error.message}`;
            return result;
          }
        }

        // Update database paths
        updates.path = finalRelativePath;
        updates.url = finalRelativePath;
        updates.name = finalFileName;

        result.to.path = finalRelativePath;
        result.to.url = finalRelativePath;

        changes.push({
          field: "path",
          from: fileDoc.path,
          to: finalRelativePath
        });

        if (finalFileName !== fileDoc.name) {
          changes.push({
            field: "name",
            from: fileDoc.name,
            to: finalFileName
          });
        }
      }
    }

    // Update database if changes were made
    if (!options.dry_run && Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();

      await file.updateOne({
        filter: { _id: new ObjectId(fileDoc._id) },
        update: { $set: updates }
      });

      // Update references in other models if requested
      if (options.update_references && (updates.path || updates.url)) {
        await updateFileReferences(fileDoc._id, updates);
      }
    }

    result.success = true;
    result.changes = changes;
    return result;

  } catch (error) {
    result.error = error.message;
    return result;
  }
}

// Helper function to apply move filters
async function applyMoveFilters(files: any[], filters: any): Promise<any[]> {
  let filteredFiles = files;

  if (filters.file_type) {
    filteredFiles = filteredFiles.filter(f =>
      f.type.toLowerCase().includes(filters.file_type.toLowerCase())
    );
  }

  if (filters.size_min || filters.size_max) {
    filteredFiles = filteredFiles.filter(f => {
      if (filters.size_min && f.size < filters.size_min) return false;
      if (filters.size_max && f.size > filters.size_max) return false;
      return true;
    });
  }

  if (filters.older_than) {
    const cutoffDate = new Date(filters.older_than);
    filteredFiles = filteredFiles.filter(f =>
      new Date(f.createdAt) < cutoffDate
    );
  }

  if (filters.unused_only) {
    const unusedFiles = [];
    for (const file of filteredFiles) {
      const isUsed = await checkFileUsage(file._id);
      if (!isUsed) {
        unusedFiles.push(file);
      }
    }
    filteredFiles = unusedFiles;
  }

  return filteredFiles;
}

// Helper function to perform safety checks
async function performSafetyChecks(files: any[], strategy: string, destinationPath?: string, force?: boolean): Promise<any> {
  const checks = {
    warnings: [],
    requiresConfirmation: false
  };

  // Check for large number of files
  if (files.length > 50) {
    checks.warnings.push(`Moving ${files.length} files at once`);
    checks.requiresConfirmation = true;
  }

  // Check for system files or important directories
  if (destinationPath) {
    const dangerousPaths = ['/system', '/admin', '/config', '/backup'];
    if (dangerousPaths.some(path => destinationPath.includes(path))) {
      checks.warnings.push(`Moving to system directory: ${destinationPath}`);
      checks.requiresConfirmation = true;
    }
  }

  // Check for files that are heavily referenced
  let highlyReferencedFiles = 0;
  for (const file of files.slice(0, 10)) { // Check first 10 files only for performance
    const isUsed = await checkFileUsage(file._id);
    if (isUsed) {
      highlyReferencedFiles++;
    }
  }

  if (highlyReferencedFiles > 5) {
    checks.warnings.push(`${highlyReferencedFiles} files are actively referenced by other content`);
    checks.requiresConfirmation = true;
  }

  return checks;
}

// Helper function to handle file conflicts
async function handleFileConflicts(
  targetPath: string,
  strategy: string,
  originalName: string,
  dryRun: boolean
): Promise<{ finalPath: string; renamed: boolean }> {
  const exists = dryRun ? false : await fileExists(targetPath);

  if (!exists) {
    return { finalPath: targetPath, renamed: false };
  }

  switch (strategy) {
    case "skip":
      throw new Error(`File already exists: ${targetPath}`);

    case "overwrite":
      return { finalPath: targetPath, renamed: false };

    case "rename":
      const pathParts = targetPath.split('/');
      const fileName = pathParts.pop() || originalName;
      const directory = pathParts.join('/');
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      const extension = fileName.substring(fileName.lastIndexOf('.')) || '';

      let counter = 1;
      let newPath;

      do {
        const newFileName = `${nameWithoutExt}_${counter}${extension}`;
        newPath = `${directory}/${newFileName}`;
        counter++;
      } while (!dryRun && await fileExists(newPath) && counter < 1000);

      if (counter >= 1000) {
        throw new Error(`Could not find available name for file: ${originalName}`);
      }

      return { finalPath: newPath, renamed: true };

    case "merge":
      // For merge strategy, we might implement file content merging in the future
      return { finalPath: targetPath, renamed: false };

    default:
      throw new Error(`Unknown conflict handling strategy: ${strategy}`);
  }
}

// Helper function to generate new file name
function generateNewFileName(fileDoc: any, pattern?: string): string {
  if (!pattern) return fileDoc.name;

  const date = new Date();
  const originalName = fileDoc.name;
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const extension = originalName.substring(originalName.lastIndexOf('.')) || '';

  let newName = pattern;
  newName = newName.replace('{original}', nameWithoutExt);
  newName = newName.replace('{date}', date.toISOString().split('T')[0]);
  newName = newName.replace('{timestamp}', Date.now().toString());
  newName = newName.replace('{type}', fileDoc.type.split('/')[0]);

  return newName + extension;
}

// Helper function to check if file exists
async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

// Helper function to check file usage
async function checkFileUsage(fileId: ObjectId): Promise<boolean> {
  try {
    // Check articles
    const articlesCount = await article.find({
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
      options: { limit: 1 }
    });

    if (articlesCount.docs.some(a => a.featured_image || (a.gallery && a.gallery.length > 0))) {
      return true;
    }

    // Check courses
    const coursesCount = await course.find({
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
      options: { limit: 1 }
    });

    if (coursesCount.docs.some(c => c.featured_image || (c.gallery && c.gallery.length > 0))) {
      return true;
    }

    // Check users
    const usersCount = await user.find({
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
      options: { limit: 1 }
    });

    return usersCount.docs.some(u => u.avatar || u.national_card);

  } catch (error) {
    console.error(`Error checking file usage for ${fileId}:`, error);
    return true; // Assume used if we can't check
  }
}

// Helper function to update file references in other models
async function updateFileReferences(fileId: ObjectId, updates: any): Promise<void> {
  try {
    // This function would update references in other models
    // For now, we'll just log that references should be updated
    console.log(`[INFO] File references should be updated for file ${fileId} with new path: ${updates.path}`);

    // In a full implementation, you would:
    // 1. Update article.featured_image and article.gallery references
    // 2. Update course.featured_image and course.gallery references
    // 3. Update user.avatar and user.national_card references
    // 4. Update any other models that reference this file

  } catch (error) {
    console.error(`Failed to update file references for ${fileId}:`, error);
  }
}
