import { type ActFn, ObjectId } from "@deps";
import {  coreApp, file, article, course, user  } from "@app";
import type { MyContext } from "@lib";

export const organizeFilesFn: ActFn = async (body) => {
  const { user: currentUser }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: {
      file_ids,
      strategy = "by_category",
      target_category,
      create_category,
      category_structure,
      apply_tags,
      remove_tags,
      set_permissions,
      naming_convention,
      date_organization,
      type_organization,
      usage_organization,
      filters,
      dry_run = false,
      batch_size = 50,
      preserve_original_names = false,
      backup_metadata = true,
      notify_uploaders = false,
      ...rest
    },
    get,
  } = body.details;

  const results = {
    strategy: strategy,
    totalFiles: 0,
    processedFiles: 0,
    skippedFiles: 0,
    errors: [],
    changes: [],
    categories: {
      created: [],
      updated: []
    },
    dryRun: dry_run,
    processingTime: 0
  };

  const startTime = Date.now();

  try {
    // Build file query based on filters and file_ids
    let fileQuery: any = {};

    if (file_ids && file_ids.length > 0) {
      fileQuery._id = { $in: file_ids.map(id => new ObjectId(id)) };
    }

    // Apply filters
    if (filters) {
      if (filters.file_type) {
        fileQuery.type = { $regex: filters.file_type, $options: 'i' };
      }
      if (filters.size_min || filters.size_max) {
        fileQuery.size = {};
        if (filters.size_min) fileQuery.size.$gte = filters.size_min;
        if (filters.size_max) fileQuery.size.$lte = filters.size_max;
      }
      if (filters.uploaded_after || filters.uploaded_before) {
        fileQuery.createdAt = {};
        if (filters.uploaded_after) fileQuery.createdAt.$gte = new Date(filters.uploaded_after);
        if (filters.uploaded_before) fileQuery.createdAt.$lte = new Date(filters.uploaded_before);
      }
      if (filters.uploader_id) {
        fileQuery['uploader._id'] = new ObjectId(filters.uploader_id);
      }
      if (filters.has_category === true) {
        fileQuery.category = { $exists: true, $ne: null, $ne: "" };
      } else if (filters.has_category === false) {
        fileQuery.$or = [
          { category: { $exists: false } },
          { category: null },
          { category: "" }
        ];
      }
      if (filters.has_tags === true) {
        fileQuery.tags = { $exists: true, $not: { $size: 0 } };
      } else if (filters.has_tags === false) {
        fileQuery.$or = [
          { tags: { $exists: false } },
          { tags: { $size: 0 } }
        ];
      }
    }

    // Get files to organize
    const filesToOrganize = await file.find({
      filter: fileQuery,
      projection: {
        _id: 1, name: 1, type: 1, size: 1, path: 1, category: 1,
        tags: 1, permissions: 1, createdAt: 1, updatedAt: 1
      },
      relations: {
        uploader: {
          projection: { _id: 1, email: 1, firstName: 1, lastName: 1 }
        }
      },
      options: { sort: { createdAt: -1 } }
    });

    results.totalFiles = filesToOrganize.docs.length;

    if (results.totalFiles === 0) {
      return {
        ...results,
        message: "No files found matching the specified criteria",
        processingTime: Date.now() - startTime
      };
    }

    // Handle unused files filter if specified
    if (filters?.unused_files) {
      const unusedFiles = [];
      for (const fileDoc of filesToOrganize.docs) {
        const isUsed = await checkFileUsage(fileDoc._id);
        if (!isUsed) {
          unusedFiles.push(fileDoc);
        }
      }
      filesToOrganize.docs = unusedFiles;
      results.totalFiles = unusedFiles.length;
    }

    // Create category if specified
    if (create_category || category_structure) {
      const categoryName = category_structure?.name || create_category;
      if (categoryName) {
        results.categories.created.push({
          name: categoryName,
          description: category_structure?.description,
          parent: category_structure?.parent_category,
          created: !dry_run
        });
      }
    }

    // Process files in batches
    const batches = [];
    for (let i = 0; i < filesToOrganize.docs.length; i += batch_size) {
      batches.push(filesToOrganize.docs.slice(i, i + batch_size));
    }

    for (const batch of batches) {
      for (const fileDoc of batch) {
        try {
          const changes = await organizeFile(
            fileDoc,
            strategy,
            {
              target_category,
              create_category,
              category_structure,
              apply_tags,
              remove_tags,
              set_permissions,
              naming_convention,
              date_organization,
              type_organization,
              usage_organization,
              preserve_original_names,
              backup_metadata
            },
            dry_run
          );

          if (changes.length > 0) {
            results.changes.push({
              fileId: fileDoc._id,
              fileName: fileDoc.name,
              changes: changes
            });
          }

          results.processedFiles++;
        } catch (error) {
          results.errors.push({
            fileId: fileDoc._id,
            fileName: fileDoc.name,
            error: error.message
          });
          results.skippedFiles++;
        }
      }
    }

    results.processingTime = Date.now() - startTime;

    // Log the organization activity for audit
    console.log(`[AUDIT] File organization ${dry_run ? '(DRY RUN) ' : ''}completed by admin ${currentUser._id}: Strategy: ${strategy}, Files: ${results.processedFiles}/${results.totalFiles}, Errors: ${results.errors.length}`);

    return {
      success: true,
      message: `File organization ${dry_run ? 'preview ' : ''}completed successfully`,
      ...results
    };

  } catch (error) {
    console.error(`[ERROR] Failed to organize files:`, error);
    throw new Error(`Failed to organize files: ${error.message}`, { cause: 500 });
  }
};

// Helper function to organize a single file
async function organizeFile(
  fileDoc: any,
  strategy: string,
  options: any,
  dryRun: boolean
): Promise<any[]> {
  const changes: any[] = [];
  const updates: any = {};

  // Apply strategy-specific organization
  switch (strategy) {
    case "by_category":
      if (options.target_category && fileDoc.category !== options.target_category) {
        updates.category = options.target_category;
        changes.push({
          field: "category",
          from: fileDoc.category || "none",
          to: options.target_category
        });
      }
      break;

    case "by_type":
      const typeCategory = getTypeCategoryMapping(fileDoc.type, options.type_organization);
      if (typeCategory && fileDoc.category !== typeCategory) {
        updates.category = typeCategory;
        changes.push({
          field: "category",
          from: fileDoc.category || "none",
          to: typeCategory
        });
      }
      break;

    case "by_date":
      const dateCategory = getDateCategoryMapping(fileDoc.createdAt, options.date_organization);
      if (dateCategory && fileDoc.category !== dateCategory) {
        updates.category = dateCategory;
        changes.push({
          field: "category",
          from: fileDoc.category || "none",
          to: dateCategory
        });
      }
      break;

    case "by_uploader":
      const uploaderCategory = `uploader_${fileDoc.uploader?._id || 'unknown'}`;
      if (fileDoc.category !== uploaderCategory) {
        updates.category = uploaderCategory;
        changes.push({
          field: "category",
          from: fileDoc.category || "none",
          to: uploaderCategory
        });
      }
      break;

    case "by_usage":
      const usageCategory = await getUsageCategoryMapping(fileDoc._id, options.usage_organization);
      if (usageCategory && fileDoc.category !== usageCategory) {
        updates.category = usageCategory;
        changes.push({
          field: "category",
          from: fileDoc.category || "none",
          to: usageCategory
        });
      }
      break;

    case "custom":
      // Custom organization logic can be added here
      break;
  }

  // Apply bulk metadata updates
  if (options.apply_tags && options.apply_tags.length > 0) {
    const currentTags = fileDoc.tags || [];
    const newTags = [...new Set([...currentTags, ...options.apply_tags])];
    if (newTags.length !== currentTags.length || !arraysEqual(newTags.sort(), currentTags.sort())) {
      updates.tags = newTags;
      changes.push({
        field: "tags",
        from: currentTags,
        to: newTags,
        added: options.apply_tags.filter(tag => !currentTags.includes(tag))
      });
    }
  }

  if (options.remove_tags && options.remove_tags.length > 0) {
    const currentTags = fileDoc.tags || [];
    const filteredTags = currentTags.filter(tag => !options.remove_tags.includes(tag));
    if (filteredTags.length !== currentTags.length) {
      updates.tags = filteredTags;
      changes.push({
        field: "tags",
        from: currentTags,
        to: filteredTags,
        removed: options.remove_tags.filter(tag => currentTags.includes(tag))
      });
    }
  }

  if (options.set_permissions && fileDoc.permissions !== options.set_permissions) {
    updates.permissions = options.set_permissions;
    changes.push({
      field: "permissions",
      from: fileDoc.permissions || "none",
      to: options.set_permissions
    });
  }

  // Apply naming convention
  if (options.naming_convention && !options.preserve_original_names) {
    const newName = generateFileName(fileDoc, options.naming_convention);
    if (newName && newName !== fileDoc.name) {
      updates.name = newName;
      changes.push({
        field: "name",
        from: fileDoc.name,
        to: newName
      });
    }
  }

  // Backup metadata if requested
  if (options.backup_metadata && changes.length > 0) {
    updates.backup_metadata = {
      original: {
        name: fileDoc.name,
        category: fileDoc.category,
        tags: fileDoc.tags,
        permissions: fileDoc.permissions
      },
      backedUpAt: new Date(),
      backedUpBy: "organize_files_operation"
    };
  }

  // Apply updates if not dry run
  if (!dryRun && Object.keys(updates).length > 0) {
    updates.updatedAt = new Date();
    await file.updateOne({
      filter: { _id: new ObjectId(fileDoc._id) },
      update: { $set: updates }
    });
  }

  return changes;
}

// Helper function to check if file is used
async function checkFileUsage(fileId: ObjectId): Promise<boolean> {
  try {
    // Check articles
    const articlesCount = await article.countDocuments({
      $or: [
        { 'featured_image._id': fileId },
        { 'gallery._id': fileId }
      ]
    });

    if (articlesCount > 0) return true;

    // Check courses
    const coursesCount = await course.countDocuments({
      $or: [
        { 'featured_image._id': fileId },
        { 'gallery._id': fileId }
      ]
    });

    if (coursesCount > 0) return true;

    // Check users
    const usersCount = await user.countDocuments({
      $or: [
        { 'avatar._id': fileId },
        { 'national_card._id': fileId }
      ]
    });

    return usersCount > 0;
  } catch (error) {
    console.error(`Error checking file usage for ${fileId}:`, error);
    return true; // Assume used if we can't check
  }
}

// Helper function to get type-based category
function getTypeCategoryMapping(fileType: string, typeOrg?: any): string | null {
  if (!typeOrg) return null;

  if (typeOrg.type_mapping && typeOrg.type_mapping[fileType]) {
    return typeOrg.type_mapping[fileType];
  }

  if (typeOrg.separate_by_type) {
    if (fileType.startsWith('image/')) return 'images';
    if (fileType.startsWith('video/')) return 'videos';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return 'documents';
    return 'other';
  }

  return null;
}

// Helper function to get date-based category
function getDateCategoryMapping(createdAt: Date, dateOrg?: any): string | null {
  if (!dateOrg || !createdAt) return null;

  const date = new Date(createdAt);

  switch (dateOrg.group_by) {
    case 'year':
      return `${date.getFullYear()}`;
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    case 'day':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    default:
      return null;
  }
}

// Helper function to get usage-based category
async function getUsageCategoryMapping(fileId: ObjectId, usageOrg?: any): Promise<string | null> {
  if (!usageOrg) return null;

  try {
    const isUsed = await checkFileUsage(fileId);

    if (!isUsed && usageOrg.unused_category) {
      return usageOrg.unused_category;
    }

    if (isUsed && usageOrg.recent_category) {
      return usageOrg.recent_category;
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Helper function to generate file name based on convention
function generateFileName(fileDoc: any, namingConvention: any): string | null {
  if (!namingConvention.pattern) return null;

  let newName = namingConvention.pattern;
  const date = new Date(fileDoc.createdAt);
  const originalName = fileDoc.name;
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const extension = originalName.substring(originalName.lastIndexOf('.')) || '';

  // Replace placeholders
  newName = newName.replace('{original}', nameWithoutExt);
  newName = newName.replace('{type}', fileDoc.type.split('/')[0]);
  newName = newName.replace('{extension}', extension);

  if (namingConvention.date_format) {
    const dateStr = formatDate(date, namingConvention.date_format);
    newName = newName.replace('{date}', dateStr);
  } else {
    newName = newName.replace('{date}', date.toISOString().split('T')[0]);
  }

  if (namingConvention.include_uploader && fileDoc.uploader) {
    newName = newName.replace('{uploader}', fileDoc.uploader.email.split('@')[0]);
  }

  if (namingConvention.include_category && fileDoc.category) {
    newName = newName.replace('{category}', fileDoc.category);
  }

  if (namingConvention.sanitize_names) {
    newName = newName.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  return newName + extension;
}

// Helper function to format date
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day);
}

// Helper function to compare arrays
function arraysEqual(a: any[], b: any[]): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}
