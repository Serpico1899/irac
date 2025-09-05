import type {
  SMSVerificationRequest,
  SMSVerificationResponse,
  SMSCodeVerifyRequest,
  SMSCodeVerifyResponse,
  SMSPasswordResetRequest,
  SMSPasswordResetResponse,
  SMSGuestLoginRequest,
  SMSGuestLoginResponse,
  SMS2FARequest,
  SMS2FAResponse,
  SMSApiResponse,
  SMSVerificationStatus,
} from "@/types";

// Utility function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock SMS verification data for development
const mockVerificationCodes: Record<
  string,
  {
    code: string;
    expiresAt: Date;
    verified: boolean;
    attempts: number;
    phoneNumber: string;
    purpose: "login" | "register" | "password_reset" | "2fa";
    createdAt: Date;
  }
> = {};

// Mock user data for SMS authentication
const mockSMSUsers = [
  {
    id: "sms_user_1",
    phone: "+989123456789",
    name: "کاربر تست",
    email: "test@example.com",
    verified: true,
    last_login: new Date().toISOString(),
    registration_method: "sms",
  },
  {
    id: "sms_user_2",
    phone: "+989987654321",
    name: "مهمان سیستم",
    email: null,
    verified: false,
    last_login: null,
    registration_method: "guest_sms",
  },
];

// Generate random verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validate Iranian phone number
const validateIranianPhoneNumber = (phone: string): boolean => {
  const iranianPhoneRegex = /^(\+98|0)?9\d{9}$/;
  return iranianPhoneRegex.test(phone);
};

// Normalize phone number to international format
const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // Handle different formats
  if (digits.startsWith("98")) {
    return "+" + digits;
  } else if (digits.startsWith("09")) {
    return "+98" + digits.substring(1);
  } else if (digits.startsWith("9") && digits.length === 10) {
    return "+98" + digits;
  }

  return phone;
};

export const smsApi = {
  // Send SMS verification code
  async sendVerificationCode(
    request: SMSVerificationRequest,
  ): Promise<SMSApiResponse<SMSVerificationResponse>> {
    await delay(800);

    try {
      const normalizedPhone = normalizePhoneNumber(request.phone_number);

      // Validate phone number format
      if (!validateIranianPhoneNumber(normalizedPhone)) {
        return {
          success: false,
          error: "شماره تلفن وارد شده صحیح نمی‌باشد",
        };
      }

      // Check for rate limiting (max 3 SMS per 10 minutes)
      const recentCodes = Object.values(mockVerificationCodes).filter(
        (code) =>
          code.phoneNumber === normalizedPhone &&
          new Date().getTime() - code.createdAt.getTime() < 10 * 60 * 1000,
      );

      if (recentCodes.length >= 3) {
        return {
          success: false,
          error: "حداکثر تعداد ارسال کد تأیید در ۱۰ دقیقه گذشته رسیده است",
        };
      }

      // Generate verification code
      const verificationCode = generateVerificationCode();
      const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiry

      // Store verification code
      mockVerificationCodes[verificationId] = {
        code: verificationCode,
        expiresAt,
        verified: false,
        attempts: 0,
        phoneNumber: normalizedPhone,
        purpose: request.purpose || "login",
        createdAt: new Date(),
      };

      // Log for development (in production, this would be sent via SMS provider)
      console.log(`📱 SMS sent to ${normalizedPhone}: ${verificationCode}`);

      return {
        success: true,
        data: {
          verification_id: verificationId,
          phone_number: normalizedPhone,
          expires_in: 300, // 5 minutes in seconds
          message: "کد تأیید برای شما ارسال شد",
          can_resend_after: 60, // 1 minute
        },
      };
    } catch (error) {
      console.error("Error sending SMS verification:", error);
      return {
        success: false,
        error: "خطا در ارسال کد تأیید",
      };
    }
  },

  // Verify SMS code
  async verifyCode(
    request: SMSCodeVerifyRequest,
  ): Promise<SMSApiResponse<SMSCodeVerifyResponse>> {
    await delay(600);

    try {
      const verification = mockVerificationCodes[request.verification_id];

      if (!verification) {
        return {
          success: false,
          error: "کد تأیید یافت نشد",
        };
      }

      // Check if already verified
      if (verification.verified) {
        return {
          success: false,
          error: "این کد قبلاً استفاده شده است",
        };
      }

      // Check expiry
      if (new Date() > verification.expiresAt) {
        return {
          success: false,
          error: "کد تأیید منقضی شده است",
        };
      }

      // Check max attempts (3 attempts allowed)
      if (verification.attempts >= 3) {
        return {
          success: false,
          error: "حداکثر تعداد تلاش برای وارد کردن کد",
        };
      }

      // Increment attempts
      verification.attempts += 1;

      // Verify code
      if (verification.code !== request.code) {
        return {
          success: false,
          error: `کد تأیید اشتباه است. ${3 - verification.attempts} تلاش باقی مانده`,
        };
      }

      // Mark as verified
      verification.verified = true;

      // Check if user exists for login purposes
      let user = null;
      if (verification.purpose === "login" || verification.purpose === "2fa") {
        user = mockSMSUsers.find((u) => u.phone === verification.phoneNumber);
      }

      return {
        success: true,
        data: {
          verified: true,
          phone_number: verification.phoneNumber,
          purpose: verification.purpose,
          user_exists: !!user,
          user_id: user?.id || null,
          token: user ? `mock_token_${user.id}_${Date.now()}` : null,
          message: "کد تأیید با موفقیت تأیید شد",
        },
      };
    } catch (error) {
      console.error("Error verifying SMS code:", error);
      return {
        success: false,
        error: "خطا در تأیید کد",
      };
    }
  },

  // Password reset via SMS
  async resetPassword(
    request: SMSPasswordResetRequest,
  ): Promise<SMSApiResponse<SMSPasswordResetResponse>> {
    await delay(700);

    try {
      const normalizedPhone = normalizePhoneNumber(request.phone_number);

      // Find user by phone number
      const user = mockSMSUsers.find((u) => u.phone === normalizedPhone);

      if (!user) {
        return {
          success: false,
          error: "کاربری با این شماره تلفن یافت نشد",
        };
      }

      // Verify the code first
      const verification = mockVerificationCodes[request.verification_id];

      if (
        !verification ||
        !verification.verified ||
        verification.purpose !== "password_reset"
      ) {
        return {
          success: false,
          error: "کد تأیید نامعتبر یا منقضی شده است",
        };
      }

      // In real implementation, this would update the user's password
      console.log(`🔑 Password reset for user: ${user.id}`);

      return {
        success: true,
        data: {
          user_id: user.id,
          phone_number: normalizedPhone,
          reset_completed: true,
          message: "رمز عبور با موفقیت تغییر یافت",
        },
      };
    } catch (error) {
      console.error("Error resetting password:", error);
      return {
        success: false,
        error: "خطا در تغییر رمز عبور",
      };
    }
  },

  // Guest login with SMS
  async guestLogin(
    request: SMSGuestLoginRequest,
  ): Promise<SMSApiResponse<SMSGuestLoginResponse>> {
    await delay(800);

    try {
      const normalizedPhone = normalizePhoneNumber(request.phone_number);

      // Verify the code first
      const verification = mockVerificationCodes[request.verification_id];

      if (!verification || !verification.verified) {
        return {
          success: false,
          error: "کد تأیید نامعتبر است",
        };
      }

      // Check if user already exists
      let user = mockSMSUsers.find((u) => u.phone === normalizedPhone);

      if (!user) {
        // Create new guest user
        user = {
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          phone: normalizedPhone,
          name: request.name || "کاربر مهمان",
          email: request.email || null,
          verified: true,
          last_login: new Date().toISOString(),
          registration_method: "guest_sms",
        };
        mockSMSUsers.push(user);
      } else {
        // Update last login
        user.last_login = new Date().toISOString();
      }

      if (!user) {
        return {
          success: false,
          error: "خطا در ایجاد کاربر",
        };
      }

      const token = `guest_token_${user.id}_${Date.now()}`;
      const isNewUser = !mockSMSUsers.some(
        (u) => u.id === user.id && u.last_login !== user.last_login,
      );

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            verified: user.verified,
          },
          token,
          is_new_user: isNewUser,
          expires_in: 86400, // 24 hours
          message: "ورود موفق به سیستم",
        },
      };
    } catch (error) {
      console.error("Error guest login:", error);
      return {
        success: false,
        error: "خطا در ورود مهمان",
      };
    }
  },

  // Enable/Disable 2FA
  async setup2FA(
    request: SMS2FARequest,
  ): Promise<SMSApiResponse<SMS2FAResponse>> {
    await delay(600);

    try {
      const normalizedPhone = normalizePhoneNumber(request.phone_number);

      if (request.action === "enable") {
        // Verify the code first
        const verification = mockVerificationCodes[request.verification_id!];

        if (
          !verification ||
          !verification.verified ||
          verification.purpose !== "2fa"
        ) {
          return {
            success: false,
            error: "کد تأیید نامعتبر است",
          };
        }
      }

      // Find user
      const user = mockSMSUsers.find((u) => u.phone === normalizedPhone);

      if (!user) {
        return {
          success: false,
          error: "کاربر یافت نشد",
        };
      }

      // In real implementation, this would update user's 2FA settings
      console.log(`🔒 2FA ${request.action} for user: ${user.id}`);

      return {
        success: true,
        data: {
          user_id: user.id,
          phone_number: normalizedPhone,
          two_factor_enabled: request.action === "enable",
          backup_codes:
            request.action === "enable"
              ? ["ABC123", "DEF456", "GHI789", "JKL012", "MNO345"]
              : undefined,
          message:
            request.action === "enable"
              ? "احراز هویت دو مرحله‌ای فعال شد"
              : "احراز هویت دو مرحله‌ای غیرفعال شد",
        },
      };
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      return {
        success: false,
        error: "خطا در تنظیم احراز هویت دو مرحله‌ای",
      };
    }
  },

  // Get verification status
  async getVerificationStatus(
    verificationId: string,
  ): Promise<SMSApiResponse<SMSVerificationStatus>> {
    await delay(300);

    try {
      const verification = mockVerificationCodes[verificationId];

      if (!verification) {
        return {
          success: false,
          error: "کد تأیید یافت نشد",
        };
      }

      const now = new Date();
      const isExpired = now > verification.expiresAt;
      const timeLeft = isExpired
        ? 0
        : Math.floor((verification.expiresAt.getTime() - now.getTime()) / 1000);

      return {
        success: true,
        data: {
          verification_id: verificationId,
          phone_number: verification.phoneNumber,
          verified: verification.verified,
          expired: isExpired,
          attempts_remaining: Math.max(0, 3 - verification.attempts),
          time_left: timeLeft,
          can_resend: isExpired || verification.attempts >= 3,
          purpose: verification.purpose,
        },
      };
    } catch (error) {
      console.error("Error getting verification status:", error);
      return {
        success: false,
        error: "خطا در دریافت وضعیت تأیید",
      };
    }
  },

  // Resend verification code
  async resendCode(
    verificationId: string,
  ): Promise<SMSApiResponse<SMSVerificationResponse>> {
    await delay(500);

    try {
      const verification = mockVerificationCodes[verificationId];

      if (!verification) {
        return {
          success: false,
          error: "کد تأیید یافت نشد",
        };
      }

      // Check if can resend (expired or max attempts reached)
      const now = new Date();
      const canResend =
        now > verification.expiresAt || verification.attempts >= 3;

      if (!canResend) {
        const timeLeft = Math.floor(
          (verification.expiresAt.getTime() - now.getTime()) / 1000,
        );
        return {
          success: false,
          error: `${Math.floor(timeLeft / 60)} دقیقه و ${timeLeft % 60} ثانیه تا امکان ارسال مجدد`,
        };
      }

      // Generate new code
      const newCode = generateVerificationCode();
      const newExpiresAt = new Date();
      newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 5);

      // Update verification
      verification.code = newCode;
      verification.expiresAt = newExpiresAt;
      verification.attempts = 0;
      verification.verified = false;
      verification.createdAt = new Date();

      // Log for development
      console.log(`📱 SMS resent to ${verification.phoneNumber}: ${newCode}`);

      return {
        success: true,
        data: {
          verification_id: verificationId,
          phone_number: verification.phoneNumber,
          expires_in: 300,
          message: "کد تأیید مجدداً ارسال شد",
          can_resend_after: 60,
        },
      };
    } catch (error) {
      console.error("Error resending SMS code:", error);
      return {
        success: false,
        error: "خطا در ارسال مجدد کد",
      };
    }
  },
};
