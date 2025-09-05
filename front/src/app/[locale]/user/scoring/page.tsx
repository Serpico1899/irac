"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useScoring } from "@/context/ScoringContext";
import UserScore from "@/components/organisms/Scoring/UserScore";
import ScoreHistory from "@/components/organisms/Scoring/ScoreHistory";
import LevelBadge from "@/components/organisms/Scoring/LevelBadge";
import { UserAchievement } from "@/types";

interface ScoringPageProps {
  params: {
    locale: string;
  };
}

const ScoringPage: React.FC<ScoringPageProps> = ({ params: { locale } }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    userScore,
    scoreStats,
    achievements,
    availableRewards,
    isLoading: scoringLoading,
    error,
    refreshScore,
  } = useScoring();

  const [activeTab, setActiveTab] = useState<
    "overview" | "achievements" | "history"
  >("overview");
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=/user/scoring`);
    }
  }, [isAuthenticated, router, locale]);

  // Format number with Persian separators
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  // Get recent achievements (last 5)
  const recentAchievements = achievements
    .filter((a) => a.completed)
    .sort(
      (a, b) =>
        new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime(),
    )
    .slice(0, 5);

  // Get achievement progress (uncompleted with progress > 0)
  const achievementsInProgress = achievements
    .filter((a) => !a.completed && (a.progress || 0) > 0)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 3);

  // Loading state
  if (scoringLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                امتیازات من
              </h1>
              <p className="text-gray-600">امتیازها، سطح و دستاورد های شما</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push(`/${locale}/user/rewards`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="text-lg">🏪</span>
                <span>فروشگاه جوایز</span>
              </button>

              <button
                onClick={refreshScore}
                disabled={scoringLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <span
                  className={`text-lg ${scoringLoading ? "animate-spin" : ""}`}
                >
                  🔄
                </span>
                <span>بروزرسانی</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3 text-red-800">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">خطا در بارگذاری اطلاعات</p>
                <p className="text-sm opacity-75">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Score Overview */}
            <UserScore
              variant="detailed"
              showProgress={true}
              showMultiplier={true}
            />

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[
                  { key: "overview", label: "نمای کلی", icon: "📊" },
                  { key: "achievements", label: "دستاوردها", icon: "🏆" },
                  { key: "history", label: "تاریخچه", icon: "📋" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                      ${
                        activeTab === tab.key
                          ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    {scoreStats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatNumber(scoreStats.lifetime_earned)}
                          </div>
                          <div className="text-xs text-green-700">
                            کل کسب شده
                          </div>
                        </div>

                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {formatNumber(scoreStats.lifetime_used)}
                          </div>
                          <div className="text-xs text-blue-700">
                            استفاده شده
                          </div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {scoreStats.achievements_count}
                          </div>
                          <div className="text-xs text-purple-700">
                            دستاوردها
                          </div>
                        </div>

                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 mb-1">
                            {userScore?.current_streak || 0}
                          </div>
                          <div className="text-xs text-orange-700">
                            روز فعالیت
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Achievements */}
                    {recentAchievements.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          آخرین دستاوردها
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                          {recentAchievements.map((achievement) => (
                            <LevelBadge
                              key={achievement._id}
                              achievement={achievement}
                              variant="achievement"
                              size="md"
                              showDetails={false}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements in Progress */}
                    {achievementsInProgress.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          در حال پیشرفت
                        </h3>
                        <div className="space-y-3">
                          {achievementsInProgress.map((achievement) => (
                            <div
                              key={achievement._id}
                              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                            >
                              <LevelBadge
                                achievement={achievement}
                                variant="achievement"
                                size="sm"
                                showDetails={false}
                                showProgress={true}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {achievement.achievement.name}
                                </h4>
                                <div className="mt-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${achievement.progress || 0}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {achievement.progress}% تکمیل
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "achievements" && (
                  <div className="space-y-6">
                    {achievements.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🏆</div>
                        <p className="text-gray-600 mb-2">
                          هنوز دستاوردی کسب نکرده‌اید
                        </p>
                        <p className="text-sm text-gray-500">
                          با خرید محصولات و فعالیت در سایت دستاوردهای جدید کسب
                          کنید
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Achievement Summary */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              دستاوردهای من
                            </h3>
                            <p className="text-sm text-gray-600">
                              {achievements.filter((a) => a.completed).length}{" "}
                              از {achievements.length} دستاورد
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setShowAllAchievements(!showAllAchievements)
                            }
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {showAllAchievements ? "نمایش کمتر" : "نمایش همه"}
                          </button>
                        </div>

                        {/* Achievements Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {(showAllAchievements
                            ? achievements
                            : achievements.slice(0, 10)
                          ).map((achievement) => (
                            <LevelBadge
                              key={achievement._id}
                              achievement={achievement}
                              variant="achievement"
                              size="lg"
                              showDetails={true}
                              showProgress={!achievement.completed}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                  <ScoreHistory
                    pageSize={10}
                    showFilters={true}
                    compact={false}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Current Level */}
            {userScore && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  سطح فعلی
                </h3>
                <div className="flex justify-center">
                  <LevelBadge
                    level={userScore.level}
                    variant="level"
                    size="xl"
                    showDetails={true}
                  />
                </div>
              </div>
            )}

            {/* Available Rewards Preview */}
            {availableRewards.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    جوایز در دسترس
                  </h3>
                  <button
                    onClick={() => router.push(`/${locale}/user/rewards`)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    مشاهده همه
                  </button>
                </div>

                <div className="space-y-3">
                  {availableRewards.slice(0, 3).map((reward) => {
                    const canAfford =
                      userScore &&
                      userScore.available_points >= reward.points_cost;
                    return (
                      <div
                        key={reward._id}
                        className={`p-3 border rounded-lg transition-colors ${
                          canAfford
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🎁</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                              {reward.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-blue-600">
                                {formatNumber(reward.points_cost)} امتیاز
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  canAfford
                                    ? "text-green-700 bg-green-100"
                                    : "text-gray-600 bg-gray-100"
                                }`}
                              >
                                {canAfford ? "قابل خرید" : "امتیاز کم"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                عملیات سریع
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/${locale}/products`)}
                  className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">🛒</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      خرید محصولات
                    </div>
                    <div className="text-xs text-gray-600">امتیاز کسب کنید</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push(`/${locale}/courses`)}
                  className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">📚</span>
                  <div>
                    <div className="font-medium text-gray-900">دوره‌ها</div>
                    <div className="text-xs text-gray-600">
                      یادگیری و امتیاز
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push(`/${locale}/user/referrals`)}
                  className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">👥</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      معرفی دوستان
                    </div>
                    <div className="text-xs text-gray-600">
                      جایزه ویژه دریافت کنید
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringPage;
