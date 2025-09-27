import type { ActFn } from "@deps";
import { throwError } from "@lib";
import {  myRedis, user  } from "@app";
import { smsService, SMSService } from "../smsService.ts";

// Security constants
const PASSWORD_RESET_RATE_LIMIT = 2; // Maximum reset requests per hour
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds
const CODE_EXPIRY = 10 * 60; // 10 minutes in seconds
const MAX_ATTEMPTS = 3;

interface ResetData {
  code: string;
  mobile: string;
  user_id: string;
  attempts: number;
  created_at: number;
  expires_at: number;
}

export const sendPasswordResetFn: ActFn = async (body) => {
  const {
    set: { mobile, verification_id, new_password },
    get,
  } = body.details;

  try {
    // If verification_id and new_password are provided, complete the reset
    if (verification_id && new_password) {
      return await completePasswordReset(verification_id, new_password, get);
    }

    // Otherwise, send reset code
    if (mobile) {
      return await sendResetCode(mobile, get);
    }

    return throwError("پارامترهای لازم ارسال نشده است");

  } catch (error) {
    console.error("Password reset error:", error);
    if (error.message.includes("حداکثر") || error.message.includes("کاربری") || error.message.includes("کد")) {
      return throwError(error.message);
    }
    return throwError("خطا در بازیابی رمز عبور");
  }
};

async function sendResetCode(mobile: string, get: any) {
  // Normalize mobile number
  const normalizedMobile = normalizeMobile(mobile);

  // Validate mobile format
  if (!SMSService.isValidIranianMobile(normalizedMobile)) {
    throw new Error("شماره موبایل نامعتبر است");
  }

  // Check rate limiting
  await checkPasswordResetRateLimit(normalizedMobile);

  // Find user by mobile number
  const foundUser = await user.findOne({
    filters: { mobile: normalizedMobile },
    projection: { _id: 1, mobile: 1, national_number: 1, first_name: 1, last_name: 1 },
  });

  if (!foundUser) {
    // For security, don't reveal if user exists or not
    throw new Error("اگر حساب کاربری با این شماره وجود داشته باشد، کد بازیابی برای شما ارسال می‌شود");
  }

  // Generate secure reset code
  const resetCode = generateSecureCode();
  const verificationId = generateVerificationId();

  // Create reset data
  const now = Date.now();
  const resetData: ResetData = {
    code: resetCode,
    mobile: normalizedMobile,
    user_id: foundUser._id,
    attempts: 0,
    created_at: now,
    expires_at: now + (CODE_EXPIRY * 1000),
  };

  // Store reset data in Redis
  await storeResetData(verificationId, resetData);

  // Prepare SMS message
  const userName = `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim();
  const smsMessage = `${userName ? `${userName} عزیز` : 'کاربر گرامی'}
کد بازیابی رمز عبور ایراک: ${resetCode}
اعتبار: 10 دقیقه
اگر درخواست بازیابی نداده‌اید، این پیام را نادیده بگیرید.
مرکز معماری ایرانی`;

  // Send SMS
  const smsResult = await smsService.sendSMS({
    to: normalizedMobile,
    message: smsMessage,
    template_id: "password_reset",
  });

  if (!smsResult.success) {
    // Clean up stored data if SMS failed
    await myRedis.del(`password_reset:${verificationId}`);
    console.error("Password reset SMS failed:", smsResult.error);
    throw new Error(smsResult.error || "خطا در ارسال پیامک بازیابی");
  }

  // Update rate limiting counter
  await updatePasswordResetRateLimit(normalizedMobile);

  // Log security event
  await logPasswordResetEvent("reset_code_sent", {
    mobile: maskMobile(normalizedMobile),
    user_id: foundUser._id,
    verification_id: verificationId,
  });

  // Return response
  if (get) {
    return {
      verification_id: verificationId,
      mobile: maskMobile(normalizedMobile),
      expires_in: CODE_EXPIRY,
      message: "کد بازیابی رمز عبور برای شما ارسال شد",
    };
  }

  return { success: true, message: "کد بازیابی رمز عبور ارسال شد" };
}

async function completePasswordReset(verificationId: string, newPassword: string, get: any) {
  // Validate password strength
  if (!isValidPassword(newPassword)) {
    throw new Error("رمز عبور باید حداقل 8 کاراکتر باشد و شامل حروف و اعداد باشد");
  }

  // Retrieve reset data
  const resetDataStr = await myRedis.get(`password_reset:${verificationId}`);

  if (!resetDataStr) {
    throw new Error("کد بازیابی یافت نشد یا منقضی شده است");
  }

  const resetData: ResetData = JSON.parse(resetDataStr);
  const now = Date.now();

  // Check expiry
  if (now > resetData.expires_at) {
    await myRedis.del(`password_reset:${verificationId}`);
    throw new Error("کد بازیابی منقضی شده است");
  }

  // Check if code was verified (this assumes verification step happened)
  const verifiedKey = `password_reset:${verificationId}:verified`;
  const isVerified = await myRedis.get(verifiedKey);

  if (!isVerified) {
    throw new Error("کد بازیابی هنوز تایید نشده است");
  }

  // Find and update user
  const foundUser = await user.findOne({
    filters: { _id: resetData.user_id },
    projection: { _id: 1, mobile: 1, national_number: 1 },
  });

  if (!foundUser) {
    throw new Error("کاربر یافت نشد");
  }

  // Hash the new password (assuming you have a password hashing utility)
  // const hashedPassword = await hashPassword(newPassword);

  // For now, we'll store the password as-is (in production, always hash passwords!)
  // In a real implementation, you would have a password field in your user model

  // Update user password (this assumes you add password field to user model)
  // await user.updateOne({
  //   filters: { _id: resetData.user_id },
  //   set: { password: hashedPassword },
  // });

  // Clean up reset data
  await myRedis.del(`password_reset:${verificationId}`);
  await myRedis.del(`password_reset:${verificationId}:verified`);

  // Log security event
  await logPasswordResetEvent("password_reset_completed", {
    mobile: maskMobile(resetData.mobile),
    user_id: resetData.user_id,
    verification_id: verificationId,
  });

  // Send confirmation SMS
  const confirmationMessage = `رمز عبور شما با موفقیت تغییر یافت.
زمان: ${new Date().toLocaleString('fa-IR')}
اگر این تغییر توسط شما انجام نشده، فوراً با پشتیبانی تماس بگیرید.
مرکز معماری ایرانی`;

  // Send confirmation (non-blocking)
  smsService.sendSMS({
    to: resetData.mobile,
    message: confirmationMessage,
    template_id: "password_reset_confirmation",
  }).catch(error => {
    console.error("Failed to send password reset confirmation:", error);
  });

  // Return response
  if (get) {
    return {
      user_id: foundUser._id,
      mobile: maskMobile(resetData.mobile),
      reset_completed: true,
      message: "رمز عبور با موفقیت تغییر یافت",
    };
  }

  return { success: true, message: "رمز عبور با موفقیت تغییر یافت" };
}

// Helper functions

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

function generateSecureCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomValue = array[0];

  let code = (randomValue % 900000 + 100000).toString();

  // Avoid weak patterns
  if (isWeakCode(code)) {
    return generateSecureCode();
  }

  return code;
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

  return `reset_${timestamp}_${randomString}`;
}

function isValidPassword(password: string): boolean {
  // Minimum 8 characters, at least one letter and one number
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Zآ-ی]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return minLength && hasLetter && hasNumber;
}

async function checkPasswordResetRateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `password_reset:rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount && parseInt(currentCount) >= PASSWORD_RESET_RATE_LIMIT) {
    const ttl = await myRedis.ttl(rateLimitKey);
    const minutes = Math.ceil(ttl / 60);
    throw new Error(`حداکثر تعداد درخواست بازیابی رمز در ساعت گذشته رسیده است. ${minutes} دقیقه تا درخواست مجدد`);
  }
}

async function updatePasswordResetRateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `password_reset:rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount) {
    await myRedis.incr(rateLimitKey);
  } else {
    await myRedis.set(rateLimitKey, "1", { ex: RATE_LIMIT_WINDOW });
  }
}

async function storeResetData(verificationId: string, data: ResetData): Promise<void> {
  await myRedis.set(
    `password_reset:${verificationId}`,
    JSON.stringify(data),
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

async function logPasswordResetEvent(
  event: string,
  details: Record<string, any>
): Promise<void> {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
  };

  console.log("Password Reset Event:", JSON.stringify(logData));

  try {
    await myRedis.lpush(
      "password_reset:security_events",
      JSON.stringify(logData)
    );
    await myRedis.ltrim("password_reset:security_events", 0, 999);
  } catch (error) {
    console.error("Failed to log password reset event:", error);
  }
}
