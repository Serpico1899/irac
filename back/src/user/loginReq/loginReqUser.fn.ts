import type { ActFn } from "@deps";
import { throwError } from "@lib";
import { myRedis, user } from "../../../mod.ts";
import { smsService, SMSService } from "../../sms/smsService.ts";

// Rate limiting constants
const LOGIN_REQUEST_RATE_LIMIT = 3; // Maximum login requests per hour
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds
const CODE_EXPIRY = 5 * 60; // 5 minutes in seconds

interface VerificationData {
  code: string;
  purpose: string;
  national_number: string;
  mobile: string;
  user_id: string;
  attempts: number;
  created_at: number;
  expires_at: number;
}

export const loginReqUserFn: ActFn = async (body) => {
  const {
    set: { national_number },
    get,
  } = body.details;

  try {
    // Find user by national number
    const foundedUser = await user.findOne({
      filters: { national_number: String(national_number) },
      projection: { _id: 1, mobile: 1, national_number: 1, first_name: 1, last_name: 1 },
    });

    if (!foundedUser) {
      return throwError("با این شماره ملی هیچ کاربری پیدا نشد");
    }

    // Check rate limiting
    await checkLoginRequestRateLimit(foundedUser.mobile);

    // Generate secure verification code
    const verificationCode = generateSecureCode();
    const verificationId = generateVerificationId();

    // Create verification data
    const now = Date.now();
    const verificationData: VerificationData = {
      code: verificationCode,
      purpose: "login",
      national_number: foundedUser.national_number,
      mobile: foundedUser.mobile,
      user_id: foundedUser._id,
      attempts: 0,
      created_at: now,
      expires_at: now + (CODE_EXPIRY * 1000),
    };

    // Store verification data in Redis (using new system)
    await myRedis.set(
      `verification:${verificationId}`,
      JSON.stringify(verificationData),
      { ex: CODE_EXPIRY }
    );

    // Store mobile mapping for cleanup and tracking
    await myRedis.set(
      `verification:mobile:${foundedUser.mobile}:${verificationId}`,
      "1",
      { ex: CODE_EXPIRY }
    );

    // Store latest verification ID for mobile
    await myRedis.set(
      `verification:latest:${foundedUser.mobile}`,
      verificationId,
      { ex: CODE_EXPIRY }
    );

    // Keep backward compatibility - also store in old format
    await myRedis.set(foundedUser.national_number, verificationCode, { ex: 100 });

    // Prepare SMS message
    const userName = `${foundedUser.first_name || ''} ${foundedUser.last_name || ''}`.trim();
    const smsMessage = `${userName ? `${userName} عزیز` : 'کاربر گرامی'}
کد ورود شما در ایراک: ${verificationCode}
اعتبار: 5 دقیقه
مرکز معماری ایرانی`;

    // Send SMS using the new SMS service
    const smsResult = await smsService.sendSMS({
      to: foundedUser.mobile,
      message: smsMessage,
      template_id: "login_verification",
    });

    if (!smsResult.success) {
      // Clean up stored data if SMS failed
      await myRedis.del(`verification:${verificationId}`);
      await myRedis.del(`verification:mobile:${foundedUser.mobile}:${verificationId}`);
      await myRedis.del(`verification:latest:${foundedUser.mobile}`);

      console.error("Login SMS send failed:", smsResult.error);
      return throwError(smsResult.error || "خطا در ارسال کد تایید");
    }

    // Update rate limiting counter
    await updateLoginRequestRateLimit(foundedUser.mobile);

    // Log login request (for security monitoring)
    console.log(`Login verification sent - National Number: ${national_number}, Mobile: ${maskMobile(foundedUser.mobile)}, Verification ID: ${verificationId}`);

    // Return masked mobile for security
    const mobile = foundedUser.mobile as string;
    foundedUser.mobile = `${mobile.slice(0, 3)}****${mobile.slice(-3)}`;

    return foundedUser;

  } catch (error) {
    console.error("Login request error:", error);

    if (error.message.includes("حداکثر") || error.message.includes("کاربری") || error.message.includes("کد")) {
      return throwError(error.message);
    }

    return throwError("خطا در درخواست ورود");
  }
};

// Helper functions

function generateSecureCode(): string {
  // In development, return fixed code
  if (Deno.env.get("ENV") === "development") {
    return "11111";
  }

  // Use crypto.getRandomValues for secure random generation
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomValue = array[0];

  // Generate 5-digit code
  let code = (randomValue % 90000 + 10000).toString();

  // Avoid common patterns
  if (isWeakCode(code)) {
    return generateSecureCode(); // Regenerate if weak
  }

  return code;
}

function isWeakCode(code: string): boolean {
  // Check for sequential numbers
  const isSequential = /^(?:12345|23456|34567|45678|56789|54321|43210|32109|21098)$/.test(code);

  // Check for repeated digits
  const isRepeated = /^(\d)\1{4}$/.test(code);

  // Check for common weak patterns
  const weakPatterns = ["00000", "11111", "12312", "45645"];
  const isCommon = weakPatterns.includes(code);

  return isSequential || isRepeated || isCommon;
}

function generateVerificationId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  const randomString = Array.from(randomBytes, byte => byte.toString(36)).join('');

  return `login_${timestamp}_${randomString}`;
}

async function checkLoginRequestRateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `login:rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount && parseInt(currentCount) >= LOGIN_REQUEST_RATE_LIMIT) {
    const ttl = await myRedis.ttl(rateLimitKey);
    const minutes = Math.ceil(ttl / 60);
    throw new Error(`حداکثر تعداد درخواست ورود در ساعت گذشته رسیده است. ${minutes} دقیقه تا درخواست مجدد`);
  }
}

async function updateLoginRequestRateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `login:rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount) {
    await myRedis.incr(rateLimitKey);
  } else {
    await myRedis.set(rateLimitKey, "1", { ex: RATE_LIMIT_WINDOW });
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
