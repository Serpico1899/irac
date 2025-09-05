"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@/context/WalletContext";
import {
  walletApi,
  default as WalletApiService,
} from "@/services/wallet/walletApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
} from "lucide-react";

interface WalletStatsProps {
  showRecentTransactions?: boolean;
  className?: string;
}

export function WalletStats({
  showRecentTransactions = true,
  className = "",
}: WalletStatsProps) {
  const t = useTranslations();
  const { state, fetchStats, clearError } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!state.stats && !state.isLoading) {
      fetchStats();
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setIsRefreshing(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("fa-IR");
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: string;
    trend?: "up" | "down" | "neutral";
  }) => (
    <Card>
      <CardContent className="p-4 xs:p-6">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`p-2 xs:p-3 rounded-lg ${color} flex-shrink-0`}>
              <Icon className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg xs:text-2xl font-bold text-gray-900 break-all">
                {typeof value === "number" ? formatNumber(value) : value}
              </div>
              <div className="text-xs xs:text-sm text-gray-600 leading-relaxed">
                {title}
              </div>
            </div>
          </div>
          {trend && (
            <div className="flex xs:block self-end xs:self-auto">
              {trend === "up" && (
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
              {trend === "down" && (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              {trend === "neutral" && (
                <Activity className="h-4 w-4 text-gray-600" />
              )}
            </div>
          )}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-3 leading-relaxed">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (state.error) {
    return (
      <Card className={className}>
        <CardContent className="p-4 xs:p-6">
          <div className="flex items-start gap-2 text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm xs:text-base leading-relaxed">
              خطا در بارگذاری آمار کیف پول
            </span>
          </div>
          <div className="text-sm text-red-500 mt-3 leading-relaxed">
            {state.error}
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="mt-4 w-full xs:w-auto"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <RefreshCw className="h-4 w-4 ml-2" />
            )}
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state.isLoading && !state.stats) {
    return (
      <Card className={className}>
        <CardContent className="p-4 xs:p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-gray-600 text-center">
              در حال بارگذاری آمار...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!state.stats) {
    return (
      <Card className={className}>
        <CardContent className="p-4 xs:p-6">
          <div className="text-center text-gray-500 py-8">
            <BarChart3 className="h-16 w-16 mx-auto mb-6 text-gray-400" />
            <p className="text-sm leading-relaxed">
              آمار کیف پول در دسترس نیست
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = state.stats;

  return (
    <div className={`space-y-4 xs:space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-lg xs:text-xl">آمار کیف پول</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={state.isLoading || isRefreshing}
              className="h-8 w-8 p-0 self-end xs:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  state.isLoading || isRefreshing ? "animate-spin" : ""
                }`}
              />
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Current Balance */}
      <Card>
        <CardContent className="p-4 xs:p-6">
          <div className="text-center">
            <div className="text-2xl xs:text-3xl font-bold text-primary mb-3 break-all">
              {WalletApiService.formatCurrency(stats.balance, stats.currency)}
            </div>
            <div className="text-sm xs:text-base text-gray-600 mb-4 leading-relaxed">
              موجودی فعلی کیف پول
            </div>
            <Badge
              className={`text-xs xs:text-sm ${
                stats.status === "active"
                  ? "bg-green-100 text-green-800"
                  : stats.status === "suspended"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {stats.status === "active"
                ? "فعال"
                : stats.status === "suspended"
                  ? "تعلیق شده"
                  : "مسدود شده"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
        <StatCard
          title="کل واریزی‌ها"
          value={WalletApiService.formatCurrency(
            stats.totalDeposits.total,
            stats.currency,
          )}
          subtitle={`${formatNumber(stats.totalDeposits.count)} تراکنش`}
          icon={TrendingUp}
          color="bg-green-500"
          trend="up"
        />

        <StatCard
          title="کل برداشت‌ها"
          value={WalletApiService.formatCurrency(
            stats.totalWithdrawals.total,
            stats.currency,
          )}
          subtitle={`${formatNumber(stats.totalWithdrawals.count)} تراکنش`}
          icon={TrendingDown}
          color="bg-red-500"
          trend="down"
        />
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader className="pb-3 px-4 xs:px-6">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-lg xs:text-xl">خلاصه فعالیت</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 xs:px-6 pb-4 xs:pb-6">
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl xs:text-2xl font-bold text-gray-900">
                {formatNumber(
                  stats.totalDeposits.count + stats.totalWithdrawals.count,
                )}
              </div>
              <div className="text-sm text-gray-600">کل تراکنش‌ها</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-xl xs:text-2xl font-bold text-blue-900 break-all">
                {WalletApiService.formatCurrency(
                  stats.totalDeposits.total - stats.totalWithdrawals.total,
                  stats.currency,
                )}
              </div>
              <div className="text-sm text-blue-600">خالص جابجایی</div>
            </div>

            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-xl xs:text-2xl font-bold text-primary">
                {stats.totalDeposits.total > 0
                  ? Math.round(
                      ((stats.totalDeposits.total -
                        stats.totalWithdrawals.total) /
                        stats.totalDeposits.total) *
                        100,
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-primary">نرخ حفظ موجودی</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {showRecentTransactions && stats.recentTransactions.length > 0 && (
        <Card>
          <CardHeader className="pb-3 px-4 xs:px-6">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-lg xs:text-xl">آخرین تراکنش‌ها</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 xs:px-6 pb-4 xs:pb-6">
            {stats.recentTransactions.map((transaction) => {
              const isCredit = ![
                "withdrawal",
                "purchase",
                "transfer_out",
                "penalty",
              ].includes(transaction.type);

              return (
                <div
                  key={transaction._id}
                  className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`p-2 rounded-full ${
                        isCredit
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm leading-relaxed truncate">
                        {transaction.description ||
                          WalletApiService.getTransactionTypeLabel(
                            transaction.type,
                          )}
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        {new Date(transaction.created_at).toLocaleDateString(
                          "fa-IR",
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right xs:text-left self-end xs:self-auto flex-shrink-0">
                    <div
                      className={`font-medium text-base xs:text-sm break-all ${
                        isCredit ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isCredit ? "+" : "-"}
                      {WalletApiService.formatCurrency(
                        transaction.amount,
                        transaction.currency,
                      )}
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      {WalletApiService.getTransactionStatusLabel(
                        transaction.status,
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-lg xs:text-xl">عملیات سریع</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-12 text-sm xs:text-base"
              asChild
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>شارژ کیف پول</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-12 text-sm xs:text-base"
              asChild
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="hidden xs:inline">مشاهده تاریخچه کامل</span>
                <span className="xs:hidden">تاریخچه کامل</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WalletStats;
