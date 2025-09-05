"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useReferral } from "@/context/ReferralContext";
import {
  Share as ShareIcon,
  Users as UserGroupIcon,
  Gift as GiftIcon,
  Trophy as TrophyIcon,
  BarChart3 as ChartBarIcon,
  Plus as PlusIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
} from "lucide-react";
import {
  WhatsAppIcon,
  TelegramIcon,
  EmailIcon,
} from "@/components/atoms/SocialIcons";

interface ReferralDashboardProps {
  locale: string;
}

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ locale }) => {
  const t = useTranslations("referral");
  const {
    userStats,
    referralCode,
    leaderboard,
    myGroups,
    isLoading,
    error,
    shareReferralCode,
    refreshStats,
  } = useReferral();

  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState<string | null>(null);

  const isRTL = locale === "fa";

  // Handle share referral code
  const handleShare = async (
    method: "whatsapp" | "telegram" | "email" | "copy",
  ) => {
    setShareLoading(method);

    try {
      const success = await shareReferralCode(method);
      if (success && method === "copy") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setShareLoading(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: "IRR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get level color
  const getLevelColor = (rank: number) => {
    if (rank <= 3) return "text-yellow-600";
    if (rank <= 10) return "text-purple-600";
    if (rank <= 50) return "text-blue-600";
    return "text-gray-600";
  };

  if (isLoading && !userStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="text-red-500 text-center mb-4">
          <p className="font-medium">{t("errorTitle")}</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={refreshStats}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("dashboard.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <button
          onClick={refreshStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <ChartBarIcon className="w-4 h-4" />
          {t("refresh")}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900">
                {userStats?.successful_referrals || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {t("stats.successfulReferrals")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GiftIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {formatCurrency(userStats?.total_rewards_earned || 0)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {t("stats.totalRewards")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrophyIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900">
                #{userStats?.rank || "N/A"}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {t("stats.rank")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900">
                {userStats?.conversion_rate?.toFixed(1) || 0}%
              </p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {t("stats.conversionRate")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("referralCode.title")}
          </h2>
          <ShareIcon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {/* Referral Code Display */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">
                {t("referralCode.yourCode")}
              </p>
              <p className="text-xl font-bold text-primary-600 font-mono">
                {referralCode?.code || "Loading..."}
              </p>
            </div>
            <button
              onClick={() => handleShare("copy")}
              disabled={!referralCode || shareLoading === "copy"}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <CopyIcon className="w-4 h-4" />
              )}
              {copied ? t("copied") : t("copy")}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              {t("referralCode.shareWith")}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare("whatsapp")}
                disabled={!referralCode || shareLoading === "whatsapp"}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex-1 sm:flex-none justify-center"
              >
                <WhatsAppIcon className="w-4 h-4" />
                {t("share.whatsapp")}
              </button>

              <button
                onClick={() => handleShare("telegram")}
                disabled={!referralCode || shareLoading === "telegram"}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex-1 sm:flex-none justify-center"
              >
                <TelegramIcon className="w-4 h-4" />
                {t("share.telegram")}
              </button>

              <button
                onClick={() => handleShare("email")}
                disabled={!referralCode || shareLoading === "email"}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors flex-1 sm:flex-none justify-center"
              >
                <EmailIcon className="w-4 h-4" />
                {t("share.email")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Desktop */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Referrals */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("recentReferrals.title")}
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {t("viewAll")}
            </button>
          </div>

          <div className="space-y-3">
            {userStats?.recent_referrals &&
            userStats.recent_referrals.length > 0 ? (
              userStats.recent_referrals.slice(0, 5).map((referral) => (
                <div
                  key={referral._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {referral.referee_email ||
                        referral.referee_phone ||
                        t("anonymous")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(referral.invited_at).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      referral.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : referral.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : referral.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t(`status.${referral.status}`)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t("recentReferrals.empty")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("leaderboard.title")}
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {t("viewAll")}
            </button>
          </div>

          <div className="space-y-3">
            {leaderboard && leaderboard.top_referrers.length > 0 ? (
              leaderboard.top_referrers.slice(0, 5).map((user) => (
                <div
                  key={user.user_id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    user.is_current_user
                      ? "bg-primary-50 border border-primary-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      user.rank <= 3
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        user.is_current_user
                          ? "text-primary-900"
                          : "text-gray-900"
                      }`}
                    >
                      {user.user_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.referrals_count} {t("referrals")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${getLevelColor(user.rank)}`}
                    >
                      {formatCurrency(user.rewards_earned)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t("leaderboard.empty")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Groups */}
      {myGroups && myGroups.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("myGroups.title")}
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {t("viewAll")}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {myGroups.slice(0, 4).map((group) => (
              <div key={group._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {t(`groupTier.tier_${group.discount_id}`)}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.status === "active"
                        ? "bg-green-100 text-green-800"
                        : group.status === "forming"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t(`groupStatus.${group.status}`)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {group.current_participants} {t("participants")}
                  </span>
                  <span>
                    {group.discount_applied}% {t("discount")}
                  </span>
                </div>
                {group.total_savings > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {t("totalSavings")}: {formatCurrency(group.total_savings)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Reward Progress */}
      {userStats?.next_reward && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GiftIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {t("nextReward.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {userStats.next_reward.reward_name}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t("progress")}</span>
              <span className="font-medium text-gray-900">
                {userStats.next_reward.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${userStats.next_reward.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {t("nextReward.needed", {
                count: userStats.next_reward.referrals_needed,
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralDashboard;
