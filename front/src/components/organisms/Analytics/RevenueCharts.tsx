"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  RefreshIcon,
} from "@heroicons/react/24/outline";

interface RevenueChartData {
  totalRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  revenueGrowth: number;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    count: number;
    percentage: number;
  }>;
  topRevenueItems: Array<{
    itemId: string;
    name: string;
    type: string;
    revenue: number;
    enrollments: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

interface ChartFilters {
  period: "7d" | "30d" | "90d" | "1y" | "all";
  category: "all" | "workshops" | "products" | "courses" | "bookings";
  chartType: "revenue" | "transactions" | "both";
}

const RevenueCharts: React.FC = () => {
  const t = useTranslations("analytics");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RevenueChartData | null>(null);
  const [filters, setFilters] = useState<ChartFilters>({
    period: "30d",
    category: "all",
    chartType: "revenue",
  });
  const [activeView, setActiveView] = useState<
    "timeline" | "category" | "items"
  >("timeline");

  useEffect(() => {
    loadRevenueData();
  }, [filters]);

  const loadRevenueData = async () => {
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
            includeRefunds: true,
            currency: "IRR",
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || "خطا در دریافت داده‌های نمودار درآمد");
      }
    } catch (err) {
      console.error("Error loading revenue chart data:", err);
      setError("خطا در اتصال به سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
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

  const getCategoryColor = (category: string, index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
    ];
    return colors[index % colors.length];
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "course_enrollment":
        return "دوره‌ها";
      case "workshop_enrollment":
        return "کارگاه‌ها";
      case "product_purchase":
        return "محصولات";
      case "space_booking":
        return "رزرو فضاها";
      default:
        return category;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshIcon className="h-6 w-6 animate-spin" />
          <span>در حال بارگذاری نمودار درآمد...</span>
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
            onClick={loadRevenueData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">داده‌ای برای نمایش یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">
            نمودار درآمد - {getPeriodLabel(filters.period)}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter */}
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, period: e.target.value as any }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">همه دسته‌ها</option>
            <option value="courses">دوره‌ها</option>
            <option value="workshops">کارگاه‌ها</option>
            <option value="products">محصولات</option>
            <option value="bookings">رزرو فضاها</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadRevenueData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="به‌روزرسانی داده‌ها"
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">کل درآمد</span>
            <span className="font-bold text-green-600">
              {formatCurrency(data.totalRevenue)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {data.revenueGrowth >= 0 ? (
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDownIcon className="h-5 w-5 text-red-600" />
            )}
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">رشد درآمد</span>
              <span
                className={`font-bold ${
                  data.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {data.revenueGrowth >= 0 ? "+" : ""}
                {data.revenueGrowth}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">بازه زمانی</span>
            <span className="font-medium text-blue-600">
              {new Date(data.period.startDate).toLocaleDateString("fa-IR", {
                month: "short",
                day: "numeric",
              })}{" "}
              تا{" "}
              {new Date(data.period.endDate).toLocaleDateString("fa-IR", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Chart View Selector */}
      <div className="flex flex-wrap gap-2">
        {["timeline", "category", "items"].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === view
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {view === "timeline" && "روند زمانی"}
            {view === "category" && "دسته‌بندی"}
            {view === "items" && "پردرآمدترین موارد"}
          </button>
        ))}
      </div>

      {/* Chart Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeView === "timeline" && (
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold text-gray-900">
              روند درآمد در طول زمان
            </h4>
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
              {data.monthlyRevenue.map((item, index) => {
                const maxRevenue = Math.max(
                  ...data.monthlyRevenue.map((m) => m.revenue),
                );
                const percentage =
                  maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                return (
                  <div
                    key={item.month || index}
                    className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex flex-col min-w-24">
                      <span className="font-medium text-gray-900">
                        {item.month}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.transactions} تراکنش
                      </span>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-blue-600 min-w-20 text-right">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === "category" && (
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold text-gray-900">
              توزیع درآمد بر اساس دسته‌بندی
            </h4>
            <div className="flex flex-wrap gap-4">
              {data.revenueByCategory.map((category, index) => (
                <div
                  key={category.category || index}
                  className="flex flex-col flex-1 min-w-48 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-4 h-4 rounded-full ${getCategoryColor(
                        category.category,
                        index,
                      )}`}
                    ></div>
                    <h5 className="font-semibold text-gray-900">
                      {getCategoryLabel(category.category)}
                    </h5>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {formatCurrency(category.revenue)}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.count} تراکنش
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full ${getCategoryColor(
                        category.category,
                        index,
                      )
                        .replace("bg-", "bg-gradient-to-r from-")
                        .replace("-500", "-400 to-")
                        .concat("-600")}`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === "items" && (
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold text-gray-900">
              پردرآمدترین موارد
            </h4>
            <div className="flex flex-col gap-3">
              {data.topRevenueItems.slice(0, 8).map((item, index) => (
                <div
                  key={item.itemId || index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <h5 className="font-semibold text-gray-900">
                        {item.name || "نام نامشخص"}
                      </h5>
                      <p className="text-sm text-gray-500">
                        {getCategoryLabel(item.type)} • {item.enrollments}{" "}
                        ثبت‌نام
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-purple-600 text-lg">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      {activeView === "category" && data.revenueByCategory.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-3">راهنمای رنگ‌ها</h5>
          <div className="flex flex-wrap gap-4">
            {data.revenueByCategory.map((category, index) => (
              <div
                key={category.category || index}
                className="flex items-center gap-2"
              >
                <div
                  className={`w-3 h-3 rounded-full ${getCategoryColor(
                    category.category,
                    index,
                  )}`}
                ></div>
                <span className="text-sm text-gray-700">
                  {getCategoryLabel(category.category)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueCharts;
