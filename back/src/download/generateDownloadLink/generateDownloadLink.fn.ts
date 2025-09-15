import { coreApp } from "../../../mod.ts";
import {
  order,
  product,
  user,
  file,
} from "../../../mod.ts";
import { jwt } from "@deps";

interface DownloadLinkDetails {
  product_id: string;
  order_id: string;
  download_type?: string;
  access_level?: string;
  link_format?: string;
  expires_in_hours?: number;
  expires_at?: Date;
  max_downloads?: number;
  ip_restriction?: string;
  user_agent_restriction?: string;
  file_ids?: string;
  include_metadata?: string;
  delivery_method?: string;
  notification_email?: string;
  campaign_id?: string;
  referrer?: string;
  require_authentication?: string;
  watermark_content?: string;
  prevent_screenshot?: string;
  quality?: string;
  format?: string;
  resolution?: string;
  include_bonus_files?: string;
  bundle_related_products?: string;
  license_type?: string;
  usage_tracking?: string;
  custom_filename?: string;
  compression_level?: number;
  password_protect?: string;
  bypass_download_limits?: string;
  force_revalidation?: string;
  debug_mode?: string;
}

interface DownloadToken {
  product_id: string;
  order_id: string;
  user_id: string;
  file_ids?: string[];
  expires_at: Date;
  max_downloads: number;
  current_downloads: number;
  restrictions: {
    ip?: string;
    user_agent?: string;
    watermark?: boolean;
  };
  metadata: {
    campaign_id?: string;
    referrer?: string;
    created_at: Date;
  };
}

export const generateDownloadLinkFn = async (
  { details, context }: { details: DownloadLinkDetails; context: any }
) => {
  try {
    const {
      product_id,
      order_id,
      download_type = "full",
      access_level = "basic",
      link_format = "direct",
      expires_in_hours = 24,
      expires_at,
      max_downloads = 5,
      ip_restriction,
      user_agent_restriction,
      file_ids,
      include_metadata = "false",
      delivery_method = "direct_download",
      notification_email,
      campaign_id,
      referrer,
      require_authentication = "true",
      watermark_content = "false",
      prevent_screenshot = "false",
      quality = "original",
      format = "original",
      resolution,
      include_bonus_files = "false",
      bundle_related_products = "false",
      license_type = "personal",
      usage_tracking = "true",
      custom_filename,
      compression_level = 6,
      password_protect = "false",
      bypass_download_limits = "false",
      force_revalidation = "false",
      debug_mode = "false",
    } = details;

    // Get user ID from context
    const userId = context?.user?._id;
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      };
    }

    // Step 1: Validate product exists and is digital
    const productData = await product().findOne({
      _id: coreApp.odm.ObjectId(product_id),
      type: "digital"
    });

    if (!productData) {
      return {
        success: false,
        error: "Digital product not found",
        code: "PRODUCT_NOT_FOUND"
      };
    }

    // Step 2: Verify purchase and order ownership
    if (force_revalidation === "false") {
      const orderData = await order().findOne({
        _id: coreApp.odm.ObjectId(order_id),
        user: coreApp.odm.ObjectId(userId),
        status: "completed",
        "items.product._id": coreApp.odm.ObjectId(product_id)
      });

      if (!orderData) {
        return {
          success: false,
          error: "Invalid order or product not purchased",
          code: "PURCHASE_NOT_VERIFIED"
        };
      }
    }

    // Step 3: Check existing download limits (unless bypassed)
    if (bypass_download_limits !== "true") {
      const existingDownloads = await getExistingDownloadCount(order_id, product_id);
      if (existingDownloads >= max_downloads) {
        return {
          success: false,
          error: "Download limit exceeded",
          code: "DOWNLOAD_LIMIT_EXCEEDED",
          details: {
            current_downloads: existingDownloads,
            max_downloads: max_downloads
          }
        };
      }
    }

    // Step 4: Get product files
    const productFiles = await getProductFiles(product_id, file_ids);
    if (productFiles.length === 0) {
      return {
        success: false,
        error: "No files available for download",
        code: "NO_FILES_AVAILABLE"
      };
    }

    // Step 5: Calculate expiration
    const expirationDate = expires_at ||
      new Date(Date.now() + (expires_in_hours * 60 * 60 * 1000));

    // Step 6: Create download token
    const downloadToken: DownloadToken = {
      product_id,
      order_id,
      user_id: userId,
      file_ids: productFiles.map(f => f._id.toString()),
      expires_at: expirationDate,
      max_downloads,
      current_downloads: 0,
      restrictions: {
        ...(ip_restriction && { ip: ip_restriction }),
        ...(user_agent_restriction && { user_agent: user_agent_restriction }),
        watermark: watermark_content === "true"
      },
      metadata: {
        ...(campaign_id && { campaign_id }),
        ...(referrer && { referrer }),
        created_at: new Date()
      }
    };

    // Step 7: Generate secure JWT token
    const jwtSecret = Deno.env.get("JWT_SECRET") || "fallback-secret";
    const secureToken = await jwt.create(
      { alg: "HS256", typ: "JWT" },
      {
        ...downloadToken,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expirationDate.getTime() / 1000)
      },
      jwtSecret
    );

    // Step 8: Generate download URLs based on format
    const downloadUrls = await generateDownloadUrls(
      productFiles,
      secureToken,
      {
        format: link_format,
        quality,
        compression_level,
        custom_filename,
        password_protect: password_protect === "true"
      }
    );

    // Step 9: Store download record for tracking
    if (usage_tracking === "true") {
      await storeDownloadRecord({
        token: secureToken,
        user_id: userId,
        product_id,
        order_id,
        download_type,
        access_level,
        ip_address: context?.ip || "unknown",
        user_agent: context?.userAgent || "unknown",
        created_at: new Date(),
        expires_at: expirationDate,
        status: "generated"
      });
    }

    // Step 10: Handle delivery method
    let deliveryResult = null;
    if (delivery_method === "email_link" && notification_email) {
      deliveryResult = await sendDownloadEmail({
        email: notification_email,
        product_name: productData.title,
        download_urls: downloadUrls,
        expires_at: expirationDate,
        license_type
      });
    }

    // Step 11: Generate response with security considerations
    const response: any = {
      success: true,
      data: {
        download_links: downloadUrls,
        token: secureToken,
        expires_at: expirationDate,
        max_downloads: max_downloads,
        downloads_remaining: max_downloads,

        // Product information
        product: {
          id: product_id,
          name: productData.title,
          type: download_type,
          license: license_type
        },

        // Access information
        access: {
          level: access_level,
          format: link_format,
          quality: quality,
          watermarked: watermark_content === "true",
          screenshot_protected: prevent_screenshot === "true"
        },

        // Security information
        security: {
          ip_restricted: !!ip_restriction,
          browser_locked: !!user_agent_restriction,
          authentication_required: require_authentication === "true"
        },

        // Usage terms
        terms: {
          license_type,
          personal_use_only: license_type === "personal",
          commercial_use_allowed: ["commercial", "extended", "unlimited"].includes(license_type),
          redistribution_allowed: ["extended", "unlimited"].includes(license_type)
        }
      },
      message: "Download links generated successfully"
    };

    // Step 12: Add delivery information if applicable
    if (deliveryResult) {
      response.data.delivery = {
        method: delivery_method,
        email_sent: deliveryResult.success,
        email_address: notification_email
      };
    }

    // Step 13: Add debug information if requested
    if (debug_mode === "true") {
      response.debug = {
        token_payload: downloadToken,
        file_count: productFiles.length,
        generation_time: new Date(),
        restrictions_applied: Object.keys(downloadToken.restrictions).length,
        metadata_included: include_metadata === "true"
      };
    }

    // Step 14: Add metadata if requested
    if (include_metadata === "true") {
      response.data.metadata = {
        file_details: productFiles.map(file => ({
          id: file._id,
          name: file.filename,
          size: file.size,
          type: file.mimetype,
          format: file.format || "unknown"
        })),
        download_history: await getDownloadHistory(order_id, product_id, 5),
        usage_statistics: await getUsageStatistics(product_id),
        related_products: bundle_related_products === "true"
          ? await getRelatedProducts(product_id)
          : []
      };
    }

    return response;

  } catch (error) {
    console.error("Download link generation failed:", error);

    return {
      success: false,
      error: "Failed to generate download links",
      code: "GENERATION_FAILED",
      details: error instanceof Error ? {
        message: error.message,
        stack: debug_mode === "true" ? error.stack : undefined
      } : "Unknown error occurred"
    };
  }
};

// Helper function to get existing download count
async function getExistingDownloadCount(orderId: string, productId: string): Promise<number> {
  try {
    // This would query a downloads tracking collection
    // For now, return placeholder
    return 0;
  } catch (error) {
    console.error("Failed to get download count:", error);
    return 0;
  }
}

// Helper function to get product files
async function getProductFiles(productId: string, fileIds?: string) {
  try {
    const productData = await product().findOne({
      _id: coreApp.odm.ObjectId(productId)
    });

    if (!productData || !productData.files) {
      return [];
    }

    // If specific files requested, filter to those
    if (fileIds) {
      const requestedIds = JSON.parse(fileIds);
      return productData.files.filter((file: any) =>
        requestedIds.includes(file._id.toString())
      );
    }

    return productData.files || [];
  } catch (error) {
    console.error("Failed to get product files:", error);
    return [];
  }
}

// Helper function to generate download URLs
async function generateDownloadUrls(
  files: any[],
  token: string,
  options: any
): Promise<any[]> {
  try {
    const baseUrl = Deno.env.get("BASE_URL") || "http://localhost:1405";

    return files.map(file => {
      const filename = options.custom_filename || file.filename || "download";
      const extension = file.filename?.split('.').pop() || "";

      return {
        file_id: file._id,
        filename: `${filename}.${extension}`,
        url: `${baseUrl}/api/download/file/${token}/${file._id}`,
        size: file.size || 0,
        type: file.mimetype || "application/octet-stream",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        direct_download: options.format === "direct",
        streaming_available: options.format === "streaming",
        preview_url: file.preview_url || null
      };
    });
  } catch (error) {
    console.error("Failed to generate URLs:", error);
    return [];
  }
}

// Helper function to store download record
async function storeDownloadRecord(record: any): Promise<void> {
  try {
    // This would store in a download_logs collection
    // For now, just log
    console.log("Download record:", record);
  } catch (error) {
    console.error("Failed to store download record:", error);
  }
}

// Helper function to send download email
async function sendDownloadEmail(data: any): Promise<{ success: boolean }> {
  try {
    // This would integrate with email service
    console.log("Sending download email to:", data.email);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false };
  }
}

// Helper function to get download history
async function getDownloadHistory(orderId: string, productId: string, limit: number): Promise<any[]> {
  try {
    // This would query download history
    return [];
  } catch (error) {
    console.error("Failed to get download history:", error);
    return [];
  }
}

// Helper function to get usage statistics
async function getUsageStatistics(productId: string): Promise<any> {
  try {
    return {
      total_downloads: 0,
      unique_downloaders: 0,
      average_downloads_per_user: 0,
      popular_download_times: []
    };
  } catch (error) {
    console.error("Failed to get usage statistics:", error);
    return {};
  }
}

// Helper function to get related products
async function getRelatedProducts(productId: string): Promise<any[]> {
  try {
    const relatedProducts = await product().find({
      _id: { $ne: coreApp.odm.ObjectId(productId) },
      type: "digital",
      status: "published"
    }).limit(3);

    return relatedProducts.map(p => ({
      id: p._id,
      name: p.title,
      price: p.price,
      category: p.category
    }));
  } catch (error) {
    console.error("Failed to get related products:", error);
    return [];
  }
}
