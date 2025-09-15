import {
  coerce,
  date,
  enums,
  object,
  optional,
  string,
} from "@deps";

export const access_method_array = [
  "direct",
  "streaming",
  "preview",
  "thumbnail"
];

export const access_method_enums = enums(access_method_array);

export const validation_level_array = [
  "basic",
  "strict",
  "paranoid"
];

export const validation_level_enums = enums(validation_level_array);

export const access_purpose_array = [
  "download",
  "stream",
  "preview",
  "verify",
  "metadata"
];

export const access_purpose_enums = enums(access_purpose_array);

export const validateAccessValidator = object({
  details: object({
    // Required fields
    token: string(), // JWT token from generateDownloadLink
    file_id: string(), // Specific file being accessed

    // Optional security validation
    validation_level: optional(validation_level_enums),
    access_method: optional(access_method_enums),
    access_purpose: optional(access_purpose_enums),

    // Client information for validation
    client_ip: optional(string()),
    user_agent: optional(string()),
    referer: optional(string()),

    // Request context
    request_id: optional(string()), // Unique request identifier
    session_id: optional(string()), // User session identifier

    // Access parameters
    byte_range: optional(string()), // For partial downloads "bytes=0-1023"
    quality_requested: optional(enums(["original", "high", "medium", "low"])),
    format_requested: optional(enums(["original", "pdf", "zip", "stream"])),

    // Security options
    verify_fingerprint: optional(string()), // "true" or "false"
    check_geolocation: optional(string()), // "true" or "false"
    require_fresh_token: optional(string()), // "true" or "false"

    // Tracking and analytics
    track_access: optional(string()), // "true" or "false"
    log_details: optional(string()), // "true" or "false"

    // Cache control
    cache_buster: optional(string()), // Anti-cache parameter
    force_revalidation: optional(string()), // "true" or "false"

    // Rate limiting
    rate_limit_key: optional(string()), // Custom rate limit identifier
    bypass_rate_limit: optional(string()), // "true" or "false"

    // Development and debugging
    debug_mode: optional(string()), // "true" or "false"
    simulate_failure: optional(string()), // "true" or "false" - testing only

    // Advanced validation
    expected_file_size: optional(string()), // Expected size for integrity check
    expected_checksum: optional(string()), // Expected file hash
    validate_license: optional(string()), // "true" or "false"

    // Watermarking options
    apply_watermark: optional(string()), // "true" or "false"
    watermark_text: optional(string()), // Custom watermark text
    watermark_position: optional(enums(["top-left", "top-right", "bottom-left", "bottom-right", "center"])),

    // Access restrictions
    max_concurrent_access: optional(string()), // Maximum concurrent downloads
    device_fingerprint: optional(string()), // Device identification

    // Time-based validation
    validate_time_window: optional(string()), // "true" or "false"
    min_time_between_access: optional(string()), // Minimum seconds between accesses

    // Geographic restrictions
    allowed_countries: optional(string()), // JSON array of allowed country codes
    blocked_countries: optional(string()), // JSON array of blocked country codes

    // License validation
    verify_license_status: optional(string()), // "true" or "false"
    check_license_expiry: optional(string()), // "true" or "false"

    // Content protection
    prevent_hotlinking: optional(string()), // "true" or "false"
    require_secure_connection: optional(string()), // "true" or "false"

    // Audit and compliance
    compliance_mode: optional(enums(["none", "basic", "strict", "enterprise"])),
    audit_trail: optional(string()), // "true" or "false"
    retention_period: optional(string()), // Days to retain access logs
  })
});
