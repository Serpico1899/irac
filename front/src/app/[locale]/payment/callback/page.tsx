"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { zarinpalApi } from "@/services/payment/zarinpal/zarinpalApi";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CreditCardIcon,
  WalletIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Metadata } from "next";

interface PaymentResult {
  success: boolean;
  message: string;
  data?: {
    authority: string;
    amount: number;
    ref_id?: number;
    card_pan?: string;
    new_balance?: number;
    wallet_transaction_id?: string;
  };
  error_code?: string;
}

const PaymentCallbackContent: React.FC = () => {
  const t = useTranslations("payment");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { refreshWallet } = useWallet();

  const [isLoading, setIsLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null,
  );
  const [processingStage, setProcessingStage] = useState<string>("parsing");

  // Parse callback parameters
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  // Get stored payment data
  const [storedPaymentData, setStoredPaymentData] = useState<any>(null);

  useEffect(() => {
    // Get stored payment data
    const stored = zarinpalApi.getStoredPaymentData();
    setStoredPaymentData(stored);
  }, []);

  useEffect(() => {
    const processPayment = async () => {
      try {
        setProcessingStage("validating");

        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          setPaymentResult({
            success: false,
            message: "برای تأیید پرداخت باید وارد سیستم شوید",
            error_code: "NOT_AUTHENTICATED",
          });
          setIsLoading(false);
          return;
        }

        // Check callback parameters
        if (!authority) {
          setPaymentResult({
            success: false,
            message: "پارامترهای بازگشت از درگاه پرداخت نامعتبر است",
            error_code: "INVALID_CALLBACK",
          });
          setIsLoading(false);
          return;
        }

        // Check if payment was cancelled
        if (status === "NOK") {
          setPaymentResult({
            success: false,
            message: "پرداخت توسط شما لغو شد",
            error_code: "PAYMENT_CANCELLED",
          });
          setIsLoading(false);
          return;
        }

        setProcessingStage("verifying");

        // Get amount from stored data or default
        const amount = storedPaymentData?.amount || 0;

        if (!amount || amount < 1000) {
          setPaymentResult({
            success: false,
            message: "مبلغ پرداخت نامعتبر است",
            error_code: "INVALID_AMOUNT",
          });
          setIsLoading(false);
          return;
        }

        // Verify payment
        const verifyResult = await zarinpalApi.verifyPayment({
          authority,
          amount,
          status: status || undefined,
        });

        setProcessingStage("completing");

        if (verifyResult.success) {
          // Payment successful - refresh wallet
          await refreshWallet();

          // Clear stored payment data
          zarinpalApi.clearStoredPaymentData();
        }

        setPaymentResult(verifyResult);
        setIsLoading(false);
      } catch (error) {
        console.error("Payment processing error:", error);
        setPaymentResult({
          success: false,
          message: "خطا در پردازش پرداخت",
          error_code: "PROCESSING_ERROR",
        });
        setIsLoading(false);
      }
    };

    // Only process if we have the necessary parameters
    if (authority !== null) {
      processPayment();
    } else {
      setIsLoading(false);
      setPaymentResult({
        success: false,
        message: "پارامترهای پرداخت یافت نشد",
        error_code: "MISSING_PARAMETERS",
      });
    }
  }, [
    authority,
    status,
    isAuthenticated,
    user,
    storedPaymentData,
    refreshWallet,
  ]);

  // Handle navigation
  const handleGoToWallet = () => {
    router.push("/user/wallet");
  };

  const handleGoToDashboard = () => {
    router.push("/user/dashboard");
  };

  const handleTryAgain = () => {
    router.push("/user/wallet");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 max-w-md w-full text-center">
            <ArrowPathIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              در حال پردازش پرداخت
            </h2>

            <p className="text-gray-600 mb-4">
              {processingStage === "parsing" && "در حال بررسی اطلاعات..."}
              {processingStage === "validating" && "در حال اعتبارسنجی..."}
              {processingStage === "verifying" && "در حال تأیید پرداخت..."}
              {processingStage === "completing" && "در حال تکمیل فرآیند..."}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width:
                    processingStage === "parsing"
                      ? "25%"
                      : processingStage === "validating"
                        ? "50%"
                        : processingStage === "verifying"
                          ? "75%"
                          : "90%",
                }}
              ></div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              لطفاً صفحه را ببندید یا رفرش نکنید
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (paymentResult?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 max-w-md w-full">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                پرداخت موفقیت‌آمیز بود
              </h2>

              <p className="text-gray-600">{paymentResult.message}</p>
            </div>

            {/* Payment Details */}
            <div className="space-y-3 mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">مبلغ پرداخت:</span>
                <span className="font-medium text-gray-900">
                  {zarinpalApi.formatAmount(paymentResult.data?.amount || 0)}
                </span>
              </div>

              {paymentResult.data?.ref_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">کد پیگیری:</span>
                  <span className="font-medium text-gray-900 font-mono text-sm">
                    {paymentResult.data.ref_id}
                  </span>
                </div>
              )}

              {paymentResult.data?.card_pan && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">شماره کارت:</span>
                  <span className="font-medium text-gray-900 font-mono text-sm">
                    {paymentResult.data.card_pan}
                  </span>
                </div>
              )}

              {paymentResult.data?.new_balance !== undefined && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">موجودی جدید:</span>
                  <span className="font-bold text-green-600">
                    {zarinpalApi.formatAmount(paymentResult.data.new_balance)}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoToWallet}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <WalletIcon className="h-5 w-5" />
                مشاهده کیف پول
              </button>

              <button
                onClick={handleGoToDashboard}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                بازگشت به داشبورد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 max-w-md w-full">
          {/* Error Icon */}
          <div className="text-center mb-6">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              {paymentResult?.error_code === "PAYMENT_CANCELLED" ? (
                <ExclamationTriangleIcon className="h-10 w-10 text-orange-600" />
              ) : (
                <XCircleIcon className="h-10 w-10 text-red-600" />
              )}
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {paymentResult?.error_code === "PAYMENT_CANCELLED"
                ? "پرداخت لغو شد"
                : "پرداخت ناموفق بود"}
            </h2>

            <p className="text-gray-600">
              {paymentResult?.message || "خطای نامشخص در پرداخت"}
            </p>
          </div>

          {/* Error Details */}
          {paymentResult?.error_code && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">کد خطا:</span>
                <span className="font-medium text-gray-900 font-mono text-xs">
                  {paymentResult.error_code}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {paymentResult?.error_code === "PAYMENT_CANCELLED" ? (
              <button
                onClick={handleTryAgain}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCardIcon className="h-5 w-5" />
                تلاش مجدد
              </button>
            ) : (
              <button
                onClick={handleGoToWallet}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                بازگشت به کیف پول
              </button>
            )}

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRightIcon className="h-5 w-5" />
              بازگشت به صفحه اصلی
            </button>
          </div>

          {/* Support Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              در صورت بروز مشکل، لطفاً با پشتیبانی تماس بگیرید
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentCallbackPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 max-w-md w-full text-center">
              <ArrowPathIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                در حال بارگذاری...
              </h2>
              <p className="text-gray-600">در حال پردازش اطلاعات پرداخت</p>
            </div>
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
};

// Note: SEO metadata removed as this is a client component
// Payment callback pages should not be indexed anyway

export default PaymentCallbackPage;
