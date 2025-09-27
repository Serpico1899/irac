import { type ActFn, ObjectId } from "@deps";
import {  coreApp, file  } from "@app";
import type { MyContext } from "@lib";

export const updateFileMetadataFn: ActFn = async (body) => {
  const { user: currentUser }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const {
    set: {
      _id,
      name,
      description,
      alt_text,
      category,
      tags,
      permissions,
      seo_title,
      seo_description,
      name_fa,
      description_fa,
      alt_text_fa,
      custom_metadata,
      ...rest
    },
    get,
  } = body.details;

  const fileId = new ObjectId(_id);

  // First, verify the file exists
  const existingFile = await file.findOne({
    filter: { _id: fileId },
    projection: {
      _id: 1,
      name: 1,
      type: 1,
      size: 1,
      path: 1,
      url: 1,
      description: 1,
      alt_text: 1,
      category: 1,
      tags: 1,
      permissions: 1,
      seo_title: 1,
      seo_description: 1,
      name_fa: 1,
      description_fa: 1,
      alt_text_fa: 1,
      custom_metadata: 1,
      createdAt: 1,
      updatedAt: 1
    }
  });

  if (!existingFile) {
    throw new Error("File not found", { cause: 404 });
  }

  // Prepare update object with only provided fields
  const updateData: any = {};

  // Basic metadata updates
  if (name !== undefined) {
    // Validate file name format and ensure uniqueness if needed
    if (name.trim().length === 0) {
      throw new Error("File name cannot be empty", { cause: 400 });
    }
    updateData.name = name.trim();
  }

  if (description !== undefined) {
    updateData.description = description.trim();
  }

  if (alt_text !== undefined) {
    updateData.alt_text = alt_text.trim();
  }

  // Organization metadata
  if (category !== undefined) {
    updateData.category = category.trim();
  }

  if (tags !== undefined) {
    // Clean and validate tags
    updateData.tags = tags
      .filter(tag => tag && tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
  }

  if (permissions !== undefined) {
    // Validate permissions value
    const validPermissions = ['public', 'private', 'restricted'];
    if (!validPermissions.includes(permissions)) {
      throw new Error(`Invalid permissions value. Must be one of: ${validPermissions.join(', ')}`, { cause: 400 });
    }
    updateData.permissions = permissions;
  }

  // SEO metadata
  if (seo_title !== undefined) {
    updateData.seo_title = seo_title.trim();
  }

  if (seo_description !== undefined) {
    updateData.seo_description = seo_description.trim();
  }

  // Multilingual support
  if (name_fa !== undefined) {
    updateData.name_fa = name_fa.trim();
  }

  if (description_fa !== undefined) {
    updateData.description_fa = description_fa.trim();
  }

  if (alt_text_fa !== undefined) {
    updateData.alt_text_fa = alt_text_fa.trim();
  }

  // Custom metadata
  if (custom_metadata !== undefined) {
    // Validate custom metadata is an object
    if (typeof custom_metadata !== 'object' || Array.isArray(custom_metadata)) {
      throw new Error("Custom metadata must be an object", { cause: 400 });
    }
    updateData.custom_metadata = custom_metadata;
  }

  // Add any other fields from rest
  Object.keys(rest).forEach(key => {
    if (rest[key] !== undefined) {
      updateData[key] = rest[key];
    }
  });

  // If no updates provided, return error
  if (Object.keys(updateData).length === 0) {
    throw new Error("No metadata updates provided", { cause: 400 });
  }

  // Add updated timestamp
  updateData.updatedAt = new Date();

  try {
    // Update the file metadata
    const result = await file.updateOne({
      filter: { _id: fileId },
      update: { $set: updateData },
      projection: get
    });

    // Log the metadata update for audit
    const updatedFields = Object.keys(updateData).filter(key => key !== 'updatedAt');
    console.log(`[AUDIT] File metadata updated by admin ${currentUser._id}: File ${existingFile.name} (${fileId}). Updated fields: ${updatedFields.join(', ')}`);

    return {
      success: true,
      message: `File metadata updated successfully`,
      updatedFields,
      file: result,
      changes: {
        before: {
          name: existingFile.name,
          description: existingFile.description,
          category: existingFile.category,
          tags: existingFile.tags,
          permissions: existingFile.permissions
        },
        after: {
          name: updateData.name || existingFile.name,
          description: updateData.description !== undefined ? updateData.description : existingFile.description,
          category: updateData.category || existingFile.category,
          tags: updateData.tags || existingFile.tags,
          permissions: updateData.permissions || existingFile.permissions
        }
      }
    };

  } catch (error) {
    console.error(`[ERROR] Failed to update file metadata ${_id}:`, error);
    throw new Error(`Failed to update file metadata: ${error.message}`, { cause: 500 });
  }
};
