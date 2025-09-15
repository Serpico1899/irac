import {
  coerce,
  date,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";

export const download_type_array = [
  "full",
  "preview",
  "sample",
  "documentation",
  "license",
  "certificate"
];

export const download_type_enums = enums(download_type_array);

export const access_level_array = [
  "basic",
  "premium",
  "unlimited",
  "trial"
];

export const access_level_enums = enums(access_level_array);

export const link_format_array = [
  "direct",
  "streaming",
  "zip_package",
  "individual_files"
];

export const link_format_enums = enums(link_format_array);

export const generateDownloadLinkValidator = object({
  details: object({
    // Required fields
    product_id: string(), // The digital product being downloaded
    order_id: string(),   // The order that purchased this product

    // Optional configuration
    download_type: optional(download_type_enums),
    access_level: optional(access_level_enums),
    link_format: optional(link_format_enums),

    // Expiration settings
    expires_in_hours: optional(number()), // Default 24 hours
    expires_at: optional(coerce(date(), string(), (value) => new Date(value))), // Specific expiration

    // Access restrictions
    max_downloads: optional(number()), // Default 5
    ip_restriction: optional(string()), // Lock to specific IP
    user_agent_restriction: optional(string()), // Lock to specific browser

    // File selection (for products with multiple files)
    file_ids: optional(string()), // JSON array of specific file IDs
    include_metadata: optional(string()), // "true" or "false"

    // Delivery options
    delivery_method: optional(enums(["direct_download", "email_link", "secure_viewer"])),
    notification_email: optional(string()), // Email to send download link

    // Tracking and analytics
    campaign_id: optional(string()), // For tracking download sources
    referrer: optional(string()), // Where download was initiated

    // Security options
    require_authentication: optional(string()), // "true" or "false"
    watermark_content: optional(string()), // "true" or "false" - add user watermark
    prevent_screenshot: optional(string()), // "true" or "false"

    // Quality/format options
    quality: optional(enums(["original", "high", "medium", "low"])),
    format: optional(enums(["original", "pdf", "zip", "epub", "mp4", "mp3"])),
    resolution: optional(string()), // For image/video products

    // Bundling options
    include_bonus_files: optional(string()), // "true" or "false"
    bundle_related_products: optional(string()), // "true" or "false"

    // Licensing and usage
    license_type: optional(enums(["personal", "commercial", "extended", "unlimited"])),
    usage_tracking: optional(string()), // "true" or "false"

    // Advanced options
    custom_filename: optional(string()), // Override default filename
    compression_level: optional(number()), // 0-9 for zip files
    password_protect: optional(string()), // Generate password-protected download

    // Admin options
    bypass_download_limits: optional(string()), // "true" or "false" - admin override
    force_revalidation: optional(string()), // "true" or "false" - recheck purchase
    debug_mode: optional(string()), // "true" or "false" - include debug info
  })
});
