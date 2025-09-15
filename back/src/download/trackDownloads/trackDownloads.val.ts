import {
  coerce,
  date,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";

export const download_event_array = [
  "initiated",
  "started",
  "progress",
  "paused",
  "resumed",
  "completed",
  "cancelled",
  "failed",
  "timeout",
  "interrupted"
];

export const download_event_enums = enums(download_event_array);

export const download_method_array = [
  "direct",
  "streaming",
  "chunked",
  "resume",
  "batch"
];

export const download_method_enums = enums(download_method_array);

export const client_type_array = [
  "browser",
  "mobile_app",
  "desktop_app",
  "api_client",
  "bot",
  "unknown"
];

export const client_type_enums = enums(client_type_array);

export const error_category_array = [
  "network",
  "authentication",
  "authorization",
  "file_not_found",
  "server_error",
  "client_error",
  "timeout",
  "rate_limit",
  "quota_exceeded",
  "corrupted_file"
];

export const error_category_enums = enums(error_category_array);

export const trackDownloadsValidator = object({
  details: object({
    // Required tracking fields
    event_type: download_event_enums,
    download_token: string(), // JWT token from generateDownloadLink
    file_id: string(),

    // Optional identification
    session_id: optional(string()),
    request_id: optional(string()),
    correlation_id: optional(string()), // For tracking related events

    // Download details
    download_method: optional(download_method_enums),
    file_size: optional(number()), // Total file size in bytes
    bytes_downloaded: optional(number()), // Bytes downloaded so far
    download_speed: optional(number()), // Bytes per second
    progress_percentage: optional(number()), // 0-100

    // Time tracking
    started_at: optional(coerce(date(), string(), (value) => new Date(value))),
    completed_at: optional(coerce(date(), string(), (value) => new Date(value))),
    duration_ms: optional(number()), // Download duration in milliseconds

    // Client information
    client_ip: optional(string()),
    user_agent: optional(string()),
    client_type: optional(client_type_enums),
    referer: optional(string()),
    browser_info: optional(string()), // JSON string with browser details

    // Network information
    connection_type: optional(enums(["wifi", "cellular", "ethernet", "unknown"])),
    network_quality: optional(enums(["excellent", "good", "fair", "poor"])),
    bandwidth_estimate: optional(number()), // Estimated bandwidth in Mbps

    // Error tracking (for failed downloads)
    error_code: optional(string()),
    error_message: optional(string()),
    error_category: optional(error_category_enums),
    retry_count: optional(number()),
    stack_trace: optional(string()),

    // Performance metrics
    time_to_first_byte: optional(number()), // TTFB in milliseconds
    dns_lookup_time: optional(number()),
    connection_time: optional(number()),
    ssl_handshake_time: optional(number()),
    server_response_time: optional(number()),

    // Quality metrics
    interruption_count: optional(number()),
    resume_count: optional(number()),
    chunk_errors: optional(number()),
    data_integrity_check: optional(string()), // "passed" or "failed"

    // Geographic and demographic data
    country_code: optional(string()),
    region: optional(string()),
    city: optional(string()),
    timezone: optional(string()),
    language: optional(string()),

    // Device information
    device_type: optional(enums(["desktop", "mobile", "tablet", "smart_tv", "unknown"])),
    operating_system: optional(string()),
    os_version: optional(string()),
    device_model: optional(string()),
    screen_resolution: optional(string()),

    // Content information
    file_type: optional(string()),
    file_category: optional(string()),
    content_quality: optional(enums(["original", "high", "medium", "low"])),
    content_format: optional(string()),
    compression_used: optional(string()), // "true" or "false"

    // Business context
    product_category: optional(string()),
    price_paid: optional(number()),
    currency: optional(string()),
    promotional_code: optional(string()),
    acquisition_channel: optional(string()),

    // User behavior
    time_on_download_page: optional(number()), // Seconds spent on download page
    clicks_before_download: optional(number()),
    previous_failed_attempts: optional(number()),
    user_satisfaction: optional(enums(["very_satisfied", "satisfied", "neutral", "dissatisfied", "very_dissatisfied"])),

    // Security and compliance
    ssl_enabled: optional(string()), // "true" or "false"
    vpn_detected: optional(string()), // "true" or "false"
    tor_detected: optional(string()), // "true" or "false"
    proxy_detected: optional(string()), // "true" or "false"
    suspicious_activity: optional(string()), // "true" or "false"

    // Feature usage
    resume_feature_used: optional(string()), // "true" or "false"
    pause_feature_used: optional(string()), // "true" or "false"
    download_manager_used: optional(string()), // "true" or "false"
    concurrent_downloads: optional(number()),

    // A/B testing and experiments
    experiment_variant: optional(string()),
    feature_flags: optional(string()), // JSON string of active feature flags

    // Feedback and ratings
    download_rating: optional(number()), // 1-5 stars
    user_feedback: optional(string()),
    would_recommend: optional(string()), // "true" or "false"

    // Analytics and attribution
    utm_source: optional(string()),
    utm_medium: optional(string()),
    utm_campaign: optional(string()),
    utm_term: optional(string()),
    utm_content: optional(string()),

    // Server information
    server_id: optional(string()),
    edge_location: optional(string()),
    cdn_cache_status: optional(enums(["hit", "miss", "stale", "bypass"])),
    server_load: optional(number()), // Server load percentage

    // Advanced metrics
    perceived_quality: optional(enums(["excellent", "good", "fair", "poor"])),
    user_engagement_score: optional(number()), // 0-100
    conversion_value: optional(number()), // Business value of this download
    lifetime_download_count: optional(number()), // User's total downloads

    // Compliance and legal
    privacy_consent: optional(string()), // "granted" or "denied"
    data_retention_period: optional(number()), // Days to retain this data
    anonymize_data: optional(string()), // "true" or "false"

    // Custom fields
    custom_properties: optional(string()), // JSON string for custom tracking data
    notes: optional(string()), // Admin notes
  })
});
