'use client';

import React from 'react';
import { useScoring } from '@/context/ScoringContext';
import { UserScoreLevel } from '@/types';

interface UserScoreProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  showMultiplier?: boolean;
}

const UserScore: React.FC<UserScoreProps> = ({
  className = '',
  variant = 'default',
  showProgress = true,
  showMultiplier = true
}) => {
  const { userScore, isLoading, error } = useScoring();

  // Level configuration with colors and icons
  const levelConfig = {
    bronze: {
      name: 'برنزی',
      name_en: 'Bronze',
      color: 'bg-amber-600',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-600',
      bgLight: 'bg-amber-50',
      icon: '🥉',
    },
    silver: {
      name: 'نقره‌ای',
      name_en: 'Silver',
      color: 'bg-gray-500',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-500',
      bgLight: 'bg-gray-50',
      icon: '🥈',
    },
    gold: {
      name: 'طلایی',
      name_en: 'Gold',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500',
      bgLight: 'bg-yellow-50',
      icon: '🥇',
    },
    platinum: {
      name: 'پلاتینی',
      name_en: 'Platinum',
      color: 'bg-slate-600',
      textColor: 'text-slate-600',
      borderColor: 'border-slate-600',
      bgLight: 'bg-slate-50',
      icon: '💎',
    },
    diamond: {
      name: 'الماسی',
      name_en: 'Diamond',
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-600',
      bgLight: 'bg-blue-50',
      icon: '💠',
    },
    master: {
      name: 'استاد',
      name_en: 'Master',
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-600',
      bgLight: 'bg-purple-50',
      icon: '👑',
    },
  };

  // Format number with Persian separators
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  // Get level configuration
  const getLevelConfig = (level: UserScoreLevel) => {
    return levelConfig[level] || levelConfig.bronze;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
        <div className="animate-pulse">
          {variant === 'compact' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              {showProgress && (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !userScore) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3 text-red-700">
          <span className="text-xl">❌</span>
          <div>
            <p className="text-sm font-medium">خطا در بارگذاری امتیاز</p>
            <p className="text-xs opacity-75">
              {error || 'اطلاعات امتیاز در دسترس نیست'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelConfig(userScore.level);

  // Compact variant for small spaces
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg border border-gray-100 p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${levelInfo.color} flex items-center justify-center text-white text-sm font-bold`}>
              {levelInfo.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {formatNumber(userScore.available_points)} امتیاز
              </p>
              <p className={`text-xs font-medium ${levelInfo.textColor}`}>
                {levelInfo.name}
              </p>
            </div>
          </div>
          {showMultiplier && userScore.multiplier > 1 && (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
              ×{userScore.multiplier}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default and detailed variants
  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${levelInfo.color} flex items-center justify-center text-white shadow-lg`}>
              <span className="text-xl sm:text-2xl">{levelInfo.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-lg sm:text-xl font-bold ${levelInfo.textColor}`}>
                  {levelInfo.name}
                </h3>
                {showMultiplier && userScore.multiplier > 1 && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs sm:text-sm font-medium">
                    ضریب ×{userScore.multiplier}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                سطح فعلی شما
              </p>
            </div>
          </div>

          {variant === 'detailed' && userScore.current_streak > 0 && (
            <div className="text-center">
              <div className="text-orange-500 text-xl sm:text-2xl mb-1">🔥</div>
              <p className="text-xs text-gray-600">
                {formatNumber(userScore.current_streak)} روز
              </p>
              <p className="text-xs text-gray-500">فعالیت مداوم</p>
            </div>
          )}
        </div>

        {/* Points Display */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-600 text-xs sm:text-sm font-medium mb-1">
              امتیاز فعلی
            </p>
            <p className="text-blue-900 text-lg sm:text-xl font-bold">
              {formatNumber(userScore.available_points)}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-green-600 text-xs sm:text-sm font-medium mb-1">
              کل کسب شده
            </p>
            <p className="text-green-900 text-lg sm:text-xl font-bold">
              {formatNumber(userScore.lifetime_earned)}
            </p>
          </div>

          {variant === 'detailed' && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-purple-600 text-xs sm:text-sm font-medium mb-1">
                استفاده شده
              </p>
              <p className="text-purple-900 text-lg sm:text-xl font-bold">
                {formatNumber(userScore.used_points)}
              </p>
            </div>
          )}
        </div>

        {/* Progress to Next Level */}
        {showProgress && userScore.next_level_points > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">پیشرفت تا سطح بعد</span>
              <span className="font-medium text-gray-900">
                {userScore.level_progress}%
              </span>
            </div>

            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div
                  className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${levelInfo.color}`}
                  style={{ width: `${Math.min(userScore.level_progress, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {formatNumber(userScore.total_points)} امتیاز
              </span>
              <span>
                {formatNumber(userScore.next_level_points)} امتیاز تا سطح بعد
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats (Detailed variant only) */}
      {variant === 'detailed' && (
        <div className="px-4 sm:px-6 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                🏆 بهترین دوره: {formatNumber(userScore.longest_streak)} روز
              </span>
              {userScore.last_activity_at && (
                <span>
                  📅 آخرین فعالیت: {new Date(userScore.last_activity_at).toLocaleDateString('fa-IR')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserScore;
