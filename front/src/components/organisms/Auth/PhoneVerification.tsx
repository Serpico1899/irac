"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { smsApi } from "@/services/sms/smsApi";
import {
  PhoneIcon,
  KeyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  PhoneIcon as PhoneIconSolid,
} from "@heroicons/react/24/solid";
import type {
  SMSVerificationRequest,
  SMSCodeVerifyRequest,
} from "@/types";

interface PhoneVerificationState {
  step: "phone_input" | "code_verification" | "success";
  phoneNumber: string;
  verificationCode: string;
  verificationId: string;
  timeLeft: number;
  canResend: boolean;
  isLoading: boolean;
  error: string;
  success: string;
  attempts: number;
}

interface PhoneVerificationProps {
  onVerificationComplete?: (phoneNumber: string, verificationId: string) => void;
  onCancel?: () => void;
  initialPhoneNumber?: string;
  purpose?: "login" | "register" | "password_reset" | "2fa";
  showTitle?: boolean;
  className?: string;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerificationComplete,
  onCancel,
  initialPhoneNumber = "",
  purpose = "register",
  showTitle = true,
  className = "",
}) => {
  const t = useTranslations("auth");
  const { user } = useAuth();

  const [state, setState] = useState<PhoneVerificationState>({
    step: "phone_input",
    phoneNumber: initialPhoneNumber,
    verificationCode: "",
    verificationId: "",
    timeLeft: 0,
    canResend: false,
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
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
          canResend: prev.timeLeft <= 1,
        }));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [state.timeLeft]);

  const formatPhoneNumber = (phone: string): string => {
    // Remove non-digits
    const digits = phone.replace(/\D/g, "");

    // Format as Iranian mobile number
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

  const handleSendVerification = async () => {
    if (!state.phoneNumber.trim()) {
      setState(prev => ({
        ...prev,
        error: "لطفاً شماره تلفن خود را وارد کنید",
      }));
      return;
    }

    if (!validatePhoneNumber(state.phoneNumber)) {
      setState(prev => ({
        ...prev,
        error: "شماره تلفن وارد شده صحیح نمی‌باشد",
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: "",
      success: "",
    }));

    try {
      const normalizedPhone = normalizePhoneNumber(state.phoneNumber);

      const request: SMSVerificationRequest = {
        phone_number: normalizedPhone,
        purpose,
        locale: "fa",
      };

      const response = await smsApi.sendVerificationCode(request);

      if (response.success && response.data) {
        setState(prev => ({
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
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || "خطا در ارسال کد تأیید",
        }));
      }
    } catch (error) {
      console.error("SMS verification error:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "خطا در ارسال کد تأیید",
      }));
    }
  };

  const handleVerifyCode = async () => {
    if (!state.verificationCode.trim()) {
      setState(prev => ({
        ...prev,
        error: "لطفاً کد تأیید را وارد کنید",
      }));
      return;
    }

    if (state.verificationCode.length !== 6) {
      setState(prev => ({
        ...prev,
        error: "کد تأیید باید 6 رقم باشد",
      }));
      return;
    }

    setState(prev => ({
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
        setState(prev => ({
          ...prev,
          isLoading: false,
          step: "success",
          success: response.data!.message,
        }));

        // Call completion callback
        if (onVerificationComplete) {
          onVerificationComplete(
            normalizePhoneNumber(state.phoneNumber),
            state.verificationId
          );
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || "کد تأیید نامعتبر است",
          attempts: prev.attempts + 1,
        }));
      }
    } catch (error) {
      console.error("Code verification error:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "خطا در تأیید کد",
        attempts: prev.attempts + 1,
      }));
    }
  };

  const handleResendCode = async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: "",
      success: "",
    }));

    try {
      const response = await smsApi.resendCode(state.verificationId);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          timeLeft: response.data!.can_resend_after || 60,
          canResend: false,
          success: response.data!.message,
          verificationCode: "",
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || "خطا در ارسال مجدد کد",
        }));
      }
    } catch (error) {
      console.error("Resend code error:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "خطا در ارسال مجدد کد",
      }));
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getStepIcon = (step: string, isActive: boolean, isCompleted: boolean) => {
    const iconClass = `h-6 w-6 ${
      isCompleted
        ? "text-green-600"
        : isActive
        ? "text-blue-600"
        : "text-gray-400"
    }`;

    switch (step) {
      case "phone_input":
        return isCompleted ? (
          <CheckCircleIconSolid className={iconClass} />
        ) : (
          <PhoneIcon className={iconClass} />
        );
      case "code_verification":
        return isCompleted ? (
          <CheckCircleIconSolid className={iconClass} />
        ) : (
          <KeyIcon className={iconClass} />
        );
      case "success":
        return <CheckCircleIconSolid className={iconClass} />;
      default:
        return <PhoneIcon className={iconClass} />;
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            تأیید شماره تلفن
          </h2>
          <p className="text-gray-600">
            برای تکمیل فرآیند، شماره تلفن خود را تأیید کنید
          </p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Phone Input Step */}
          <div className="flex flex-col items-center">
            {getStepIcon(
              "phone_input",
              state.step === "phone_input",
              ["code_verification", "success"].includes(state.step)
            )}
            <span className="text-xs mt-1 text-gray-600">شماره تلفن</span>
          </div>

          <ArrowLeftIcon className="h-4 w-4 text-gray-400 mx-2" />

          {/* Code Verification Step */}
          <div className="flex flex-col items-center">
            {getStepIcon(
              "code_verification",
              state.step === "code_verification",
              state.step === "success"
            )}
            <span className="text-xs mt-1 text-gray-600">کد تأیید</span>
          </div>

          <ArrowLeftIcon className="h-4 w-4 text-gray-400 mx-2" />

          {/* Success Step */}
          <div className="flex flex-col items-center">
            {getStepIcon("success", state.step === "success", false)}
            <span className="text-xs mt-1 text-gray-600">تأیید</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 space-x-reverse">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{state.error}</span>
        </div>
      )}

      {/* Success Message */}
      {state.success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2 space-x-reverse">
          <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <span className="text-green-700 text-sm">{state.success}</span>
        </div>
      )}

      {/* Phone Input Step */}
      {state.step === "phone_input" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              شماره تلفن همراه
            </label>
            <div className="relative">
              <PhoneIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={state.phoneNumber}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setState(prev => ({
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
              کد تأیید به این شماره ارسال خواهد شد
            </p>
          </div>

          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={handleSendVerification}
              disabled={state.isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                  در حال ارسال...
                </div>
              ) : (
                "ارسال کد تأیید"
              )}
            </button>

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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              کد تأیید
            </label>
            <div className="relative">
              <KeyIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={state.verificationCode}
                onChange={(e) => {
                  const code = e.target.value.replace(/\D/g, "").substring(0, 6);
                  setState(prev => ({
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
            <p className="text-xs text-gray-500 mt-1">
              کد 6 رقمی ارسال شده به {state.phoneNumber} را وارد کنید
            </p>
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
                onClick={handleResendCode}
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
              disabled={state.isLoading || state.verificationCode.length !== 6}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                  در حال تأیید...
                </div>
              ) : (
                "تأیید کد"
              )}
            </button>

            <button
              onClick={() => setState(prev => ({ ...prev, step: "phone_input" }))}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              بازگشت
            </button>
          </div>
        </div>
      )}

      {/* Success Step */}
      {state.step === "success" && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleIconSolid className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              شماره تلفن تأیید شد
            </h3>
            <p className="text-gray-600 mt-1">
              شماره {state.phoneNumber} با موفقیت تأیید شد
            </p>
          </div>
        </div>
      )}

      {/* Attempts Warning */}
      {state.attempts >= 2 && state.step !== "success" && (
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
  );
};

export default PhoneVerification;
