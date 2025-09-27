import { type ActFn, ObjectId } from "@deps";
import {  coreApp, file, wallet_transaction  } from "@app";
import type { MyContext } from "@lib";

export const serveFileFn: ActFn = async (body) => {
  const { user }: MyContext = coreApp.contextFns.getContextModel() as MyContext;

  const { fileId, download = false, track = true } = body.details.set;

  // Find the file in database
  const fileDoc = await file.findOne({
    filters: { _id: new ObjectId(fileId) },
    projection: {
      _id: 1,
      name: 1,
      type: 1,
      size: 1,
      path: 1,
      url: 1,
      createdAt: 1,
      uploader: {
        _id: 1,
        username: 1,
        firstName: 1,
        lastName: 1,
      },
    },
  });

  if (!fileDoc) {
    throw new Error("File not found");
  }

  // Construct full file path
  const fullPath = `./public${fileDoc.path}`;

  // Check if file exists on disk
  let fileExists = false;
  try {
    const fileInfo = await Deno.stat(fullPath);
    fileExists = fileInfo.isFile;
  } catch {
    fileExists = false;
  }

  if (!fileExists) {
    throw new Error("File not found on disk");
  }

  // Security check - ensure user has access (basic implementation)
  // In a more complex system, you might check file permissions, purchase status, etc.
  const hasAccess = user && (
    user._id === fileDoc.uploader._id ||
    user.role === "admin" ||
    user.role === "manager"
  );

  if (!hasAccess) {
    throw new Error("Access denied");
  }

  // Track download if requested
  if (track && user) {
    try {
      // Log the download activity (you could expand this to a dedicated downloads table)
      await wallet_transaction.insertOne({
        doc: {
          type: "file_download",
          amount: 0,
          description: `Downloaded file: ${fileDoc.name}`,
          status: "completed",
          metadata: {
            fileId: fileDoc._id,
            fileName: fileDoc.name,
            fileSize: fileDoc.size,
            downloadTime: new Date(),
          },
        },
        relations: {
          user: {
            _ids: new ObjectId(user._id),
            relatedRelations: {
              walletTransactions: true,
            },
          },
        },
      });
    } catch (error) {
      // Don't fail the download if tracking fails, just log it
      console.warn("Failed to track download:", error);
    }
  }

  // Read file content
  const fileContent = await Deno.readFile(fullPath);

  // Determine content type
  const contentType = fileDoc.type || getMimeType(fileDoc.name);

  // Set appropriate headers
  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Length": fileContent.length.toString(),
    "Cache-Control": "public, max-age=3600", // Cache for 1 hour
  });

  // If download is requested, set Content-Disposition header
  if (download) {
    headers.set("Content-Disposition", `attachment; filename="${fileDoc.name}"`);
  } else {
    headers.set("Content-Disposition", `inline; filename="${fileDoc.name}"`);
  }

  // Return file response
  return new Response(fileContent, {
    status: 200,
    headers,
  });
};

// Helper function to determine MIME type based on file extension
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',

    // Videos
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',

    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'rtf': 'application/rtf',

    // Archives
    'zip': 'application/zip',
    'rar': 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',

    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',

    // Other
    'json': 'application/json',
    'xml': 'application/xml',
    'csv': 'text/csv',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}
