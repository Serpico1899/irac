import type { ActFn } from "@deps";
import { throwError } from "@lib";
import {  myRedis  } from "@app";
import { smsService, SMSService } from "../smsService.ts";

// Rate limiting constants
const SMS_RATE_LIMIT = 3; // Maximum SMS per time window
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds
const CODE_EXPIRY = 5 * 60; // 5 minutes in seconds
const RESEND_DELAY = 60; // 1 minute in seconds

// SMS templates in Persian
const SMS_TEMPLATES = {
  login: (code: string) => `کد ورود شما در ایراک: ${code}\nاعتبار: 5 دقیقه\nمرکز معماری ایرانی`,
  register: (code: string) => `کد تایید ثبت‌نام در ایراک: ${code}\nاعتبار: 5 دقیقه\nمرکز معماری ایرانی`,
  password_reset: (code: string) => `کد بازیابی رمز عبور ایراک: ${code}\nاعتبار: 5 دقیقه\nمرکز معماری ایرانی`,
  "2fa": (code: string) => `کد ورود دو مرحله‌ای ایراک: ${code}\nاعتبار: 5 دقیقه\nمرکز معماری ایرانی`,
};

interface VerificationData {
  code: string;
  purpose: string;
  attempts: number;
  created_at: number;
  expires_at: number;
}

export const sendVerificationCodeFn: ActFn = async (body) => {
  const {
    set: { mobile, purpose = "login", locale = "fa" },
    get,
  } = body.details;

  try {
    // Normalize mobile number
    const normalizedMobile = normalizeMobile(mobile);

    // Validate mobile format
    if (!SMSService.isValidIranianMobile(normalizedMobile)) {
      return throwError("شماره موبایل نامعتبر است");
    }

    // Check rate limiting
    await checkRateLimit(normalizedMobile);

    // Generate secure verification code
    const verificationCode = generateSecureCode();
    const verificationId = generateVerificationId();

    // Create verification data
    const now = Date.now();
    const verificationData: VerificationData = {
      code: verificationCode,
      purpose,
      attempts: 0,
      created_at: now,
      expires_at: now + (CODE_EXPIRY * 1000),
    };

    // Store verification data in Redis
    await storeVerificationData(verificationId, verificationData, normalizedMobile);

    // Prepare SMS message
    const messageTemplate = SMS_TEMPLATES[purpose as keyof typeof SMS_TEMPLATES];
    const smsMessage = messageTemplate ? messageTemplate(verificationCode) :
      `کد تایید شما در ایراک: ${verificationCode}\nاعتبار: 5 دقیقه`;

    // Send SMS
    const smsResult = await smsService.sendSMS({
      to: normalizedMobile,
      message: smsMessage,
      template_id: `verification_${purpose}`,
    });

    if (!smsResult.success) {
      // Clean up stored data if SMS failed
      await myRedis.del(`verification:${verificationId}`);
      await myRedis.del(`verification:mobile:${normalizedMobile}:${verificationId}`);

      console.error("SMS send failed:", smsResult.error);
      return throwError(smsResult.error || "خطا در ارسال پیامک");
    }

    // Update rate limiting counter
    await updateRateLimit(normalizedMobile);

    // Log verification attempt (for security monitoring)
    console.log(`SMS verification sent - Mobile: ${maskMobile(normalizedMobile)}, Purpose: ${purpose}, ID: ${verificationId}`);

    // Return response based on get parameter
    if (get) {
      return {
        verification_id: verificationId,
        mobile: maskMobile(normalizedMobile),
        expires_in: CODE_EXPIRY,
        message: "کد تایید برای شما ارسال شد",
        can_resend_after: RESEND_DELAY,
      };
    }

    return { success: true, message: "کد تایید ارسال شد" };

  } catch (error) {
    console.error("Send verification code error:", error);
    return throwError("خطا در ارسال کد تایید");
  }
};

// Helper functions

function normalizeMobile(mobile: string): string {
  // Remove all non-digits
  const digits = mobile.replace(/\D/g, "");

  // Convert to international format
  if (digits.startsWith("98") && digits.length === 12) {
    return digits;
  } else if (digits.startsWith("0") && digits.length === 11) {
    return `98${digits.substring(1)}`;
  } else if (digits.length === 10 && digits.startsWith("9")) {
    return `98${digits}`;
  }

  return digits;
}

function generateSecureCode(): string {
  // Use crypto.getRandomValues for secure random generation
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomValue = array[0];

  // Generate 6-digit code ensuring it's not sequential or repeated
  let code = (randomValue % 900000 + 100000).toString();

  // Avoid common patterns
  if (isWeakCode(code)) {
    return generateSecureCode(); // Regenerate if weak
  }

  return code;
}

function isWeakCode(code: string): boolean {
  // Check for sequential numbers (123456, 654321)
  const isSequential = /^(?:123456|234567|345678|456789|567890|098765|987654|876543|765432|654321)$/.test(code);

  // Check for repeated digits (111111, 222222)
  const isRepeated = /^(\d)\1{5}$/.test(code);

  // Check for common weak patterns
  const weakPatterns = ["000000", "111111", "123123", "456456", "789789"];
  const isCommon = weakPatterns.includes(code);

  return isSequential || isRepeated || isCommon;
}

function generateVerificationId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  const randomString = Array.from(randomBytes, byte => byte.toString(36)).join('');

  return `verify_${timestamp}_${randomString}`;
}

async function checkRateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `sms:rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount && parseInt(currentCount) >= SMS_RATE_LIMIT) {
    const ttl = await myRedis.ttl(rateLimitKey);
    const minutes = Math.ceil(ttl / 60);
    throw new Error(`حداکثر تعداد ارسال پیامک در ساعت گذشته رسیده است. ${minutes} دقیقه تا ارسال مجدد`);
  }
}

async function updateRateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `sms:rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount) {
    await myRedis.incr(rateLimitKey);
  } else {
    await myRedis.set(rateLimitKey, "1", { ex: RATE_LIMIT_WINDOW });
  }
}

async function storeVerificationData(
  verificationId: string,
  data: VerificationData,
  mobile: string
): Promise<void> {
  // Store main verification data
  await myRedis.set(
    `verification:${verificationId}`,
    JSON.stringify(data),
    { ex: CODE_EXPIRY }
  );

  // Store mobile mapping for cleanup and tracking
  await myRedis.set(
    `verification:mobile:${mobile}:${verificationId}`,
    "1",
    { ex: CODE_EXPIRY }
  );

  // Store latest verification ID for mobile (for resend functionality)
  await myRedis.set(
    `verification:latest:${mobile}`,
    verificationId,
    { ex: CODE_EXPIRY }
  );
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

// Security monitoring function
async function logSecurityEvent(
  event: string,
  mobile: string,
  details?: Record<string, any>
): Promise<void> {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    mobile: maskMobile(mobile),
    ip: details?.ip,
    user_agent: details?.user_agent,
    additional: details,
  };

  console.log("SMS Security Event:", JSON.stringify(logData));

  // In production, this could be sent to a security monitoring service
  // await sendToSecurityMonitoring(logData);
}
