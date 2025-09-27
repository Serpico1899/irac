import type { ActFn } from "@deps";
import { jwt } from "@deps";
import { throwError, jwtTokenKey } from "@lib";
import {  myRedis, user  } from "@app";

const MAX_VERIFICATION_ATTEMPTS = 3;

interface VerificationData {
  code: string;
  purpose: string;
  attempts: number;
  created_at: number;
  expires_at: number;
}

export const verifyPhoneNumberFn: ActFn = async (body) => {
  const {
    set: { verification_id, code },
    get,
  } = body.details;

  try {
    // Retrieve verification data from Redis
    const verificationDataStr = await myRedis.get(`verification:${verification_id}`);

    if (!verificationDataStr) {
      return throwError("کد تایید یافت نشد یا منقضی شده است");
    }

    const verificationData: VerificationData = JSON.parse(verificationDataStr);
    const now = Date.now();

    // Check if verification has expired
    if (now > verificationData.expires_at) {
      await cleanupVerificationData(verification_id);
      return throwError("کد تایید منقضی شده است");
    }

    // Check maximum attempts
    if (verificationData.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      await cleanupVerificationData(verification_id);
      await logSecurityEvent("max_attempts_exceeded", verification_id, {
        purpose: verificationData.purpose,
        attempts: verificationData.attempts,
      });
      return throwError("حداکثر تعداد تلاش برای وارد کردن کد تایید");
    }

    // Verify the code
    if (code !== verificationData.code) {
      // Increment attempt counter
      verificationData.attempts += 1;
      await myRedis.set(
        `verification:${verification_id}`,
        JSON.stringify(verificationData),
        { ex: Math.floor((verificationData.expires_at - now) / 1000) }
      );

      const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - verificationData.attempts;

      if (remainingAttempts <= 0) {
        await cleanupVerificationData(verification_id);
        return throwError("کد تایید اشتباه است. حداکثر تعداد تلاش رسیده است");
      }

      await logSecurityEvent("invalid_code_attempt", verification_id, {
        purpose: verificationData.purpose,
        attempts: verificationData.attempts,
        remaining: remainingAttempts,
      });

      return throwError(`کد تایید اشتباه است. ${remainingAttempts} تلاش باقی مانده`);
    }

    // Code is correct - mark as verified
    verificationData.attempts += 1;
    await myRedis.set(
      `verification:${verification_id}:verified`,
      JSON.stringify({
        ...verificationData,
        verified_at: now,
      }),
      { ex: 300 } // Keep verified status for 5 minutes
    );

    // Get mobile number from verification mapping
    const mobile = await getMobileFromVerification(verification_id);
    if (!mobile) {
      return throwError("خطا در بازیابی اطلاعات تایید");
    }

    // Check if user exists with this mobile number
    const existingUser = await user.findOne({
      filters: { mobile },
      projection: { _id: 1, mobile: 1, national_number: 1, is_verified: 1, level: 1 },
    });

    let response: any = {
      verified: true,
      mobile: maskMobile(mobile),
      purpose: verificationData.purpose,
      user_exists: !!existingUser,
      user_id: existingUser?._id || null,
      message: "کد تایید با موفقیت تأیید شد",
    };

    // Generate JWT token if user exists and this is for login/2FA
    if (existingUser && (verificationData.purpose === "login" || verificationData.purpose === "2fa")) {
      const token = await generateUserToken(existingUser);
      response.token = token;

      // Update user verification status if needed
      if (!existingUser.is_verified) {
        await user.updateOne({
          filters: { _id: existingUser._id },
          set: { is_verified: true },
        });
      }

      // Log successful authentication
      await logSecurityEvent("successful_verification", verification_id, {
        purpose: verificationData.purpose,
        user_id: existingUser._id,
        mobile: maskMobile(mobile),
      });
    }

    // Clean up verification data
    await cleanupVerificationData(verification_id);

    // Return response based on get parameter
    if (get) {
      return response;
    }

    return { success: true, message: "کد تایید با موفقیت تأیید شد" };

  } catch (error) {
    console.error("Phone verification error:", error);

    // Log security event for errors
    await logSecurityEvent("verification_error", verification_id, {
      error: error.message,
      code_provided: code,
    });

    if (error.message.includes("کد تایید") || error.message.includes("تلاش")) {
      return throwError(error.message);
    }

    return throwError("خطا در تایید کد");
  }
};

// Helper functions

async function getMobileFromVerification(verificationId: string): Promise<string | null> {
  // Get all verification mobile mappings
  const keys = await myRedis.keys(`verification:mobile:*:${verificationId}`);

  if (keys.length === 0) {
    return null;
  }

  // Extract mobile number from key
  const keyParts = keys[0].split(':');
  return keyParts[2]; // verification:mobile:MOBILE:ID -> MOBILE
}

async function generateUserToken(userData: any): Promise<string> {
  try {
    const token = await jwt.create(
      { alg: "HS512", typ: "JWT" },
      {
        _id: userData._id,
        national_number: userData.national_number,
        mobile: userData.mobile,
        level: userData.level,
        exp: jwt.getNumericDate(60 * 60 * 24 * 30 * 3), // 3 months
        iat: jwt.getNumericDate(0),
      },
      jwtTokenKey
    );
    return token;
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("خطا در ایجاد توکن احراز هویت");
  }
}

async function cleanupVerificationData(verificationId: string): Promise<void> {
  try {
    // Remove main verification data
    await myRedis.del(`verification:${verificationId}`);

    // Clean up mobile mappings
    const mobileKeys = await myRedis.keys(`verification:mobile:*:${verificationId}`);
    if (mobileKeys.length > 0) {
      await myRedis.del(...mobileKeys);
    }

    // Clean up latest verification mapping
    const latestKeys = await myRedis.keys("verification:latest:*");
    for (const key of latestKeys) {
      const latestId = await myRedis.get(key);
      if (latestId === verificationId) {
        await myRedis.del(key);
      }
    }
  } catch (error) {
    console.error("Cleanup verification data error:", error);
  }
}

function maskMobile(mobile: string): string {
  if (mobile.length >= 8) {
    const start = mobile.slice(0, 4);
    const end = mobile.slice(-3);
    const masked = "*".repeat(mobile.length - 7);
    return `${start}${masked}${end}`;
  }
  return mobile;
}

async function logSecurityEvent(
  event: string,
  verificationId: string,
  details?: Record<string, any>
): Promise<void> {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    verification_id: verificationId,
    details,
  };

  console.log("SMS Security Event:", JSON.stringify(logData));

  // Store security events in Redis for monitoring (optional)
  try {
    await myRedis.lpush(
      "sms:security_events",
      JSON.stringify(logData)
    );

    // Keep only last 1000 events
    await myRedis.ltrim("sms:security_events", 0, 999);
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

// Rate limiting for verification attempts per IP (optional security feature)
async function checkVerificationRateLimit(ip?: string): Promise<void> {
  if (!ip) return;

  const rateLimitKey = `sms:verify_rate:${ip}`;
  const attempts = await myRedis.get(rateLimitKey);

  if (attempts && parseInt(attempts) > 10) { // Max 10 verification attempts per hour per IP
    throw new Error("حداکثر تعداد تلاش برای تایید کد در ساعت گذشته رسیده است");
  }

  // Increment counter
  const currentAttempts = attempts ? parseInt(attempts) + 1 : 1;
  await myRedis.set(rateLimitKey, currentAttempts.toString(), { ex: 3600 });
}
