"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  RefreshIcon,
} from "@heroicons/react/24/outline";

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: any[];
  revenueGrowth: number;
  revenueByCategory: any[];
  topRevenueItems: any[];
  refundsTotal: number;
  netRevenue: number;
  averageOrderValue: number;
  totalTransactions: number;
  paymentMethodStats: any[];
  period: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

interface FilterOptions {
  period: "7d" | "30d" | "90d" | "1y" | "all";
  category: "all" | "workshops" | "products" | "courses" | "bookings";
  currency: "IRR" | "USD";
}

const FinancialDashboard: React.FC = () => {
  const t = useTranslations("analytics");
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    period: "30d",
    category: "all",
    currency: "IRR",
  });

  useEffect(() => {
    loadFinancialData();
  }, [filters]);

  const loadFinancialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analytics/getRevenueDashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          details: {
            period: filters.period,
            category: filters.category,
            currency: filters.currency,
            includeRefunds: true,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.message || "خطا در دریافت داده‌های مالی");
      }
    } catch (err) {
      console.error("Error loading financial data:", err);
      setError("خطا در اتصال به سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (filters.currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "7d":
        return "۷ روز گذشته";
      case "30d":
        return "۳۰ روز گذشته";
      case "90d":
        return "۳ ماه گذشته";
      case "1y":
        return "یک سال گذشته";
      case "all":
        return "همه زمان‌ها";
      default:
        return "۳۰ روز گذشته";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-text-secondary">
          <RefreshIcon className="h-6 w-6 animate-spin" />
          <span>در حال بارگذاری داده‌های مالی...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={loadFinancialData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-text-secondary">داده‌ای یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-background rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-text-secondary" />
          <span className="text-sm font-medium text-text">
            {getPeriodLabel(filters.period)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter */}
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, period: e.target.value as any }))
            }
            className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="7d">۷ روز گذشته</option>
            <option value="30d">۳۰ روز گذشته</option>
            <option value="90d">۳ ماه گذشته</option>
            <option value="1y">یک سال گذشته</option>
            <option value="all">همه زمان‌ها</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category: e.target.value as any,
              }))
            }
            className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">همه دسته‌ها</option>
            <option value="courses">دوره‌ها</option>
            <option value="workshops">کارگاه‌ها</option>
            <option value="products">محصولات</option>
            <option value="bookings">رزرو فضاها</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadFinancialData}
            className="p-2 border border-border rounded-lg hover:bg-gray-50 transition-colors"
            title="به‌روزرسانی داده‌ها"
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="flex flex-wrap gap-6">
        {/* Total Revenue */}
        <div className="flex flex-col flex-1 min-w-60 bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">درآمد کل</h3>
            <CurrencyDollarIcon className="w-7 h-7" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <div className="flex items-center gap-1 text-green-100">
            {metrics.revenueGrowth >= 0 ? (
              <TrendingUpIcon className="w-4 h-4" />
            ) : (
              <TrendingDownIcon className="w-4 h-4" />
            )}
            <span className="text-sm">
              {metrics.revenueGrowth >= 0 ? "+" : ""}
              {metrics.revenueGrowth}% از دوره قبل
            </span>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="flex flex-col flex-1 min-w-60 bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">درآمد خالص</h3>
            <ChartBarIcon className="w-7 h-7" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {formatCurrency(metrics.netRevenue)}
          </p>
          <p className="text-blue-100 text-sm">
            بازگشت‌ها: {formatCurrency(metrics.refundsTotal)}
          </p>
        </div>

        {/* Total Transactions */}
        <div className="flex flex-col flex-1 min-w-60 bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">کل تراکنش‌ها</h3>
            <AcademicCapIcon className="w-7 h-7" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {metrics.totalTransactions.toLocaleString()}
          </p>
          <p className="text-purple-100 text-sm">
            میانگین: {formatCurrency(metrics.averageOrderValue)}
          </p>
        </div>
      </div>

      {/* Revenue by Category */}
      {metrics.revenueByCategory && metrics.revenueByCategory.length > 0 && (
        <div className="bg-background rounded-lg border border-border p-6">
          <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            درآمد بر اساس دسته‌بندی
          </h3>
          <div className="flex flex-wrap gap-4">
            {metrics.revenueByCategory.map((category, index) => (
              <div
                key={category.category || index}
                className="flex flex-col flex-1 min-w-48 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h4 className="font-semibold text-text mb-2">
                  {category.category === "course_enrollment"
                    ? "دوره‌ها"
                    : category.category === "workshop_enrollment"
                      ? "کارگاه‌ها"
                      : category.category === "product_purchase"
                        ? "محصولات"
                        : category.category === "space_booking"
                          ? "رزرو فضاها"
                          : category.category}
                </h4>
                <p className="text-2xl font-bold text-primary mb-1">
                  {formatCurrency(category.revenue)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {category.count} تراکنش
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {category.percentage?.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Revenue Items */}
      {metrics.topRevenueItems && metrics.topRevenueItems.length > 0 && (
        <div className="bg-background rounded-lg border border-border p-6">
          <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <TrendingUpIcon className="w-6 h-6" />
            پردرآمدترین موارد
          </h3>
          <div className="flex flex-col gap-3">
            {metrics.topRevenueItems.slice(0, 5).map((item, index) => (
              <div
                key={item.itemId || index}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-text">
                      {item.name || "نام نامشخص"}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {item.type === "course_enrollment"
                        ? "دوره"
                        : item.type === "workshop_enrollment"
                          ? "کارگاه"
                          : item.type === "product_purchase"
                            ? "محصول"
                            : item.type === "space_booking"
                              ? "رزرو فضا"
                              : item.type}{" "}
                      • {item.enrollments} ثبت‌نام
                    </p>
                  </div>
                </div>
                <span className="font-bold text-green-600 text-lg">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {metrics.paymentMethodStats && metrics.paymentMethodStats.length > 0 && (
        <div className="bg-background rounded-lg border border-border p-6">
          <h3 className="text-xl font-bold text-text mb-4">روش‌های پرداخت</h3>
          <div className="flex flex-wrap gap-4">
            {metrics.paymentMethodStats.map((method, index) => (
              <div
                key={method.method || index}
                className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200 min-w-36"
              >
                <h4 className="font-semibold text-text mb-2">
                  {method.method === "gateway"
                    ? "درگاه پرداخت"
                    : method.method === "wallet"
                      ? "کیف پول"
                      : method.method === "credit"
                        ? "اعتبار"
                        : method.method || "نامشخص"}
                </h4>
                <p className="text-lg font-bold text-primary mb-1">
                  {formatCurrency(method.revenue)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {method.count} تراکنش
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {method.percentage?.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Timeline */}
      {metrics.monthlyRevenue && metrics.monthlyRevenue.length > 0 && (
        <div className="bg-background rounded-lg border border-border p-6">
          <h3 className="text-xl font-bold text-text mb-4">
            روند درآمد در طول زمان
          </h3>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {metrics.monthlyRevenue.map((monthData, index) => (
              <div
                key={monthData.month || index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <span className="font-medium text-text">{monthData.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">
                    {monthData.transactions} تراکنش
                  </span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(monthData.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;
