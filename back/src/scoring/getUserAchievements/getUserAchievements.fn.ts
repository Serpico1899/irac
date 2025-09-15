import { ActFn } from "@deps";
import { scoringService } from "../scoringService.ts";

export const getUserAchievementsFn: ActFn = async (body) => {
  try {
    const {
      user_id,
      include_locked = false,
      category = "all",
      limit = 50,
      skip = 0,
    } = body.details.set;

    const userId = user_id || body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
        details: { auth_required: true },
      };
    }

    // Validate pagination parameters
    if (limit > 100 || limit < 1 || skip < 0) {
      return {
        success: false,
        message: "Invalid pagination parameters",
        details: { limit, skip, max_limit: 100 },
      };
    }

    // Get user level data
    const userScoreResult = await scoringService.getUserScore(userId.toString());

    if (!userScoreResult.success) {
      return {
        success: false,
        message: "Failed to get user data",
        details: { error: userScoreResult.error },
      };
    }

    const userLevel = userScoreResult.data;
    const earnedAchievements = userLevel.achievements || [];

    // Define all possible achievements with metadata
    const allAchievements = [
      // Purchase achievements
      {
        id: "first_purchase",
        name: "First Purchase",
        name_fa: "اولین خرید",
        description: "Make your first purchase",
        description_fa: "اولین خرید خود را انجام دهید",
        category: "purchase",
        icon: "🛍️",
        points_reward: 0,
        rarity: "common",
        unlock_criteria: "Make any purchase",
        progress_type: "binary",
      },
      {
        id: "big_spender",
        name: "Big Spender",
        name_fa: "خریدار بزرگ",
        description: "Spend over 1,000,000 IRR",
        description_fa: "بیش از ۱,۰۰۰,۰۰۰ تومان خرید کنید",
        category: "purchase",
        icon: "💎",
        points_reward: 500,
        rarity: "legendary",
        unlock_criteria: "Spend 1,000,000+ IRR total",
        progress_type: "cumulative",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.BIG_SPENDER,
      },

      // Course achievements
      {
        id: "course_master",
        name: "Course Master",
        name_fa: "استاد دوره‌ها",
        description: "Complete 10 courses",
        description_fa: "۱۰ دوره را تکمیل کنید",
        category: "activity",
        icon: "🎓",
        points_reward: 200,
        rarity: "rare",
        unlock_criteria: "Complete 10 courses",
        progress_type: "count",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.COURSE_MASTER,
      },

      // Level achievements
      {
        id: "level_up_5",
        name: "Rising Star",
        name_fa: "ستاره در حال طلوع",
        description: "Reach level 5",
        description_fa: "به سطح ۵ برسید",
        category: "level",
        icon: "⭐",
        points_reward: 100,
        rarity: "common",
        unlock_criteria: "Reach user level 5",
        progress_type: "level",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_5,
      },
      {
        id: "level_up_10",
        name: "Expert",
        name_fa: "متخصص",
        description: "Reach level 10",
        description_fa: "به سطح ۱۰ برسید",
        category: "level",
        icon: "🌟",
        points_reward: 250,
        rarity: "uncommon",
        unlock_criteria: "Reach user level 10",
        progress_type: "level",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_10,
      },
      {
        id: "level_up_25",
        name: "Master",
        name_fa: "استاد",
        description: "Reach level 25",
        description_fa: "به سطح ۲۵ برسید",
        category: "level",
        icon: "💫",
        points_reward: 500,
        rarity: "epic",
        unlock_criteria: "Reach user level 25",
        progress_type: "level",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_25,
      },
      {
        id: "level_up_50",
        name: "Legend",
        name_fa: "افسانه",
        description: "Reach level 50",
        description_fa: "به سطح ۵۰ برسید",
        category: "level",
        icon: "👑",
        points_reward: 1000,
        rarity: "legendary",
        unlock_criteria: "Reach user level 50",
        progress_type: "level",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_50,
      },

      // Streak achievements
      {
        id: "daily_login_streak_7",
        name: "Week Warrior",
        name_fa: "جنگجوی هفته",
        description: "Login for 7 consecutive days",
        description_fa: "۷ روز متوالی وارد شوید",
        category: "streak",
        icon: "🔥",
        points_reward: 50,
        rarity: "common",
        unlock_criteria: "Login for 7 consecutive days",
        progress_type: "streak",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.DAILY_LOGIN_STREAK_7,
      },
      {
        id: "daily_login_streak_30",
        name: "Monthly Champion",
        name_fa: "قهرمان ماهانه",
        description: "Login for 30 consecutive days",
        description_fa: "۳۰ روز متوالی وارد شوید",
        category: "streak",
        icon: "🏆",
        points_reward: 200,
        rarity: "rare",
        unlock_criteria: "Login for 30 consecutive days",
        progress_type: "streak",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.DAILY_LOGIN_STREAK_30,
      },
      {
        id: "daily_login_streak_100",
        name: "Century Master",
        name_fa: "استاد قرن",
        description: "Login for 100 consecutive days",
        description_fa: "۱۰۰ روز متوالی وارد شوید",
        category: "streak",
        icon: "💯",
        points_reward: 1000,
        rarity: "legendary",
        unlock_criteria: "Login for 100 consecutive days",
        progress_type: "streak",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.DAILY_LOGIN_STREAK_100,
      },

      // Social achievements
      {
        id: "referral_champion",
        name: "Referral Champion",
        name_fa: "قهرمان معرفی",
        description: "Successfully refer 10 users",
        description_fa: "۱۰ کاربر را با موفقیت معرفی کنید",
        category: "social",
        icon: "🤝",
        points_reward: 500,
        rarity: "epic",
        unlock_criteria: "Successfully refer 10 users",
        progress_type: "count",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.REFERRAL_CHAMPION,
      },
      {
        id: "social_butterfly",
        name: "Social Butterfly",
        name_fa: "پروانه اجتماعی",
        description: "Share content on social media 20 times",
        description_fa: "۲۰ بار محتوا را در شبکه‌های اجتماعی به اشتراک بگذارید",
        category: "social",
        icon: "🦋",
        points_reward: 100,
        rarity: "uncommon",
        unlock_criteria: "Share 20 times on social media",
        progress_type: "count",
        target_value: 20,
      },

      // Activity achievements
      {
        id: "workshop_enthusiast",
        name: "Workshop Enthusiast",
        name_fa: "علاقه‌مند کارگاه",
        description: "Book 5 workshop sessions",
        description_fa: "۵ جلسه کارگاه رزرو کنید",
        category: "activity",
        icon: "🏗️",
        points_reward: 150,
        rarity: "uncommon",
        unlock_criteria: "Book 5 workshop sessions",
        progress_type: "count",
        target_value: 5,
      },
      {
        id: "review_master",
        name: "Review Master",
        name_fa: "استاد بررسی",
        description: "Write 25 helpful reviews",
        description_fa: "۲۵ بررسی مفید بنویسید",
        category: "activity",
        icon: "✍️",
        points_reward: 200,
        rarity: "rare",
        unlock_criteria: "Write 25 reviews",
        progress_type: "count",
        target_value: scoringService.ACHIEVEMENT_THRESHOLDS.REVIEW_MASTER,
      },
      {
        id: "profile_perfectionist",
        name: "Profile Perfectionist",
        name_fa: "کمال‌گرای پروفایل",
        description: "Complete 100% of your profile",
        description_fa: "۱۰۰٪ پروفایل خود را تکمیل کنید",
        category: "activity",
        icon: "📝",
        points_reward: 50,
        rarity: "common",
        unlock_criteria: "Complete profile 100%",
        progress_type: "percentage",
        target_value: 100,
      },

      // Special achievements
      {
        id: "early_bird",
        name: "Early Bird",
        name_fa: "زودخیز",
        description: "Join IRAC in the first month",
        description_fa: "در ماه اول به آیراک بپیوندید",
        category: "special",
        icon: "🐦",
        points_reward: 100,
        rarity: "rare",
        unlock_criteria: "Register in the first month",
        progress_type: "binary",
      },
      {
        id: "loyal_customer",
        name: "Loyal Customer",
        name_fa: "مشتری وفادار",
        description: "Stay active for 365 days",
        description_fa: "۳۶۵ روز فعال باشید",
        category: "special",
        icon: "💝",
        points_reward: 1000,
        rarity: "legendary",
        unlock_criteria: "Be active for 1 year",
        progress_type: "duration",
        target_value: 365,
      },
    ];

    // Filter achievements by category
    let filteredAchievements = allAchievements;
    if (category !== "all") {
      filteredAchievements = allAchievements.filter(ach => ach.category === category);
    }

    // Calculate progress for each achievement
    const achievementsWithProgress = filteredAchievements.map(achievement => {
      const isEarned = earnedAchievements.includes(achievement.id);
      let progress = 0;
      let currentValue = 0;

      // Calculate progress based on achievement type
      if (!isEarned) {
        switch (achievement.progress_type) {
          case "level":
            currentValue = userLevel.level || 1;
            progress = Math.min(100, (currentValue / achievement.target_value) * 100);
            break;
          case "count":
            if (achievement.id.includes("course")) {
              currentValue = userLevel.total_courses_completed || 0;
            } else if (achievement.id.includes("referral")) {
              currentValue = userLevel.total_referrals || 0;
            } else if (achievement.id.includes("review")) {
              currentValue = 0; // Would need review count from another collection
            } else if (achievement.id.includes("workshop")) {
              currentValue = 0; // Would need booking count from another collection
            }
            progress = Math.min(100, (currentValue / achievement.target_value) * 100);
            break;
          case "streak":
            currentValue = achievement.id.includes("daily_login") ?
              (userLevel.daily_login_streak || 0) : 0;
            progress = Math.min(100, (currentValue / achievement.target_value) * 100);
            break;
          case "cumulative":
            // This would need spending data from orders
            currentValue = 0;
            progress = Math.min(100, (currentValue / achievement.target_value) * 100);
            break;
          case "binary":
          case "percentage":
          case "duration":
          default:
            progress = 0;
            break;
        }
      } else {
        progress = 100;
        currentValue = achievement.target_value || 1;
      }

      return {
        ...achievement,
        is_earned: isEarned,
        earned_at: isEarned ? userLevel.last_achievement_at || userLevel.created_at : null,
        progress: {
          percentage: Math.round(progress),
          current_value: currentValue,
          target_value: achievement.target_value || 1,
          is_complete: isEarned,
        },
      };
    });

    // Filter earned/locked achievements if requested
    let finalAchievements = achievementsWithProgress;
    if (!include_locked) {
      finalAchievements = achievementsWithProgress.filter(ach => ach.is_earned);
    }

    // Apply pagination
    const total = finalAchievements.length;
    const paginatedAchievements = finalAchievements.slice(skip, skip + limit);

    // Calculate summary statistics
    const earnedCount = achievementsWithProgress.filter(ach => ach.is_earned).length;
    const totalPossible = achievementsWithProgress.length;
    const completionPercentage = Math.round((earnedCount / totalPossible) * 100);

    const rarityCount = {
      common: achievementsWithProgress.filter(ach => ach.is_earned && ach.rarity === "common").length,
      uncommon: achievementsWithProgress.filter(ach => ach.is_earned && ach.rarity === "uncommon").length,
      rare: achievementsWithProgress.filter(ach => ach.is_earned && ach.rarity === "rare").length,
      epic: achievementsWithProgress.filter(ach => ach.is_earned && ach.rarity === "epic").length,
      legendary: achievementsWithProgress.filter(ach => ach.is_earned && ach.rarity === "legendary").length,
    };

    const recentAchievements = achievementsWithProgress
      .filter(ach => ach.is_earned && ach.earned_at)
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, 5);

    return {
      success: true,
      body: {
        achievements: paginatedAchievements,
        pagination: {
          current_page: Math.floor(skip / limit) + 1,
          total_pages: Math.ceil(total / limit),
          limit,
          skip,
          total_count: total,
          has_next_page: skip + limit < total,
          has_prev_page: skip > 0,
        },
        summary: {
          earned_count: earnedCount,
          total_possible: totalPossible,
          completion_percentage: completionPercentage,
          rarity_breakdown: rarityCount,
          recent_achievements: recentAchievements.map(ach => ({
            id: ach.id,
            name: ach.name,
            name_fa: ach.name_fa,
            icon: ach.icon,
            rarity: ach.rarity,
            earned_at: ach.earned_at,
          })),
        },
        filters: {
          category,
          include_locked,
          showing_earned_only: !include_locked,
        },
        categories: [
          { id: "all", name: "All Achievements", name_fa: "همه دستاورد ها", count: totalPossible },
          { id: "level", name: "Level", name_fa: "سطح", count: allAchievements.filter(a => a.category === "level").length },
          { id: "activity", name: "Activity", name_fa: "فعالیت", count: allAchievements.filter(a => a.category === "activity").length },
          { id: "purchase", name: "Purchase", name_fa: "خرید", count: allAchievements.filter(a => a.category === "purchase").length },
          { id: "social", name: "Social", name_fa: "اجتماعی", count: allAchievements.filter(a => a.category === "social").length },
          { id: "streak", name: "Streak", name_fa: "رکورد", count: allAchievements.filter(a => a.category === "streak").length },
          { id: "special", name: "Special", name_fa: "ویژه", count: allAchievements.filter(a => a.category === "special").length },
        ],
        meta: {
          user_id: userId,
          generated_at: new Date().toISOString(),
          user_level: userLevel.level || 1,
          user_points: userLevel.total_lifetime_points || 0,
        },
      },
      message: `Retrieved ${paginatedAchievements.length} achievements (${earnedCount}/${totalPossible} earned)`,
    };
  } catch (error) {
    console.error("Error in getUserAchievements function:", error);
    return {
      success: false,
      message: "Internal server error while getting user achievements",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        category: body.details.set.category,
        include_locked: body.details.set.include_locked,
      },
    };
  }
};
