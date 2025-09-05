"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@/context/WalletContext";
import {
  walletApi,
  default as WalletApiService,
} from "@/services/wallet/walletApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface WalletBalanceProps {
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function WalletBalance({
  showActions = true,
  compact = false,
  className = "",
}: WalletBalanceProps) {
  const t = useTranslations();
  const { state, fetchBalance, initiateCharge, clearError } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCharging, setIsCharging] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalance();
    setIsRefreshing(false);
  };

  const handleCharge = async () => {
    setIsCharging(true);
    clearError();

    try {
      // In a real implementation, you would show a modal to enter amount
      // For now, we'll use a default amount
      const amount = 50000; // 50,000 Toman default
      const description = "شارژ کیف پول";

      const paymentUrl = await initiateCharge(amount, description);

      if (paymentUrl) {
        // Redirect to payment gateway
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Charge initiation failed:", error);
    } finally {
      setIsCharging(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "suspended":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "blocked":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "فعال",
      suspended: "تعلیق شده",
      blocked: "مسدود شده",
    };
    return labels[status] || status;
  };

  if (compact) {
    return (
      <div
        className={`flex flex-col xs:flex-row items-start xs:items-center gap-2 w-full ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Wallet className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-medium text-sm xs:text-base truncate">
            {state.balance
              ? WalletApiService.formatCurrency(
                  state.balance.balance,
                  state.balance.currency,
                )
              : "---"}
          </span>
        </div>
        {showActions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={state.isLoading || isRefreshing}
            className="self-end xs:self-auto"
          >
            <RefreshCw
              className={`h-3 w-3 ${state.isLoading || isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-lg xs:text-xl">موجودی کیف پول</span>
          </div>

          {showActions && (
            <div className="flex items-center gap-2 self-end xs:self-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={state.isLoading || isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${state.isLoading || isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
        {state.error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700 leading-relaxed">
              {state.error}
            </span>
          </div>
        )}

        {state.isLoading && !state.balance ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-gray-600 text-center">
              در حال بارگذاری...
            </span>
          </div>
        ) : state.balance ? (
          <div className="space-y-4">
            {/* Balance Display */}
            <div className="text-center py-6 px-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2 break-all">
                {WalletApiService.formatCurrency(
                  state.balance.balance,
                  state.balance.currency,
                )}
              </div>
              <div className="text-sm text-gray-600">موجودی کیف پول</div>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
              <span className="text-sm text-gray-600">وضعیت کیف پول:</span>
              <Badge
                className={`flex items-center gap-1 self-start xs:self-auto ${getStatusColor(state.balance.status)}`}
              >
                {getStatusIcon(state.balance.status)}
                <span className="text-xs xs:text-sm">
                  {getStatusLabel(state.balance.status)}
                </span>
              </Badge>
            </div>

            {/* Last Updated */}
            {state.lastUpdated && (
              <div className="text-xs text-gray-500 text-center px-2 leading-relaxed">
                آخرین بروزرسانی:{" "}
                <span className="block xs:inline mt-1 xs:mt-0">
                  {new Date(state.lastUpdated).toLocaleString("fa-IR")}
                </span>
              </div>
            )}

            {/* Actions */}
            {showActions &&
              state.balance.status === "active" &&
              state.balance.is_active && (
                <div className="pt-2">
                  <Button
                    onClick={handleCharge}
                    disabled={isCharging || state.isLoading}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {isCharging ? (
                      <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 ml-2" />
                    )}
                    شارژ کیف پول
                  </Button>
                </div>
              )}

            {/* Inactive Wallet Message */}
            {(!state.balance.is_active ||
              state.balance.status !== "active") && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-yellow-700 leading-relaxed">
                    {state.balance.status === "suspended"
                      ? "کیف پول شما موقتاً تعلیق شده است."
                      : state.balance.status === "blocked"
                        ? "کیف پول شما مسدود شده است. لطفاً با پشتیبانی تماس بگیرید."
                        : "کیف پول شما غیرفعال است."}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 px-4 text-gray-500">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">کیف پول یافت نشد</p>
            <p className="text-xs text-gray-400 mt-2">
              کیف پول به طور خودکار ایجاد خواهد شد
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WalletBalance;
