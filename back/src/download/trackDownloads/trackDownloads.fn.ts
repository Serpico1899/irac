import { coreApp } from "../../../mod.ts";
import {
  order,
  product,
  user,
  file,
} from "../../../mod.ts";
import { jwt } from "@deps";

interface DownloadTrackingDetails {
  event_type: string;
  download_token: string;
  file_id: string;
  session_id?: string;
  request_id?: string;
  correlation_id?: string;
  download_method?: string;
  file_size?: number;
  bytes_downloaded?: number;
  download_speed?: number;
  progress_percentage?: number;
  started_at?: Date;
  completed_at?: Date;
  duration_ms?: number;
  client_ip?: string;
  user_agent?: string;
  client_type?: string;
  referer?: string;
  browser_info?: string;
  connection_type?: string;
  network_quality?: string;
  bandwidth_estimate?: number;
  error_code?: string;
  error_message?: string;
  error_category?: string;
  retry_count?: number;
  stack_trace?: string;
  time_to_first_byte?: number;
  dns_lookup_time?: number;
  connection_time?: number;
  ssl_handshake_time?: number;
  server_response_time?: number;
  interruption_count?: number;
  resume_count?: number;
  chunk_errors?: number;
  data_integrity_check?: string;
  country_code?: string;
  region?: string;
  city?: string;
  timezone?: string;
  language?: string;
  device_type?: string;
  operating_system?: string;
  os_version?: string;
  device_model?: string;
  screen_resolution?: string;
  file_type?: string;
  file_category?: string;
  content_quality?: string;
  content_format?: string;
  compression_used?: string;
  product_category?: string;
  price_paid?: number;
  currency?: string;
  promotional_code?: string;
  acquisition_channel?: string;
  time_on_download_page?: number;
  clicks_before_download?: number;
  previous_failed_attempts?: number;
  user_satisfaction?: string;
  ssl_enabled?: string;
  vpn_detected?: string;
  tor_detected?: string;
  proxy_detected?: string;
  suspicious_activity?: string;
  resume_feature_used?: string;
  pause_feature_used?: string;
  download_manager_used?: string;
  concurrent_downloads?: number;
  experiment_variant?: string;
  feature_flags?: string;
  download_rating?: number;
  user_feedback?: string;
  would_recommend?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  server_id?: string;
  edge_location?: string;
  cdn_cache_status?: string;
  server_load?: number;
  perceived_quality?: string;
  user_engagement_score?: number;
  conversion_value?: number;
  lifetime_download_count?: number;
  privacy_consent?: string;
  data_retention_period?: number;
  anonymize_data?: string;
  custom_properties?: string;
  notes?: string;
}

interface DownloadAnalytics {
  user_id: string;
  product_id: string;
  file_id: string;
  event_type: string;
  timestamp: Date;
  session_data: any;
  performance_metrics: any;
  business_metrics: any;
  technical_details: any;
}

export const trackDownloadsFn = async (
  { details, context }: { details: DownloadTrackingDetails; context: any }
) => {
  try {
    const {
      event_type,
      download_token,
      file_id,
      session_id,
      request_id,
      correlation_id,
      download_method = "direct",
      file_size,
      bytes_downloaded = 0,
      download_speed,
      progress_percentage,
      started_at,
      completed_at,
      duration_ms,
      client_ip,
      user_agent,
      client_type = "browser",
      referer,
      browser_info,
      connection_type = "unknown",
      network_quality,
      bandwidth_estimate,
      error_code,
      error_message,
      error_category,
      retry_count = 0,
      stack_trace,
      time_to_first_byte,
      dns_lookup_time,
      connection_time,
      ssl_handshake_time,
      server_response_time,
      interruption_count = 0,
      resume_count = 0,
      chunk_errors = 0,
      data_integrity_check = "not_checked",
      country_code,
      region,
      city,
      timezone,
      language,
      device_type = "unknown",
      operating_system,
      os_version,
      device_model,
      screen_resolution,
      file_type,
      file_category,
      content_quality = "original",
      content_format = "original",
      compression_used = "false",
      product_category,
      price_paid,
      currency = "IRR",
      promotional_code,
      acquisition_channel,
      time_on_download_page,
      clicks_before_download,
      previous_failed_attempts = 0,
      user_satisfaction,
      ssl_enabled = "false",
      vpn_detected = "false",
      tor_detected = "false",
      proxy_detected = "false",
      suspicious_activity = "false",
      resume_feature_used = "false",
      pause_feature_used = "false",
      download_manager_used = "false",
      concurrent_downloads = 1,
      experiment_variant,
      feature_flags,
      download_rating,
      user_feedback,
      would_recommend,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      server_id,
      edge_location,
      cdn_cache_status = "miss",
      server_load,
      perceived_quality,
      user_engagement_score,
      conversion_value,
      lifetime_download_count,
      privacy_consent = "granted",
      data_retention_period = 90,
      anonymize_data = "false",
      custom_properties,
      notes,
    } = details;

    // Step 1: Validate and decode download token
    const jwtSecret = Deno.env.get("JWT_SECRET") || "fallback-secret";
    let tokenPayload: any;

    try {
      tokenPayload = await jwt.verify(download_token, jwtSecret);
    } catch (error) {
      // For tracking purposes, we might want to log even invalid token attempts
      if (event_type !== "failed") {
        return {
          success: false,
          error: "Invalid download token",
          code: "INVALID_TOKEN"
        };
      }
      // For failed events, we still track but with limited data
      tokenPayload = { user_id: "anonymous", product_id: "unknown" };
    }

    // Step 2: Generate unique tracking ID if not provided
    const trackingId = request_id || generateTrackingId();
    const timestamp = new Date();

    // Step 3: Enrich data with geographic information
    const geoData = await enrichGeographicData(
      client_ip,
      country_code,
      region,
      city,
      timezone
    );

    // Step 4: Detect and analyze client information
    const clientAnalysis = await analyzeClientInfo(
      user_agent,
      browser_info,
      device_type,
      operating_system,
      client_ip
    );

    // Step 5: Calculate performance metrics
    const performanceMetrics = calculatePerformanceMetrics({
      file_size,
      bytes_downloaded,
      download_speed,
      duration_ms,
      time_to_first_byte,
      dns_lookup_time,
      connection_time,
      ssl_handshake_time,
      server_response_time,
      interruption_count,
      resume_count,
      chunk_errors,
    });

    // Step 6: Assess download quality
    const qualityMetrics = assessDownloadQuality({
      event_type,
      progress_percentage,
      interruption_count,
      resume_count,
      chunk_errors,
      data_integrity_check,
      download_speed,
      bandwidth_estimate,
      perceived_quality,
    });

    // Step 7: Build comprehensive analytics record
    const analyticsRecord: DownloadAnalytics = {
      user_id: tokenPayload.user_id || "anonymous",
      product_id: tokenPayload.product_id || "unknown",
      file_id: file_id,
      event_type: event_type,
      timestamp: timestamp,

      // Session and identification data
      session_data: {
        tracking_id: trackingId,
        session_id: session_id,
        correlation_id: correlation_id,
        download_token_hash: hashToken(download_token),
        request_sequence: await getRequestSequence(session_id, correlation_id),
      },

      // Performance and technical metrics
      performance_metrics: {
        ...performanceMetrics,
        quality_score: qualityMetrics.overall_score,
        efficiency_rating: qualityMetrics.efficiency_rating,
        reliability_score: qualityMetrics.reliability_score,
        network_conditions: {
          connection_type: connection_type,
          network_quality: network_quality,
          bandwidth_estimate: bandwidth_estimate,
          ssl_enabled: ssl_enabled === "true",
        },
        server_metrics: {
          server_id: server_id,
          edge_location: edge_location,
          cdn_cache_status: cdn_cache_status,
          server_load: server_load,
        },
      },

      // Business and user metrics
      business_metrics: {
        conversion_value: conversion_value || 0,
        revenue_impact: await calculateRevenueImpact(
          tokenPayload.product_id,
          event_type,
          price_paid
        ),
        user_lifetime_value: await getUserLifetimeValue(tokenPayload.user_id),
        engagement_metrics: {
          user_engagement_score: user_engagement_score,
          time_on_download_page: time_on_download_page,
          clicks_before_download: clicks_before_download,
          feature_adoption: {
            resume_used: resume_feature_used === "true",
            pause_used: pause_feature_used === "true",
            download_manager: download_manager_used === "true",
          },
        },
        satisfaction_metrics: {
          download_rating: download_rating,
          user_satisfaction: user_satisfaction,
          would_recommend: would_recommend === "true",
          user_feedback: user_feedback,
        },
      },

      // Technical and context details
      technical_details: {
        client_info: {
          ...clientAnalysis,
          client_type: client_type,
          referer: referer,
          suspicious_activity: suspicious_activity === "true",
          security_flags: {
            vpn_detected: vpn_detected === "true",
            tor_detected: tor_detected === "true",
            proxy_detected: proxy_detected === "true",
          },
        },
        geographic_info: geoData,
        content_info: {
          file_type: file_type,
          file_category: file_category,
          content_quality: content_quality,
          content_format: content_format,
          file_size: file_size,
          compression_used: compression_used === "true",
        },
        error_details: event_type === "failed" || event_type === "interrupted" ? {
          error_code: error_code,
          error_message: error_message,
          error_category: error_category,
          retry_count: retry_count,
          stack_trace: anonymize_data === "true" ? "[REDACTED]" : stack_trace,
          previous_failed_attempts: previous_failed_attempts,
        } : null,
        attribution_data: {
          acquisition_channel: acquisition_channel,
          utm_source: utm_source,
          utm_medium: utm_medium,
          utm_campaign: utm_campaign,
          utm_term: utm_term,
          utm_content: utm_content,
          promotional_code: promotional_code,
        },
        experiment_data: {
          variant: experiment_variant,
          feature_flags: feature_flags ? JSON.parse(feature_flags) : {},
        },
        compliance_info: {
          privacy_consent: privacy_consent,
          data_retention_days: data_retention_period,
          anonymized: anonymize_data === "true",
          retention_expires_at: new Date(
            timestamp.getTime() + (data_retention_period * 24 * 60 * 60 * 1000)
          ),
        },
        custom_data: custom_properties ? JSON.parse(custom_properties) : {},
        admin_notes: notes,
      },
    };

    // Step 8: Store analytics record
    await storeDownloadAnalytics(analyticsRecord);

    // Step 9: Update real-time metrics
    await updateRealTimeMetrics(analyticsRecord, event_type);

    // Step 10: Trigger downstream processing
    await triggerDownstreamProcessing(analyticsRecord, event_type);

    // Step 11: Handle specific event types
    const eventSpecificResults = await handleSpecificEventType(
      event_type,
      analyticsRecord,
      details
    );

    // Step 12: Calculate derived insights
    const insights = await calculateDownloadInsights(
      analyticsRecord,
      tokenPayload.user_id,
      tokenPayload.product_id
    );

    // Step 13: Check for alerts and anomalies
    const alerts = await checkForAlertsAndAnomalies(analyticsRecord);

    // Step 14: Build response
    const response = {
      success: true,
      data: {
        tracking_id: trackingId,
        event_recorded: event_type,
        timestamp: timestamp,
        quality_score: qualityMetrics.overall_score,
        performance_rating: performanceMetrics.overall_rating,

        // Include insights if available
        ...(insights && { insights }),

        // Include alerts if any
        ...(alerts.length > 0 && { alerts }),

        // Include event-specific results
        ...eventSpecificResults,

        // Analytics summary for immediate feedback
        session_summary: {
          total_events: await getSessionEventCount(session_id),
          download_progress: progress_percentage || 0,
          estimated_completion: calculateEstimatedCompletion(
            bytes_downloaded,
            file_size,
            download_speed
          ),
          quality_indicators: {
            stability: qualityMetrics.stability_score,
            speed: qualityMetrics.speed_score,
            reliability: qualityMetrics.reliability_score,
          },
        },

        // User experience metrics
        user_experience: {
          perceived_performance: qualityMetrics.perceived_performance,
          frustration_indicators: qualityMetrics.frustration_indicators,
          satisfaction_prediction: qualityMetrics.satisfaction_prediction,
        },

        // Next action recommendations
        recommendations: await generateActionRecommendations(analyticsRecord, event_type),
      },
      message: `Download ${event_type} event tracked successfully`
    };

    return response;

  } catch (error) {
    console.error("Download tracking failed:", error);

    // Even if primary tracking fails, attempt to log the failure
    await logTrackingFailure({
      error: error instanceof Error ? error.message : "Unknown error",
      event_type: details.event_type,
      file_id: details.file_id,
      timestamp: new Date(),
      client_ip: details.client_ip,
      user_agent: details.user_agent,
    });

    return {
      success: false,
      error: "Failed to track download event",
      code: "TRACKING_FAILED",
      details: {
        event_type: details.event_type,
        tracking_time: new Date(),
        error_message: error instanceof Error ? error.message : "Unknown error",
      }
    };
  }
};

// Helper function to generate unique tracking ID
function generateTrackingId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `track_${timestamp}_${randomStr}`;
}

// Helper function to enrich geographic data
async function enrichGeographicData(
  ip?: string,
  countryCode?: string,
  region?: string,
  city?: string,
  timezone?: string
): Promise<any> {
  try {
    // In production, this would use a GeoIP service
    return {
      country_code: countryCode || "US",
      region: region || "Unknown",
      city: city || "Unknown",
      timezone: timezone || "UTC",
      coordinates: { lat: 0, lon: 0 }, // Placeholder
      isp: "Unknown ISP",
      connection_type: "broadband",
    };
  } catch (error) {
    console.error("Geographic data enrichment failed:", error);
    return {
      country_code: "Unknown",
      region: "Unknown",
      city: "Unknown",
      timezone: "UTC",
    };
  }
}

// Helper function to analyze client information
async function analyzeClientInfo(
  userAgent?: string,
  browserInfo?: string,
  deviceType?: string,
  os?: string,
  ip?: string
): Promise<any> {
  try {
    // Parse user agent and extract details
    const analysis = {
      browser: extractBrowserInfo(userAgent),
      device: {
        type: deviceType || "unknown",
        os: os || "unknown",
        is_mobile: deviceType === "mobile" || deviceType === "tablet",
        is_bot: isBot(userAgent),
      },
      capabilities: {
        download_manager_support: true, // Simplified
        resume_support: true,
        streaming_support: true,
      },
      security_assessment: {
        risk_level: "low", // Would be calculated based on various factors
        trust_score: 85, // 0-100 scale
      },
    };

    return analysis;
  } catch (error) {
    console.error("Client analysis failed:", error);
    return {
      browser: { name: "Unknown", version: "Unknown" },
      device: { type: "unknown", os: "unknown" },
      capabilities: {},
      security_assessment: { risk_level: "medium", trust_score: 50 },
    };
  }
}

// Helper function to calculate performance metrics
function calculatePerformanceMetrics(metrics: any): any {
  const {
    file_size = 0,
    bytes_downloaded = 0,
    download_speed = 0,
    duration_ms = 0,
    time_to_first_byte = 0,
    interruption_count = 0,
    resume_count = 0,
    chunk_errors = 0,
  } = metrics;

  // Calculate various performance indicators
  const completion_rate = file_size > 0 ? (bytes_downloaded / file_size) * 100 : 0;
  const average_speed = duration_ms > 0 ? (bytes_downloaded / (duration_ms / 1000)) : download_speed;
  const error_rate = bytes_downloaded > 0 ? (chunk_errors / (bytes_downloaded / 1024)) * 100 : 0;
  const stability_score = Math.max(0, 100 - (interruption_count * 10) - (resume_count * 5));

  // Overall performance rating
  const speed_score = Math.min(100, (average_speed / 1024 / 1024) * 10); // MB/s to score
  const reliability_score = Math.max(0, 100 - error_rate);
  const responsiveness_score = time_to_first_byte > 0 ? Math.max(0, 100 - (time_to_first_byte / 100)) : 50;

  const overall_rating = (speed_score + reliability_score + stability_score + responsiveness_score) / 4;

  return {
    completion_rate,
    average_speed,
    error_rate,
    stability_score,
    speed_score,
    reliability_score,
    responsiveness_score,
    overall_rating,
    performance_grade: getPerformanceGrade(overall_rating),
  };
}

// Helper function to assess download quality
function assessDownloadQuality(params: any): any {
  const {
    event_type,
    progress_percentage = 0,
    interruption_count = 0,
    resume_count = 0,
    chunk_errors = 0,
    data_integrity_check = "not_checked",
    download_speed = 0,
    perceived_quality,
  } = params;

  // Quality scoring
  const completion_quality = event_type === "completed" ? 100 : progress_percentage;
  const stability_score = Math.max(0, 100 - (interruption_count * 15));
  const integrity_score = data_integrity_check === "passed" ? 100 :
    data_integrity_check === "failed" ? 0 : 50;
  const speed_score = Math.min(100, (download_speed / 1024 / 1024) * 20); // Normalize speed

  const overall_score = (completion_quality + stability_score + integrity_score + speed_score) / 4;

  // User experience indicators
  const frustration_indicators = [];
  if (interruption_count > 2) frustration_indicators.push("frequent_interruptions");
  if (resume_count > 1) frustration_indicators.push("multiple_resumes");
  if (chunk_errors > 5) frustration_indicators.push("data_errors");
  if (download_speed < 100 * 1024) frustration_indicators.push("slow_speed"); // < 100KB/s

  return {
    overall_score,
    efficiency_rating: getEfficiencyRating(overall_score),
    reliability_score: stability_score,
    integrity_score,
    speed_score,
    stability_score,
    perceived_performance: perceived_quality || "fair",
    frustration_indicators,
    satisfaction_prediction: predictSatisfaction(overall_score, frustration_indicators),
  };
}

// Additional helper functions
function hashToken(token: string): string {
  // Simple hash for privacy - in production use crypto
  return `hash_${token.slice(-8)}`;
}

function extractBrowserInfo(userAgent?: string): any {
  if (!userAgent) return { name: "Unknown", version: "Unknown" };

  // Simplified browser detection
  if (userAgent.includes("Chrome")) return { name: "Chrome", version: "Unknown" };
  if (userAgent.includes("Firefox")) return { name: "Firefox", version: "Unknown" };
  if (userAgent.includes("Safari")) return { name: "Safari", version: "Unknown" };
  if (userAgent.includes("Edge")) return { name: "Edge", version: "Unknown" };

  return { name: "Unknown", version: "Unknown" };
}

function isBot(userAgent?: string): boolean {
  if (!userAgent) return false;
  const botPatterns = ["bot", "crawler", "spider", "scraper"];
  return botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern));
}

function getPerformanceGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

function getEfficiencyRating(score: number): string {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

function predictSatisfaction(score: number, frustrationIndicators: string[]): string {
  if (frustrationIndicators.length >= 3) return "dissatisfied";
  if (score >= 80 && frustrationIndicators.length === 0) return "very_satisfied";
  if (score >= 60) return "satisfied";
  return "neutral";
}

function calculateEstimatedCompletion(bytesDownloaded: number, fileSize: number, speed: number): string {
  if (!speed || !fileSize || bytesDownloaded >= fileSize) return "complete";

  const remainingBytes = fileSize - bytesDownloaded;
  const remainingSeconds = remainingBytes / speed;

  if (remainingSeconds < 60) return `${Math.ceil(remainingSeconds)}s`;
  if (remainingSeconds < 3600) return `${Math.ceil(remainingSeconds / 60)}m`;
  return `${Math.ceil(remainingSeconds / 3600)}h`;
}

// Placeholder implementations for complex operations
async function getRequestSequence(sessionId?: string, correlationId?: string): Promise<number> {
  return 1; // Simplified
}

async function calculateRevenueImpact(productId: string, eventType: string, pricePaid?: number): Promise<number> {
  return pricePaid || 0; // Simplified
}

async function getUserLifetimeValue(userId: string): Promise<number> {
  return 0; // Placeholder
}

async function storeDownloadAnalytics(record: DownloadAnalytics): Promise<void> {
  console.log("Storing download analytics:", {
    user_id: record.user_id,
    event_type: record.event_type,
    timestamp: record.timestamp
  });
}

async function updateRealTimeMetrics(record: DownloadAnalytics, eventType: string): Promise<void> {
  console.log("Updating real-time metrics for event:", eventType);
}

async function triggerDownstreamProcessing(record: DownloadAnalytics, eventType: string): Promise<void> {
  console.log("Triggering downstream processing for:", eventType);
}

async function handleSpecificEventType(eventType: string, record: DownloadAnalytics, details: any): Promise<any> {
  switch (eventType) {
    case "completed":
      return { completion_bonus_awarded: true };
    case "failed":
      return { retry_recommendations: ["check_connection", "try_resume"] };
    default:
      return {};
  }
}

async function calculateDownloadInsights(record: DownloadAnalytics, userId: string, productId: string): Promise<any> {
  return {
    user_download_pattern: "regular",
    product_popularity_trend: "stable",
    optimal_download_time: "evening"
  };
}

async function checkForAlertsAndAnomalies(record: DownloadAnalytics): Promise<any[]> {
  const alerts = [];

  if (record.performance_metrics.overall_rating < 30) {
    alerts.push({
      type: "performance_alert",
      severity: "high",
      message: "Poor download performance detected"
    });
  }

  return alerts;
}

async function getSessionEventCount(sessionId?: string): Promise<number> {
  return 1; // Placeholder
}

async function generateActionRecommendations(record: DownloadAnalytics, eventType: string): Promise<string[]> {
  const recommendations = [];

  if (record.performance_metrics.overall_rating < 50) {
    recommendations.push("consider_resume_feature");
  }

  if (eventType === "failed") {
    recommendations.push("retry_download", "check_network");
  }

  return recommendations;
}

async function logTrackingFailure(failureData: any): Promise<void> {
  console.error("Tracking failure:", failureData);
}
