"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FinancialDashboard from "@/components/organisms/Analytics/FinancialDashboard";
import RevenueCharts from "@/components/organisms/Analytics/RevenueCharts";
import UserAnalytics from "@/components/organisms/Analytics/UserAnalytics";
import ExportTools from "@/components/organisms/Analytics/ExportTools";
import {
  ArrowLeftIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsFilters {
  period: "7d" | "30d" | "90d" | "1y" | "all";
  dateFrom: string;
  dateTo: string;
  category: "all" | "workshops" | "products" | "courses";
}

export default function AdminAnalyticsPage() {
  const t = useTranslations("admin");
  const { isAuthenticated, userLevel, user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "revenue" | "users" | "export"
  >("overview");
  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: "30d",
    dateFrom: "",
    dateTo: "",
    category: "all",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Check admin authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/admin/analytics");
      return;
    }

    if (userLevel !== "Manager" && userLevel !== "Ghost") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, userLevel, router]);

  // Set default date range based on period
  useEffect(() => {
    const now = new Date();
    const fromDate = new Date();

    switch (filters.period) {
      case "7d":
        fromDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        fromDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        fromDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        fromDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        fromDate.setFullYear(2020); // All time
    }

    if (filters.period !== "all") {
      setFilters((prev) => ({
        ...prev,
        dateFrom: fromDate.toISOString().split("T")[0],
        dateTo: now.toISOString().split("T")[0],
      }));
    }
  }, [filters.period]);

  // Show loading if not authenticated yet
  if (!isAuthenticated || (userLevel !== "Manager" && userLevel !== "Ghost")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "نمای کلی", icon: ChartBarIcon },
    { id: "revenue", label: "درآمد", icon: CurrencyDollarIcon },
    { id: "users", label: "کاربران", icon: UsersIcon },
    { id: "export", label: "خروجی", icon: ArrowDownTrayIcon },
  ];

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
      default:
        return "همه زمان‌ها";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                تحلیل‌ها و آمار
              </h1>
              <p className="text-sm text-gray-600">گزارش‌های تفصیلی</p>
            </div>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FunnelIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  تحلیل‌ها و آمار
                </h1>
              </div>
              <p className="text-gray-600">
                گزارش‌های تفصیلی عملکرد سیستم - {getPeriodLabel(filters.period)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-4 w-4" />
                <span className="text-sm">فیلترها</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {isFilterOpen && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  بازه زمانی
                </label>
                <select
                  value={filters.period}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      period: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="7d">۷ روز گذشته</option>
                  <option value="30d">۳۰ روز گذشته</option>
                  <option value="90d">۳ ماه گذشته</option>
                  <option value="1y">یک سال گذشته</option>
                  <option value="all">همه زمان‌ها</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دسته‌بندی
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">همه دسته‌ها</option>
                  <option value="workshops">کارگاه‌ها</option>
                  <option value="products">محصولات</option>
                  <option value="courses">دوره‌ها</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  از تاریخ
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تا تاریخ
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Mobile First */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <FinancialDashboard />
            </div>
          )}

          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    تحلیل درآمد
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    نمودارها و آمار درآمد سیستم
                  </p>
                </div>
                <div className="p-0">
                  <RevenueCharts />
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    تحلیل کاربران
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    رفتار و آمار کاربران سیستم
                  </p>
                </div>
                <div className="p-0">
                  <UserAnalytics />
                </div>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    خروجی گزارش‌ها
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    دانلود و صادرات گزارش‌های تفصیلی
                  </p>
                </div>
                <div className="p-0">
                  <ExportTools />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer - Mobile */}
      <div className="lg:hidden bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <EyeIcon className="h-4 w-4" />
              <span>بازدید</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">۲,۳۴۵</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>درآمد</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">۱۲.۵M</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <UsersIcon className="h-4 w-4" />
              <span>کاربران</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">۸۹۶</p>
          </div>
        </div>
      </div>
    </div>
  );
}
