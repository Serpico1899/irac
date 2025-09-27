import type { ActFn } from "@deps";
import { throwError } from "@lib";
import {  myRedis, user  } from "@app";
import { smsService, SMSService } from "../smsService.ts";

// 2FA Security constants
const TFA_RATE_LIMIT = 5; // Maximum 2FA requests per hour
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds
const CODE_EXPIRY = 5 * 60; // 5 minutes in seconds
const BACKUP_CODES_COUNT = 8;
const MAX_ATTEMPTS = 3;

interface TFAData {
  code: string;
  user_id: string;
  mobile: string;
  action: string;
  attempts: number;
  created_at: number;
  expires_at: number;
}

export const send2FACodeFn: ActFn = async (body) => {
  const {
    set: { user_id, mobile, action, verification_id, code },
    get,
  } = body.details;

  try {
    switch (action) {
      case "setup":
      case "enable":
        return await handle2FASetup(user_id, mobile, get);

      case "disable":
        return await handle2FADisable(user_id, verification_id, code, get);

      case "verify":
        return await handle2FAVerify(verification_id, code, get);

      default:
        return throwError("عملیات نامعتبر");
    }
  } catch (error) {
    console.error("2FA operation error:", error);

    if (error.message.includes("حداکثر") ||
      error.message.includes("کاربر") ||
      error.message.includes("کد") ||
      error.message.includes("فعال")) {
      return throwError(error.message);
    }

    return throwError("خطا در عملیات احراز هویت دو مرحله‌ای");
  }
};

async function handle2FASetup(userId: string, mobile: string, get: any) {
  if (!userId && !mobile) {
    throw new Error("شناسه کاربر یا شماره موبایل الزامی است");
  }

  // Find user
  const foundUser = await findUserForTFA(userId, mobile);
  if (!foundUser) {
    throw new Error("کاربر یافت نشد");
  }

  // Check if 2FA is already enabled
  const currentTFAStatus = await get2FAStatus(foundUser._id);
  if (currentTFAStatus.enabled) {
    throw new Error("احراز هویت دو مرحله‌ای قبلاً فعال شده است");
  }

  // Check rate limiting
  await check2FARateLimit(foundUser.mobile);

  // Generate secure verification code
  const tfaCode = generateSecure2FACode();
  const verificationId = generateVerificationId();

  // Create 2FA data
  const now = Date.now();
  const tfaData: TFAData = {
    code: tfaCode,
    user_id: foundUser._id,
    mobile: foundUser.mobile,
    action: "enable",
    attempts: 0,
    created_at: now,
    expires_at: now + (CODE_EXPIRY * 1000),
  };

  // Store 2FA data
  await store2FAData(verificationId, tfaData);

  // Prepare SMS message
  const userName = `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim();
  const smsMessage = `${userName ? `${userName} عزیز` : 'کاربر گرامی'}
کد فعال‌سازی احراز هویت دو مرحله‌ای ایراک: ${tfaCode}
اعتبار: 5 دقیقه
مرکز معماری ایرانی`;

  // Send SMS
  const smsResult = await smsService.sendSMS({
    to: foundUser.mobile,
    message: smsMessage,
    template_id: "2fa_setup",
  });

  if (!smsResult.success) {
    // Clean up on SMS failure
    await myRedis.del(`2fa:${verificationId}`);
    throw new Error(smsResult.error || "خطا در ارسال کد تایید");
  }

  // Update rate limiting
  await update2FARateLimit(foundUser.mobile);

  // Log security event
  await log2FAEvent("setup_code_sent", {
    user_id: foundUser._id,
    mobile: maskMobile(foundUser.mobile),
    verification_id: verificationId,
  });

  // Return response
  if (get) {
    return {
      verification_id: verificationId,
      mobile: maskMobile(foundUser.mobile),
      expires_in: CODE_EXPIRY,
      message: "کد فعال‌سازی احراز هویت دو مرحله‌ای ارسال شد",
    };
  }

  return { success: true, message: "کد فعال‌سازی ارسال شد" };
}

async function handle2FADisable(userId: string, verificationId: string, code: string, get: any) {
  if (!verificationId || !code) {
    throw new Error("شناسه تایید و کد الزامی است");
  }

  // Retrieve 2FA data
  const tfaDataStr = await myRedis.get(`2fa:${verificationId}`);
  if (!tfaDataStr) {
    throw new Error("کد تایید یافت نشد یا منقضی شده است");
  }

  const tfaData: TFAData = JSON.parse(tfaDataStr);
  const now = Date.now();

  // Check expiry
  if (now > tfaData.expires_at) {
    await myRedis.del(`2fa:${verificationId}`);
    throw new Error("کد تایید منقضی شده است");
  }

  // Check attempts
  if (tfaData.attempts >= MAX_ATTEMPTS) {
    await myRedis.del(`2fa:${verificationId}`);
    throw new Error("حداکثر تعداد تلاش رسیده است");
  }

  // Verify code
  if (code !== tfaData.code) {
    tfaData.attempts += 1;
    await myRedis.set(
      `2fa:${verificationId}`,
      JSON.stringify(tfaData),
      { ex: Math.floor((tfaData.expires_at - now) / 1000) }
    );

    const remainingAttempts = MAX_ATTEMPTS - tfaData.attempts;
    throw new Error(`کد تایید اشتباه است. ${remainingAttempts} تلاش باقی مانده`);
  }

  // Find user and disable 2FA
  const foundUser = await user.findOne({
    filters: { _id: tfaData.user_id },
    projection: { _id: 1, mobile: 1, first_name: 1, last_name: 1 },
  });

  if (!foundUser) {
    throw new Error("کاربر یافت نشد");
  }

  // Disable 2FA in user settings
  await disable2FA(foundUser._id);

  // Clean up
  await myRedis.del(`2fa:${verificationId}`);
  await myRedis.del(`2fa:backup_codes:${foundUser._id}`);

  // Log security event
  await log2FAEvent("2fa_disabled", {
    user_id: foundUser._id,
    mobile: maskMobile(foundUser.mobile),
  });

  // Send confirmation SMS
  const confirmationMessage = `احراز هویت دو مرحله‌ای شما غیرفعال شد.
زمان: ${new Date().toLocaleString('fa-IR')}
اگر این تغییر توسط شما انجام نشده، فوراً با پشتیبانی تماس بگیرید.
مرکز معماری ایرانی`;

  smsService.sendSMS({
    to: foundUser.mobile,
    message: confirmationMessage,
    template_id: "2fa_disabled_confirmation",
  }).catch(error => {
    console.error("Failed to send 2FA disable confirmation:", error);
  });

  // Return response
  if (get) {
    return {
      user_id: foundUser._id,
      mobile: maskMobile(foundUser.mobile),
      two_factor_enabled: false,
      message: "احراز هویت دو مرحله‌ای غیرفعال شد",
    };
  }

  return { success: true, message: "احراز هویت دو مرحله‌ای غیرفعال شد" };
}

async function handle2FAVerify(verificationId: string, code: string, get: any) {
  if (!verificationId || !code) {
    throw new Error("شناسه تایید و کد الزامی است");
  }

  // Retrieve 2FA data
  const tfaDataStr = await myRedis.get(`2fa:${verificationId}`);
  if (!tfaDataStr) {
    throw new Error("کد تایید یافت نشد یا منقضی شده است");
  }

  const tfaData: TFAData = JSON.parse(tfaDataStr);
  const now = Date.now();

  // Check expiry
  if (now > tfaData.expires_at) {
    await myRedis.del(`2fa:${verificationId}`);
    throw new Error("کد تایید منقضی شده است");
  }

  // Check attempts
  if (tfaData.attempts >= MAX_ATTEMPTS) {
    await myRedis.del(`2fa:${verificationId}`);
    throw new Error("حداکثر تعداد تلاش رسیده است");
  }

  // Verify code
  if (code !== tfaData.code) {
    tfaData.attempts += 1;
    await myRedis.set(
      `2fa:${verificationId}`,
      JSON.stringify(tfaData),
      { ex: Math.floor((tfaData.expires_at - now) / 1000) }
    );

    const remainingAttempts = MAX_ATTEMPTS - tfaData.attempts;

    await log2FAEvent("verification_failed", {
      user_id: tfaData.user_id,
      attempts: tfaData.attempts,
      remaining: remainingAttempts,
    });

    throw new Error(`کد تایید اشتباه است. ${remainingAttempts} تلاش باقی مانده`);
  }

  // Code is correct - complete the action
  if (tfaData.action === "enable") {
    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Enable 2FA for user
    await enable2FA(tfaData.user_id, backupCodes);

    // Store backup codes
    await store2FABackupCodes(tfaData.user_id, backupCodes);

    // Log successful setup
    await log2FAEvent("2fa_enabled", {
      user_id: tfaData.user_id,
      mobile: maskMobile(tfaData.mobile),
    });

    // Clean up
    await myRedis.del(`2fa:${verificationId}`);

    // Return response
    if (get) {
      return {
        user_id: tfaData.user_id,
        mobile: maskMobile(tfaData.mobile),
        two_factor_enabled: true,
        backup_codes: backupCodes.join(','),
        setup_completed: true,
        message: "احراز هویت دو مرحله‌ای با موفقیت فعال شد",
      };
    }

    return { success: true, message: "احراز هویت دو مرحله‌ای فعال شد" };
  }

  // For other verification purposes
  await myRedis.del(`2fa:${verificationId}`);

  if (get) {
    return {
      user_id: tfaData.user_id,
      mobile: maskMobile(tfaData.mobile),
      verification_completed: true,
      message: "کد تایید با موفقیت تأیید شد",
    };
  }

  return { success: true, message: "کد تایید با موفقیت تأیید شد" };
}

// Helper functions

async function findUserForTFA(userId?: string, mobile?: string) {
  const filters: any = {};

  if (userId) {
    filters._id = userId;
  } else if (mobile) {
    filters.mobile = normalizeMobile(mobile);
  }

  return await user.findOne({
    filters,
    projection: {
      _id: 1,
      mobile: 1,
      first_name: 1,
      last_name: 1,
      national_number: 1
    },
  });
}

async function get2FAStatus(userId: string): Promise<{ enabled: boolean }> {
  // Check if user has 2FA enabled (stored in Redis for now)
  const tfaStatus = await myRedis.get(`user:2fa:${userId}`);
  return { enabled: tfaStatus === "enabled" };
}

async function enable2FA(userId: string, backupCodes: string[]): Promise<void> {
  // Enable 2FA for user
  await myRedis.set(`user:2fa:${userId}`, "enabled");

  // In a real implementation, you might update the user document
  // await user.updateOne({
  //   filters: { _id: userId },
  //   set: { two_factor_enabled: true }
  // });
}

async function disable2FA(userId: string): Promise<void> {
  // Disable 2FA for user
  await myRedis.del(`user:2fa:${userId}`);

  // In a real implementation, you might update the user document
  // await user.updateOne({
  //   filters: { _id: userId },
  //   set: { two_factor_enabled: false }
  // });
}

function generateSecure2FACode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomValue = array[0];

  let code = (randomValue % 900000 + 100000).toString();

  // Avoid weak patterns
  if (isWeakCode(code)) {
    return generateSecure2FACode();
  }

  return code;
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];

  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = array[0].toString(16).toUpperCase().substring(0, 8);
    codes.push(code);
  }

  return codes;
}

function isWeakCode(code: string): boolean {
  const isSequential = /^(?:123456|234567|345678|456789|567890|098765|987654|876543|765432|654321)$/.test(code);
  const isRepeated = /^(\d)\1{5}$/.test(code);
  const weakPatterns = ["000000", "111111", "123123", "456456", "789789"];
  const isCommon = weakPatterns.includes(code);

  return isSequential || isRepeated || isCommon;
}

function generateVerificationId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  const randomString = Array.from(randomBytes, byte => byte.toString(36)).join('');

  return `2fa_${timestamp}_${randomString}`;
}

function normalizeMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");

  if (digits.startsWith("98") && digits.length === 12) {
    return digits;
  } else if (digits.startsWith("0") && digits.length === 11) {
    return `98${digits.substring(1)}`;
  } else if (digits.length === 10 && digits.startsWith("9")) {
    return `98${digits}`;
  }

  return digits;
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

async function check2FARateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `2fa:rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount && parseInt(currentCount) >= TFA_RATE_LIMIT) {
    const ttl = await myRedis.ttl(rateLimitKey);
    const minutes = Math.ceil(ttl / 60);
    throw new Error(`حداکثر تعداد درخواست احراز هویت دو مرحله‌ای در ساعت گذشته رسیده است. ${minutes} دقیقه تا درخواست مجدد`);
  }
}

async function update2FARateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `2fa:rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount) {
    await myRedis.incr(rateLimitKey);
  } else {
    await myRedis.set(rateLimitKey, "1", { ex: RATE_LIMIT_WINDOW });
  }
}

async function store2FAData(verificationId: string, data: TFAData): Promise<void> {
  await myRedis.set(
    `2fa:${verificationId}`,
    JSON.stringify(data),
    { ex: CODE_EXPIRY }
  );
}

async function store2FABackupCodes(userId: string, codes: string[]): Promise<void> {
  await myRedis.set(
    `2fa:backup_codes:${userId}`,
    JSON.stringify(codes),
    { ex: 86400 * 365 } // Store for 1 year
  );
}

async function log2FAEvent(
  event: string,
  details: Record<string, any>
): Promise<void> {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
  };

  console.log("2FA Security Event:", JSON.stringify(logData));

  try {
    await myRedis.lpush(
      "2fa:security_events",
      JSON.stringify(logData)
    );
    await myRedis.ltrim("2fa:security_events", 0, 999);
  } catch (error) {
    console.error("Failed to log 2FA event:", error);
  }
}
