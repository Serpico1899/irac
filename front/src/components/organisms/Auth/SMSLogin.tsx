"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { smsApi } from "@/services/sms/smsApi";
import {
  PhoneIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import type {
  SMSVerificationRequest,
  SMSCodeVerifyRequest,
  SMSGuestLoginRequest,
} from "@/types";

interface SMSLoginProps {
  purpose?: "login" | "register" | "password_reset";
  onSuccess?: (token: string, userData: any) => void;
  onCancel?: () => void;
  redirectPath?: string;
}

interface SMSLoginState {
  step: "phone" | "verification" | "guest_info" | "success";
  phoneNumber: string;
  verificationCode: string;
  verificationId: string;
  timeLeft: number;
  canResend: boolean;
  guestName: string;
  guestEmail: string;
  isLoading: boolean;
  error: string;
  success: string;
}

const SMSLogin: React.FC<SMSLoginProps> = ({
  purpose = "login",
  onSuccess,
  onCancel,
  redirectPath = "/user/dashboard",
}) => {
  const t = useTranslations("auth");
  const router = useRouter();
  const { login } = useAuth();

  const [state, setState] = useState<SMSLoginState>({
    step: "phone",
    phoneNumber: "",
    verificationCode: "",
    verificationId: "",
    timeLeft: 0,
    canResend: false,
    guestName: "",
    guestEmail: "",
    isLoading: false,
    error: "",
    success: "",
  });

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const codeInputRefs = useRef<HTMLInputElement[]>([]);
  const resendTimerRef = useRef<NodeJS.Timeout>();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, []);

  // Start countdown timer
  const startCountdown = (seconds: number) => {
    setState(prev => ({ ...prev, timeLeft: seconds, canResend: false }));

    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
    }

    resendTimerRef.current = setInterval(() => {
      setState(prev => {
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
  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("09")) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    return phone;
  };

  // Validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
    const iranianPhoneRegex = /^(\+98|0)?9\d{9}$/;
    return iranianPhoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Handle phone number input
  const handlePhoneNumberChange = (value: string) => {
    // Allow only digits, +, and spaces
    const cleaned = value.replace(/[^\d+\s]/g, "");
    setState(prev => ({ ...prev, phoneNumber: cleaned, error: "" }));
  };

  // Send SMS verification code
  const sendVerificationCode = async () => {
    if (!validatePhoneNumber(state.phoneNumber)) {
      setState(prev => ({
        ...prev,
        error: "لطفاً شماره تلفن صحیح وارد کنید",
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: "" }));

    try {
      const request: SMSVerificationRequest = {
        phone_number: state.phoneNumber.replace(/\s/g, ""),
        purpose,
      };

      const response = await smsApi.sendVerificationCode(request);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          step: "verification",
          verificationId: response.data!.verification_id,
          success: response.data!.message,
          isLoading: false,
        }));
        startCountdown(response.data.can_resend_after);
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || "خطا در ارسال کد تأیید",
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "خطا در ارسال کد تأیید",
        isLoading: false,
      }));
    }
  };

  // Handle verification code input
  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = state.verificationCode.split("");
    newCode[index] = value;
    const updatedCode = newCode.join("");

    setState(prev => ({ ...prev, verificationCode: updatedCode, error: "" }));

    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (updatedCode.length === 6) {
      verifyCode(updatedCode);
    }
  };

  // Handle backspace in code input
  const handleCodeKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !state.verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify SMS code
  const verifyCode = async (code?: string) => {
    const codeToVerify = code || state.verificationCode;

    if (codeToVerify.length !== 6) {
      setState(prev => ({ ...prev, error: "لطفاً کد ۶ رقمی را وارد کنید" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: "" }));

    try {
      const request: SMSCodeVerifyRequest = {
        verification_id: state.verificationId,
        code: codeToVerify,
      };

      const response = await smsApi.verifyCode(request);

      if (response.success && response.data) {
        if (response.data.user_exists && response.data.token) {
          // Existing user login
          login(response.data.token, "Normal", response.data.phone_number, {
            id: response.data.user_id!,
            name: "کاربر",
            email: response.data.phone_number,
            nationalNumber: response.data.phone_number,
          });

          setState(prev => ({
            ...prev,
            step: "success",
            success: response.data!.message,
            isLoading: false,
          }));

          if (onSuccess) {
            onSuccess(response.data.token, response.data);
          } else {
            setTimeout(() => router.push(redirectPath), 1500);
          }
        } else {
          // New user - show guest info form
          setState(prev => ({
            ...prev,
            step: "guest_info",
            isLoading: false,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || "کد تأیید اشتباه است",
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "خطا در تأیید کد",
        isLoading: false,
      }));
    }
  };

  // Complete guest login
  const completeGuestLogin = async () => {
    if (!state.guestName.trim()) {
      setState(prev => ({ ...prev, error: "لطفاً نام خود را وارد کنید" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: "" }));

    try {
      const request: SMSGuestLoginRequest = {
        phone_number: state.phoneNumber.replace(/\s/g, ""),
        verification_id: state.verificationId,
        name: state.guestName.trim(),
        email: state.guestEmail.trim() || undefined,
      };

      const response = await smsApi.guestLogin(request);

      if (response.success && response.data) {
        login(response.data.token, "Normal", response.data.user.phone, {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email || response.data.user.phone,
          nationalNumber: response.data.user.phone,
        });

        setState(prev => ({
          ...prev,
          step: "success",
          success: response.data!.message,
          isLoading: false,
        }));

        if (onSuccess) {
          onSuccess(response.data.token, response.data);
        } else {
          setTimeout(() => router.push(redirectPath), 1500);
        }
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || "خطا در ورود مهمان",
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "خطا در ورود مهمان",
        isLoading: false,
      }));
    }
  };

  // Resend verification code
  const resendCode = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: "" }));

    try {
      const response = await smsApi.resendCode(state.verificationId);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          success: response.data!.message,
          verificationCode: "",
          isLoading: false,
        }));
        startCountdown(response.data.can_resend_after);

        // Clear code inputs
        codeInputRefs.current.forEach(input => {
          if (input) input.value = "";
        });
        codeInputRefs.current[0]?.focus();
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || "خطا در ارسال مجدد کد",
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "خطا در ارسال مجدد کد",
        isLoading: false,
      }));
    }
  };

  // Go back to phone input
  const goBackToPhone = () => {
    setState(prev => ({
      ...prev,
      step: "phone",
      verificationCode: "",
      verificationId: "",
      error: "",
      success: "",
    }));

    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
    }
  };

  // Format countdown time
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getPurposeTitle = () => {
    switch (purpose) {
      case "register":
        return "ثبت نام با شماره تلفن";
      case "password_reset":
        return "بازیابی رمز عبور";
      default:
        return "ورود با شماره تلفن";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {state.step === "success" ? (
            <CheckCircleIconSolid className="h-8 w-8 text-green-600" />
          ) : (
            <PhoneIcon className="h-8 w-8 text-blue-600" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getPurposeTitle()}
        </h1>
        <p className="text-gray-600">
          {state.step === "phone" && "شماره تلفن خود را وارد کنید"}
          {state.step === "verification" &&
            `کد تأیید ارسال شده به ${formatPhoneNumber(state.phoneNumber)} را وارد کنید`}
          {state.step === "guest_info" && "اطلاعات خود را تکمیل کنید"}
          {state.step === "success" && "ورود با موفقیت انجام شد"}
        </p>
      </div>

      {/* Phone Number Step */}
      {state.step === "phone" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شماره تلفن همراه
            </label>
            <div className="relative">
              <input
                ref={phoneInputRef}
                type="tel"
                value={state.phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                placeholder="09XX XXX XXXX"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                dir="ltr"
              />
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              کد تأیید به این شماره ارسال می‌شود
            </p>
          </div>

          <button
            onClick={sendVerificationCode}
            disabled={state.isLoading || !state.phoneNumber}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {state.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRightIcon className="h-5 w-5" />
            )}
            {state.isLoading ? "در حال ارسال..." : "ارسال کد تأیید"}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              انصراف
            </button>
          )}
        </div>
      )}

      {/* Verification Code Step */}
      {state.step === "verification" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              کد ۶ رقمی تأیید را وارد کنید
            </label>
            <div className="flex justify-center gap-3 mb-4">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) codeInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={state.verificationCode[index] || ""}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ))}
            </div>
          </div>

          {/* Resend Timer */}
          <div className="text-center">
            {state.timeLeft > 0 ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <ClockIcon className="h-4 w-4" />
                <span>ارسال مجدد کد پس از {formatTime(state.timeLeft)}</span>
              </div>
            ) : (
              <button
                onClick={resendCode}
                disabled={state.isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
              >
                ارسال مجدد کد تأیید
              </button>
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={goBackToPhone}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            تغییر شماره تلفن
          </button>
        </div>
      )}

      {/* Guest Info Step */}
      {state.step === "guest_info" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نام و نام خانوادگی *
            </label>
            <input
              type="text"
              value={state.guestName}
              onChange={(e) =>
                setState(prev => ({ ...prev, guestName: e.target.value, error: "" }))
              }
              placeholder="نام خود را وارد کنید"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ایمیل (اختیاری)
            </label>
            <input
              type="email"
              value={state.guestEmail}
              onChange={(e) =>
                setState(prev => ({ ...prev, guestEmail: e.target.value }))
              }
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="ltr"
            />
          </div>

          <button
            onClick={completeGuestLogin}
            disabled={state.isLoading || !state.guestName.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {state.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircleIcon className="h-5 w-5" />
            )}
            {state.isLoading ? "در حال ورود..." : "تکمیل ثبت نام"}
          </button>

          <button
            onClick={goBackToPhone}
            className="w-full text-gray-600 hover:text-gray-800 transition-colors"
          >
            بازگشت
          </button>
        </div>
      )}

      {/* Success Step */}
      {state.step === "success" && (
        <div className="text-center space-y-4">
          <div className="text-green-600 text-lg font-medium">
            {state.success}
          </div>
          <div className="text-sm text-gray-600">
            در حال انتقال به داشبورد...
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      {/* Success Message */}
      {state.success && state.step !== "success" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">{state.success}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-blue-700">
            <p className="font-medium mb-1">امنیت اطلاعات</p>
            <p className="text-sm">
              کد تأیید فقط ۵ دقیقه اعتبار دارد و تنها برای شما ارسال شده است.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSLogin;
