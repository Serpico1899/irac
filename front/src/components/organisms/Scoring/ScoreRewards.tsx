'use client';

import React, { useState, useEffect } from 'react';
import { useScoring } from '@/context/ScoringContext';
import { ScoreReward } from '@/types';

interface ScoreRewardsProps {
  className?: string;
  showFilters?: boolean;
  gridCols?: 1 | 2 | 3 | 4;
  compact?: boolean;
}

interface RewardFilter {
  type?: string;
  maxCost?: number;
  affordable?: boolean;
}

const ScoreRewards: React.FC<ScoreRewardsProps> = ({
  className = '',
  showFilters = true,
  gridCols = 3,
  compact = false
}) => {
  const { userScore, availableRewards, claimReward, isLoading, error } = useScoring();

  // State management
  const [filter, setFilter] = useState<RewardFilter>({});
  const [selectedReward, setSelectedReward] = useState<ScoreReward | null>(null);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // Reward type configuration
  const rewardTypeConfig = {
    discount: {
      name: 'تخفیف',
      name_en: 'Discount',
      icon: '🏷️',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    product: {
      name: 'محصول',
      name_en: 'Product',
      icon: '🎁',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    service: {
      name: 'خدمات',
      name_en: 'Service',
      icon: '🛠️',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    voucher: {
      name: 'کوپن',
      name_en: 'Voucher',
      icon: '🎫',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    exclusive: {
      name: 'ویژه',
      name_en: 'Exclusive',
      icon: '⭐',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  };

  // Format number with Persian separators
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  // Get reward type config
  const getRewardTypeConfig = (type: string) => {
    return rewardTypeConfig[type as keyof typeof rewardTypeConfig] || rewardTypeConfig.product;
  };

  // Filter rewards based on current filter
  const filteredRewards = availableRewards.filter(reward => {
    if (!reward.is_active) return false;

    if (filter.type && reward.reward_type !== filter.type) return false;

    if (filter.maxCost && reward.points_cost > filter.maxCost) return false;

    if (filter.affordable && userScore && reward.points_cost > userScore.available_points) {
      return false;
    }

    // Check validity dates
    const now = new Date();
    if (reward.valid_from && new Date(reward.valid_from) > now) return false;
    if (reward.valid_until && new Date(reward.valid_until) < now) return false;

    return true;
  });

  // Handle reward claim
  const handleClaimReward = async (reward: ScoreReward) => {
    if (!userScore || userScore.available_points < reward.points_cost) {
      setClaimError('امتیاز کافی ندارید');
      return;
    }

    setClaimingReward(reward._id);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const success = await claimReward(reward._id);
      if (success) {
        setClaimSuccess(`جایزه "${reward.name}" با موفقیت دریافت شد`);
        setSelectedReward(null);
      } else {
        setClaimError('خطا در دریافت جایزه. لطفا مجددا تلاش کنید.');
      }
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'خطای غیرمنتظره');
    } finally {
      setClaimingReward(null);
    }
  };

  // Clear messages after delay
  useEffect(() => {
    if (claimError) {
      const timer = setTimeout(() => setClaimError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [claimError]);

  useEffect(() => {
    if (claimSuccess) {
      const timer = setTimeout(() => setClaimSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [claimSuccess]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 ${className}`}>
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            {showFilters && (
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            )}
          </div>

          {/* Grid skeleton */}
          <div className={`grid grid-cols-1 ${gridCols >= 2 ? 'sm:grid-cols-2' : ''} ${gridCols >= 3 ? 'lg:grid-cols-3' : ''} ${gridCols >= 4 ? 'xl:grid-cols-4' : ''} gap-4`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              فروشگاه جوایز
            </h3>
            <p className="text-sm text-gray-600">
              {userScore ? (
                <>امتیاز شما: <span className="font-semibold text-green-600">{formatNumber(userScore.available_points)}</span></>
              ) : (
                'برای دیدن امتیاز وارد شوید'
              )}
            </p>
          </div>

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Reward Type Filter */}
              <select
                value={filter.type || ''}
                onChange={(e) => setFilter({ ...filter, type: e.target.value || undefined })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">همه انواع</option>
                {Object.entries(rewardTypeConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.name}
                  </option>
                ))}
              </select>

              {/* Affordable Filter */}
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={filter.affordable || false}
                  onChange={(e) => setFilter({ ...filter, affordable: e.target.checked || undefined })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>قابل خرید</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {(claimSuccess || claimError) && (
        <div className="p-4 sm:p-6">
          {claimSuccess && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <span className="text-xl">✅</span>
              <p className="text-sm font-medium">{claimSuccess}</p>
            </div>
          )}
          {claimError && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <span className="text-xl">❌</span>
              <p className="text-sm font-medium">{claimError}</p>
            </div>
          )}
        </div>
      )}

      {/* Rewards Grid */}
      <div className="p-4 sm:p-6">
        {!filteredRewards.length ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎁</div>
            <p className="text-gray-600 mb-2">
              {availableRewards.length === 0 ? 'هنوز جایزه‌ای موجود نیست' : 'جایزه‌ای با این فیلتر یافت نشد'}
            </p>
            <p className="text-sm text-gray-500">
              لطفا فیلترها را تغییر دهید یا بعدا مراجعه کنید
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${gridCols >= 2 ? 'sm:grid-cols-2' : ''} ${gridCols >= 3 ? 'lg:grid-cols-3' : ''} ${gridCols >= 4 ? 'xl:grid-cols-4' : ''} gap-4 sm:gap-6`}>
            {filteredRewards.map((reward) => {
              const typeConfig = getRewardTypeConfig(reward.reward_type);
              const canAfford = userScore && userScore.available_points >= reward.points_cost;
              const isClaimingThis = claimingReward === reward._id;

              return (
                <div
                  key={reward._id}
                  className={`
                    bg-white border rounded-xl overflow-hidden transition-all duration-200
                    ${canAfford ? 'border-gray-200 hover:border-blue-300 hover:shadow-lg' : 'border-gray-100 opacity-75'}
                    ${compact ? 'p-3' : 'p-4'}
                  `}
                >
                  {/* Reward Image */}
                  <div className="relative mb-3">
                    {reward.image?.url ? (
                      <img
                        src={reward.image.url}
                        alt={reward.image.alt || reward.name}
                        className={`w-full object-cover rounded-lg ${compact ? 'h-24' : 'h-32'}`}
                      />
                    ) : (
                      <div className={`w-full bg-gradient-to-br ${typeConfig.bgColor} rounded-lg flex items-center justify-center ${compact ? 'h-24' : 'h-32'}`}>
                        <span className="text-4xl">{typeConfig.icon}</span>
                      </div>
                    )}

                    {/* Reward Type Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${typeConfig.color} ${typeConfig.bgColor}`}>
                      {typeConfig.icon} {typeConfig.name}
                    </div>
                  </div>

                  {/* Reward Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                      {reward.name}
                    </h4>

                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {reward.description}
                    </p>

                    {/* Discount/Value Info */}
                    {reward.discount_percentage && (
                      <div className="flex items-center gap-1 text-green-600">
                        <span className="text-lg">%</span>
                        <span className="font-bold">{reward.discount_percentage}</span>
                        <span className="text-sm">تخفیف</span>
                      </div>
                    )}

                    {reward.discount_amount && (
                      <div className="flex items-center gap-1 text-green-600">
                        <span className="text-lg">💰</span>
                        <span className="font-bold">{formatNumber(reward.discount_amount)}</span>
                        <span className="text-sm">تومان تخفیف</span>
                      </div>
                    )}

                    {/* Points Cost */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">🏆</span>
                        <span className="font-bold text-blue-600">
                          {formatNumber(reward.points_cost)}
                        </span>
                        <span className="text-sm text-gray-600">امتیاز</span>
                      </div>

                      {/* Affordability Status */}
                      <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                        canAfford
                          ? 'text-green-700 bg-green-100'
                          : 'text-red-700 bg-red-100'
                      }`}>
                        {canAfford ? 'قابل خرید' : 'امتیاز کم'}
                      </div>
                    </div>

                    {/* Usage Limits */}
                    {reward.max_uses_per_user && (
                      <p className="text-xs text-gray-500">
                        حداکثر {reward.max_uses_per_user} بار برای هر کاربر
                      </p>
                    )}

                    {/* Validity Period */}
                    {reward.valid_until && (
                      <p className="text-xs text-orange-600">
                        تا {new Date(reward.valid_until).toLocaleDateString('fa-IR')} معتبر
                      </p>
                    )}

                    {/* Claim Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedReward(reward)}
                        disabled={!canAfford || isClaimingThis}
                        className={`
                          w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors
                          ${canAfford
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          }
                          ${isClaimingThis ? 'opacity-75' : ''}
                        `}
                      >
                        {isClaimingThis ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>در حال دریافت...</span>
                          </div>
                        ) : canAfford ? (
                          'دریافت جایزه'
                        ) : (
                          `${formatNumber(reward.points_cost - (userScore?.available_points || 0))} امتیاز کم`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reward Detail Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">تایید دریافت جایزه</h3>
              <button
                onClick={() => setSelectedReward(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-500">✕</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Reward Info */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">
                    {getRewardTypeConfig(selectedReward.reward_type).icon}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {selectedReward.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedReward.description}
                </p>
              </div>

              {/* Cost Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">هزینه جایزه:</span>
                  <span className="font-semibold">
                    {formatNumber(selectedReward.points_cost)} امتیاز
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">امتیاز فعلی شما:</span>
                  <span className="font-semibold text-blue-600">
                    {formatNumber(userScore?.available_points || 0)} امتیاز
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="text-gray-600">باقی‌مانده:</span>
                  <span className={`font-semibold ${
                    (userScore?.available_points || 0) >= selectedReward.points_cost
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formatNumber(Math.max(0, (userScore?.available_points || 0) - selectedReward.points_cost))} امتیاز
                  </span>
                </div>
              </div>

              {/* Terms */}
              {selectedReward.terms_conditions && (
                <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">شرایط و قوانین:</p>
                  <p>{selectedReward.terms_conditions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedReward(null)}
                  className="flex-1 py-2 px-4 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={() => handleClaimReward(selectedReward)}
                  disabled={!userScore || userScore.available_points < selectedReward.points_cost}
                  className={`
                    flex-1 py-2 px-4 rounded-lg font-medium transition-colors
                    ${userScore && userScore.available_points >= selectedReward.points_cost
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  تایید دریافت
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreRewards;
