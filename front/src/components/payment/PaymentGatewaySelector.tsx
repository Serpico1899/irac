"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@/context/WalletContext";
import { unifiedPaymentApi, type PaymentGatewayInfo, type PaymentGatewayType } from "@/services/payment/unified-payment-api";
import {
  CreditCardIcon,
  WalletIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface PaymentGatewaySelectorProps {
  amount: number;
  onSelect: (gatewayType: PaymentGatewayType, gatewayInfo: PaymentGatewayInfo) => void;
  selectedGateway?: PaymentGatewayType;
  disabled?: boolean;
  excludeGateways?: PaymentGatewayType[];
  preferredGateway?: PaymentGatewayType;
  showWalletBalance?: boolean;
  className?: string;
}

interface GatewayIconProps {
  type: PaymentGatewayType;
  className?: string;
}

const GatewayIcon: React.FC<GatewayIconProps> = ({ type, className = "h-6 w-6" }) => {
  const iconProps = { className };

  switch (type) {
    case "zarinpal":
      return <CreditCardIcon {...iconProps} />;
    case "mellat_bank":
      return <BanknotesIcon {...iconProps} />;
    case "saman_bank":
      return <BanknotesIcon {...iconProps} />;
    case "wallet":
      return <WalletIcon {...iconProps} />;
    case "bank_transfer":
      return <BanknotesIcon {...iconProps} />;
    case "crypto":
      return <CreditCardIcon {...iconProps} />;
    default:
      return <CreditCardIcon {...iconProps} />;
  }
};

const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  amount,
  onSelect,
  selectedGateway,
  disabled = false,
  excludeGateways = [],
  preferredGateway,
  showWalletBalance = true,
  className = "",
}) => {
  const t = useTranslations("payment");
  const { balance: walletBalance, isLoading: walletLoading, refreshWallet } = useWallet();

  const [gateways, setGateways] = useState<PaymentGatewayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletSufficient, setWalletSufficient] = useState(false);

  // Load available gateways
  useEffect(() => {
    const loadGateways = async () => {
      try {
        setIsLoading(true);
        const result = await unifiedPaymentApi.getAvailableGateways(amount);

        if (result.success) {
          // Filter out excluded gateways
          const filteredGateways = result.gateways.filter(
            gateway => !excludeGateways.includes(gateway.type)
          );

          // Sort gateways by priority and health
          const sortedGateways = filteredGateways.sort((a, b) => {
            // Preferred gateway first
            if (preferredGateway) {
              if (a.type === preferredGateway) return -1;
              if (b.type === preferredGateway) return 1;
            }

            // Healthy gateways first
            if (a.is_healthy !== b.is_healthy) {
              return a.is_healthy ? -1 : 1;
            }

            // Wallet first if sufficient balance
            if (a.type === "wallet" && walletSufficient) return -1;
            if (b.type === "wallet" && walletSufficient) return 1;

            // Sort by minimum fees
            return a.gateway_fee - b.gateway_fee;
          });

          setGateways(sortedGateways);
          setError(null);
        } else {
          setError(result.error || "خطا در بارگذاری درگاه‌های پرداخت");
        }
      } catch (error) {
        console.error("Error loading gateways:", error);
        setError("خطا در بارگذاری درگاه‌های پرداخت");
      } finally {
        setIsLoading(false);
      }
    };

    loadGateways();
  }, [amount, excludeGateways, preferredGateway, walletSufficient]);

  // Check wallet balance
  useEffect(() => {
    setWalletSufficient(walletBalance >= amount);
  }, [walletBalance, amount]);

  // Handle gateway selection
  const handleGatewaySelect = (gateway: PaymentGatewayInfo) => {
    if (disabled || !gateway.is_available) return;

    // Check amount limits
    if (amount < gateway.min_amount || amount > gateway.max_amount) {
      return;
    }

    // Special handling for wallet
    if (gateway.type === "wallet" && !walletSufficient) {
      return;
    }

    onSelect(gateway.type, gateway);
  };

  // Get gateway status color and text
  const getGatewayStatus = (gateway: PaymentGatewayInfo) => {
    if (!gateway.is_available) {
      return {
        color: "text-gray-400",
        bg: "bg-gray-50",
        border: "border-gray-200",
        status: "غیرفعال",
        icon: XCircleIcon,
      };
    }

    if (!gateway.is_healthy) {
      return {
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        status: "در دسترس نیست",
        icon: ExclamationTriangleIcon,
      };
    }

    if (gateway.type === "wallet" && !walletSufficient) {
      return {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        status: "موجودی ناکافی",
        icon: XCircleIcon,
      };
    }

    if (amount < gateway.min_amount) {
      return {
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        status: `حداقل ${gateway.min_amount.toLocaleString("fa-IR")} تومان`,
        icon: ExclamationTriangleIcon,
      };
    }

    if (amount > gateway.max_amount) {
      return {
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        status: `حداکثر ${gateway.max_amount.toLocaleString("fa-IR")} تومان`,
        icon: ExclamationTriangleIcon,
      };
    }

    return {
      color: "text-green-600",
      bg: "bg-white",
      border: "border-gray-200",
      status: "آماده پرداخت",
      icon: CheckCircleIcon,
    };
  };

  // Calculate final amount including fees
  const getFinalAmount = (gateway: PaymentGatewayInfo) => {
    return amount + gateway.gateway_fee;
  };

  // Check if gateway is selectable
  const isGatewaySelectable = (gateway: PaymentGatewayInfo) => {
    if (!gateway.is_available || !gateway.is_healthy) return false;
    if (amount < gateway.min_amount || amount > gateway.max_amount) return false;
    if (gateway.type === "wallet" && !walletSufficient) return false;
    return true;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <ArrowPathIcon className="h-8 w-8 text-primary animate-spin" />
            <p className="text-text-secondary">در حال بارگذاری درگاه‌های پرداخت...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-1">خطا در بارگذاری درگاه‌ها</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">انتخاب روش پرداخت</h3>
        <div className="text-sm text-text-secondary">
          مبلغ: {amount.toLocaleString("fa-IR")} تومان
        </div>
      </div>

      {/* Wallet Balance Info */}
      {showWalletBalance && (
        <div className="bg-background-secondary rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-text-primary">موجودی کیف پول</span>
            </div>
            <div className="flex items-center gap-2">
              {walletLoading ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin text-text-secondary" />
              ) : (
                <>
                  <span className="font-bold text-text-primary">
                    {walletBalance.toLocaleString("fa-IR")} تومان
                  </span>
                  {walletSufficient ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gateway List */}
      <div className="space-y-3">
        {gateways.map((gateway) => {
          const status = getGatewayStatus(gateway);
          const isSelected = selectedGateway === gateway.type;
          const isSelectable = isGatewaySelectable(gateway);
          const finalAmount = getFinalAmount(gateway);

          return (
            <div
              key={gateway.type}
              className={`
                relative border rounded-lg transition-all duration-200 cursor-pointer
                ${isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : status.border
                }
                ${isSelectable && !disabled
                  ? "hover:shadow-md hover:border-primary/50"
                  : "cursor-not-allowed opacity-60"
                }
                ${status.bg}
              `}
              onClick={() => handleGatewaySelect(gateway)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  {/* Gateway Info */}
                  <div className="flex items-start gap-3 flex-1">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${gateway.color}15`, color: gateway.color }}
                    >
                      <GatewayIcon type={gateway.type} className="h-6 w-6" />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-text-primary">{gateway.display_name}</h4>
                        {isSelected && (
                          <CheckCircleIcon className="h-4 w-4 text-primary" />
                        )}
                      </div>

                      <p className="text-sm text-text-secondary mb-2">{gateway.description}</p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {gateway.features.instant_confirmation && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            <ClockIcon className="h-3 w-3" />
                            تأیید فوری
                          </span>
                        )}
                        {gateway.features.supports_refund && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            <ShieldCheckIcon className="h-3 w-3" />
                            برگشت‌پذیر
                          </span>
                        )}
                        {gateway.features.supports_installment && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            <CreditCardIcon className="h-3 w-3" />
                            اقساطی
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <status.icon className={`h-4 w-4 ${status.color}`} />
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Fee */}
                  <div className="text-left flex-shrink-0">
                    <div className="text-sm text-text-secondary mb-1">مبلغ نهایی</div>
                    <div className="font-bold text-text-primary">
                      {finalAmount.toLocaleString("fa-IR")} تومان
                    </div>
                    {gateway.gateway_fee > 0 && (
                      <div className="text-xs text-text-secondary">
                        شامل {gateway.gateway_fee.toLocaleString("fa-IR")} تومان کارمزد
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info for Wallet */}
                {gateway.type === "wallet" && !walletSufficient && (
                  <div className="mt-4 pt-3 border-t border-red-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600">
                        برای استفاده از کیف پول، ابتدا آن را شارژ کنید
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          refreshWallet();
                        }}
                        className="text-primary hover:text-primary-dark underline"
                      >
                        به‌روزرسانی موجودی
                      </button>
                    </div>
                  </div>
                )}

                {/* Gateway Limits Info */}
                {(amount < gateway.min_amount || amount > gateway.max_amount) && (
                  <div className="mt-4 pt-3 border-t border-orange-200">
                    <div className="flex items-start gap-2 text-sm text-orange-700">
                      <InformationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        محدوده پرداخت این درگاه: {gateway.min_amount.toLocaleString("fa-IR")} تا {gateway.max_amount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Gateways Available */}
      {gateways.length === 0 && !isLoading && (
        <div className="bg-background-secondary rounded-lg p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <h3 className="font-medium text-text-primary mb-2">
            هیچ روش پرداختی در دسترس نیست
          </h3>
          <p className="text-sm text-text-secondary">
            لطفاً بعداً تلاش کنید یا با پشتیبانی تماس بگیرید
          </p>
        </div>
      )}

      {/* Payment Security Notice */}
      <div className="bg-background-secondary border border-accent/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-text-primary mb-1">امنیت پرداخت</h4>
            <p className="text-xs text-text-secondary">
              تمامی پرداخت‌ها با استفاده از پروتکل‌های امنیتی بانک‌ها و با رمزنگاری SSL انجام می‌شود.
              اطلاعات کارت شما در سیستم ما ذخیره نمی‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewaySelector;
