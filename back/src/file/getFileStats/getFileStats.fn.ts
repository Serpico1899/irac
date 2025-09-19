import { type ActFn, ObjectId } from "@deps";
import { coreApp, file, article, course, user } from "../../../mod.ts";
import type { MyContext } from "@lib";

export const getFileStatsFn: ActFn = async (body) => {
  const { user: currentUser }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: {
      stats_types = ["all"],
      time_period = {},
      grouping = {},
      filters = {},
      output = {},
      storage_analysis = {},
      usage_analysis = {},
      ...rest
    },
    get,
  } = body.details;

  const results = {
    generatedAt: new Date(),
    generatedBy: currentUser._id,
    timePeriod: time_period,
    summary: {},
    storage: {},
    usage: {},
    uploads: {},
    types: {},
    users: {},
    categories: {},
    cleanup: {},
    processingTime: 0
  };

  const startTime = Date.now();

  try {
    // Build time filter if specified
    let timeFilter: any = {};
    if (time_period?.start_date || time_period?.end_date) {
      timeFilter.createdAt = {};
      if (time_period.start_date) {
        timeFilter.createdAt.$gte = new Date(time_period.start_date);
      }
      if (time_period.end_date) {
        timeFilter.createdAt.$lte = new Date(time_period.end_date);
      }
    } else if (time_period?.period_type) {
      const now = new Date();
      switch (time_period.period_type) {
        case "today":
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          timeFilter.createdAt = { $gte: startOfDay };
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          timeFilter.createdAt = { $gte: weekAgo };
          break;
        case "month":
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          timeFilter.createdAt = { $gte: monthAgo };
          break;
        case "year":
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          timeFilter.createdAt = { $gte: yearAgo };
          break;
      }
    }

    // Apply additional filters
    let queryFilter = { ...timeFilter };
    if (filters.file_types && filters.file_types.length > 0) {
      queryFilter.type = { $in: filters.file_types };
    }
    if (filters.categories && filters.categories.length > 0) {
      queryFilter.category = { $in: filters.categories };
    }
    if (filters.size_min || filters.size_max) {
      queryFilter.size = {};
      if (filters.size_min) queryFilter.size.$gte = filters.size_min;
      if (filters.size_max) queryFilter.size.$lte = filters.size_max;
    }

    // Get all files matching criteria
    const allFiles = await file.find({
      filter: queryFilter,
      projection: {
        _id: 1, name: 1, type: 1, size: 1, category: 1,
        tags: 1, permissions: 1, createdAt: 1, updatedAt: 1
      },
      relations: {
        uploader: {
          projection: { _id: 1, email: 1, firstName: 1, lastName: 1 }
        }
      },
      options: { sort: { createdAt: -1 } }
    });

    const totalFiles = allFiles.docs.length;
    const totalSize = allFiles.docs.reduce((sum, f) => sum + (f.size || 0), 0);

    // Generate summary
    results.summary = {
      totalFiles,
      totalSize,
      totalSizeFormatted: formatFileSize(totalSize),
      averageFileSize: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0,
      averageFileSizeFormatted: totalFiles > 0 ? formatFileSize(Math.round(totalSize / totalFiles)) : "0 Bytes"
    };

    // Storage Statistics
    if (stats_types.includes("storage") || stats_types.includes("all")) {
      results.storage = await generateStorageStats(allFiles.docs, storage_analysis);
    }

    // File Type Statistics
    if (stats_types.includes("types") || stats_types.includes("all")) {
      results.types = generateTypeStats(allFiles.docs);
    }

    // User Statistics
    if (stats_types.includes("users") || stats_types.includes("all")) {
      results.users = generateUserStats(allFiles.docs);
    }

    // Category Statistics
    if (stats_types.includes("categories") || stats_types.includes("all")) {
      results.categories = generateCategoryStats(allFiles.docs);
    }

    // Upload Trends
    if (stats_types.includes("uploads") || stats_types.includes("all")) {
      results.uploads = generateUploadTrends(allFiles.docs, grouping);
    }

    // Usage Statistics
    if (stats_types.includes("usage") || stats_types.includes("all")) {
      results.usage = await generateUsageStats(allFiles.docs, usage_analysis);
    }

    // Cleanup Recommendations
    if (stats_types.includes("cleanup") || stats_types.includes("all")) {
      results.cleanup = await generateCleanupStats(allFiles.docs);
    }

    results.processingTime = Date.now() - startTime;

    // Log analytics access for audit
    console.log(`[AUDIT] File statistics accessed by admin ${currentUser._id}: ${stats_types.join(',')}, ${totalFiles} files analyzed`);

    return {
      success: true,
      message: `File statistics generated for ${totalFiles} files`,
      ...results
    };

  } catch (error) {
    console.error(`[ERROR] Failed to generate file statistics:`, error);
    throw new Error(`Failed to generate file statistics: ${error.message}`, { cause: 500 });
  }
};

// Helper function to generate storage statistics
async function generateStorageStats(files: any[], storageAnalysis: any): Promise<any> {
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
    byType: {},
    byCategory: {},
    largestFiles: [],
    smallestFiles: [],
    duplicatePotential: 0
  };

  // Group by type
  const typeGroups: { [key: string]: { count: number; size: number } } = {};
  const categoryGroups: { [key: string]: { count: number; size: number } } = {};

  for (const file of files) {
    const baseType = file.type?.split('/')[0] || 'unknown';
    if (!typeGroups[baseType]) {
      typeGroups[baseType] = { count: 0, size: 0 };
    }
    typeGroups[baseType].count++;
    typeGroups[baseType].size += file.size || 0;

    const category = file.category || 'uncategorized';
    if (!categoryGroups[category]) {
      categoryGroups[category] = { count: 0, size: 0 };
    }
    categoryGroups[category].count++;
    categoryGroups[category].size += file.size || 0;
  }

  stats.byType = Object.entries(typeGroups).map(([type, data]) => ({
    type,
    count: data.count,
    size: data.size,
    sizeFormatted: formatFileSize(data.size),
    percentage: ((data.size / stats.totalSize) * 100).toFixed(2)
  }));

  stats.byCategory = Object.entries(categoryGroups).map(([category, data]) => ({
    category,
    count: data.count,
    size: data.size,
    sizeFormatted: formatFileSize(data.size),
    percentage: ((data.size / stats.totalSize) * 100).toFixed(2)
  }));

  // Find largest files
  stats.largestFiles = files
    .sort((a, b) => (b.size || 0) - (a.size || 0))
    .slice(0, 10)
    .map(f => ({
      _id: f._id,
      name: f.name,
      type: f.type,
      size: f.size,
      sizeFormatted: formatFileSize(f.size || 0),
      category: f.category
    }));

  return stats;
}

// Helper function to generate type statistics
function generateTypeStats(files: any[]): any {
  const typeStats: { [key: string]: number } = {};
  const mimeStats: { [key: string]: number } = {};

  for (const file of files) {
    const baseType = file.type?.split('/')[0] || 'unknown';
    const mimeType = file.type || 'unknown';

    typeStats[baseType] = (typeStats[baseType] || 0) + 1;
    mimeStats[mimeType] = (mimeStats[mimeType] || 0) + 1;
  }

  return {
    byBaseType: Object.entries(typeStats)
      .map(([type, count]) => ({
        type,
        count,
        percentage: ((count / files.length) * 100).toFixed(2)
      }))
      .sort((a, b) => b.count - a.count),
    byMimeType: Object.entries(mimeStats)
      .map(([type, count]) => ({
        type,
        count,
        percentage: ((count / files.length) * 100).toFixed(2)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 MIME types
  };
}

// Helper function to generate user statistics
function generateUserStats(files: any[]): any {
  const userStats: { [key: string]: { count: number; size: number; user: any } } = {};

  for (const file of files) {
    if (file.uploader) {
      const userId = file.uploader._id.toString();
      if (!userStats[userId]) {
        userStats[userId] = {
          count: 0,
          size: 0,
          user: file.uploader
        };
      }
      userStats[userId].count++;
      userStats[userId].size += file.size || 0;
    }
  }

  return {
    totalUploaders: Object.keys(userStats).length,
    topUploaders: Object.values(userStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(stat => ({
        user: stat.user,
        fileCount: stat.count,
        totalSize: stat.size,
        totalSizeFormatted: formatFileSize(stat.size),
        averageFileSize: formatFileSize(stat.size / stat.count)
      }))
  };
}

// Helper function to generate category statistics
function generateCategoryStats(files: any[]): any {
  const categoryStats: { [key: string]: { count: number; size: number } } = {};

  for (const file of files) {
    const category = file.category || 'uncategorized';
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, size: 0 };
    }
    categoryStats[category].count++;
    categoryStats[category].size += file.size || 0;
  }

  return Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      fileCount: stats.count,
      totalSize: stats.size,
      totalSizeFormatted: formatFileSize(stats.size),
      percentage: ((stats.count / files.length) * 100).toFixed(2)
    }))
    .sort((a, b) => b.fileCount - a.fileCount);
}

// Helper function to generate upload trends
function generateUploadTrends(files: any[], grouping: any): any {
  const trends: { [key: string]: number } = {};
  const granularity = grouping?.date_granularity || 'day';

  for (const file of files) {
    if (file.createdAt) {
      const date = new Date(file.createdAt);
      let key: string;

      switch (granularity) {
        case 'hour':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'week':
          const weekStart = new Date(date.getTime() - date.getDay() * 24 * 60 * 60 * 1000);
          key = `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default: // day
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      trends[key] = (trends[key] || 0) + 1;
    }
  }

  return {
    granularity,
    data: Object.entries(trends)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period))
  };
}

// Helper function to generate usage statistics
async function generateUsageStats(files: any[], usageAnalysis: any): Promise<any> {
  // This would require checking file references across models
  // For now, return basic placeholder stats
  return {
    referencedFiles: 0,
    unreferencedFiles: files.length,
    mostUsedFiles: [],
    leastUsedFiles: [],
    note: "Detailed usage analysis requires reference checking implementation"
  };
}

// Helper function to generate cleanup recommendations
async function generateCleanupStats(files: any[]): Promise<any> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const oldFiles = files.filter(f => new Date(f.createdAt) < ninetyDaysAgo);
  const largeFiles = files.filter(f => (f.size || 0) > 10 * 1024 * 1024); // >10MB
  const uncategorizedFiles = files.filter(f => !f.category || f.category === 'uncategorized');

  const potentialSavings = oldFiles.reduce((sum, f) => sum + (f.size || 0), 0);

  return {
    oldFiles: {
      count: oldFiles.length,
      totalSize: potentialSavings,
      totalSizeFormatted: formatFileSize(potentialSavings),
      recommendation: "Consider archiving or removing files older than 90 days"
    },
    largeFiles: {
      count: largeFiles.length,
      totalSize: largeFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      recommendation: "Review large files for compression or archival opportunities"
    },
    uncategorizedFiles: {
      count: uncategorizedFiles.length,
      recommendation: "Organize uncategorized files into appropriate categories"
    },
    totalPotentialSavings: potentialSavings,
    totalPotentialSavingsFormatted: formatFileSize(potentialSavings)
  };
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
