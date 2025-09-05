"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useReferral } from "@/context/ReferralContext";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  Clock,
  Award,
  Target,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import type { ReferralHistoryResponse, ReferralQuery } from "@/types";

interface ReferralStatsProps {
  locale: string;
}

interface TimeFilter {
  label: string;
  value: string;
  days: number;
}

interface StatsCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
  description?: string;
}

const ReferralStats: React.FC<ReferralStatsProps> = ({ locale }) => {
  const t = useTranslations("referral.stats");
  const {
    userStats,
    getReferralHistory,
    isLoading,
    error,
    refreshStats,
  } = useReferral();

  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");
  const [referralHistory, setReferralHistory] = useState<ReferralHistoryResponse | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isRTL = locale === "fa";

  // Time filter options
  const timeFilters: TimeFilter[] = [
    { label: t("periods.week"), value: "7", days: 7 },
    { label: t("periods.month"), value: "30", days: 30 },
    { label: t("periods.quarter"), value: "90", days: 90 },
    { label: t("periods.year"), value: "365", days: 365 },
    { label: t("periods.all"), value: "all", days: 0 },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: "IRR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(num);
  };

  // Calculate trend
  const calculateTrend = (current: number, previous: number): { change: number; trend: "up" | "down" | "neutral" } => {
    if (previous === 0) return { change: 0, trend: "neutral" };
    const change = ((current - previous) / previous) * 100;
    return {
      change: Math.abs(change),
      trend: change > 0 ? "up" : change < 0 ? "down" : "neutral"
    };
  };

  // Get stats cards data
  const getStatsCards = (): StatsCard[] => {
    if (!userStats) return [];

    return [
      {
        title: t("cards.totalReferrals"),
        value: userStats.total_invitations,
        change: 12.5, // Mock data - in real app, calculate from period comparison
        trend: "up",
        icon: Users,
        color: "blue",
        description: t("cards.totalReferralsDesc"),
      },
      {
        title: t("cards.successfulReferrals"),
        value: userStats.successful_referrals,
        change: 8.3,
        trend: "up",
        icon: Target,
        color: "green",
        description: t("cards.successfulReferralsDesc"),
      },
      {
        title: t("cards.totalEarnings"),
        value: formatCurrency(userStats.total_rewards_earned),
        change: 15.2,
        trend: "up",
        icon: DollarSign,
        color: "purple",
        description: t("cards.totalEarningsDesc"),
      },
      {
        title: t("cards.conversionRate"),
        value: `${userStats.conversion_rate.toFixed(1)}%`,
        change: 3.1,
        trend: "up",
        icon: TrendingUp,
        color: "yellow",
        description: t("cards.conversionRateDesc"),
      },
      {
        title: t("cards.currentStreak"),
        value: userStats.current_streak,
        change: 0,
        trend: "neutral",
        icon: Zap,
        color: "orange",
        description: t("cards.currentStreakDesc"),
      },
      {
        title: t("cards.rank"),
        value: `#${userStats.rank}`,
        change: 2,
        trend: "up",
        icon: Award,
        color: "pink",
        description: t("cards.rankDesc"),
      },
    ];
  };

  // Load referral history
  const loadReferralHistory = async (page: number = 1) => {
    setHistoryLoading(true);
    try {
      const query: ReferralQuery = {
        page,
        limit: 10,
        sort_by: sortBy as any,
        sort_order: sortOrder,
      };

      if (statusFilter !== "all") {
        query.status = statusFilter as any;
      }

      if (selectedPeriod !== "all") {
        const days = parseInt(selectedPeriod);
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        query.date_from = fromDate.toISOString();
      }

      const history = await getReferralHistory(query);
      setReferralHistory(history);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load referral history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = () => {
    setCurrentPage(1);
    loadReferralHistory(1);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get card color classes
  const getCardColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200",
      purple: "bg-purple-50 border-purple-200",
      yellow: "bg-yellow-50 border-yellow-200",
      orange: "bg-orange-50 border-orange-200",
      pink: "bg-pink-50 border-pink-200",
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      yellow: "text-yellow-600",
      orange: "text-orange-600",
      pink: "text-pink-600",
    };
    return colors[color] || colors.blue;
  };

  // Load data on mount
  useEffect(() => {
    loadReferralHistory();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    handleFilterChange();
  }, [selectedPeriod, statusFilter, sortBy, sortOrder]);

  if (isLoading && !userStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  const statsCards = getStatsCards();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Filter */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {timeFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshStats}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{t("refresh")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all hover:shadow-md ${getCardColor(card.color)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white/50 ${getIconColor(card.color)}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                {card.change !== undefined && card.trend !== "neutral" && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    card.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {card.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {card.change.toFixed(1)}%
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {card.title}
                </p>
                {card.description && (
                  <p className="text-xs text-gray-600">
                    {card.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("performance.title")}
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <BarChart3 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <PieChart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mock Chart Area */}
        <div className="h-64 bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-primary-200">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-primary-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">{t("performance.chartPlaceholder")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("performance.chartDescription")}</p>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* History Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("history.title")}
          </h2>

          <div className="flex items-center gap-3">
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                showFilters
                  ? "bg-primary-50 text-primary-600 border-primary-200"
                  : "text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              {t("history.filters")}
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t("history.export")}</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("history.status")}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">{t("history.allStatuses")}</option>
                  <option value="completed">{t("status.completed")}</option>
                  <option value="active">{t("status.active")}</option>
                  <option value="pending">{t("status.pending")}</option>
                  <option value="expired">{t("status.expired")}</option>
                  <option value="cancelled">{t("status.cancelled")}</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("history.sortBy")}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="created_at">{t("history.sortDate")}</option>
                  <option value="completed_at">{t("history.sortCompleted")}</option>
                  <option value="reward_amount">{t("history.sortReward")}</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("history.order")}
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="desc">{t("history.newest")}</option>
                  <option value="asc">{t("history.oldest")}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="overflow-x-auto">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : referralHistory && referralHistory.referrals.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("history.contact")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("history.status")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("history.date")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("history.reward")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referralHistory.referrals.map((referral) => (
                  <tr key={referral._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {referral.referee_email || referral.referee_phone || t("history.anonymous")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t("history.code")}: {referral.referral_code}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                        {t(`status.${referral.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(referral.invited_at).toLocaleDateString(locale)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(referral.invited_at).toLocaleTimeString(locale, {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {referral.reward_amount ? (
                        <span className="text-green-600 font-medium">
                          {formatCurrency(referral.reward_amount)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t("history.empty")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {referralHistory && referralHistory.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => loadReferralHistory(currentPage - 1)}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("history.previous")}
              </button>
              <button
                onClick={() => loadReferralHistory(currentPage + 1)}
                disabled={currentPage >= referralHistory.pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("history.next")}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t("history.showing")} {((currentPage - 1) * 10) + 1} {t("history.to")}{" "}
                  {Math.min(currentPage * 10, referralHistory.pagination.total)} {t("history.of")}{" "}
                  {referralHistory.pagination.total} {t("history.results")}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Page numbers would go here */}
                <button
                  onClick={() => loadReferralHistory(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4 transform rotate-90" />
                </button>
                <span className="text-sm text-gray-700">
                  {currentPage} / {referralHistory.pagination.pages}
                </span>
                <button
                  onClick={() => loadReferralHistory(currentPage + 1)}
                  disabled={currentPage >= referralHistory.pagination.pages}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4 transform -rotate-90" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {referralHistory && (
        <div className="bg-gradient-to-br from-primary-50 to-purple-50 p-6 rounded-xl border border-primary-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("summary.title")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {referralHistory.stats.total_sent}
              </p>
              <p className="text-sm text-gray-600">{t("summary.totalSent")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {referralHistory.stats.total_successful}
              </p>
              <p className="text-sm text-gray-600">{t("summary.successful")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(referralHistory.stats.total_rewards)}
              </p>
              <p className="text-sm text-gray-600">{t("summary.totalRewards")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {referralHistory.stats.conversion_rate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">{t("summary.conversionRate")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralStats;
