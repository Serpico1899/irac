import { type ActFn, ObjectId } from "@deps";
import { coreApp, file, article, course, user } from "../../../mod.ts";
import type { MyContext } from "@lib";

export const getUnusedFilesFn: ActFn = async (body) => {
  const { user: currentUser }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: {
      grace_period = {},
      filters = {},
      reference_checking = {},
      output = {},
      analysis = {},
      safety = {},
      performance = {},
      dry_run = false,
      ...rest
    },
    get,
  } = body.details;

  const results = {
    totalFilesChecked: 0,
    unusedFiles: [],
    referencedFiles: 0,
    analysis: {
      totalUnusedSize: 0,
      totalUnusedSizeFormatted: "0 Bytes",
      oldestUnusedFile: null,
      newestUnusedFile: null,
      largestUnusedFile: null,
      byCategory: {},
      byType: {},
      byUploader: {}
    },
    recommendations: [],
    warnings: [],
    processingTime: 0,
    dryRun: dry_run
  };

  const startTime = Date.now();

  try {
    // Build grace period filter
    let graceFilter: any = {};
    const now = new Date();

    if (grace_period?.days) {
      const gracePeriodDate = new Date(now.getTime() - grace_period.days * 24 * 60 * 60 * 1000);
      graceFilter.createdAt = { $lt: gracePeriodDate };
    } else if (grace_period?.hours) {
      const gracePeriodDate = new Date(now.getTime() - grace_period.hours * 60 * 60 * 1000);
      graceFilter.createdAt = { $lt: gracePeriodDate };
    } else if (grace_period?.ignore_recent !== false) {
      // Default: ignore files uploaded in last 24 hours
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      graceFilter.createdAt = { $lt: yesterday };
    }

    // Build additional filters
    let fileQuery = { ...graceFilter };

    if (filters?.file_types && filters.file_types.length > 0) {
      fileQuery.type = { $in: filters.file_types };
    }
    if (filters?.categories && filters.categories.length > 0) {
      fileQuery.category = { $in: filters.categories };
    }
    if (filters?.size_min || filters?.size_max) {
      fileQuery.size = {};
      if (filters.size_min) fileQuery.size.$gte = filters.size_min;
      if (filters.size_max) fileQuery.size.$lte = filters.size_max;
    }
    if (filters?.uploaded_before) {
      fileQuery.createdAt = { ...fileQuery.createdAt, $lt: new Date(filters.uploaded_before) };
    }
    if (filters?.uploaded_after) {
      fileQuery.createdAt = { ...fileQuery.createdAt, $gt: new Date(filters.uploaded_after) };
    }
    if (filters?.uploader_ids && filters.uploader_ids.length > 0) {
      fileQuery['uploader._id'] = { $in: filters.uploader_ids.map(id => new ObjectId(id)) };
    }
    if (filters?.has_category === true) {
      fileQuery.category = { $exists: true, $ne: null, $ne: "" };
    } else if (filters?.has_category === false) {
      fileQuery.$or = [
        { category: { $exists: false } },
        { category: null },
        { category: "" }
      ];
    }

    // Get all files matching criteria
    const allFiles = await file.find({
      filter: fileQuery,
      projection: {
        _id: 1, name: 1, type: 1, size: 1, path: 1, url: 1,
        category: 1, tags: 1, permissions: 1, createdAt: 1, updatedAt: 1
      },
      relations: {
        uploader: {
          projection: { _id: 1, email: 1, firstName: 1, lastName: 1 }
        }
      },
      options: {
        sort: { createdAt: -1 },
        limit: performance?.timeout_seconds ? 1000 : undefined // Limit for performance
      }
    });

    results.totalFilesChecked = allFiles.docs.length;

    if (results.totalFilesChecked === 0) {
      return {
        success: true,
        message: "No files found matching the specified criteria",
        ...results,
        processingTime: Date.now() - startTime
      };
    }

    // Check each file for references
    const batchSize = performance?.batch_size || 20;
    const useCache = performance?.use_cache !== false;
    const referenceCache = new Map();

    for (let i = 0; i < allFiles.docs.length; i += batchSize) {
      const batch = allFiles.docs.slice(i, i + batchSize);

      for (const fileDoc of batch) {
        try {
          const hasReferences = await checkFileReferences(
            fileDoc._id,
            reference_checking,
            useCache ? referenceCache : null
          );

          if (!hasReferences) {
            const unusedFileInfo = {
              _id: fileDoc._id,
              name: fileDoc.name,
              type: fileDoc.type,
              size: fileDoc.size,
              sizeFormatted: formatFileSize(fileDoc.size || 0),
              category: fileDoc.category || 'uncategorized',
              tags: fileDoc.tags || [],
              permissions: fileDoc.permissions || 'public',
              uploadedAt: fileDoc.createdAt,
              lastModified: fileDoc.updatedAt,
              uploader: fileDoc.uploader,
              ageInDays: Math.floor((now.getTime() - new Date(fileDoc.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
              path: fileDoc.path,
              url: fileDoc.url
            };

            // Add detailed info if requested
            if (output?.include_file_details) {
              unusedFileInfo.details = {
                physicalExists: await checkPhysicalFile(fileDoc.path),
                lastChecked: new Date()
              };
            }

            results.unusedFiles.push(unusedFileInfo);
          } else {
            results.referencedFiles++;
          }

        } catch (error) {
          results.warnings.push(`Error checking file ${fileDoc.name}: ${error.message}`);
        }
      }

      // Check timeout
      if (performance?.timeout_seconds) {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > performance.timeout_seconds) {
          results.warnings.push(`Processing stopped due to timeout (${performance.timeout_seconds}s)`);
          break;
        }
      }
    }

    // Generate analysis if requested
    if (analysis?.calculate_total_waste !== false) {
      results.analysis = generateUnusedFilesAnalysis(results.unusedFiles);
    }

    // Apply sorting and limiting
    if (output?.sort_by) {
      results.unusedFiles = sortUnusedFiles(results.unusedFiles, output.sort_by);
    }

    if (output?.limit) {
      results.unusedFiles = results.unusedFiles.slice(output.offset || 0, (output.offset || 0) + output.limit);
    }

    // Generate recommendations
    results.recommendations = generateRecommendations(results.unusedFiles, results.analysis);

    // Safety checks
    if (safety?.max_files_threshold && results.unusedFiles.length > safety.max_files_threshold) {
      results.warnings.push(`Found ${results.unusedFiles.length} unused files (threshold: ${safety.max_files_threshold})`);
    }

    if (safety?.size_threshold_mb) {
      const totalSizeMB = results.analysis.totalUnusedSize / (1024 * 1024);
      if (totalSizeMB > safety.size_threshold_mb) {
        results.warnings.push(`Unused files total ${totalSizeMB.toFixed(2)}MB (threshold: ${safety.size_threshold_mb}MB)`);
      }
    }

    results.processingTime = Date.now() - startTime;

    // Log the unused files check for audit
    console.log(`[AUDIT] Unused files check by admin ${currentUser._id}: Found ${results.unusedFiles.length} unused files (${results.analysis.totalUnusedSizeFormatted})`);

    return {
      success: true,
      message: `Found ${results.unusedFiles.length} unused files out of ${results.totalFilesChecked} checked`,
      ...results
    };

  } catch (error) {
    console.error(`[ERROR] Failed to find unused files:`, error);
    throw new Error(`Failed to find unused files: ${error.message}`, { cause: 500 });
  }
};

// Helper function to check if file has references
async function checkFileReferences(
  fileId: ObjectId,
  options: any = {},
  cache: Map<string, boolean> | null = null
): Promise<boolean> {
  const cacheKey = fileId.toString();

  if (cache && cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    // Check articles (featured_image and gallery)
    const articleRefs = await article.find({
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

    const hasArticleRefs = articleRefs.docs.some(a =>
      a.featured_image || (a.gallery && a.gallery.length > 0)
    );

    if (hasArticleRefs) {
      if (cache) cache.set(cacheKey, true);
      return true;
    }

    // Check courses (featured_image and gallery)
    const courseRefs = await course.find({
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

    const hasCourseRefs = courseRefs.docs.some(c =>
      c.featured_image || (c.gallery && c.gallery.length > 0)
    );

    if (hasCourseRefs) {
      if (cache) cache.set(cacheKey, true);
      return true;
    }

    // Check users (avatar and national_card)
    const userRefs = await user.find({
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

    const hasUserRefs = userRefs.docs.some(u =>
      u.avatar || u.national_card
    );

    const hasReferences = hasUserRefs;
    if (cache) cache.set(cacheKey, hasReferences);
    return hasReferences;

  } catch (error) {
    console.error(`Error checking references for file ${fileId}:`, error);
    // Assume has references if check fails (conservative approach)
    if (cache) cache.set(cacheKey, true);
    return true;
  }
}

// Helper function to check if physical file exists
async function checkPhysicalFile(filePath: string | null): Promise<boolean> {
  if (!filePath) return false;

  try {
    const physicalPath = `./public${filePath}`;
    await Deno.stat(physicalPath);
    return true;
  } catch {
    return false;
  }
}

// Helper function to generate analysis
function generateUnusedFilesAnalysis(unusedFiles: any[]): any {
  if (unusedFiles.length === 0) {
    return {
      totalUnusedSize: 0,
      totalUnusedSizeFormatted: "0 Bytes",
      oldestUnusedFile: null,
      newestUnusedFile: null,
      largestUnusedFile: null,
      byCategory: {},
      byType: {},
      byUploader: {}
    };
  }

  const totalSize = unusedFiles.reduce((sum, f) => sum + (f.size || 0), 0);

  // Sort by date to find oldest and newest
  const sortedByDate = [...unusedFiles].sort((a, b) =>
    new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
  );

  // Sort by size to find largest
  const sortedBySize = [...unusedFiles].sort((a, b) => (b.size || 0) - (a.size || 0));

  // Group by category
  const byCategory: { [key: string]: { count: number; size: number } } = {};
  const byType: { [key: string]: { count: number; size: number } } = {};
  const byUploader: { [key: string]: { count: number; size: number; uploader: any } } = {};

  unusedFiles.forEach(file => {
    // By category
    const category = file.category || 'uncategorized';
    if (!byCategory[category]) {
      byCategory[category] = { count: 0, size: 0 };
    }
    byCategory[category].count++;
    byCategory[category].size += file.size || 0;

    // By type
    const baseType = file.type?.split('/')[0] || 'unknown';
    if (!byType[baseType]) {
      byType[baseType] = { count: 0, size: 0 };
    }
    byType[baseType].count++;
    byType[baseType].size += file.size || 0;

    // By uploader
    if (file.uploader) {
      const uploaderId = file.uploader._id.toString();
      if (!byUploader[uploaderId]) {
        byUploader[uploaderId] = { count: 0, size: 0, uploader: file.uploader };
      }
      byUploader[uploaderId].count++;
      byUploader[uploaderId].size += file.size || 0;
    }
  });

  return {
    totalUnusedSize: totalSize,
    totalUnusedSizeFormatted: formatFileSize(totalSize),
    oldestUnusedFile: sortedByDate[0],
    newestUnusedFile: sortedByDate[sortedByDate.length - 1],
    largestUnusedFile: sortedBySize[0],
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      count: data.count,
      size: data.size,
      sizeFormatted: formatFileSize(data.size)
    })),
    byType: Object.entries(byType).map(([type, data]) => ({
      type,
      count: data.count,
      size: data.size,
      sizeFormatted: formatFileSize(data.size)
    })),
    byUploader: Object.entries(byUploader).map(([id, data]) => ({
      uploader: data.uploader,
      count: data.count,
      size: data.size,
      sizeFormatted: formatFileSize(data.size)
    }))
  };
}

// Helper function to sort unused files
function sortUnusedFiles(files: any[], sortBy: string): any[] {
  switch (sortBy) {
    case "size_desc":
      return files.sort((a, b) => (b.size || 0) - (a.size || 0));
    case "size_asc":
      return files.sort((a, b) => (a.size || 0) - (b.size || 0));
    case "date_desc":
      return files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    case "date_asc":
      return files.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
    case "name":
      return files.sort((a, b) => a.name.localeCompare(b.name));
    case "type":
      return files.sort((a, b) => a.type.localeCompare(b.type));
    default:
      return files;
  }
}

// Helper function to generate recommendations
function generateRecommendations(unusedFiles: any[], analysis: any): string[] {
  const recommendations = [];

  if (unusedFiles.length === 0) {
    recommendations.push("✅ No unused files found. File management is optimal.");
    return recommendations;
  }

  if (analysis.totalUnusedSize > 100 * 1024 * 1024) { // >100MB
    recommendations.push(`🗑️ Consider deleting unused files to free up ${analysis.totalUnusedSizeFormatted} of storage space.`);
  }

  if (unusedFiles.length > 50) {
    recommendations.push(`📁 Large number of unused files (${unusedFiles.length}). Consider implementing automated cleanup policies.`);
  }

  // Find categories with most unused files
  const topCategory = analysis.byCategory?.[0];
  if (topCategory && topCategory.count > 10) {
    recommendations.push(`📂 Category "${topCategory.category}" has ${topCategory.count} unused files (${topCategory.sizeFormatted}). Review this category first.`);
  }

  // Check for old files
  if (analysis.oldestUnusedFile) {
    const ageInDays = Math.floor((Date.now() - new Date(analysis.oldestUnusedFile.uploadedAt).getTime()) / (24 * 60 * 60 * 1000));
    if (ageInDays > 365) {
      recommendations.push(`⏰ Oldest unused file is ${ageInDays} days old. Consider archiving or removing very old unused files.`);
    }
  }

  // Check for large files
  if (analysis.largestUnusedFile && analysis.largestUnusedFile.size > 10 * 1024 * 1024) {
    recommendations.push(`📦 Largest unused file is ${analysis.largestUnusedFile.sizeFormatted}. Prioritize removing large unused files for maximum space savings.`);
  }

  return recommendations;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
