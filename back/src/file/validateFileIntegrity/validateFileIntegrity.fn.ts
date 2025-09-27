import { type ActFn, ObjectId } from "@deps";
import {  coreApp, file, article, course, user  } from "@app";
import type { MyContext } from "@lib";

export const validateFileIntegrityFn: ActFn = async (body) => {
  const { user: currentUser }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: {
      validation_scope = {},
      checks = {},
      reference_validation = {},
      auto_repair = {},
      processing = {},
      reporting = {},
      testing = {},
      ...rest
    },
    get,
  } = body.details;

  const results = {
    validationScope: validation_scope,
    totalFilesChecked: 0,
    healthyFiles: 0,
    problematicFiles: 0,
    issues: {
      missingPhysicalFiles: [],
      corruptedFiles: [],
      sizeMismatches: [],
      brokenReferences: [],
      orphanedReferences: [],
      permissionIssues: [],
      pathIssues: []
    },
    repairs: {
      attempted: 0,
      successful: 0,
      failed: []
    },
    summary: {},
    recommendations: [],
    processingTime: 0,
    dryRun: testing?.dry_run || false
  };

  const startTime = Date.now();

  try {
    // Build validation scope query
    let scopeQuery: any = {};

    if (validation_scope?.file_ids && validation_scope.file_ids.length > 0) {
      scopeQuery._id = { $in: validation_scope.file_ids.map(id => new ObjectId(id)) };
    }

    if (validation_scope?.categories && validation_scope.categories.length > 0) {
      scopeQuery.category = { $in: validation_scope.categories };
    }

    if (validation_scope?.file_types && validation_scope.file_types.length > 0) {
      scopeQuery.type = { $in: validation_scope.file_types };
    }

    if (validation_scope?.uploaded_before || validation_scope?.uploaded_after) {
      scopeQuery.createdAt = {};
      if (validation_scope.uploaded_before) {
        scopeQuery.createdAt.$lt = new Date(validation_scope.uploaded_before);
      }
      if (validation_scope.uploaded_after) {
        scopeQuery.createdAt.$gt = new Date(validation_scope.uploaded_after);
      }
    }

    if (validation_scope?.size_min || validation_scope?.size_max) {
      scopeQuery.size = {};
      if (validation_scope.size_min) scopeQuery.size.$gte = validation_scope.size_min;
      if (validation_scope.size_max) scopeQuery.size.$lte = validation_scope.size_max;
    }

    // Get all files in validation scope
    const filesToValidate = await file.find({
      filter: scopeQuery,
      projection: {
        _id: 1, name: 1, type: 1, size: 1, path: 1, url: 1,
        category: 1, permissions: 1, createdAt: 1, updatedAt: 1
      },
      relations: {
        uploader: {
          projection: { _id: 1, email: 1 }
        }
      },
      options: {
        sort: { createdAt: -1 },
        limit: processing?.max_processing_time ? 1000 : undefined
      }
    });

    results.totalFilesChecked = filesToValidate.docs.length;

    if (results.totalFilesChecked === 0) {
      return {
        success: true,
        message: "No files found in validation scope",
        ...results,
        processingTime: Date.now() - startTime
      };
    }

    // Process files in batches
    const batchSize = processing?.batch_size || 25;
    let processedCount = 0;

    for (let i = 0; i < filesToValidate.docs.length; i += batchSize) {
      const batch = filesToValidate.docs.slice(i, i + batchSize);

      for (const fileDoc of batch) {
        try {
          const validationResult = await validateIndividualFile(
            fileDoc,
            checks,
            reference_validation,
            auto_repair,
            results.dryRun
          );

          if (validationResult.isHealthy) {
            results.healthyFiles++;
          } else {
            results.problematicFiles++;

            // Categorize issues
            if (validationResult.issues.missingPhysical) {
              results.issues.missingPhysicalFiles.push({
                fileId: fileDoc._id,
                fileName: fileDoc.name,
                path: fileDoc.path,
                details: validationResult.issues.missingPhysical
              });
            }

            if (validationResult.issues.sizeMismatch) {
              results.issues.sizeMismatches.push({
                fileId: fileDoc._id,
                fileName: fileDoc.name,
                expected: fileDoc.size,
                actual: validationResult.issues.sizeMismatch.actualSize,
                difference: validationResult.issues.sizeMismatch.difference
              });
            }

            if (validationResult.issues.brokenReferences) {
              results.issues.brokenReferences.push({
                fileId: fileDoc._id,
                fileName: fileDoc.name,
                brokenReferences: validationResult.issues.brokenReferences
              });
            }

            if (validationResult.issues.permissionIssue) {
              results.issues.permissionIssues.push({
                fileId: fileDoc._id,
                fileName: fileDoc.name,
                issue: validationResult.issues.permissionIssue
              });
            }

            if (validationResult.issues.pathIssue) {
              results.issues.pathIssues.push({
                fileId: fileDoc._id,
                fileName: fileDoc.name,
                issue: validationResult.issues.pathIssue
              });
            }
          }

          // Track repair attempts
          if (validationResult.repairAttempts) {
            results.repairs.attempted += validationResult.repairAttempts.attempted;
            results.repairs.successful += validationResult.repairAttempts.successful;
            results.repairs.failed.push(...validationResult.repairAttempts.failed);
          }

          processedCount++;

        } catch (error) {
          results.issues.corruptedFiles.push({
            fileId: fileDoc._id,
            fileName: fileDoc.name,
            error: error.message
          });
          results.problematicFiles++;
        }
      }

      // Check timeout
      if (processing?.max_processing_time) {
        const elapsed = (Date.now() - startTime) / (1000 * 60); // minutes
        if (elapsed > processing.max_processing_time) {
          break;
        }
      }
    }

    // Validate references if requested
    if (reference_validation?.check_orphaned_references) {
      const orphanedRefs = await findOrphanedReferences();
      results.issues.orphanedReferences = orphanedRefs;
    }

    // Generate summary
    results.summary = {
      healthPercentage: results.totalFilesChecked > 0
        ? ((results.healthyFiles / results.totalFilesChecked) * 100).toFixed(2)
        : "0",
      totalIssues: Object.values(results.issues).reduce((sum, issueArray) =>
        sum + (Array.isArray(issueArray) ? issueArray.length : 0), 0
      ),
      criticalIssues: results.issues.missingPhysicalFiles.length + results.issues.corruptedFiles.length,
      warningIssues: results.issues.sizeMismatches.length + results.issues.permissionIssues.length,
      repairEffectiveness: results.repairs.attempted > 0
        ? ((results.repairs.successful / results.repairs.attempted) * 100).toFixed(2)
        : "N/A"
    };

    // Generate recommendations
    results.recommendations = generateIntegrityRecommendations(results);

    results.processingTime = Date.now() - startTime;

    // Log validation for audit
    console.log(`[AUDIT] File integrity validation ${results.dryRun ? '(DRY RUN) ' : ''}by admin ${currentUser._id}: ${results.totalFilesChecked} files checked, ${results.problematicFiles} issues found`);

    return {
      success: results.summary.criticalIssues === 0,
      message: `File integrity validation completed. ${results.healthyFiles}/${results.totalFilesChecked} files healthy, ${results.problematicFiles} issues found`,
      ...results
    };

  } catch (error) {
    console.error(`[ERROR] File integrity validation failed:`, error);
    throw new Error(`File integrity validation failed: ${error.message}`, { cause: 500 });
  }
};

// Helper function to validate individual file
async function validateIndividualFile(
  fileDoc: any,
  checks: any = {},
  referenceValidation: any = {},
  autoRepair: any = {},
  dryRun: boolean
): Promise<any> {
  const result = {
    isHealthy: true,
    issues: {},
    repairAttempts: null
  };

  const repairs = {
    attempted: 0,
    successful: 0,
    failed: []
  };

  try {
    // Check physical file existence
    if (checks?.physical_existence !== false) {
      const physicalExists = await checkPhysicalFileExists(fileDoc.path);
      if (!physicalExists) {
        result.isHealthy = false;
        result.issues.missingPhysical = {
          path: fileDoc.path,
          lastChecked: new Date()
        };

        // Attempt auto-repair if enabled
        if (autoRepair?.enabled && !dryRun) {
          repairs.attempted++;
          try {
            // Could implement file restoration logic here
            console.log(`[REPAIR] Would attempt to restore missing file: ${fileDoc.name}`);
          } catch (repairError) {
            repairs.failed.push({
              fileId: fileDoc._id,
              issue: "missing_physical",
              error: repairError.message
            });
          }
        }
      }
    }

    // Check file size consistency
    if (checks?.size_verification !== false && fileDoc.path) {
      try {
        const physicalPath = `./public${fileDoc.path}`;
        const stat = await Deno.stat(physicalPath);

        if (stat.size !== fileDoc.size) {
          result.isHealthy = false;
          result.issues.sizeMismatch = {
            expected: fileDoc.size,
            actualSize: stat.size,
            difference: stat.size - fileDoc.size
          };

          // Attempt auto-repair if enabled
          if (autoRepair?.update_file_sizes && !dryRun) {
            repairs.attempted++;
            try {
              await file.updateOne({
                filter: { _id: new ObjectId(fileDoc._id) },
                update: { $set: { size: stat.size, updatedAt: new Date() } }
              });
              repairs.successful++;
            } catch (repairError) {
              repairs.failed.push({
                fileId: fileDoc._id,
                issue: "size_mismatch",
                error: repairError.message
              });
            }
          }
        }
      } catch (error) {
        // File doesn't exist - already handled above
      }
    }

    // Check metadata integrity
    if (checks?.metadata_integrity !== false) {
      if (!fileDoc.name || !fileDoc.type) {
        result.isHealthy = false;
        result.issues.metadataIssue = {
          missingName: !fileDoc.name,
          missingType: !fileDoc.type
        };
      }
    }

    // Check path validation
    if (checks?.path_validation !== false && fileDoc.path) {
      if (!isValidPath(fileDoc.path)) {
        result.isHealthy = false;
        result.issues.pathIssue = {
          invalidPath: fileDoc.path,
          reason: "Invalid characters or format"
        };
      }
    }

    // Check file permissions
    if (checks?.permission_validation !== false && fileDoc.path) {
      try {
        const physicalPath = `./public${fileDoc.path}`;
        const stat = await Deno.stat(physicalPath);

        // Basic permission check - could be expanded
        if (!stat.isFile) {
          result.isHealthy = false;
          result.issues.permissionIssue = {
            reason: "Path exists but is not a file"
          };
        }
      } catch (error) {
        // File access issue - might be a permission problem
        if (error.code === "EACCES") {
          result.isHealthy = false;
          result.issues.permissionIssue = {
            reason: "Access denied to file"
          };
        }
      }
    }

    // Check URL accessibility
    if (checks?.url_accessibility !== false && fileDoc.url) {
      const isAccessible = await checkUrlAccessible(fileDoc.url);
      if (!isAccessible) {
        result.isHealthy = false;
        result.issues.urlIssue = {
          url: fileDoc.url,
          reason: "URL not accessible"
        };
      }
    }

    if (repairs.attempted > 0) {
      result.repairAttempts = repairs;
    }

    return result;

  } catch (error) {
    result.isHealthy = false;
    result.issues.validationError = error.message;
    return result;
  }
}

// Helper function to check if physical file exists
async function checkPhysicalFileExists(filePath: string | null): Promise<boolean> {
  if (!filePath) return false;

  try {
    const physicalPath = `./public${filePath}`;
    const stat = await Deno.stat(physicalPath);
    return stat.isFile;
  } catch {
    return false;
  }
}

// Helper function to validate file path
function isValidPath(path: string): boolean {
  // Basic path validation
  if (!path || path.includes('..') || path.includes('//')) {
    return false;
  }

  // Check for valid characters
  const validPathRegex = /^[a-zA-Z0-9\/._-]+$/;
  return validPathRegex.test(path);
}

// Helper function to check URL accessibility
async function checkUrlAccessible(url: string): Promise<boolean> {
  try {
    // Simple check - in production, you might want to make HTTP requests
    return url.startsWith('/') || url.startsWith('http');
  } catch {
    return false;
  }
}

// Helper function to find orphaned references
async function findOrphanedReferences(): Promise<any[]> {
  const orphanedRefs = [];

  try {
    // This would check for references to non-existent files
    // Implementation would depend on specific reference patterns
    console.log("[INFO] Orphaned reference detection not fully implemented");
    return orphanedRefs;
  } catch (error) {
    console.error("Error finding orphaned references:", error);
    return [];
  }
}

// Helper function to generate recommendations
function generateIntegrityRecommendations(results: any): string[] {
  const recommendations = [];

  if (results.summary.criticalIssues === 0 && results.summary.warningIssues === 0) {
    recommendations.push("✅ File system integrity is excellent. No critical issues found.");
    return recommendations;
  }

  if (results.issues.missingPhysicalFiles.length > 0) {
    recommendations.push(`🚨 CRITICAL: ${results.issues.missingPhysicalFiles.length} files are missing from storage. Consider restoring from backups.`);
  }

  if (results.issues.corruptedFiles.length > 0) {
    recommendations.push(`🚨 CRITICAL: ${results.issues.corruptedFiles.length} files may be corrupted. Immediate attention required.`);
  }

  if (results.issues.sizeMismatches.length > 0) {
    recommendations.push(`⚠️ WARNING: ${results.issues.sizeMismatches.length} files have size mismatches between database and storage.`);
  }

  if (results.issues.brokenReferences.length > 0) {
    recommendations.push(`⚠️ WARNING: ${results.issues.brokenReferences.length} files have broken references. Consider cleaning up.`);
  }

  if (results.issues.permissionIssues.length > 0) {
    recommendations.push(`⚠️ WARNING: ${results.issues.permissionIssues.length} files have permission issues.`);
  }

  if (results.repairs.attempted > 0) {
    const successRate = ((results.repairs.successful / results.repairs.attempted) * 100).toFixed(0);
    recommendations.push(`🔧 Auto-repair attempted ${results.repairs.attempted} fixes with ${successRate}% success rate.`);
  }

  if (results.summary.healthPercentage < 90) {
    recommendations.push(`📊 Overall file system health is ${results.summary.healthPercentage}%. Consider implementing preventive maintenance.`);
  }

  return recommendations;
}
