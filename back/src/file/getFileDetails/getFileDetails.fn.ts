import { type ActFn, ObjectId } from "@deps";
import { coreApp, file, article, course, user } from "../../../mod.ts";
import type { MyContext } from "@lib";

export const getFileDetailsFn: ActFn = async (body) => {
  const { user: currentUser }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: {
      _id,
      include_usage_stats = false,
      include_references = false,
      include_physical_info = false,
      include_upload_history = false,
      include_related_files = false,
    },
    get,
  } = body.details;

  const fileId = new ObjectId(_id);

  // Get basic file information
  const fileData = await file.findOne({
    filter: { _id: fileId },
    projection: get,
    relations: {
      uploader: {
        projection: { _id: 1, email: 1, firstName: 1, lastName: 1 }
      }
    }
  });

  if (!fileData) {
    throw new Error("File not found", { cause: 404 });
  }

  const result: any = {
    file: fileData,
    metadata: {
      fileId: fileId.toString(),
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
      sizeFormatted: formatFileSize(fileData.size),
      path: fileData.path,
      url: fileData.url,
      uploadedAt: fileData.createdAt,
      lastModified: fileData.updatedAt,
      uploader: fileData.uploader
    }
  };

  // Include usage statistics
  if (include_usage_stats) {
    try {
      const usageStats = {
        totalReferences: 0,
        referencesByType: {
          articles: { featured: 0, gallery: 0 },
          courses: { featured: 0, gallery: 0 },
          users: { avatar: 0, nationalCard: 0 }
        },
        lastAccessed: null, // Could be tracked separately
        downloadCount: 0, // Could be tracked separately
        viewCount: 0 // Could be tracked separately
      };

      // Count article featured image references
      const articlesFeatured = await article.find({
        filter: {},
        projection: { _id: 1 },
        relations: {
          featured_image: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });
      usageStats.referencesByType.articles.featured = articlesFeatured.docs.filter(a => a.featured_image).length;

      // Count article gallery references
      const articlesGallery = await article.find({
        filter: {},
        projection: { _id: 1 },
        relations: {
          gallery: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });
      usageStats.referencesByType.articles.gallery = articlesGallery.docs.filter(a => a.gallery?.length > 0).length;

      // Count course featured image references
      const coursesFeatured = await course.find({
        filter: {},
        projection: { _id: 1 },
        relations: {
          featured_image: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });
      usageStats.referencesByType.courses.featured = coursesFeatured.docs.filter(c => c.featured_image).length;

      // Count course gallery references
      const coursesGallery = await course.find({
        filter: {},
        projection: { _id: 1 },
        relations: {
          gallery: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });
      usageStats.referencesByType.courses.gallery = coursesGallery.docs.filter(c => c.gallery?.length > 0).length;

      // Count user avatar references
      const usersAvatar = await user.find({
        filter: {},
        projection: { _id: 1 },
        relations: {
          avatar: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });
      usageStats.referencesByType.users.avatar = usersAvatar.docs.filter(u => u.avatar).length;

      // Count user national card references
      const usersNationalCard = await user.find({
        filter: {},
        projection: { _id: 1 },
        relations: {
          national_card: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });
      usageStats.referencesByType.users.nationalCard = usersNationalCard.docs.filter(u => u.national_card).length;

      // Calculate total references
      usageStats.totalReferences = Object.values(usageStats.referencesByType)
        .reduce((total, typeRefs) => {
          if (typeof typeRefs === 'object') {
            return total + Object.values(typeRefs).reduce((sum: number, count) => sum + (count as number), 0);
          }
          return total + (typeRefs as number);
        }, 0);

      result.usageStats = usageStats;
    } catch (error) {
      result.usageStats = { error: `Failed to gather usage statistics: ${error.message}` };
    }
  }

  // Include detailed references
  if (include_references) {
    try {
      const references = {
        articles: {
          featuredImage: [],
          gallery: []
        },
        courses: {
          featuredImage: [],
          gallery: []
        },
        users: {
          avatar: [],
          nationalCard: []
        }
      };

      // Get article references with details
      const articlesWithFeatured = await article.find({
        filter: {},
        projection: { _id: 1, title: 1, slug: 1, status: 1, createdAt: 1 },
        relations: {
          featured_image: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });

      for (const art of articlesWithFeatured.docs) {
        if (art.featured_image) {
          references.articles.featuredImage.push({
            _id: art._id,
            title: art.title,
            slug: art.slug,
            status: art.status,
            createdAt: art.createdAt
          });
        }
      }

      const articlesWithGallery = await article.find({
        filter: {},
        projection: { _id: 1, title: 1, slug: 1, status: 1, createdAt: 1 },
        relations: {
          gallery: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });

      for (const art of articlesWithGallery.docs) {
        if (art.gallery?.length > 0) {
          references.articles.gallery.push({
            _id: art._id,
            title: art.title,
            slug: art.slug,
            status: art.status,
            createdAt: art.createdAt
          });
        }
      }

      // Get course references with details
      const coursesWithFeatured = await course.find({
        filter: {},
        projection: { _id: 1, title: 1, slug: 1, status: 1, createdAt: 1 },
        relations: {
          featured_image: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });

      for (const crs of coursesWithFeatured.docs) {
        if (crs.featured_image) {
          references.courses.featuredImage.push({
            _id: crs._id,
            title: crs.title,
            slug: crs.slug,
            status: crs.status,
            createdAt: crs.createdAt
          });
        }
      }

      const coursesWithGallery = await course.find({
        filter: {},
        projection: { _id: 1, title: 1, slug: 1, status: 1, createdAt: 1 },
        relations: {
          gallery: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });

      for (const crs of coursesWithGallery.docs) {
        if (crs.gallery?.length > 0) {
          references.courses.gallery.push({
            _id: crs._id,
            title: crs.title,
            slug: crs.slug,
            status: crs.status,
            createdAt: crs.createdAt
          });
        }
      }

      // Get user references with details
      const usersWithAvatar = await user.find({
        filter: {},
        projection: { _id: 1, email: 1, firstName: 1, lastName: 1, createdAt: 1 },
        relations: {
          avatar: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });

      for (const usr of usersWithAvatar.docs) {
        if (usr.avatar) {
          references.users.avatar.push({
            _id: usr._id,
            email: usr.email,
            name: `${usr.firstName} ${usr.lastName}`.trim(),
            createdAt: usr.createdAt
          });
        }
      }

      const usersWithNationalCard = await user.find({
        filter: {},
        projection: { _id: 1, email: 1, firstName: 1, lastName: 1, createdAt: 1 },
        relations: {
          national_card: {
            filters: { _id: fileId },
            projection: { _id: 1 }
          }
        }
      });

      for (const usr of usersWithNationalCard.docs) {
        if (usr.national_card) {
          references.users.nationalCard.push({
            _id: usr._id,
            email: usr.email,
            name: `${usr.firstName} ${usr.lastName}`.trim(),
            createdAt: usr.createdAt
          });
        }
      }

      result.references = references;
    } catch (error) {
      result.references = { error: `Failed to gather references: ${error.message}` };
    }
  }

  // Include physical file information
  if (include_physical_info) {
    try {
      const physicalInfo = {
        exists: false,
        actualSize: null,
        permissions: null,
        lastModified: null,
        checksum: null,
        mimeType: null
      };

      if (fileData.path) {
        const physicalPath = `./public${fileData.path}`;

        try {
          const fileInfo = await Deno.stat(physicalPath);
          physicalInfo.exists = true;
          physicalInfo.actualSize = fileInfo.size;
          physicalInfo.lastModified = fileInfo.mtime;

          // Check if sizes match
          if (fileInfo.size !== fileData.size) {
            physicalInfo.sizeDiscrepancy = {
              database: fileData.size,
              actual: fileInfo.size,
              difference: fileInfo.size - fileData.size
            };
          }

          // Get file permissions (Unix-like systems)
          try {
            physicalInfo.permissions = (fileInfo.mode & parseInt('777', 8)).toString(8);
          } catch (error) {
            // Ignore permission errors on some systems
          }

        } catch (error) {
          physicalInfo.exists = false;
          physicalInfo.error = `File not found in filesystem: ${error.message}`;
        }
      }

      result.physicalInfo = physicalInfo;
    } catch (error) {
      result.physicalInfo = { error: `Failed to gather physical info: ${error.message}` };
    }
  }

  // Include upload history (if tracking is implemented)
  if (include_upload_history) {
    result.uploadHistory = {
      originalUpload: {
        date: fileData.createdAt,
        uploader: fileData.uploader
      },
      modifications: [],
      note: "Detailed modification history tracking not yet implemented"
    };
  }

  // Include related files
  if (include_related_files) {
    try {
      const relatedFiles = {
        sameUploader: [],
        sameType: [],
        similarName: [],
        sameCategory: []
      };

      // Find files from same uploader (limit 5)
      if (fileData.uploader) {
        const sameUploaderFiles = await file.find({
          filter: {
            _id: { $ne: fileId } // Exclude current file
          },
          projection: { _id: 1, name: 1, type: 1, size: 1, createdAt: 1 },
          relations: {
            uploader: {
              filters: { _id: new ObjectId(fileData.uploader._id) },
              projection: { _id: 1 }
            }
          },
          options: { limit: 5, sort: { createdAt: -1 } }
        });

        relatedFiles.sameUploader = sameUploaderFiles.docs
          .filter(f => f.uploader)
          .map(f => ({
            _id: f._id,
            name: f.name,
            type: f.type,
            size: formatFileSize(f.size),
            uploadedAt: f.createdAt
          }));
      }

      // Find files of same type (limit 5)
      const sameTypeFiles = await file.find({
        filter: {
          _id: { $ne: fileId },
          type: fileData.type
        },
        projection: { _id: 1, name: 1, type: 1, size: 1, createdAt: 1 },
        options: { limit: 5, sort: { createdAt: -1 } }
      });

      relatedFiles.sameType = sameTypeFiles.docs.map(f => ({
        _id: f._id,
        name: f.name,
        type: f.type,
        size: formatFileSize(f.size),
        uploadedAt: f.createdAt
      }));

      // Find files with similar names (if name is long enough)
      if (fileData.name && fileData.name.length > 3) {
        const namePattern = fileData.name.substring(0, Math.floor(fileData.name.length / 2));
        const similarNameFiles = await file.find({
          filter: {
            _id: { $ne: fileId },
            name: { $regex: namePattern, $options: 'i' }
          },
          projection: { _id: 1, name: 1, type: 1, size: 1, createdAt: 1 },
          options: { limit: 5, sort: { createdAt: -1 } }
        });

        relatedFiles.similarName = similarNameFiles.docs.map(f => ({
          _id: f._id,
          name: f.name,
          type: f.type,
          size: formatFileSize(f.size),
          uploadedAt: f.createdAt
        }));
      }

      result.relatedFiles = relatedFiles;
    } catch (error) {
      result.relatedFiles = { error: `Failed to gather related files: ${error.message}` };
    }
  }

  // Add summary
  result.summary = {
    fileId: fileId.toString(),
    name: fileData.name,
    type: fileData.type,
    size: formatFileSize(fileData.size),
    uploadedBy: fileData.uploader?.email || 'Unknown',
    uploadedAt: fileData.createdAt,
    isReferenced: result.usageStats ? result.usageStats.totalReferences > 0 : undefined,
    physicallyExists: result.physicalInfo ? result.physicalInfo.exists : undefined
  };

  return result;
};

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
