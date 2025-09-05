"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface UserMetrics {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  retentionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
}

interface PopularContent {
  id: string;
  title: string;
  type: "course" | "workshop" | "product";
  enrollments: number;
  revenue: number;
  rating: number;
  growth: number;
}

interface UserGrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
}

interface UserLocation {
  city: string;
  users: number;
  percentage: number;
}

const UserAnalytics: React.FC = () => {
  const t = useTranslations("analytics");

  const [selectedMetric, setSelectedMetric] = useState<"growth" | "activity" | "retention">("growth");
  const [selectedPeriod, setSelectedPeriod] = useState<"7days" | "30days" | "90days">("30days");
  const [isLoading, setIsLoading] = useState(true);

  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    activeUsersToday: 0,
    activeUsersThisWeek: 0,
    activeUsersThisMonth: 0,
    retentionRate: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
  });

  const [growthData, setGrowthData] = useState<UserGrowthData[]>([]);
  const [popularContent, setPopularContent] = useState<PopularContent[]>([]);
  const [topLocations, setTopLocations] = useState<UserLocation[]>([]);

  useEffect(() => {
    loadUserAnalytics();
  }, [selectedPeriod]);

  const loadUserAnalytics = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real app, this would call APIs
      const mockMetrics: UserMetrics = {
        totalUsers: 2150,
        newUsersToday: 8,
        newUsersThisWeek: 45,
        newUsersThisMonth: 187,
        activeUsersToday: 234,
        activeUsersThisWeek: 1456,
        activeUsersThisMonth: 1847,
        retentionRate: 68.5,
        averageSessionDuration: 24.5, // minutes
        bounceRate: 32.1,
      };

      const mockGrowthData: UserGrowthData[] = [
        { date: "2024-01-01", newUsers: 12, activeUsers: 145, totalUsers: 1963 },
        { date: "2024-01-02", newUsers: 8, activeUsers: 167, totalUsers: 1971 },
        { date: "2024-01-03", newUsers: 15, activeUsers: 189, totalUsers: 1986 },
        { date: "2024-01-04", newUsers: 11, activeUsers: 203, totalUsers: 1997 },
        { date: "2024-01-05", newUsers: 19, activeUsers: 178, totalUsers: 2016 },
        { date: "2024-01-06", newUsers: 7, activeUsers: 234, totalUsers: 2023 },
        { date: "2024-01-07", newUsers: 14, activeUsers: 198, totalUsers: 2037 },
        { date: "2024-01-08", newUsers: 22, activeUsers: 245, totalUsers: 2059 },
        { date: "2024-01-09", newUsers: 9, activeUsers: 187, totalUsers: 2068 },
        { date: "2024-01-10", newUsers: 16, activeUsers: 223, totalUsers: 2084 },
        { date: "2024-01-11", newUsers: 13, activeUsers: 267, totalUsers: 2097 },
        { date: "2024-01-12", newUsers: 18, activeUsers: 201, totalUsers: 2115 },
        { date: "2024-01-13", newUsers: 10, activeUsers: 189, totalUsers: 2125 },
        { date: "2024-01-14", newUsers: 25, activeUsers: 298, totalUsers: 2150 },
      ];

      const mockPopularContent: PopularContent[] = [
        {
          id: "1",
          title: "دوره جامع برنامه‌نویسی React",
          type: "course",
          enrollments: 324,
          revenue: 113400000,
          rating: 4.8,
          growth: 15.2,
        },
        {
          id: "2",
          title: "کارگاه طراحی UI/UX",
          type: "workshop",
          enrollments: 156,
          revenue: 39000000,
          rating: 4.9,
          growth: 23.7,
        },
        {
          id: "3",
          title: "دوره Python برای علم داده",
          type: "course",
          enrollments: 267,
          revenue: 93450000,
          rating: 4.7,
          growth: 8.9,
        },
        {
          id: "4",
          title: "کتاب الگوهای طراحی",
          type: "product",
          enrollments: 89,
          revenue: 7565000,
          rating: 4.6,
          growth: 31.2,
        },
        {
          id: "5",
          title: "کارگاه DevOps و Docker",
          type: "workshop",
          enrollments: 134,
          revenue: 33500000,
          rating: 4.8,
          growth: 19.4,
        },
      ];

      const mockLocations: UserLocation[] = [
        { city: "تهران", users: 687, percentage: 32.0 },
        { city: "اصفهان", users: 298, percentage: 13.9 },
        { city: "شیراز", users: 234, percentage: 10.9 },
        { city: "مشهد", users: 189, percentage: 8.8 },
        { city: "تبریز", users: 156, percentage: 7.3 },
        { city: "کرج", users: 143, percentage: 6.7 },
        { city: "اهواز", users: 98, percentage: 4.6 },
        { city: "قم", users: 87, percentage: 4.0 },
        { city: "کرمان", users: 76, percentage: 3.5 },
        { city: "سایر", users: 182, percentage: 8.5 },
      ];

      setUserMetrics(mockMetrics);
      setGrowthData(mockGrowthData);
      setPopularContent(mockPopularContent);
      setTopLocations(mockLocations);
    } catch (error) {
      console.error("Failed to load user analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes.toFixed(1)} دقیقه`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ساعت ${remainingMinutes.toFixed(0)} دقیقه`;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "course":
        return "📚";
      case "workshop":
        return "🎯";
      case "product":
        return "📦";
      default:
        return "📄";
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels = {
      course: t("userAnalytics.contentType.course"),
      workshop: t("userAnalytics.contentType.workshop"),
      product: t("userAnalytics.contentType.product"),
    };
    return labels[type as keyof typeof labels] || type;
  };

  const renderGrowthChart = () => {
    const maxValue = Math.max(...growthData.map(item =>
      selectedMetric === "growth" ? item.newUsers :
      selectedMetric === "activity" ? item.activeUsers :
      item.totalUsers
    ));

    return (
      <div className="relative">
        <svg className="w-full h-48" viewBox="0 0 700 200">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((index) => (
            <line
              key={index}
              x1="40"
              y1={30 + (index * 30)}
              x2="660"
              y2={30 + (index * 30)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Chart line */}
          <polyline
            points={growthData.map((item, index) => {
              const x = 40 + (index * (620 / (growthData.length - 1)));
              const value = selectedMetric === "growth" ? item.newUsers :
                           selectedMetric === "activity" ? item.activeUsers :
                           item.totalUsers;
              const y = 150 - ((value / maxValue) * 120);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
          />

          {/* Data points */}
          {growthData.map((item, index) => {
            const x = 40 + (index * (620 / (growthData.length - 1)));
            const value = selectedMetric === "growth" ? item.newUsers :
                         selectedMetric === "activity" ? item.activeUsers :
                         item.totalUsers;
            const y = 150 - ((value / maxValue) * 120);

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#8b5cf6"
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t("userAnalytics.title")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("userAnalytics.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Metric Selection */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["growth", "activity", "retention"] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedMetric === metric
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t(`userAnalytics.metrics.${metric}`)}
                </button>
              ))}
            </div>

            {/* Period Selection */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["7days", "30days", "90days"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedPeriod === period
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t(`userAnalytics.periods.${period}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6">
        {renderGrowthChart()}
      </div>

      {/* Key Metrics */}
      <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {formatNumber(userMetrics.totalUsers)}
            </p>
            <p className="text-sm text-gray-600">{t("userAnalytics.totalUsers")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(userMetrics.newUsersThisMonth)}
            </p>
            <p className="text-sm text-gray-600">{t("userAnalytics.newUsersMonth")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {userMetrics.retentionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">{t("userAnalytics.retentionRate")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {formatDuration(userMetrics.averageSessionDuration)}
            </p>
            <p className="text-sm text-gray-600">{t("userAnalytics.avgSessionDuration")}</p>
          </div>
        </div>
      </div>

      {/* Popular Content */}
      <div className="p-4 sm:p-6 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          {t("userAnalytics.popularContent.title")}
        </h4>
        <div className="space-y-3">
          {popularContent.slice(0, 3).map((content, index) => (
            <div key={content.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm">{getContentTypeIcon(content.type)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {content.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{getContentTypeLabel(content.type)}</span>
                  <span>•</span>
                  <span>{formatNumber(content.enrollments)} {t("userAnalytics.enrollments")}</span>
                  <span>•</span>
                  <span>⭐ {content.rating}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(content.revenue)}
                </p>
                <p className={`text-xs font-medium ${
                  content.growth >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {content.growth >= 0 ? "+" : ""}{content.growth.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
          {t("userAnalytics.popularContent.viewAll")}
        </button>
      </div>

      {/* Top Locations */}
      <div className="p-4 sm:p-6 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          {t("userAnalytics.topLocations.title")}
        </h4>
        <div className="space-y-3">
          {topLocations.slice(0, 5).map((location, index) => (
            <div key={location.city} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {location.city}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${location.percentage}%` }}
                  ></div>
                </div>
                <div className="text-right min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatNumber(location.users)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {location.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">
              {t("userAnalytics.bounceRate")}:
              <span className="font-medium text-gray-900 mr-1">
                {userMetrics.bounceRate.toFixed(1)}%
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-gray-600">
              {t("userAnalytics.activeToday")}:
              <span className="font-medium text-gray-900 mr-1">
                {formatNumber(userMetrics.activeUsersToday)}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span className="text-gray-600">
              {t("userAnalytics.newToday")}:
              <span className="font-medium text-gray-900 mr-1">
                {formatNumber(userMetrics.newUsersToday)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
