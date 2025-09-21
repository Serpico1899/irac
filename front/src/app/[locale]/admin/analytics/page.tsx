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
            <div className="flex flex-col gap-6">
              <FinancialDashboard />

              {/* Quick Overview Cards */}
              <div className="flex flex-wrap gap-6">
                <div className="flex flex-col flex-1 min-w-60 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">کاربران فعال امروز</h3>
                    <UsersIcon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold mb-2">156</p>
                  <p className="text-indigo-100 text-sm">+12% از دیروز</p>
                </div>

                <div className="flex flex-col flex-1 min-w-60 bg-gradient-to-r from-orange-400 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">نرخ تکمیل دوره</h3>
                    <AcademicCapIcon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold mb-2">78.5%</p>
                  <p className="text-orange-100 text-sm">+5.2% از ماه قبل</p>
                </div>

                <div className="flex flex-col flex-1 min-w-60 bg-gradient-to-r from-teal-400 to-teal-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">رزرو فضاهای کاری</h3>
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold mb-2">42</p>
                  <p className="text-teal-100 text-sm">امروز</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "revenue" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    تحلیل درآمد تفصیلی
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    نمودارها و آمار کامل درآمد سیستم
                  </p>
                </div>
                <div className="p-6">
                  <RevenueCharts />
                </div>
              </div>

              {/* Revenue Performance Metrics */}
              <div className="flex flex-wrap gap-6">
                <div className="flex flex-col flex-1 min-w-80 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    عملکرد درآمد بر اساس دسته
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">دوره‌های آنلاین</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        45.2M تومان
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="font-medium">کارگاه‌های حضوری</span>
                      </div>
                      <span className="font-bold text-green-600">
                        32.8M تومان
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <span className="font-medium">محصولات دیجیتال</span>
                      </div>
                      <span className="font-bold text-purple-600">
                        18.7M تومان
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-1 min-w-80 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    روند درآمد ماهانه
                  </h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">فروردین</span>
                      <span className="font-medium">38.5M</span>
                    </div>
                    <div className="flex items-center justify-between p-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">اردیبهشت</span>
                      <span className="font-medium">42.1M</span>
                    </div>
                    <div className="flex items-center justify-between p-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">خرداد</span>
                      <span className="font-medium">45.8M</span>
                    </div>
                    <div className="flex items-center justify-between p-2">
                      <span className="text-sm text-gray-600">تیر</span>
                      <span className="font-medium text-green-600">
                        48.2M ↗
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    تحلیل جامع کاربران
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    رفتار، مشارکت و آمار تفصیلی کاربران سیستم
                  </p>
                </div>
                <div className="p-6">
                  <UserAnalytics />
                </div>
              </div>

              {/* User Engagement Metrics */}
              <div className="flex flex-wrap gap-6">
                <div className="flex flex-col flex-1 min-w-80 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    کاربران برتر
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold">
                          1
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium">محمد احمدی</span>
                          <span className="text-sm text-gray-500">
                            12 دوره تکمیل شده
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">
                        15.2M تومان
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-silver text-white rounded-full flex items-center justify-center font-bold">
                          2
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium">فاطمه کریمی</span>
                          <span className="text-sm text-gray-500">
                            9 دوره تکمیل شده
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">
                        8.7M تومان
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-1 min-w-80 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    آمار مشارکت
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">نرخ بازگشت کاربران</span>
                      <span className="font-bold text-blue-600">72.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">متوسط زمان حضور</span>
                      <span className="font-bold text-purple-600">
                        45 دقیقه
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">تعداد کل ثبت‌نام‌ها</span>
                      <span className="font-bold text-green-600">1,247</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    خروجی و صادرات گزارش‌ها
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    دانلود، ایمیل و برنامه‌ریزی گزارش‌های تفصیلی سیستم
                  </p>
                </div>
                <div className="p-6">
                  <ExportTools />
                </div>
              </div>

              {/* Recent Exports */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  آخرین گزارش‌های صادر شده
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowDownTrayIcon className="w-5 h-5 text-green-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">گزارش درآمد ماهانه</span>
                        <span className="text-sm text-gray-500">
                          PDF • 2.4 مگابایت • 10 دقیقه پیش
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      دانلود
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowDownTrayIcon className="w-5 h-5 text-green-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">آمار کاربران فعال</span>
                        <span className="text-sm text-gray-500">
                          Excel • 1.8 مگابایت • 1 ساعت پیش
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      دانلود
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer - Mobile */}
      <div className="lg:hidden bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <EyeIcon className="h-4 w-4" />
              <span>بازدید امروز</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">۲,۸۹۷</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>درآمد ماهانه</span>
            </div>
            <p className="text-lg font-semibold text-green-600">۴۸.۲M</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <UsersIcon className="h-4 w-4" />
              <span>کاربران فعال</span>
            </div>
            <p className="text-lg font-semibold text-blue-600">۱,۴۲۳</p>
          </div>
        </div>
      </div>
    </div>
  );
}
