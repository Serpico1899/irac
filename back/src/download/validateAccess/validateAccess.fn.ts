import { coreApp } from "../../../mod.ts";
import {
  order,
  product,
  user,
  file,
} from "../../../mod.ts";
import { jwt } from "@deps";

interface AccessValidationDetails {
  token: string;
  file_id: string;
  validation_level?: string;
  access_method?: string;
  access_purpose?: string;
  client_ip?: string;
  user_agent?: string;
  referer?: string;
  request_id?: string;
  session_id?: string;
  byte_range?: string;
  quality_requested?: string;
  format_requested?: string;
  verify_fingerprint?: string;
  check_geolocation?: string;
  require_fresh_token?: string;
  track_access?: string;
  log_details?: string;
  cache_buster?: string;
  force_revalidation?: string;
  rate_limit_key?: string;
  bypass_rate_limit?: string;
  debug_mode?: string;
  simulate_failure?: string;
  expected_file_size?: string;
  expected_checksum?: string;
  validate_license?: string;
  apply_watermark?: string;
  watermark_text?: string;
  watermark_position?: string;
  max_concurrent_access?: string;
  device_fingerprint?: string;
  validate_time_window?: string;
  min_time_between_access?: string;
  allowed_countries?: string;
  blocked_countries?: string;
  verify_license_status?: string;
  check_license_expiry?: string;
  prevent_hotlinking?: string;
  require_secure_connection?: string;
  compliance_mode?: string;
  audit_trail?: string;
  retention_period?: string;
}

interface ValidationResult {
  access_granted: boolean;
  access_type: string;
  file_info?: any;
  restrictions?: any;
  watermark_config?: any;
  rate_limit_info?: any;
  security_warnings?: string[];
  debug_info?: any;
}

export const validateAccessFn = async (
  { details, context }: { details: AccessValidationDetails; context: any }
) => {
  try {
    const {
      token,
      file_id,
      validation_level = "basic",
      access_method = "direct",
      access_purpose = "download",
      client_ip,
      user_agent,
      referer,
      request_id,
      session_id,
      byte_range,
      quality_requested = "original",
      format_requested = "original",
      verify_fingerprint = "false",
      check_geolocation = "false",
      require_fresh_token = "false",
      track_access = "true",
      log_details = "false",
      force_revalidation = "false",
      rate_limit_key,
      bypass_rate_limit = "false",
      debug_mode = "false",
      simulate_failure = "false",
      expected_file_size,
      expected_checksum,
      validate_license = "true",
      apply_watermark = "false",
      watermark_text,
      watermark_position = "bottom-right",
      max_concurrent_access,
      device_fingerprint,
      validate_time_window = "true",
      min_time_between_access = "0",
      allowed_countries,
      blocked_countries,
      verify_license_status = "true",
      check_license_expiry = "true",
      prevent_hotlinking = "false",
      require_secure_connection = "false",
      compliance_mode = "basic",
      audit_trail = "true",
      retention_period = "30",
    } = details;

    // For testing - simulate failure if requested
    if (simulate_failure === "true") {
      return {
        success: false,
        error: "Simulated failure for testing",
        code: "SIMULATED_FAILURE"
      };
    }

    const securityWarnings: string[] = [];
    const debugInfo: any = debug_mode === "true" ? {} : undefined;

    // Step 1: Decode and verify JWT token
    const jwtSecret = Deno.env.get("JWT_SECRET") || "fallback-secret";
    let tokenPayload: any;

    try {
      tokenPayload = await jwt.verify(token, jwtSecret);

      if (debugInfo) {
        debugInfo.token_decoded = true;
        debugInfo.token_expires_at = new Date(tokenPayload.exp * 1000);
      }
    } catch (error) {
      return {
        success: false,
        error: "Invalid or expired token",
        code: "INVALID_TOKEN",
        details: debug_mode === "true" ? error.message : undefined
      };
    }

    // Step 2: Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (tokenPayload.exp < now) {
      return {
        success: false,
        error: "Token has expired",
        code: "TOKEN_EXPIRED",
        details: {
          expired_at: new Date(tokenPayload.exp * 1000),
          current_time: new Date()
        }
      };
    }

    // Step 3: Validate file access
    if (!tokenPayload.file_ids || !tokenPayload.file_ids.includes(file_id)) {
      return {
        success: false,
        error: "File not included in this download token",
        code: "FILE_NOT_AUTHORIZED"
      };
    }

    // Step 4: Check download limits
    if (bypass_rate_limit !== "true") {
      const currentDownloads = await getCurrentDownloadCount(
        tokenPayload.order_id,
        tokenPayload.product_id
      );

      if (currentDownloads >= tokenPayload.max_downloads) {
        return {
          success: false,
          error: "Download limit exceeded",
          code: "DOWNLOAD_LIMIT_EXCEEDED",
          details: {
            current_downloads: currentDownloads,
            max_downloads: tokenPayload.max_downloads
          }
        };
      }
    }

    // Step 5: IP restriction validation
    if (tokenPayload.restrictions?.ip && client_ip) {
      if (tokenPayload.restrictions.ip !== client_ip) {
        securityWarnings.push("IP address mismatch detected");

        if (validation_level === "strict" || validation_level === "paranoid") {
          return {
            success: false,
            error: "IP address not authorized",
            code: "IP_RESTRICTION_FAILED"
          };
        }
      }
    }

    // Step 6: User agent validation
    if (tokenPayload.restrictions?.user_agent && user_agent) {
      if (tokenPayload.restrictions.user_agent !== user_agent) {
        securityWarnings.push("User agent mismatch detected");

        if (validation_level === "paranoid") {
          return {
            success: false,
            error: "Browser/client not authorized",
            code: "USER_AGENT_RESTRICTION_FAILED"
          };
        }
      }
    }

    // Step 7: Geographic restrictions
    if (check_geolocation === "true" && client_ip) {
      const geoValidation = await validateGeographicAccess(
        client_ip,
        allowed_countries,
        blocked_countries
      );

      if (!geoValidation.allowed) {
        return {
          success: false,
          error: "Geographic restrictions apply",
          code: "GEO_RESTRICTION_FAILED",
          details: geoValidation
        };
      }
    }

    // Step 8: Time-based validation
    if (validate_time_window === "true" && min_time_between_access !== "0") {
      const lastAccessTime = await getLastAccessTime(
        tokenPayload.user_id,
        tokenPayload.product_id,
        file_id
      );

      const minInterval = parseInt(min_time_between_access) * 1000;
      const timeSinceLastAccess = Date.now() - lastAccessTime.getTime();

      if (timeSinceLastAccess < minInterval) {
        return {
          success: false,
          error: "Too frequent access attempts",
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            retry_after: Math.ceil((minInterval - timeSinceLastAccess) / 1000)
          }
        };
      }
    }

    // Step 9: Concurrent access validation
    if (max_concurrent_access) {
      const concurrentCount = await getConcurrentAccessCount(
        tokenPayload.user_id,
        tokenPayload.product_id
      );

      const maxConcurrent = parseInt(max_concurrent_access);
      if (concurrentCount >= maxConcurrent) {
        return {
          success: false,
          error: "Maximum concurrent downloads exceeded",
          code: "CONCURRENT_LIMIT_EXCEEDED",
          details: {
            current_concurrent: concurrentCount,
            max_concurrent: maxConcurrent
          }
        };
      }
    }

    // Step 10: Device fingerprint validation
    if (verify_fingerprint === "true" && device_fingerprint) {
      const fingerprintValid = await validateDeviceFingerprint(
        tokenPayload.user_id,
        device_fingerprint
      );

      if (!fingerprintValid) {
        securityWarnings.push("Device fingerprint mismatch");

        if (validation_level === "paranoid") {
          return {
            success: false,
            error: "Device not recognized",
            code: "DEVICE_FINGERPRINT_FAILED"
          };
        }
      }
    }

    // Step 11: License validation
    if (verify_license_status === "true" || validate_license === "true") {
      const licenseValidation = await validateProductLicense(
        tokenPayload.product_id,
        tokenPayload.user_id,
        check_license_expiry === "true"
      );

      if (!licenseValidation.valid) {
        return {
          success: false,
          error: "License validation failed",
          code: "LICENSE_INVALID",
          details: licenseValidation
        };
      }
    }

    // Step 12: Hotlinking protection
    if (prevent_hotlinking === "true" && referer) {
      const allowedDomains = await getAllowedRefererDomains();
      const refererDomain = new URL(referer).hostname;

      if (!allowedDomains.includes(refererDomain)) {
        return {
          success: false,
          error: "Hotlinking not allowed",
          code: "HOTLINKING_BLOCKED"
        };
      }
    }

    // Step 13: Secure connection requirement
    if (require_secure_connection === "true") {
      const isSecure = context?.protocol === "https" ||
        context?.headers?.["x-forwarded-proto"] === "https";

      if (!isSecure) {
        return {
          success: false,
          error: "Secure connection required",
          code: "INSECURE_CONNECTION"
        };
      }
    }

    // Step 14: Get file information
    const fileInfo = await getFileInformation(file_id, tokenPayload.product_id);
    if (!fileInfo) {
      return {
        success: false,
        error: "File not found or inaccessible",
        code: "FILE_NOT_FOUND"
      };
    }

    // Step 15: File integrity validation
    if (expected_file_size && fileInfo.size.toString() !== expected_file_size) {
      securityWarnings.push("File size mismatch detected");
    }

    if (expected_checksum && fileInfo.checksum !== expected_checksum) {
      securityWarnings.push("File checksum mismatch detected");
    }

    // Step 16: Prepare watermark configuration
    let watermarkConfig = null;
    if (apply_watermark === "true" || tokenPayload.restrictions?.watermark) {
      watermarkConfig = {
        enabled: true,
        text: watermark_text || `Licensed to: ${tokenPayload.user_id}`,
        position: watermark_position,
        opacity: 0.3,
        font_size: 12,
        timestamp: new Date().toISOString()
      };
    }

    // Step 17: Prepare rate limit information
    const rateLimitInfo = {
      downloads_used: await getCurrentDownloadCount(
        tokenPayload.order_id,
        tokenPayload.product_id
      ),
      downloads_remaining: tokenPayload.max_downloads - await getCurrentDownloadCount(
        tokenPayload.order_id,
        tokenPayload.product_id
      ),
      max_downloads: tokenPayload.max_downloads,
      reset_time: tokenPayload.expires_at
    };

    // Step 18: Log access attempt if tracking enabled
    if (track_access === "true" || audit_trail === "true") {
      await logAccessAttempt({
        request_id: request_id || generateRequestId(),
        user_id: tokenPayload.user_id,
        product_id: tokenPayload.product_id,
        file_id: file_id,
        access_method: access_method,
        access_purpose: access_purpose,
        client_ip: client_ip,
        user_agent: user_agent,
        referer: referer,
        validation_level: validation_level,
        security_warnings: securityWarnings,
        timestamp: new Date(),
        success: true,
        compliance_mode: compliance_mode,
        retention_days: parseInt(retention_period)
      });
    }

    // Step 19: Update download count
    await incrementDownloadCount(tokenPayload.order_id, tokenPayload.product_id);

    // Step 20: Prepare validation result
    const validationResult: ValidationResult = {
      access_granted: true,
      access_type: access_method,
      file_info: {
        id: file_id,
        name: fileInfo.filename,
        size: fileInfo.size,
        type: fileInfo.mimetype,
        format: format_requested,
        quality: quality_requested,
        checksum: fileInfo.checksum,
        ...(byte_range && {
          supports_partial: true,
          requested_range: byte_range
        })
      },
      restrictions: {
        max_downloads: tokenPayload.max_downloads,
        downloads_remaining: rateLimitInfo.downloads_remaining,
        expires_at: new Date(tokenPayload.exp * 1000),
        ip_restricted: !!tokenPayload.restrictions?.ip,
        watermarked: !!watermarkConfig,
        geo_restricted: !!(allowed_countries || blocked_countries)
      },
      ...(watermarkConfig && { watermark_config: watermarkConfig }),
      rate_limit_info: rateLimitInfo,
      ...(securityWarnings.length > 0 && { security_warnings: securityWarnings }),
      ...(debugInfo && { debug_info: debugInfo })
    };

    return {
      success: true,
      data: validationResult,
      message: "Access validated successfully"
    };

  } catch (error) {
    console.error("Access validation failed:", error);

    // Log failed access attempt
    if (details.track_access === "true" || details.audit_trail === "true") {
      await logAccessAttempt({
        request_id: details.request_id || generateRequestId(),
        file_id: details.file_id,
        access_method: details.access_method || "unknown",
        client_ip: details.client_ip,
        user_agent: details.user_agent,
        validation_level: details.validation_level || "basic",
        timestamp: new Date(),
        success: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
        compliance_mode: details.compliance_mode || "basic"
      });
    }

    return {
      success: false,
      error: "Access validation failed",
      code: "VALIDATION_ERROR",
      details: details.debug_mode === "true" ? {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    };
  }
};

// Helper function to get current download count
async function getCurrentDownloadCount(orderId: string, productId: string): Promise<number> {
  try {
    // This would query download logs collection
    // For now, return placeholder
    return Math.floor(Math.random() * 3); // 0-2 downloads used
  } catch (error) {
    console.error("Failed to get download count:", error);
    return 0;
  }
}

// Helper function to validate geographic access
async function validateGeographicAccess(
  ip: string,
  allowedCountries?: string,
  blockedCountries?: string
): Promise<{ allowed: boolean; country?: string; reason?: string }> {
  try {
    // This would use a GeoIP service
    const country = "US"; // Placeholder

    if (blockedCountries) {
      const blocked = JSON.parse(blockedCountries);
      if (blocked.includes(country)) {
        return {
          allowed: false,
          country: country,
          reason: "Country is blocked"
        };
      }
    }

    if (allowedCountries) {
      const allowed = JSON.parse(allowedCountries);
      if (!allowed.includes(country)) {
        return {
          allowed: false,
          country: country,
          reason: "Country not in allowed list"
        };
      }
    }

    return { allowed: true, country: country };
  } catch (error) {
    console.error("Geographic validation failed:", error);
    return { allowed: true }; // Default to allow if validation fails
  }
}

// Helper function to get last access time
async function getLastAccessTime(userId: string, productId: string, fileId: string): Promise<Date> {
  try {
    // This would query access logs
    return new Date(Date.now() - 60000); // 1 minute ago placeholder
  } catch (error) {
    console.error("Failed to get last access time:", error);
    return new Date(0); // Very old date if query fails
  }
}

// Helper function to get concurrent access count
async function getConcurrentAccessCount(userId: string, productId: string): Promise<number> {
  try {
    // This would count active download sessions
    return 0; // Placeholder
  } catch (error) {
    console.error("Failed to get concurrent access count:", error);
    return 0;
  }
}

// Helper function to validate device fingerprint
async function validateDeviceFingerprint(userId: string, fingerprint: string): Promise<boolean> {
  try {
    // This would check stored device fingerprints for the user
    return true; // Placeholder - assume valid
  } catch (error) {
    console.error("Device fingerprint validation failed:", error);
    return true; // Default to allow if validation fails
  }
}

// Helper function to validate product license
async function validateProductLicense(
  productId: string,
  userId: string,
  checkExpiry: boolean
): Promise<{ valid: boolean; reason?: string; expires_at?: Date }> {
  try {
    // This would check license status in database
    return {
      valid: true,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };
  } catch (error) {
    console.error("License validation failed:", error);
    return { valid: false, reason: "License validation error" };
  }
}

// Helper function to get allowed referer domains
async function getAllowedRefererDomains(): Promise<string[]> {
  try {
    // This would get from configuration
    const baseUrl = Deno.env.get("BASE_URL") || "http://localhost:1405";
    const domain = new URL(baseUrl).hostname;
    return [domain, "localhost", "127.0.0.1"];
  } catch (error) {
    console.error("Failed to get allowed domains:", error);
    return ["localhost"];
  }
}

// Helper function to get file information
async function getFileInformation(fileId: string, productId: string): Promise<any | null> {
  try {
    const productData = await product().findOne({
      _id: coreApp.odm.ObjectId(productId)
    });

    if (!productData || !productData.files) {
      return null;
    }

    return productData.files.find((file: any) =>
      file._id.toString() === fileId
    );
  } catch (error) {
    console.error("Failed to get file information:", error);
    return null;
  }
}

// Helper function to log access attempts
async function logAccessAttempt(logData: any): Promise<void> {
  try {
    // This would store in access logs collection
    console.log("Access attempt logged:", {
      timestamp: logData.timestamp,
      user_id: logData.user_id,
      file_id: logData.file_id,
      success: logData.success,
      ip: logData.client_ip
    });
  } catch (error) {
    console.error("Failed to log access attempt:", error);
  }
}

// Helper function to increment download count
async function incrementDownloadCount(orderId: string, productId: string): Promise<void> {
  try {
    // This would update download count in database
    console.log("Download count incremented for order:", orderId);
  } catch (error) {
    console.error("Failed to increment download count:", error);
  }
}

// Helper function to generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
