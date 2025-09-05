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
} from "@heroicons/react/24/outline";
import {
  ShieldCheckIcon as ShieldCheckIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from "@heroicons/react/24/solid";
import type {
  SMS2FARequest,
  SMSVerificationRequest,
  SMSCodeVerifyRequest,
} from "@/types";

interface SMS2FASettingsState {
  isEnabled: boolean;
  phoneNumber: string;
  step:
    | "settings"
    | "phone_verification"
    | "enable_success"
    | "disable_confirm";
  verificationId: string;
  verificationCode: string;
  backupCodes: string[];
  timeLeft: number;
  canResend: boolean;
  isLoading: boolean;
  error: string;
  success: string;
  showBackupCodes: boolean;
}

const SMS2FASettings: React.FC = () => {
  const t = useTranslations("auth");
  const { user, isAuthenticated } = useAuth();

  const [state, setState] = useState<SMS2FASettingsState>({
    isEnabled: false, // In real app, get from user profile
    phoneNumber: user?.phone || "",
    step: "settings",
    verificationId: "",
    verificationCode: "",
    backupCodes: [],
    timeLeft: 0,
    canResend: false,
    isLoading: false,
    error: "",
    success: "",
    showBackupCodes: false,
  });

  const resendTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, []);

  // Start countdown timer for resend
  const startCountdown = (seconds: number) => {
    setState((prev) => ({ ...prev, timeLeft: seconds, canResend: false }));

    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
    }

    resendTimerRef.current = setInterval(() => {
      setState((prev) => {
        const newTimeLeft = prev.timeLeft - 1;
        if (newTimeLeft <= 0) {
          if (resendTimerRef.current) {
            clearInterval(resendTimerRef.current);
          }
          return { ...prev, timeLeft: 0, canResend: true };
        }
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/(\+98|0)(\d{3})(\d{3})(\d{4})/, "$2 $3 $4");
  };

  // Send verification code
  const sendVerificationCode = async () => {
    if (!state.phoneNumber) {
      setState((prev) => ({ ...prev, error: "شماره تلفن را وارد کنید" }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: "", success: "" }));

    try {
      const request: SMSVerificationRequest = {
        phone_number: state.phoneNumber,
        purpose: "2fa",
      };

      const response = await smsApi.sendVerificationCode(request);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          verificationId: response.data!.verification_id,
          step: "phone_verification",
          success: "کد تأیید برای شما ارسال شد",
        }));

        startCountdown(60); // 1 minute countdown
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "خطا در ارسال کد تأیید",
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "خطا در اتصال به سرور",
      }));
      console.error("Error sending verification code:", err);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Verify code and enable/disable 2FA
  const verifyAndToggle2FA = async () => {
    if (!state.verificationCode || state.verificationCode.length !== 6) {
      setState((prev) => ({ ...prev, error: "کد 6 رقمی را وارد کنید" }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      // First verify the SMS code
      const verifyRequest: SMSCodeVerifyRequest = {
        verification_id: state.verificationId,
        code: state.verificationCode,
      };

      const verifyResponse = await smsApi.verifyCode(verifyRequest);

      if (!verifyResponse.success) {
        setState((prev) => ({
          ...prev,
          error: verifyResponse.error || "کد تأیید نادرست است",
        }));
        return;
      }

      // Then enable/disable 2FA
      const twoFARequest: SMS2FARequest = {
        phone_number: state.phoneNumber,
        action: state.isEnabled ? "disable" : "enable",
        verification_id: state.verificationId,
      };

      const twoFAResponse = await smsApi.setup2FA(twoFARequest);

      if (twoFAResponse.success && twoFAResponse.data) {
        const newEnabledState = twoFAResponse.data.two_factor_enabled;

        setState((prev) => ({
          ...prev,
          isEnabled: newEnabledState,
          backupCodes: twoFAResponse.data!.backup_codes || [],
          step: newEnabledState ? "enable_success" : "settings",
          success: twoFAResponse.data!.message,
          verificationCode: "",
          verificationId: "",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: twoFAResponse.error || "خطا در تنظیم احراز هویت دو مرحله‌ای",
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "خطا در اتصال به سرور",
      }));
      console.error("Error toggling 2FA:", err);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = async () => {
    try {
      const codesText = state.backupCodes.join("\n");
      await navigator.clipboard.writeText(codesText);
      setState((prev) => ({ ...prev, success: "کدهای پشتیبان کپی شدند" }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: "خطا در کپی کردن" }));
    }
  };

  // Handle input changes
  const handlePhoneChange = (value: string) => {
    // Allow only digits and common formats
    const cleaned = value.replace(/[^\d+]/g, "");
    setState((prev) => ({ ...prev, phoneNumber: cleaned, error: "" }));
  };

  const handleCodeChange = (value: string) => {
    // Allow only 6 digits
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setState((prev) => ({ ...prev, verificationCode: cleaned, error: "" }));
  };

  // Reset to settings view
  const resetToSettings = () => {
    setState((prev) => ({
      ...prev,
      step: "settings",
      verificationId: "",
      verificationCode: "",
      error: "",
      success: "",
      timeLeft: 0,
      canResend: false,
    }));
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">برای مشاهده این بخش وارد شوید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheckIconSolid className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          احراز هویت دو مرحله‌ای
        </h2>
        <p className="text-gray-600">
          امنیت حساب خود را با احراز هویت پیامکی افزایش دهید
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Settings View */}
        {state.step === "settings" && (
          <div className="p-6 space-y-6">
            {/* Current Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {state.isEnabled ? (
                  <CheckCircleIconSolid className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {state.isEnabled ? "فعال" : "غیرفعال"}
                  </p>
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

            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شماره تلفن همراه
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={state.phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="09123456789"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dir="ltr"
                />
              </div>
              {state.phoneNumber && (
                <p className="text-sm text-gray-600 mt-1">
                  فرمت: {formatPhoneNumber(state.phoneNumber)}
                </p>
              )}
            </div>

            {/* Current Phone (if 2FA is enabled) */}
            {state.isEnabled && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    شماره فعلی احراز هویت
                  </span>
                </div>
                <p className="text-blue-800 font-mono">
                  {formatPhoneNumber(state.phoneNumber)}
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={sendVerificationCode}
              disabled={state.isLoading || !state.phoneNumber}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                state.isEnabled
                  ? "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
              } disabled:cursor-not-allowed`}
            >
              {state.isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShieldCheckIcon className="h-5 w-5" />
              )}
              {state.isEnabled ? "غیرفعال کردن" : "فعال کردن"} احراز هویت دو
              مرحله‌ای
            </button>
          </div>
        )}

        {/* Phone Verification View */}
        {state.step === "phone_verification" && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <PhoneIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                تأیید شماره تلفن
              </h3>
              <p className="text-gray-600 text-sm">
                کد 6 رقمی ارسال شده به شماره{" "}
                <span className="font-medium" dir="ltr">
                  {formatPhoneNumber(state.phoneNumber)}
                </span>{" "}
                را وارد کنید
              </p>
            </div>

            {/* Verification Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کد تأیید
              </label>
              <input
                type="text"
                value={state.verificationCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                dir="ltr"
              />
            </div>

            {/* Countdown and Resend */}
            <div className="text-center">
              {state.timeLeft > 0 ? (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-sm">
                    ارسال مجدد در {state.timeLeft} ثانیه
                  </span>
                </div>
              ) : (
                <button
                  onClick={sendVerificationCode}
                  disabled={state.isLoading}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={verifyAndToggle2FA}
                disabled={
                  state.isLoading || state.verificationCode.length !== 6
                }
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {state.isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircleIcon className="h-5 w-5" />
                )}
                تأیید و ادامه
              </button>

              <button
                onClick={resetToSettings}
                className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
              >
                بازگشت
              </button>
            </div>
          </div>
        )}

        {/* Enable Success View */}
        {state.step === "enable_success" && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIconSolid className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                احراز هویت دو مرحله‌ای فعال شد!
              </h3>
              <p className="text-gray-600 text-sm">
                حساب شما اکنون با احراز هویت پیامکی محافظت می‌شود
              </p>
            </div>

            {/* Backup Codes */}
            {state.backupCodes.length > 0 && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <KeyIcon className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-900">
                      کدهای پشتیبان
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        showBackupCodes: !prev.showBackupCodes,
                      }))
                    }
                    className="text-orange-700 hover:text-orange-800"
                  >
                    {state.showBackupCodes ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="text-sm text-orange-800 mb-3">
                  این کدها را در جای امنی نگهداری کنید. در صورت عدم دسترسی به
                  تلفن، می‌توانید از آن‌ها استفاده کنید.
                </p>

                {state.showBackupCodes && (
                  <>
                    <div className="bg-white rounded border p-3 font-mono text-sm space-y-1">
                      {state.backupCodes.map((code, index) => (
                        <div key={index} className="text-gray-900">
                          {code}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={copyBackupCodes}
                      className="w-full mt-3 flex items-center justify-center gap-2 text-orange-700 hover:text-orange-800 py-2 text-sm"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      کپی کردن همه کدها
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              onClick={resetToSettings}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              بازگشت به تنظیمات
            </button>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{state.error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {state.success && state.step !== "enable_success" && (
          <div className="mx-6 mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 text-sm">{state.success}</p>
            </div>
          </div>
        )}
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                چرا احراز هویت دو مرحله‌ای؟
              </h4>
              <p className="text-sm text-blue-800">
                حتی اگر رمز عبور شما در اختیار دیگران قرار گیرد، بدون دسترسی به
                تلفن شما نمی‌توانند وارد حساب شوند.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <PhoneIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">
                چگونه کار می‌کند؟
              </h4>
              <p className="text-sm text-green-800">
                پس از ورود با رمز عبور، کدی به تلفن همراه شما ارسال می‌شود که
                باید آن را وارد کنید.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMS2FASettings;
