"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { smsApi } from "@/services/sms/smsApi";
import {
  ShieldCheckIcon,
  PhoneIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CogIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import {
  ShieldCheckIcon as ShieldCheckIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  LockClosedIcon as LockClosedIconSolid,
} from "@heroicons/react/24/solid";
import type {
  SMSVerificationRequest,
  SMSCodeVerifyRequest,
  SMS2FARequest,
} from "@/types";

interface TwoFactorSetupState {
  isEnabled: boolean;
  step:
    | "overview"
    | "phone_verification"
    | "code_verification"
    | "backup_codes"
    | "success"
    | "disable_confirm";
  phoneNumber: string;
  verificationCode: string;
  verificationId: string;
  backupCodes: string[];
  timeLeft: number;
  canResend: boolean;
  showBackupCodes: boolean;
  copiedCodes: boolean;
  isLoading: boolean;
  error: string;
  success: string;
  attempts: number;
}

interface TwoFactorSetupProps {
  onComplete?: (enabled: boolean) => void;
  onCancel?: () => void;
  className?: string;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  onComplete,
  onCancel,
  className = "",
}) => {
  const t = useTranslations("auth");
  const { user, isAuthenticated } = useAuth();

  const [state, setState] = useState<TwoFactorSetupState>({
    isEnabled: false,
    step: "overview",
    phoneNumber: user?.mobile || "",
    verificationCode: "",
    verificationId: "",
    backupCodes: [],
    timeLeft: 0,
    canResend: false,
    showBackupCodes: false,
    copiedCodes: false,
    isLoading: false,
    error: "",
    success: "",
    attempts: 0,
  });

  // Timer for resend countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.timeLeft > 0) {
      timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
          canResend: prev.timeLeft <= 1,
        }));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [state.timeLeft]);

  // Load current 2FA status
  useEffect(() => {
    if (user && isAuthenticated) {
      // Check if user has 2FA enabled
      // This would typically come from user profile API
      setState((prev) => ({
        ...prev,
        isEnabled: user.two_factor_enabled || false,
        phoneNumber: user.mobile || "",
      }));
    }
  }, [user, isAuthenticated]);

  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("98")) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "+$1 $2 $3 $4");
    } else if (digits.startsWith("09")) {
      return digits.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    } else if (digits.startsWith("9") && digits.length === 10) {
      const formatted = "09" + digits.substring(1);
      return formatted.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    return phone;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, "");
    const iranianMobilePattern = /^(\+?98|0)?9\d{9}$/;
    return iranianMobilePattern.test(digits);
  };

  const normalizePhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("98") && digits.length === 12) {
      return "+" + digits;
    } else if (digits.startsWith("09") && digits.length === 11) {
      return "+98" + digits.substring(1);
    } else if (digits.startsWith("9") && digits.length === 10) {
      return "+98" + digits;
    }
    return phone;
  };

  const handleEnable2FA = async () => {
    if (!validatePhoneNumber(state.phoneNumber)) {
      setState((prev) => ({
        ...prev,
        error: "شماره تلفن وارد شده صحیح نمی‌باشد",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: "",
      success: "",
    }));

    try {
      const normalizedPhone = normalizePhoneNumber(state.phoneNumber);

      const request: SMSVerificationRequest = {
        phone_number: normalizedPhone,
        purpose: "2fa",
        locale: "fa",
      };

      const response = await smsApi.sendVerificationCode(request);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          verificationId: response.data!.verification_id,
          timeLeft: response.data!.can_resend_after || 60,
          canResend: false,
          step: "code_verification",
          success: response.data!.message,
          attempts: 0,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || "خطا در ارسال کد تأیید",
        }));
      }
    } catch (error) {
      console.error("2FA setup error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "خطا در راه‌اندازی احراز هویت دو مرحله‌ای",
      }));
    }
  };

  const handleVerifyCode = async () => {
    if (!state.verificationCode.trim() || state.verificationCode.length !== 6) {
      setState((prev) => ({
        ...prev,
        error: "کد تأیید باید 6 رقم باشد",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: "",
      success: "",
    }));

    try {
      const request: SMSCodeVerifyRequest = {
        verification_id: state.verificationId,
        code: state.verificationCode,
      };

      const response = await smsApi.verifyCode(request);

      if (response.success && response.data) {
        // Enable 2FA
        const enable2FARequest: SMS2FARequest = {
          phone_number: normalizePhoneNumber(state.phoneNumber),
          action: "enable",
          verification_id: state.verificationId,
        };

        const enable2FAResponse = await smsApi.setup2FA(enable2FARequest);

        if (enable2FAResponse.success && enable2FAResponse.data) {
          const backupCodes =
            enable2FAResponse.data.backup_codes?.split(",") || [];

          setState((prev) => ({
            ...prev,
            isLoading: false,
            isEnabled: true,
            backupCodes,
            step: "backup_codes",
            success: enable2FAResponse.data!.message,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error:
              enable2FAResponse.error ||
              "خطا در فعال‌سازی احراز هویت دو مرحله‌ای",
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || "کد تأیید نامعتبر است",
          attempts: prev.attempts + 1,
        }));
      }
    } catch (error) {
      console.error("Code verification error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "خطا در تأیید کد",
        attempts: prev.attempts + 1,
      }));
    }
  };

  const handleDisable2FA = async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: "",
      success: "",
    }));

    try {
      const request: SMS2FARequest = {
        phone_number: normalizePhoneNumber(state.phoneNumber),
        action: "disable",
      };

      const response = await smsApi.setup2FA(request);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isEnabled: false,
          step: "overview",
          success: response.data.message,
        }));

        if (onComplete) {
          onComplete(false);
        }
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || "خطا در غیرفعال‌سازی احراز هویت دو مرحله‌ای",
        }));
      }
    } catch (error) {
      console.error("Disable 2FA error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "خطا در غیرفعال‌سازی احراز هویت دو مرحله‌ای",
      }));
    }
  };

  const handleCopyBackupCodes = () => {
    const codesText = state.backupCodes.join("\n");
    navigator.clipboard
      .writeText(codesText)
      .then(() => {
        setState((prev) => ({ ...prev, copiedCodes: true }));
        setTimeout(() => {
          setState((prev) => ({ ...prev, copiedCodes: false }));
        }, 2000);
      })
      .catch(() => {
        setState((prev) => ({ ...prev, error: "خطا در کپی کردن کدها" }));
      });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheckIconSolid className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            احراز هویت دو مرحله‌ای
          </h2>
          <p className="text-gray-600">
            امنیت حساب کاربری خود را با احراز هویت دو مرحله‌ای افزایش دهید
          </p>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 space-x-reverse">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{state.error}</span>
          </div>
        )}

        {/* Success Message */}
        {state.success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3 space-x-reverse">
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-green-700 text-sm">{state.success}</span>
          </div>
        )}

        {/* Overview Step */}
        {state.step === "overview" && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  {state.isEnabled ? (
                    <ShieldCheckIconSolid className="h-6 w-6 text-green-600" />
                  ) : (
                    <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">وضعیت فعلی</h3>
                    <p className="text-sm text-gray-600">
                      {state.isEnabled
                        ? "احراز هویت دو مرحله‌ای فعال است"
                        : "احراز هویت دو مرحله‌ای غیرفعال است"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    state.isEnabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {state.isEnabled ? "فعال" : "غیرفعال"}
                </span>
              </div>
            </div>

            {/* Phone Number */}
            {!state.isEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره تلفن همراه
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={state.phoneNumber}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setState((prev) => ({
                        ...prev,
                        phoneNumber: formatted,
                        error: "",
                      }));
                    }}
                    placeholder="09123456789"
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  کدهای تأیید به این شماره ارسال خواهد شد
                </p>
              </div>
            )}

            {/* Security Benefits */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                <LockClosedIconSolid className="h-5 w-5 ml-2" />
                مزایای احراز هویت دو مرحله‌ای
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <CheckCircleIconSolid className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                  محافظت بیشتر در برابر دسترسی غیرمجاز
                </li>
                <li className="flex items-center">
                  <CheckCircleIconSolid className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                  تأیید هویت در تراکنش‌های مهم
                </li>
                <li className="flex items-center">
                  <CheckCircleIconSolid className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                  اطلاع‌رسانی فوری در صورت ورود مشکوک
                </li>
                <li className="flex items-center">
                  <CheckCircleIconSolid className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                  کدهای پشتیبان برای دسترسی اضطراری
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 space-x-reverse">
              {!state.isEnabled ? (
                <button
                  onClick={handleEnable2FA}
                  disabled={state.isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state.isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                      در حال فعال‌سازی...
                    </div>
                  ) : (
                    "فعال‌سازی احراز هویت دو مرحله‌ای"
                  )}
                </button>
              ) : (
                <button
                  onClick={() =>
                    setState((prev) => ({ ...prev, step: "disable_confirm" }))
                  }
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  غیرفعال‌سازی احراز هویت دو مرحله‌ای
                </button>
              )}

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
              )}
            </div>
          </div>
        )}

        {/* Code Verification Step */}
        {state.step === "code_verification" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                تأیید شماره تلفن
              </h3>
              <p className="text-gray-600">
                کد تأیید ارسال شده به {state.phoneNumber} را وارد کنید
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کد تأیید
              </label>
              <div className="relative">
                <KeyIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={state.verificationCode}
                  onChange={(e) => {
                    const code = e.target.value
                      .replace(/\D/g, "")
                      .substring(0, 6);
                    setState((prev) => ({
                      ...prev,
                      verificationCode: code,
                      error: "",
                    }));
                  }}
                  placeholder="123456"
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg tracking-widest"
                  dir="ltr"
                  maxLength={6}
                />
              </div>
            </div>

            {/* Timer and Resend */}
            <div className="text-center">
              {state.timeLeft > 0 ? (
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 ml-1" />
                  <span>ارسال مجدد کد تا {formatTime(state.timeLeft)}</span>
                </div>
              ) : (
                <button
                  onClick={handleEnable2FA}
                  disabled={state.isLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={handleVerifyCode}
                disabled={
                  state.isLoading || state.verificationCode.length !== 6
                }
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state.isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    در حال تأیید...
                  </div>
                ) : (
                  "تأیید و فعال‌سازی"
                )}
              </button>

              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, step: "overview" }))
                }
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بازگشت
              </button>
            </div>
          </div>
        )}

        {/* Backup Codes Step */}
        {state.step === "backup_codes" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIconSolid className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                احراز هویت دو مرحله‌ای فعال شد
              </h3>
              <p className="text-gray-600">
                کدهای پشتیبان زیر را در جای امنی نگهداری کنید
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">نکات مهم:</p>
                  <ul className="space-y-1">
                    <li>• هر کد پشتیبان تنها یک بار قابل استفاده است</li>
                    <li>• این کدها را در جای امن نگهداری کنید</li>
                    <li>
                      • در صورت از دست دادن تلفن، از این کدها استفاده کنید
                    </li>
                    <li>• اگر کدها تمام شد، کدهای جدید درخواست کنید</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">کدهای پشتیبان</h4>
                  <button
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        showBackupCodes: !prev.showBackupCodes,
                      }))
                    }
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    {state.showBackupCodes ? (
                      <>
                        <EyeSlashIcon className="h-4 w-4 ml-1" />
                        مخفی کردن
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-4 w-4 ml-1" />
                        نمایش کدها
                      </>
                    )}
                  </button>
                </div>

                {state.showBackupCodes && (
                  <div className="space-y-2">
                    {state.backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded p-2 font-mono text-center"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {state.showBackupCodes && (
                <button
                  onClick={handleCopyBackupCodes}
                  className="absolute top-2 left-2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="کپی کردن کدها"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              )}

              {state.copiedCodes && (
                <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  کپی شد!
                </div>
              )}
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setState((prev) => ({ ...prev, step: "overview" }));
                  if (onComplete) {
                    onComplete(true);
                  }
                }}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                تکمیل راه‌اندازی
              </button>
            </div>
          </div>
        )}

        {/* Disable Confirmation */}
        {state.step === "disable_confirm" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                غیرفعال‌سازی احراز هویت دو مرحله‌ای
              </h3>
              <p className="text-gray-600">
                آیا مطمئن هستید که می‌خواهید احراز هویت دو مرحله‌ای را غیرفعال
                کنید؟
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-2">توجه!</p>
                  <p>
                    با غیرفعال کردن احراز هویت دو مرحله‌ای، امنیت حساب شما کاهش
                    می‌یابد. تمام کدهای پشتیبان نیز حذف خواهند شد.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={handleDisable2FA}
                disabled={state.isLoading}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state.isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    در حال غیرفعال‌سازی...
                  </div>
                ) : (
                  "بله، غیرفعال کن"
                )}
              </button>

              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, step: "overview" }))
                }
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        {/* Attempts Warning */}
        {state.attempts >= 2 && state.step === "code_verification" && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2 space-x-reverse">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">توجه!</p>
                <p>
                  شما {state.attempts} بار کد اشتباه وارد کرده‌اید. پس از 3 تلاش
                  ناموفق، باید مجدداً درخواست کد دهید.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
