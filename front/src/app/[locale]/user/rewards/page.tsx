"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useScoring } from "@/context/ScoringContext";
import ScoreRewards from "@/components/organisms/Scoring/ScoreRewards";
import UserScore from "@/components/organisms/Scoring/UserScore";

interface RewardsPageProps {
  params: {
    locale: string;
  };
}

const RewardsPage: React.FC<RewardsPageProps> = ({ params: { locale } }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    userScore,
    availableRewards,
    isLoading: scoringLoading,
    error,
    refreshScore,
  } = useScoring();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=/user/rewards`);
    }
  }, [isAuthenticated, router, locale]);

  // Format number with Persian separators
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  // Get reward categories
  const rewardCategories = Array.from(
    new Set(availableRewards.map((reward) => reward.reward_type)),
  );

  // Filter rewards based on search and category
  const filteredRewards = availableRewards.filter((reward) => {
    const matchesSearch =
      !searchQuery ||
      reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || reward.reward_type === selectedCategory;

    return matchesSearch && matchesCategory && reward.is_active;
  });

  // Loading state
  if (scoringLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header skeleton */}
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>

            {/* Score card skeleton */}
            <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>

            {/* Search and filters skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-64"></div>
                </div>
              ))}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push(`/${locale}/user/scoring`)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="text-sm">برگشت به امتیازات</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                🏪 فروشگاه جوایز
              </h1>
              <p className="text-gray-600">
                با امتیازات خود جوایز شگفت‌انگیز کسب کنید
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
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

          {/* User Score Summary */}
          <UserScore
            variant="compact"
            showProgress={false}
            showMultiplier={true}
            className="mb-6"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3 text-red-800">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">خطا در بارگذاری جوایز</p>
                <p className="text-sm opacity-75">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در جوایز..."
                  className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">همه دسته‌ها</option>
                {rewardCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === "discount" && "🏷️ تخفیف"}
                    {category === "product" && "🎁 محصول"}
                    {category === "service" && "🛠️ خدمات"}
                    {category === "voucher" && "🎫 کوپن"}
                    {category === "exclusive" && "⭐ ویژه"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          {(searchQuery || selectedCategory) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">فیلترهای فعال:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  جستجو: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  دسته: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                پاک کردن همه
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                {filteredRewards.length} جایزه یافت شد
                {availableRewards.length !== filteredRewards.length && (
                  <span className="text-gray-500">
                    {" "}
                    از {availableRewards.length} جایزه
                  </span>
                )}
              </p>

              {userScore && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">قابل خرید:</span>
                  <span className="font-semibold text-green-600">
                    {
                      filteredRewards.filter(
                        (r) => r.points_cost <= userScore.available_points,
                      ).length
                    }{" "}
                    جایزه
                  </span>
                </div>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Filter to show only affordable rewards
                  // This would need to be handled by the ScoreRewards component
                }}
                className="px-3 py-1 text-xs border border-green-200 text-green-700 rounded-md hover:bg-green-50 transition-colors"
              >
                فقط قابل خرید
              </button>

              <button
                onClick={() => setSelectedCategory("discount")}
                className={`px-3 py-1 text-xs border rounded-md transition-colors ${
                  selectedCategory === "discount"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                🏷️ تخفیف‌ها
              </button>
            </div>
          </div>
        </div>

        {/* No Results */}
        {filteredRewards.length === 0 && availableRewards.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              جایزه‌ای یافت نشد
            </h3>
            <p className="text-gray-600 mb-4">
              با این فیلترها جایزه‌ای پیدا نشد. لطفا جستجوی خود را تغییر دهید.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <span>پاک کردن فیلترها</span>
            </button>
          </div>
        )}

        {/* No Rewards Available */}
        {availableRewards.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              هنوز جایزه‌ای موجود نیست
            </h3>
            <p className="text-gray-600 mb-4">
              به زودی جوایز شگفت‌انگیزی اضافه خواهد شد. امتیاز کسب کنید و منتظر
              بمانید!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push(`/${locale}/products`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <span>🛒</span>
                <span>خرید محصولات</span>
              </button>

              <button
                onClick={() => router.push(`/${locale}/courses`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <span>📚</span>
                <span>مشاهده دوره‌ها</span>
              </button>
            </div>
          </div>
        )}

        {/* Rewards Grid */}
        {filteredRewards.length > 0 && (
          <ScoreRewards
            showFilters={false} // We handle filters above
            gridCols={4}
            compact={false}
            className="mb-8"
          />
        )}

        {/* Bottom CTA */}
        {userScore && userScore.available_points < 100 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              نیاز به امتیاز بیشتر دارید؟
            </h3>
            <p className="text-gray-600 mb-4">
              با خرید محصولات، نظر دادن و معرفی دوستان امتیاز کسب کنید
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push(`/${locale}/products`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <span>🛒</span>
                <span>خرید محصول</span>
              </button>

              <button
                onClick={() => router.push(`/${locale}/user/referrals`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <span>👥</span>
                <span>معرفی دوستان</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;
