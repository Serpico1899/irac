import { type ActFn, ObjectId } from "@deps";
import {  coreApp, file, article, course, user  } from "@app";
import type { MyContext } from "@lib";

export const deleteFileFn: ActFn = async (body) => {
  const { user: currentUser }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: { _id, force = false, hardCascade = false, confirm = false },
    get,
  } = body.details;

  const fileId = new ObjectId(_id);

  // First, verify the file exists
  const existingFile = await file.findOne({
    filter: { _id: fileId },
    projection: { name: 1, path: 1, url: 1, type: 1, size: 1 }
  });

  if (!existingFile) {
    throw new Error("File not found", { cause: 404 });
  }

  // Check for references in other models
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

  // Check articles with featured_image
  const articlesWithFeatured = await article.find({
    filter: {},
    projection: { _id: 1, title: 1 },
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
        title: art.title
      });
    }
  }

  // Check articles with gallery containing this file
  const articlesWithGallery = await article.find({
    filter: {},
    projection: { _id: 1, title: 1 },
    relations: {
      gallery: {
        filters: { _id: fileId },
        projection: { _id: 1 }
      }
    }
  });

  for (const art of articlesWithGallery.docs) {
    if (art.gallery && art.gallery.length > 0) {
      references.articles.gallery.push({
        _id: art._id,
        title: art.title
      });
    }
  }

  // Check courses with featured_image
  const coursesWithFeatured = await course.find({
    filter: {},
    projection: { _id: 1, title: 1 },
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
        title: crs.title
      });
    }
  }

  // Check courses with gallery containing this file
  const coursesWithGallery = await course.find({
    filter: {},
    projection: { _id: 1, title: 1 },
    relations: {
      gallery: {
        filters: { _id: fileId },
        projection: { _id: 1 }
      }
    }
  });

  for (const crs of coursesWithGallery.docs) {
    if (crs.gallery && crs.gallery.length > 0) {
      references.courses.gallery.push({
        _id: crs._id,
        title: crs.title
      });
    }
  }

  // Check users with avatar
  const usersWithAvatar = await user.find({
    filter: {},
    projection: { _id: 1, email: 1 },
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
        email: usr.email
      });
    }
  }

  // Check users with national_card
  const usersWithNationalCard = await user.find({
    filter: {},
    projection: { _id: 1, email: 1 },
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
        email: usr.email
      });
    }
  }

  // Calculate total references
  const totalReferences =
    references.articles.featuredImage.length +
    references.articles.gallery.length +
    references.courses.featuredImage.length +
    references.courses.gallery.length +
    references.users.avatar.length +
    references.users.nationalCard.length;

  // If file has references and force deletion is not enabled, return error
  if (totalReferences > 0 && !force) {
    throw new Error(`File cannot be deleted. It is referenced by ${totalReferences} records. Use force=true to delete anyway.`, {
      cause: {
        code: 409,
        references,
        totalReferences,
        file: existingFile
      }
    });
  }

  // If admin confirmation is required for dangerous operations
  if (totalReferences > 5 && !confirm) {
    throw new Error(`This file is referenced by ${totalReferences} records. Admin confirmation required (confirm=true).`, {
      cause: {
        code: 403,
        references,
        totalReferences,
        confirmationRequired: true
      }
    });
  }

  const cleanupResults = {
    articlesUpdated: 0,
    coursesUpdated: 0,
    usersUpdated: 0,
    physicalFileDeleted: false,
    errors: []
  };

  try {
    // Clean up references if force deletion is enabled
    if (force && totalReferences > 0) {
      // Remove featured_image references from articles
      for (const artRef of references.articles.featuredImage) {
        try {
          await article.updateOne({
            filter: { _id: new ObjectId(artRef._id) },
            update: {
              $unset: { featured_image: "" }
            }
          });
          cleanupResults.articlesUpdated++;
        } catch (error) {
          cleanupResults.errors.push(`Failed to clean article ${artRef._id}: ${error.message}`);
        }
      }

      // Remove from gallery arrays in articles
      for (const artRef of references.articles.gallery) {
        try {
          await article.updateOne({
            filter: { _id: new ObjectId(artRef._id) },
            update: {
              $pull: { gallery: fileId }
            }
          });
          cleanupResults.articlesUpdated++;
        } catch (error) {
          cleanupResults.errors.push(`Failed to clean article gallery ${artRef._id}: ${error.message}`);
        }
      }

      // Remove featured_image references from courses
      for (const crsRef of references.courses.featuredImage) {
        try {
          await course.updateOne({
            filter: { _id: new ObjectId(crsRef._id) },
            update: {
              $unset: { featured_image: "" }
            }
          });
          cleanupResults.coursesUpdated++;
        } catch (error) {
          cleanupResults.errors.push(`Failed to clean course ${crsRef._id}: ${error.message}`);
        }
      }

      // Remove from gallery arrays in courses
      for (const crsRef of references.courses.gallery) {
        try {
          await course.updateOne({
            filter: { _id: new ObjectId(crsRef._id) },
            update: {
              $pull: { gallery: fileId }
            }
          });
          cleanupResults.coursesUpdated++;
        } catch (error) {
          cleanupResults.errors.push(`Failed to clean course gallery ${crsRef._id}: ${error.message}`);
        }
      }

      // Remove avatar references from users
      for (const usrRef of references.users.avatar) {
        try {
          await user.updateOne({
            filter: { _id: new ObjectId(usrRef._id) },
            update: {
              $unset: { avatar: "" }
            }
          });
          cleanupResults.usersUpdated++;
        } catch (error) {
          cleanupResults.errors.push(`Failed to clean user avatar ${usrRef._id}: ${error.message}`);
        }
      }

      // Remove national_card references from users
      for (const usrRef of references.users.nationalCard) {
        try {
          await user.updateOne({
            filter: { _id: new ObjectId(usrRef._id) },
            update: {
              $unset: { national_card: "" }
            }
          });
          cleanupResults.usersUpdated++;
        } catch (error) {
          cleanupResults.errors.push(`Failed to clean user national_card ${usrRef._id}: ${error.message}`);
        }
      }
    }

    // Delete physical file if hardCascade is enabled
    if (hardCascade && existingFile.path) {
      try {
        const physicalPath = `./public${existingFile.path}`;
        await Deno.remove(physicalPath);
        cleanupResults.physicalFileDeleted = true;
      } catch (error) {
        cleanupResults.errors.push(`Failed to delete physical file: ${error.message}`);
      }
    }

    // Delete file record from database
    const result = await file.deleteOne({
      filter: { _id: fileId },
      hardCascade: false, // We handle physical deletion ourselves
    });

    // Log the deletion activity for audit
    console.log(`[AUDIT] File deleted by admin ${currentUser._id}: ${existingFile.name} (${existingFile.type}, ${existingFile.size} bytes). References cleaned: ${totalReferences}. Physical file deleted: ${cleanupResults.physicalFileDeleted}`);

    return {
      success: true,
      deletedFile: existingFile,
      referencesFound: totalReferences,
      references: totalReferences > 0 ? references : undefined,
      cleanup: cleanupResults,
      message: `File "${existingFile.name}" deleted successfully. ${totalReferences > 0 ? `Cleaned up ${totalReferences} references.` : 'No references found.'}`
    };

  } catch (error) {
    console.error(`[ERROR] Failed to delete file ${_id}:`, error);
    throw new Error(`Failed to delete file: ${error.message}`, { cause: 500 });
  }
};
