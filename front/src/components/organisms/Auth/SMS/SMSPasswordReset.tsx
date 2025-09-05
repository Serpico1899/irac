"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { smsApi } from "@/services/sms/smsApi";
import {
  PhoneIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
} from "@heroicons/react/24/solid";
import type {
  SMSVerificationRequest,
  SMSCodeVerifyRequest,
  SMSPasswordResetRequest,
} from "@/types";

interface SMSPasswordResetState {
  step: "phone" | "verification" | "password" | "success";
  phoneNumber: string;
  verificationCode: string;
  verificationId: string;
  newPassword: string;
  confirmPassword: string;
  timeLeft: number;
  canResend: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  error: string;
  success: string;
}

interface SMSPasswordResetProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SMSPasswordReset: React.FC<SMSPasswordResetProps> = ({
  onSuccess,
  onCancel,
}) => {
  const t = useTranslations("auth");
  const router = useRouter();

  const [state, setState] = useState<SMSPasswordResetState>({
    step: "phone",
    phoneNumber: "",
    verificationCode: "",
    verificationId: "",
    newPassword: "",
    confirmPassword: "",
    timeLeft: 0,
    canResend: false,
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    error: "",
    success: "",
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

  // Validate Iranian phone number
  const validatePhoneNumber = (phone: string): boolean => {
    const iranianPhoneRegex = /^(\+98|0)?9\d{9}$/;
    return iranianPhoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/(\+98|0)(\d{3})(\d{3})(\d{4})/, "$2 $3 $4");
  };

  // Validate password strength
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
      checks: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
      },
    };
  };

  // Send SMS verification code
  const sendVerificationCode = async () => {
    if (!validatePhoneNumber(state.phoneNumber)) {
      setState((prev) => ({
        ...prev,
        error: "شماره تلفن معتبر وارد کنید (مثال: 09123456789)",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: "", success: "" }));

    try {
      const request: SMSVerificationRequest = {
        phone_number: state.phoneNumber.replace(/\s/g, ""),
        purpose: "password_reset",
      };

      const response = await smsApi.sendVerificationCode(request);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          verificationId: response.data!.verification_id,
          step: "verification",
          success: "کد تأیید برای بازیابی رمز عبور ارسال شد",
        }));

        startCountdown(response.data.can_resend_after);
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

  // Verify SMS code
  const verifyCode = async () => {
    if (!state.verificationCode || state.verificationCode.length !== 6) {
      setState((prev) => ({ ...prev, error: "کد 6 رقمی را وارد کنید" }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      const request: SMSCodeVerifyRequest = {
        verification_id: state.verificationId,
        code: state.verificationCode,
      };

      const response = await smsApi.verifyCode(request);

      if (response.success && response.data) {
        if (!response.data.user_exists) {
          setState((prev) => ({
            ...prev,
            error: "کاربری با این شماره تلفن یافت نشد",
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          step: "password",
          success: "کد تأیید شد. رمز عبور جدید را وارد کنید",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "کد تأیید نادرست است",
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "خطا در اتصال به سرور",
      }));
      console.error("Error verifying code:", err);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Reset password
  const resetPassword = async () => {
    if (!state.newPassword || !state.confirmPassword) {
      setState((prev) => ({ ...prev, error: "همه فیلدها را پر کنید" }));
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      setState((prev) => ({ ...prev, error: "رمزهای عبور مطابقت ندارند" }));
      return;
    }

    const passwordValidation = validatePassword(state.newPassword);
    if (!passwordValidation.isValid) {
      setState((prev) => ({
        ...prev,
        error:
          "رمز عبور باید حداقل 8 کاراکتر و شامل حروف بزرگ، کوچک و عدد باشد",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      const request: SMSPasswordResetRequest = {
        phone_number: state.phoneNumber,
        verification_id: state.verificationId,
        new_password: state.newPassword,
      };

      const response = await smsApi.resetPassword(request);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          step: "success",
          success: response.data?.message || "رمز عبور با موفقیت تغییر یافت",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "خطا در تغییر رمز عبور",
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "خطا در اتصال به سرور",
      }));
      console.error("Error resetting password:", err);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle input changes
  const handlePhoneChange = (value: string) => {
    // Allow digits and common phone number formats
    const cleaned = value.replace(/[^\d+]/g, "");
    setState((prev) => ({ ...prev, phoneNumber: cleaned, error: "" }));
  };

  const handleCodeChange = (value: string) => {
    // Allow only 6 digits
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setState((prev) => ({ ...prev, verificationCode: cleaned, error: "" }));
  };

  const handlePasswordChange = (
    field: "newPassword" | "confirmPassword",
    value: string,
  ) => {
    setState((prev) => ({ ...prev, [field]: value, error: "" }));
  };

  // Go to previous step
  const goToPreviousStep = () => {
    if (state.step === "verification") {
      setState((prev) => ({
        ...prev,
        step: "phone",
        verificationId: "",
        verificationCode: "",
        error: "",
        success: "",
      }));
    } else if (state.step === "password") {
      setState((prev) => ({
        ...prev,
        step: "verification",
        newPassword: "",
        confirmPassword: "",
        error: "",
        success: "",
      }));
    }
  };

  const passwordValidation = validatePassword(state.newPassword);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <KeyIcon className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          بازیابی رمز عبور
        </h2>
        <p className="text-gray-600 text-sm">
          {state.step === "phone" && "شماره تلفن خود را وارد کنید"}
          {state.step === "verification" && "کد تأیید ارسال شده را وارد کنید"}
          {state.step === "password" && "رمز عبور جدید را تعیین کنید"}
          {state.step === "success" && "رمز عبور با موفقیت تغییر یافت"}
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Phone Number Step */}
        {state.step === "phone" && (
          <>
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

            <button
              onClick={sendVerificationCode}
              disabled={state.isLoading || !state.phoneNumber}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {state.isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <PhoneIcon className="h-5 w-5" />
              )}
              ارسال کد تأیید
            </button>
          </>
        )}

        {/* Verification Step */}
        {state.step === "verification" && (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                کد 6 رقمی ارسال شده به شماره{" "}
                <span className="font-medium" dir="ltr">
                  {formatPhoneNumber(state.phoneNumber)}
                </span>{" "}
                را وارد کنید
              </p>
            </div>

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

            <div className="flex flex-col gap-3">
              <button
                onClick={verifyCode}
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
                تأیید کد
              </button>

              <button
                onClick={goToPreviousStep}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 py-2 transition-colors"
              >
                <ArrowRightIcon className="h-4 w-4" />
                بازگشت
              </button>
            </div>
          </>
        )}

        {/* Password Step */}
        {state.step === "password" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز عبور جدید
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={state.showPassword ? "text" : "password"}
                  value={state.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  placeholder="رمز عبور جدید"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      showPassword: !prev.showPassword,
                    }))
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {state.showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {state.newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidation.checks.minLength ? (
                      <CheckCircleIconSolid className="h-3 w-3 text-green-600" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-300"></div>
                    )}
                    <span
                      className={
                        passwordValidation.checks.minLength
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      حداقل 8 کاراکتر
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidation.checks.hasUpperCase ? (
                      <CheckCircleIconSolid className="h-3 w-3 text-green-600" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-300"></div>
                    )}
                    <span
                      className={
                        passwordValidation.checks.hasUpperCase
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      حروف بزرگ انگلیسی
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidation.checks.hasLowerCase ? (
                      <CheckCircleIconSolid className="h-3 w-3 text-green-600" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-300"></div>
                    )}
                    <span
                      className={
                        passwordValidation.checks.hasLowerCase
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      حروف کوچک انگلیسی
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidation.checks.hasNumbers ? (
                      <CheckCircleIconSolid className="h-3 w-3 text-green-600" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-300"></div>
                    )}
                    <span
                      className={
                        passwordValidation.checks.hasNumbers
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      اعداد
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تأیید رمز عبور
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={state.showConfirmPassword ? "text" : "password"}
                  value={state.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  placeholder="تأیید رمز عبور"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      showConfirmPassword: !prev.showConfirmPassword,
                    }))
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {state.showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {state.confirmPassword &&
                state.newPassword !== state.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    رمزهای عبور مطابقت ندارند
                  </p>
                )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={resetPassword}
                disabled={
                  state.isLoading ||
                  !passwordValidation.isValid ||
                  state.newPassword !== state.confirmPassword
                }
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {state.isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShieldCheckIcon className="h-5 w-5" />
                )}
                تغییر رمز عبور
              </button>

              <button
                onClick={goToPreviousStep}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 py-2 transition-colors"
              >
                <ArrowRightIcon className="h-4 w-4" />
                بازگشت
              </button>
            </div>
          </>
        )}

        {/* Success Step */}
        {state.step === "success" && (
          <>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIconSolid className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                رمز عبور تغییر یافت!
              </h3>
              <p className="text-gray-600 text-sm">
                رمز عبور شما با موفقیت تغییر یافت. اکنون می‌توانید با رمز عبور
                جدید وارد شوید.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (onSuccess) {
                    onSuccess();
                  } else {
                    router.push("/login");
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ورود به حساب کاربری
              </button>
            </div>
          </>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{state.error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {state.success && state.step !== "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 text-sm">{state.success}</p>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {state.step !== "success" && onCancel && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
            >
              لغو و بازگشت
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSPasswordReset;
