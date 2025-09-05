'use client';

import React, { useState } from 'react';
import { UserScoreLevel, Achievement, UserAchievement, AchievementType } from '@/types';

interface LevelBadgeProps {
  className?: string;
  level?: UserScoreLevel;
  achievement?: Achievement | UserAchievement;
  variant?: 'level' | 'achievement';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
  showProgress?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({
  className = '',
  level,
  achievement,
  variant = 'level',
  size = 'md',
  showDetails = true,
  showProgress = false,
  animated = true,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Level configuration
  const levelConfig = {
    bronze: {
      name: 'برنزی',
      name_en: 'Bronze',
      color: 'from-amber-400 to-amber-600',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      shadowColor: 'shadow-amber-200',
      icon: '🥉',
      glow: 'shadow-amber-400/20'
    },
    silver: {
      name: 'نقره‌ای',
      name_en: 'Silver',
      color: 'from-gray-400 to-gray-600',
      borderColor: 'border-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      shadowColor: 'shadow-gray-200',
      icon: '🥈',
      glow: 'shadow-gray-400/20'
    },
    gold: {
      name: 'طلایی',
      name_en: 'Gold',
      color: 'from-yellow-400 to-yellow-600',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      shadowColor: 'shadow-yellow-200',
      icon: '🥇',
      glow: 'shadow-yellow-400/20'
    },
    platinum: {
      name: 'پلاتینی',
      name_en: 'Platinum',
      color: 'from-slate-400 to-slate-600',
      borderColor: 'border-slate-500',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-50',
      shadowColor: 'shadow-slate-200',
      icon: '💎',
      glow: 'shadow-slate-400/20'
    },
    diamond: {
      name: 'الماسی',
      name_en: 'Diamond',
      color: 'from-blue-400 to-blue-600',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      shadowColor: 'shadow-blue-200',
      icon: '💠',
      glow: 'shadow-blue-400/20'
    },
    master: {
      name: 'استاد',
      name_en: 'Master',
      color: 'from-purple-400 to-purple-600',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      shadowColor: 'shadow-purple-200',
      icon: '👑',
      glow: 'shadow-purple-400/20'
    }
  };

  // Achievement type configuration
  const achievementTypeConfig = {
    first_purchase: { icon: '🛒', color: 'from-green-400 to-green-600' },
    loyal_customer: { icon: '💎', color: 'from-blue-400 to-blue-600' },
    big_spender: { icon: '💰', color: 'from-yellow-400 to-yellow-600' },
    reviewer: { icon: '⭐', color: 'from-orange-400 to-orange-600' },
    referrer: { icon: '👥', color: 'from-purple-400 to-purple-600' },
    milestone: { icon: '🏆', color: 'from-red-400 to-red-600' },
    seasonal: { icon: '🎉', color: 'from-pink-400 to-pink-600' },
    special: { icon: '✨', color: 'from-indigo-400 to-indigo-600' }
  };

  // Rarity configuration
  const rarityConfig = {
    common: {
      name: 'معمولی',
      color: 'from-gray-400 to-gray-500',
      borderColor: 'border-gray-400',
      glow: ''
    },
    uncommon: {
      name: 'غیرمعمول',
      color: 'from-green-400 to-green-500',
      borderColor: 'border-green-400',
      glow: 'shadow-green-400/20'
    },
    rare: {
      name: 'نادر',
      color: 'from-blue-400 to-blue-500',
      borderColor: 'border-blue-400',
      glow: 'shadow-blue-400/30'
    },
    epic: {
      name: 'حماسی',
      color: 'from-purple-400 to-purple-500',
      borderColor: 'border-purple-400',
      glow: 'shadow-purple-400/40'
    },
    legendary: {
      name: 'افسانه‌ای',
      color: 'from-yellow-400 to-orange-500',
      borderColor: 'border-yellow-400',
      glow: 'shadow-yellow-400/50'
    }
  };

  // Size configuration
  const sizeConfig = {
    sm: {
      container: 'w-12 h-12',
      icon: 'text-lg',
      text: 'text-xs',
      padding: 'p-1',
      gap: 'gap-1'
    },
    md: {
      container: 'w-16 h-16',
      icon: 'text-xl',
      text: 'text-sm',
      padding: 'p-2',
      gap: 'gap-2'
    },
    lg: {
      container: 'w-20 h-20',
      icon: 'text-2xl',
      text: 'text-base',
      padding: 'p-3',
      gap: 'gap-3'
    },
    xl: {
      container: 'w-24 h-24',
      icon: 'text-3xl',
      text: 'text-lg',
      padding: 'p-4',
      gap: 'gap-4'
    }
  };

  const sizeConf = sizeConfig[size];

  // Get level configuration
  const getLevelConfig = () => {
    if (!level) return levelConfig.bronze;
    return levelConfig[level] || levelConfig.bronze;
  };

  // Get achievement configuration
  const getAchievementConfig = () => {
    if (!achievement) return null;

    const achv = 'achievement' in achievement ? achievement.achievement : achievement;
    const typeConf = achievementTypeConfig[achv.type as AchievementType] || achievementTypeConfig.special;
    const rarityConf = rarityConfig[achv.rarity] || rarityConfig.common;

    return { typeConf, rarityConf, achv };
  };

  // Format number
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  // Render level badge
  const renderLevelBadge = () => {
    const config = getLevelConfig();

    return (
      <div
        className={`
          relative flex flex-col items-center ${sizeConf.gap} cursor-pointer group
          ${animated ? 'transition-all duration-300 hover:scale-110' : ''}
          ${className}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Badge */}
        <div className={`
          relative ${sizeConf.container} rounded-full
          bg-gradient-to-br ${config.color}
          border-2 ${config.borderColor}
          flex items-center justify-center
          shadow-lg ${config.glow}
          ${isHovered ? 'shadow-xl' : ''}
          ${animated ? 'transition-all duration-300' : ''}
        `}>
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-50"></div>

          {/* Icon */}
          <span className={`relative z-10 ${sizeConf.icon}`}>
            {config.icon}
          </span>

          {/* Pulse animation */}
          {animated && isHovered && (
            <div className={`
              absolute inset-0 rounded-full
              bg-gradient-to-br ${config.color}
              animate-ping opacity-30
            `}></div>
          )}
        </div>

        {/* Level Name */}
        {showDetails && (
          <div className="text-center">
            <p className={`font-bold ${config.textColor} ${sizeConf.text}`}>
              {config.name}
            </p>
          </div>
        )}

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-20">
            <div className={`
              px-3 py-2 rounded-lg text-xs font-medium text-white shadow-lg
              bg-gradient-to-br ${config.color}
              whitespace-nowrap
            `}>
              سطح {config.name}
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current`}></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render achievement badge
  const renderAchievementBadge = () => {
    const config = getAchievementConfig();
    if (!config) return null;

    const { typeConf, rarityConf, achv } = config;
    const userAchievement = 'earned_at' in achievement! ? achievement as UserAchievement : null;
    const isEarned = !!userAchievement?.completed;
    const progress = userAchievement?.progress || 0;

    return (
      <div
        className={`
          relative flex flex-col items-center ${sizeConf.gap} cursor-pointer group
          ${animated ? 'transition-all duration-300 hover:scale-105' : ''}
          ${className}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Badge */}
        <div className={`
          relative ${sizeConf.container} rounded-xl
          ${isEarned ? `bg-gradient-to-br ${rarityConf.color}` : 'bg-gray-300'}
          border-2 ${isEarned ? rarityConf.borderColor : 'border-gray-400'}
          flex items-center justify-center
          shadow-lg ${isEarned ? rarityConf.glow : ''}
          ${isHovered ? 'shadow-xl' : ''}
          ${animated ? 'transition-all duration-300' : ''}
          ${!isEarned ? 'grayscale opacity-60' : ''}
        `}>
          {/* Shine effect */}
          {isEarned && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent opacity-50"></div>
          )}

          {/* Icon */}
          <span className={`relative z-10 ${sizeConf.icon} ${!isEarned ? 'opacity-60' : ''}`}>
            {typeConf.icon}
          </span>

          {/* Progress indicator */}
          {showProgress && !isEarned && progress > 0 && (
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-blue-500/30 transition-all duration-500"
                style={{ height: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Earned indicator */}
          {isEarned && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}

          {/* Sparkle animation for legendary */}
          {isEarned && achv.rarity === 'legendary' && animated && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping delay-0"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
              <div className="absolute top-1/2 left-0 w-1 h-1 bg-white rounded-full animate-ping delay-600"></div>
            </div>
          )}
        </div>

        {/* Achievement Details */}
        {showDetails && (
          <div className="text-center">
            <p className={`font-semibold ${sizeConf.text} ${isEarned ? 'text-gray-900' : 'text-gray-500'} mb-1`}>
              {achv.name}
            </p>
            <p className={`text-xs ${rarityConfig[achv.rarity].name === 'معمولی' ? 'text-gray-500' : 'font-medium'}`}
               style={{ color: isEarned ? undefined : '#9CA3AF' }}>
              {rarityConfig[achv.rarity].name}
            </p>
            {showProgress && !isEarned && progress > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                {progress}% تکمیل
              </p>
            )}
          </div>
        )}

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-20">
            <div className="relative">
              <div className={`
                px-4 py-3 rounded-lg text-sm font-medium text-white shadow-xl
                ${isEarned ? `bg-gradient-to-br ${rarityConf.color}` : 'bg-gray-600'}
                max-w-xs whitespace-normal text-center
              `}>
                <p className="font-bold mb-1">{achv.name}</p>
                <p className="text-xs opacity-90 mb-2">{achv.description}</p>

                <div className="flex items-center justify-center gap-2 text-xs">
                  <span>🏆 {formatNumber(achv.points_reward)} امتیاز</span>
                  <span>•</span>
                  <span>{rarityConfig[achv.rarity].name}</span>
                </div>

                {userAchievement?.earned_at && (
                  <p className="text-xs opacity-75 mt-2">
                    کسب شده: {new Date(userAchievement.earned_at).toLocaleDateString('fa-IR')}
                  </p>
                )}

                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render based on variant
  if (variant === 'level') {
    return renderLevelBadge();
  } else {
    return renderAchievementBadge();
  }
};

export default LevelBadge;
