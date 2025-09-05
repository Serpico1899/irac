"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import RevenueCharts from "./RevenueCharts";
import UserAnalytics from "./UserAnalytics";
import ExportTools from "./ExportTools";

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  weeklyOrders: number;
  dailyOrders: number;
  totalUsers: number;
  monthlyUsers: number;
  weeklyUsers: number;
  dailyUsers: number;
  averageOrderValue: number;
  conversionRate: number;
  refundRate: number;
}

interface RevenueBreakdown {
  courses: number;
  workshops: number;
  products: number;
  walletTopups: number;
}

interface RecentTransaction {
  id: string;
  type: "course" | "workshop" | "product" | "wallet_topup" | "refund";
  amount: number;
  user_name: string;
  user_email: string;
  description: string;
  status: "completed" | "pending" | "failed" | "refunded";
  created_at: string;
}

const FinancialDashboard: React.FC = () => {
  const t = useTranslations("analytics");
  const { user } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    weeklyOrders: 0,
    dailyOrders: 0,
    totalUsers: 0,
    monthlyUsers: 0,
    weeklyUsers: 0,
    dailyUsers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    refundRate: 0,
  });

  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown>({
    courses: 0,
    workshops: 0,
    products: 0,
    walletTopups: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod, selectedDate]);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real app, this would call APIs
      const mockMetrics: FinancialMetrics = {
        totalRevenue: 485750000, // 485,750,000 IRR
        monthlyRevenue: 125000000,
        weeklyRevenue: 28500000,
        dailyRevenue: 4200000,
        totalOrders: 1247,
        monthlyOrders: 324,
        weeklyOrders: 89,
        dailyOrders: 12,
        totalUsers: 2150,
        monthlyUsers: 187,
        weeklyUsers: 45,
        dailyUsers: 8,
        averageOrderValue: 2850000,
        conversionRate: 12.5,
        refundRate: 2.1,
      };

      const mockBreakdown: RevenueBreakdown = {
        courses: 45000000,
        workshops: 35000000,
        products: 25000000,
        walletTopups: 20000000,
      };

      const mockTransactions: RecentTransaction[] = [
        {
          id: "txn_001",
          type: "course",
          amount: 3500000,
          user_name: "محمد احمدی",
          user_email: "mohammad.ahmadi@example.com",
          description: "خرید دوره برنامه‌نویسی پیشرفته",
          status: "completed",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "txn_002",
          type: "workshop",
          amount: 2500000,
          user_name: "فاطمه کریمی",
          user_email: "fateme.karimi@example.com",
          description: "ثبت‌نام کارگاه طراحی UI/UX",
          status: "completed",
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "txn_003",
          type: "product",
          amount: 850000,
          user_name: "علی رضایی",
          user_email: "ali.rezaei@example.com",
          description: "خرید کتاب الگوهای طراحی",
          status: "completed",
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "txn_004",
          type: "wallet_topup",
          amount: 5000000,
          user_name: "زهرا موسوی",
          user_email: "zahra.mousavi@example.com",
          description: "شارژ کیف پول",
          status: "completed",
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "txn_005",
          type: "refund",
          amount: -1500000,
          user_name: "حسن نوری",
          user_email: "hasan.nouri@example.com",
          description: "بازگشت وجه کارگاه",
          status: "completed",
          created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setMetrics(mockMetrics);
      setRevenueBreakdown(mockBreakdown);
      setRecentTransactions(mockTransactions);
    } catch (error) {
      console.error("Failed to load financial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(Math.abs(amount)) + " " + t("common.currency");
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(1) + "%";
  };

  const getMetricByPeriod = (metricName: string) => {
    const periodMap = {
      daily: "daily",
      weekly: "weekly",
      monthly: "monthly",
      yearly: "total"
    };
    const period = periodMap[selectedPeriod];
    return metrics[`${period}${metricName.charAt(0).toUpperCase() + metricName.slice(1)}` as keyof FinancialMetrics];
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "course":
        return "📚";
      case "workshop":
        return "🎯";
      case "product":
        return "📦";
      case "wallet_topup":
        return "💰";
      case "refund":
        return "↩️";
      default:
        return "💳";
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      course: t("dashboard.transaction.types.course"),
      workshop: t("dashboard.transaction.types.workshop"),
      product: t("dashboard.transaction.types.product"),
      wallet_topup: t("dashboard.transaction.types.walletTopup"),
      refund: t("dashboard.transaction.types.refund"),
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "refunded":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: t("dashboard.transaction.status.completed"),
      pending: t("dashboard.transaction.status.pending"),
      failed: t("dashboard.transaction.status.failed"),
      refunded: t("dashboard.transaction.status.refunded"),
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return t("dashboard.time.minutesAgo", { count: diffInMinutes });
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return t("dashboard.time.hoursAgo", { count: diffInHours });
    }

    return date.toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("dashboard.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Period Selection */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t(`dashboard.periods.${period}`)}
              </button>
            ))}
          </div>

          <ExportTools />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Revenue */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.metrics.revenue")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(getMetricByPeriod("revenue") as number)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-green-600 font-medium">+12.5%</span>
            <span className="text-sm text-gray-500 mr-2">
              {t("dashboard.metrics.fromPrevious")}
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.metrics.orders")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(getMetricByPeriod("orders") as number).toLocaleString("fa-IR")}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📦</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-blue-600 font-medium">+8.2%</span>
            <span className="text-sm text-gray-500 mr-2">
              {t("dashboard.metrics.fromPrevious")}
            </span>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.metrics.users")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(getMetricByPeriod("users") as number).toLocaleString("fa-IR")}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">👥</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-purple-600 font-medium">+15.3%</span>
            <span className="text-sm text-gray-500 mr-2">
              {t("dashboard.metrics.fromPrevious")}
            </span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.metrics.averageOrderValue")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(metrics.averageOrderValue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">📊</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-orange-600 font-medium">+3.7%</span>
            <span className="text-sm text-gray-500 mr-2">
              {t("dashboard.metrics.fromPrevious")}
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("dashboard.breakdown.title")}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 text-2xl">📚</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {t("dashboard.breakdown.courses")}
            </p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(revenueBreakdown.courses)}
            </p>
            <p className="text-xs text-gray-500">
              {formatPercentage((revenueBreakdown.courses / (revenueBreakdown.courses + revenueBreakdown.workshops + revenueBreakdown.products + revenueBreakdown.walletTopups)) * 100)}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 text-2xl">🎯</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {t("dashboard.breakdown.workshops")}
            </p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(revenueBreakdown.workshops)}
            </p>
            <p className="text-xs text-gray-500">
              {formatPercentage((revenueBreakdown.workshops / (revenueBreakdown.courses + revenueBreakdown.workshops + revenueBreakdown.products + revenueBreakdown.walletTopups)) * 100)}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 text-2xl">📦</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {t("dashboard.breakdown.products")}
            </p>
            <p className="text-lg font-bold text-purple-600">
              {formatCurrency(revenueBreakdown.products)}
            </p>
            <p className="text-xs text-gray-500">
              {formatPercentage((revenueBreakdown.products / (revenueBreakdown.courses + revenueBreakdown.workshops + revenueBreakdown.products + revenueBreakdown.walletTopups)) * 100)}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-yellow-600 text-2xl">💳</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {t("dashboard.breakdown.walletTopups")}
            </p>
            <p className="text-lg font-bold text-yellow-600">
              {formatCurrency(revenueBreakdown.walletTopups)}
            </p>
            <p className="text-xs text-gray-500">
              {formatPercentage((revenueBreakdown.walletTopups / (revenueBreakdown.courses + revenueBreakdown.workshops + revenueBreakdown.products + revenueBreakdown.walletTopups)) * 100)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueCharts />
        <UserAnalytics />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("dashboard.transactions.title")}
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.transactions.viewAll")}
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">
                    {getTransactionTypeIcon(transaction.type)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.user_name} • {getTransactionTypeLabel(transaction.type)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1">
                      <p className={`text-sm font-medium ${
                        transaction.amount < 0 ? "text-red-600" : "text-green-600"
                      }`}>
                        {transaction.amount < 0 ? "-" : "+"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(transaction.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Conversion Rate */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.metrics.conversionRate")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPercentage(metrics.conversionRate)}
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 text-xl">🎯</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${metrics.conversionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Refund Rate */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.metrics.refundRate")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPercentage(metrics.refundRate)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-xl">↩️</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full"
              style={{ width: `${metrics.refundRate}%` }}
            ></div>
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.metrics.satisfaction")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                4.8/5.0
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⭐</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-sm ${star <= 4 ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ⭐
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500 mr-2">
              (1,247 {t("dashboard.metrics.reviews")})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
