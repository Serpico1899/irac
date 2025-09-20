"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@/context/WalletContext";
import { unifiedPaymentApi, type PaymentGatewayInfo, type PaymentGatewayType } from "@/services/payment/unified-payment-api";
import {
  CreditCardIcon,
  WalletIcon,
  BanknotesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface PaymentMethodSelectorProps {
  amount: number;
  onSelect: (gatewayType: PaymentGatewayType, gatewayInfo: PaymentGatewayInfo) => void;
  selectedMethod?: PaymentGatewayType;
  disabled?: boolean;
  className?: string;
}

interface PaymentMethodCardProps {
  gateway: PaymentGatewayInfo;
  amount: number;
  isSelected: boolean;
  isWalletSufficient: boolean;
  onClick: () => void;
  disabled: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  gateway,
  amount,
  isSelected,
  isWalletSufficient,
  onClick,
  disabled,
}) => {
  const t = useTranslations("payment");

  // Calculate final amount with fees
  const finalAmount = amount + gateway.gateway_fee;

  // Determine card status
  const getCardStatus = () => {
    if (!gateway.is_available) {
      return {
        status: "unavailable",
        color: "text-gray-400",
        bg: "bg-gray-50",
        border: "border-gray-200",
        message: "غیرفعال",
        icon: XCircleIcon,
        canSelect: false,
      };
    }

    if (!gateway.is_healthy) {
      return {
        status: "unhealthy",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        message: "در دسترس نیست",
        icon: ExclamationTriangleIcon,
        canSelect: false,
      };
    }

    if (gateway.type === "wallet" && !isWalletSufficient) {
      return {
        status: "insufficient",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        message: "موجودی ناکافی",
        icon: ExclamationTriangleIcon,
        canSelect: false,
      };
    }

    if (amount < gateway.min_amount) {
      return {
        status: "min_amount",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        message: `حداقل ${gateway.min_amount.toLocaleString("fa-IR")} تومان`,
        icon: InformationCircleIcon,
        canSelect: false,
      };
    }

    if (amount > gateway.max_amount) {
      return {
        status: "max_amount",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        message: `حداکثر ${gateway.max_amount.toLocaleString("fa-IR")} تومان`,
        icon: InformationCircleIcon,
        canSelect: false,
      };
    }

    return {
      status: "available",
      color: "text-green-600",
      bg: "bg-white",
      border: "border-gray-200",
      message: "آماده پرداخت",
      icon: CheckCircleIcon,
      canSelect: true,
    };
  };

  const cardStatus = getCardStatus();

  // Get gateway icon
  const getGatewayIcon = () => {
    switch (gateway.type) {
      case "zarinpal":
        return <CreditCardIcon className="h-6 w-6" />;
      case "mellat_bank":
        return <BanknotesIcon className="h-6 w-6" />;
      case "saman_bank":
        return <BanknotesIcon className="h-6 w-6" />;
      case "wallet":
        return <WalletIcon className="h-6 w-6" />;
      case "bank_transfer":
        return <BanknotesIcon className="h-6 w-6" />;
      case "crypto":
        return <CurrencyDollarIcon className="h-6 w-6" />;
      default:
        return <CreditCardIcon className="h-6 w-6" />;
    }
  };

  return (
    <div
      className={`
        relative border rounded-xl transition-all duration-200 cursor-pointer group
        ${isSelected
          ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
          : cardStatus.border
        }
        ${cardStatus.canSelect && !disabled
          ? "hover:shadow-lg hover:border-primary/50 hover:bg-primary/[0.02]"
          : "cursor-not-allowed"
        }
        ${cardStatus.bg}
        ${disabled ? "opacity-50" : ""}
      `}
      onClick={cardStatus.canSelect && !disabled ? onClick : undefined}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <CheckCircleIcon className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Gateway info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Gateway icon */}
            <div
              className={`
                w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200
                ${isSelected
                  ? "text-primary shadow-md"
                  : "text-gray-600 group-hover:text-primary"
                }
              `}
              style={{
                backgroundColor: isSelected ? `${gateway.color}20` : `${gateway.color}10`,
                color: isSelected ? gateway.color : undefined
              }}
            >
              {getGatewayIcon()}
            </div>

            {/* Gateway details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {gateway.display_name}
                </h3>
                {gateway.type === "wallet" && (
                  <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>

              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                {gateway.description}
              </p>

              {/* Gateway features */}
              <div className="flex flex-wrap gap-2 mb-3">
                {gateway.features.instant_confirmation && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    <ClockIcon className="h-3 w-3" />
                    تأیید فوری
                  </span>
                )}
                {gateway.features.supports_refund && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    <ShieldCheckIcon className="h-3 w-3" />
                    قابل برگشت
                  </span>
                )}
                {gateway.features.supports_installment && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                    <CreditCardIcon className="h-3 w-3" />
                    اقساطی
                  </span>
                )}
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <cardStatus.icon className={`h-4 w-4 ${cardStatus.color}`} />
                <span className={`text-sm font-medium ${cardStatus.color}`}>
                  {cardStatus.message}
                </span>
              </div>
            </div>
          </div>

          {/* Amount section */}
          <div className="text-left flex-shrink-0">
            <div className="text-sm text-gray-500 mb-1">مبلغ نهایی</div>
            <div className="text-xl font-bold text-gray-900">
              {finalAmount.toLocaleString("fa-IR")}
            </div>
            <div className="text-xs text-gray-500">تومان</div>

            {gateway.gateway_fee > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                + {gateway.gateway_fee.toLocaleString("fa-IR")} کارمزد
              </div>
            )}
          </div>
        </div>

        {/* Additional info for special cases */}
        {gateway.type === "wallet" && !isWalletSufficient && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="flex items-start gap-2 text-sm text-orange-700">
              <InformationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                برای استفاده از کیف پول، ابتدا آن را شارژ کنید.
              </span>
            </div>
          </div>
        )}

        {(amount < gateway.min_amount || amount > gateway.max_amount) && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="flex items-start gap-2 text-sm text-orange-700">
              <InformationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                محدوده پرداخت: {gateway.min_amount.toLocaleString("fa-IR")} تا {gateway.max_amount.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  onSelect,
  selectedMethod,
  disabled = false,
  className = "",
}) => {
  const t = useTranslations("payment");
  const { balance: walletBalance, isLoading: walletLoading, refreshWallet } = useWallet();

  const [gateways, setGateways] = useState<PaymentGatewayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet has sufficient balance
  const isWalletSufficient = walletBalance >= amount;

  // Load available gateways
  useEffect(() => {
    const loadGateways = async () => {
      try {
        setIsLoading(true);
        const result = await unifiedPaymentApi.getAvailableGateways(amount);

        if (result.success) {
          // Sort gateways by priority
          const sortedGateways = result.gateways.sort((a, b) => {
            // Wallet first if sufficient balance
            if (a.type === "wallet" && isWalletSufficient) return -1;
            if (b.type === "wallet" && isWalletSufficient) return 1;

            // Healthy gateways first
            if (a.is_healthy !== b.is_healthy) {
              return a.is_healthy ? -1 : 1;
            }

            // Sort by fees
            return a.gateway_fee - b.gateway_fee;
          });

          setGateways(sortedGateways);
          setError(null);
        } else {
          setError(result.error || "خطا در بارگذاری روش‌های پرداخت");
        }
      } catch (error) {
        console.error("Error loading payment gateways:", error);
        setError("خطا در بارگذاری روش‌های پرداخت");
      } finally {
        setIsLoading(false);
      }
    };

    loadGateways();
  }, [amount, isWalletSufficient]);

  // Handle gateway selection
  const handleGatewaySelect = (gateway: PaymentGatewayInfo) => {
    if (disabled) return;
    onSelect(gateway.type, gateway);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <ArrowPathIcon className="h-8 w-8 text-primary animate-spin" />
            <p className="text-gray-600 font-medium">در حال بارگذاری روش‌های پرداخت...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">خطا در بارگذاری</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <ArrowPathIcon className="h-4 w-4" />
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">انتخاب روش پرداخت</h2>
          <p className="text-gray-600">
            مبلغ قابل پرداخت: <span className="font-semibold text-gray-900">
              {amount.toLocaleString("fa-IR")} تومان
            </span>
          </p>
        </div>
      </div>

      {/* Wallet balance info */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <WalletIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">موجودی کیف پول</h3>
              <p className="text-sm text-gray-600">موجودی فعلی شما</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {walletLoading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-left">
                  <div className="text-xl font-bold text-gray-900">
                    {walletBalance.toLocaleString("fa-IR")}
                  </div>
                  <div className="text-xs text-gray-500">تومان</div>
                </div>
                <div className="flex items-center">
                  {isWalletSufficient ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {!isWalletSufficient && (
          <div className="mt-4 pt-4 border-t border-primary/10">
            <p className="text-sm text-gray-600 mb-2">
              برای پرداخت با کیف پول، موجودی شما کافی نیست.
            </p>
            <button
              onClick={refreshWallet}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              <ArrowPathIcon className="h-4 w-4" />
              به‌روزرسانی موجودی
            </button>
          </div>
        )}
      </div>

      {/* Payment methods grid */}
      <div className="grid gap-4">
        {gateways.map((gateway) => (
          <PaymentMethodCard
            key={gateway.type}
            gateway={gateway}
            amount={amount}
            isSelected={selectedMethod === gateway.type}
            isWalletSufficient={isWalletSufficient}
            onClick={() => handleGatewaySelect(gateway)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* No gateways available */}
      {gateways.length === 0 && !isLoading && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">
            هیچ روش پرداختی در دسترس نیست
          </h3>
          <p className="text-gray-600 mb-4">
            در حال حاضر هیچ درگاه پرداختی برای این مبلغ فعال نیست.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            <ArrowPathIcon className="h-4 w-4" />
            بررسی مجدد
          </button>
        </div>
      )}

      {/* Security notice */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">امنیت پرداخت تضمین شده</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              تمامی پرداخت‌ها با استفاده از پروتکل‌های امنیتی بانک‌ها و رمزنگاری SSL انجام می‌شود.
              اطلاعات کارت شما هیچ‌گاه در سیستم ما ذخیره نمی‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
