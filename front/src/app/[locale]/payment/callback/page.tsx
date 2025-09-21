"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { unifiedPaymentApi } from "@/services/payment/unified-payment-api";
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
  gateway_type?: string;
  data?: {
    authority?: string;
    reference_id?: string;
    tracking_code?: string;
    amount: number;
    card_info?: {
      masked_pan?: string;
      hash?: string;
      bank_name?: string;
    };
    wallet_info?: {
      transaction_id?: string;
      new_balance?: number;
    };
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

  // Parse callback parameters from different gateways
  const [callbackParams, setCallbackParams] = useState<any>(null);
  const [gatewayType, setGatewayType] = useState<string>("");

  // Get stored payment data
  const [storedPaymentData, setStoredPaymentData] = useState<any>(null);

  useEffect(() => {
    // Parse callback parameters for all gateways
    const params = unifiedPaymentApi.parseCallbackParams();
    setCallbackParams(params);
    setGatewayType(params?.gateway_type || "");

    // Get stored payment data
    const stored = unifiedPaymentApi.getStoredPaymentData();
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
        if (!callbackParams || !callbackParams.gateway_type) {
          setPaymentResult({
            success: false,
            message: "پارامترهای بازگشت از درگاه پرداخت نامعتبر است",
            error_code: "INVALID_CALLBACK",
          });
          setIsLoading(false);
          return;
        }

        // Check payment status from callback
        const paymentStatus = unifiedPaymentApi.getPaymentStatusFromCallback();
        if (paymentStatus.isCancelled || paymentStatus.isFailed) {
          setPaymentResult({
            success: false,
            message: paymentStatus.message || "پرداخت ناموفق بود",
            error_code: paymentStatus.errorCode || "PAYMENT_FAILED",
            gateway_type: gatewayType,
          });
          setIsLoading(false);
          return;
        }

        setProcessingStage("verifying");

        // Get transaction ID from stored data or URL
        const transactionId =
          storedPaymentData?.transaction_id ||
          searchParams.get("transaction_id") ||
          callbackParams.transaction_id;

        if (!transactionId) {
          setPaymentResult({
            success: false,
            message: "شناسه تراکنش یافت نشد",
            error_code: "MISSING_TRANSACTION_ID",
            gateway_type: gatewayType,
          });
          setIsLoading(false);
          return;
        }

        // Verify payment using unified API
        const verifyResult = await unifiedPaymentApi.verifyPayment({
          transaction_id: transactionId,
          authority: callbackParams.authority,
          reference_id: callbackParams.reference_id,
          callback_params: callbackParams,
        });

        setProcessingStage("completing");

        if (verifyResult.success) {
          // Payment successful - refresh wallet
          await refreshWallet();

          // Clear stored payment data
          unifiedPaymentApi.clearStoredPaymentData();
        }

        setPaymentResult({
          ...verifyResult,
          gateway_type: gatewayType,
        });
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
    if (callbackParams !== null) {
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
    callbackParams,
    gatewayType,
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

              {paymentResult.gateway_type && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                  {unifiedPaymentApi.getGatewayDisplayName(
                    paymentResult.gateway_type as any,
                  )}
                </div>
              )}

              <p className="text-gray-600">{paymentResult.message}</p>
            </div>

            {/* Payment Details */}
            <div className="space-y-3 mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">مبلغ پرداخت:</span>
                <span className="font-medium text-gray-900">
                  {unifiedPaymentApi.formatAmount(
                    paymentResult.data?.amount || 0,
                  )}
                </span>
              </div>

              {paymentResult.data?.tracking_code && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">کد پیگیری:</span>
                  <span className="font-medium text-gray-900 font-mono text-sm">
                    {paymentResult.data.tracking_code}
                  </span>
                </div>
              )}

              {paymentResult.data?.reference_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">شماره مرجع:</span>
                  <span className="font-medium text-gray-900 font-mono text-sm">
                    {paymentResult.data.reference_id}
                  </span>
                </div>
              )}

              {paymentResult.data?.card_info?.masked_pan && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">شماره کارت:</span>
                  <span className="font-medium text-gray-900 font-mono text-sm">
                    {paymentResult.data.card_info.masked_pan}
                  </span>
                </div>
              )}

              {paymentResult.data?.card_info?.bank_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">بانک:</span>
                  <span className="font-medium text-gray-900">
                    {paymentResult.data.card_info.bank_name}
                  </span>
                </div>
              )}

              {paymentResult.data?.wallet_info?.new_balance !== undefined && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">موجودی جدید:</span>
                  <span className="font-bold text-green-600">
                    {unifiedPaymentApi.formatAmount(
                      paymentResult.data.wallet_info.new_balance,
                    )}
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

            {paymentResult?.gateway_type && (
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-2">
                {unifiedPaymentApi.getGatewayDisplayName(
                  paymentResult.gateway_type as any,
                )}
              </div>
            )}

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
