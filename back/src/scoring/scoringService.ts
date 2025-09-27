import {  coreApp  } from "@app";
import { ActFn } from "@deps";

export class ScoringService {
  // Points configuration
  static readonly POINTS_CONFIG = {
    COURSE_PURCHASE: 50,
    COURSE_COMPLETION: 100,
    PRODUCT_PURCHASE_RATE: 1, // Points per 1000 IRR spent
    DAILY_LOGIN: 5,
    REFERRAL_SUCCESS: 200,
    WORKSHOP_BOOKING: 25,
    REVIEW_WRITE: 15,
    PROFILE_COMPLETE: 20,
    SOCIAL_SHARE: 10,
    LEVEL_THRESHOLD: 500, // Points needed per level
  };

  // Achievement thresholds
  static readonly ACHIEVEMENT_THRESHOLDS = {
    FIRST_PURCHASE: 1,
    COURSE_MASTER: 10, // Complete 10 courses
    BIG_SPENDER: 1000000, // Spend 1,000,000 IRR
    REFERRAL_CHAMPION: 10, // 10 successful referrals
    DAILY_LOGIN_STREAK_7: 7,
    DAILY_LOGIN_STREAK_30: 30,
    DAILY_LOGIN_STREAK_100: 100,
    LEVEL_UP_5: 5,
    LEVEL_UP_10: 10,
    LEVEL_UP_25: 25,
    LEVEL_UP_50: 50,
    REVIEW_MASTER: 25, // Write 25 reviews
  };

  /**
   * Award points to a user for a specific action
   */
  static async awardPoints(params: {
    userId: string;
    action: string;
    points: number;
    description: string;
    metadata?: Record<string, any>;
    referenceId?: string;
    referenceType?: string;
    orderId?: string;
    courseId?: string;
  }) {
    try {
      const {
        userId,
        action,
        points,
        description,
        metadata = {},
        referenceId,
        referenceType,
        orderId,
        courseId,
      } = params;

      const scoringTransactionModel = coreApp.odm.db.collection("scoring_transaction");
      const userLevelModel = coreApp.odm.db.collection("user_level");

      // Check for duplicate transactions (prevent double-awarding)
      if (referenceId && referenceType) {
        const existingTransaction = await scoringTransactionModel.findOne({
          "user._id": coreApp.odm.ObjectId(userId),
          reference_id: referenceId,
          reference_type: referenceType,
          status: "completed",
        });

        if (existingTransaction) {
          return {
            success: false,
            message: "Points already awarded for this action",
            data: { duplicate: true },
          };
        }
      }

      // Create scoring transaction
      const transactionData = {
        _id: coreApp.odm.ObjectId(),
        user: { _id: coreApp.odm.ObjectId(userId) },
        points,
        action,
        status: "completed",
        description,
        metadata: JSON.stringify(metadata),
        reference_id: referenceId,
        reference_type: referenceType,
        processed_at: new Date().toISOString(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Add relations if provided
      if (orderId) {
        transactionData.order = { _id: coreApp.odm.ObjectId(orderId) };
      }
      if (courseId) {
        transactionData.course = { _id: coreApp.odm.ObjectId(courseId) };
      }

      await scoringTransactionModel.insertOne(transactionData);

      // Update or create user level
      const currentUserLevel = await userLevelModel.findOne({
        "user._id": coreApp.odm.ObjectId(userId),
      });

      let newCurrentPoints, newTotalPoints, newLevel, leveledUp = false;
      let newAchievements: string[] = [];

      if (currentUserLevel) {
        newCurrentPoints = currentUserLevel.current_points + points;
        newTotalPoints = currentUserLevel.total_lifetime_points + points;
        newLevel = this.calculateLevel(newTotalPoints);
        leveledUp = newLevel > currentUserLevel.level;
        newAchievements = [...currentUserLevel.achievements];
      } else {
        newCurrentPoints = points;
        newTotalPoints = points;
        newLevel = this.calculateLevel(newTotalPoints);
        leveledUp = newLevel > 1;
      }

      // Calculate points breakdown based on action
      const pointsBreakdown = this.calculatePointsBreakdown(action, points, currentUserLevel);

      // Check for new achievements
      const earnedAchievements = await this.checkAchievements(userId, {
        currentPoints: newCurrentPoints,
        totalLifetimePoints: newTotalPoints,
        level: newLevel,
        action,
        metadata,
      });

      newAchievements.push(...earnedAchievements.filter(a => !newAchievements.includes(a)));

      // Calculate level progress
      const { pointsToNextLevel, progressPercentage } = this.calculateLevelProgress(newTotalPoints, newLevel);

      // Update user level
      const updateData = {
        current_points: newCurrentPoints,
        total_lifetime_points: newTotalPoints,
        level: newLevel,
        achievements: newAchievements,
        achievement_count: newAchievements.length,
        points_to_next_level: pointsToNextLevel,
        level_progress_percentage: progressPercentage,
        last_points_earned_at: new Date(),
        updated_at: new Date(),
        ...pointsBreakdown,
      };

      if (leveledUp) {
        updateData.last_level_up_at = new Date();
      }

      if (earnedAchievements.length > 0) {
        updateData.last_achievement_at = new Date();
      }

      if (currentUserLevel) {
        await userLevelModel.updateOne(
          { "user._id": coreApp.odm.ObjectId(userId) },
          { $set: updateData }
        );
      } else {
        await userLevelModel.insertOne({
          _id: coreApp.odm.ObjectId(),
          user: { _id: coreApp.odm.ObjectId(userId) },
          ...updateData,
          created_at: new Date(),
        });
      }

      return {
        success: true,
        data: {
          points_awarded: points,
          new_total_points: newTotalPoints,
          new_level: newLevel,
          leveled_up: leveledUp,
          new_achievements: earnedAchievements,
          level_progress: {
            points_to_next_level: pointsToNextLevel,
            progress_percentage: progressPercentage,
          },
        },
      };
    } catch (error) {
      console.error("Error awarding points:", error);
      return {
        success: false,
        message: "Failed to award points",
        error: error.message,
      };
    }
  }

  /**
   * Calculate user level based on total points
   */
  static calculateLevel(totalPoints: number): number {
    return Math.floor(totalPoints / this.POINTS_CONFIG.LEVEL_THRESHOLD) + 1;
  }

  /**
   * Calculate progress to next level
   */
  static calculateLevelProgress(totalPoints: number, currentLevel: number) {
    const pointsInCurrentLevel = totalPoints % this.POINTS_CONFIG.LEVEL_THRESHOLD;
    const pointsToNextLevel = this.POINTS_CONFIG.LEVEL_THRESHOLD - pointsInCurrentLevel;
    const progressPercentage = Math.round((pointsInCurrentLevel / this.POINTS_CONFIG.LEVEL_THRESHOLD) * 100);

    return { pointsToNextLevel, progressPercentage };
  }

  /**
   * Calculate points breakdown based on action
   */
  static calculatePointsBreakdown(action: string, points: number, currentUserLevel: any) {
    const breakdown = {
      points_from_purchases: currentUserLevel?.points_from_purchases || 0,
      points_from_courses: currentUserLevel?.points_from_courses || 0,
      points_from_referrals: currentUserLevel?.points_from_referrals || 0,
      points_from_activities: currentUserLevel?.points_from_activities || 0,
      points_from_bonuses: currentUserLevel?.points_from_bonuses || 0,
    };

    switch (action) {
      case "purchase":
        breakdown.points_from_purchases += points;
        break;
      case "course_complete":
        breakdown.points_from_courses += points;
        break;
      case "referral":
        breakdown.points_from_referrals += points;
        break;
      case "daily_login":
      case "workshop_booking":
      case "review_write":
      case "profile_complete":
      case "social_share":
        breakdown.points_from_activities += points;
        break;
      case "bonus":
      case "manual_adjustment":
        breakdown.points_from_bonuses += points;
        break;
    }

    return breakdown;
  }

  /**
   * Check for new achievements
   */
  static async checkAchievements(userId: string, data: {
    currentPoints: number;
    totalLifetimePoints: number;
    level: number;
    action: string;
    metadata: Record<string, any>;
  }) {
    const newAchievements: string[] = [];

    // Level-based achievements
    if (data.level >= this.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_5 && data.level < this.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_10) {
      newAchievements.push("level_up_5");
    }
    if (data.level >= this.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_10 && data.level < this.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_25) {
      newAchievements.push("level_up_10");
    }
    if (data.level >= this.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_25 && data.level < this.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_50) {
      newAchievements.push("level_up_25");
    }
    if (data.level >= this.ACHIEVEMENT_THRESHOLDS.LEVEL_UP_50) {
      newAchievements.push("level_up_50");
    }

    // Action-based achievements
    if (data.action === "purchase") {
      newAchievements.push("first_purchase");
    }

    // Get user statistics for complex achievements
    const userStats = await this.getUserStatistics(userId);

    if (userStats.success) {
      const stats = userStats.data;

      // Course completion achievements
      if (stats.total_courses_completed >= this.ACHIEVEMENT_THRESHOLDS.COURSE_MASTER) {
        newAchievements.push("course_master");
      }

      // Referral achievements
      if (stats.total_referrals >= this.ACHIEVEMENT_THRESHOLDS.REFERRAL_CHAMPION) {
        newAchievements.push("referral_champion");
      }

      // Daily login streak achievements
      if (stats.daily_login_streak >= this.ACHIEVEMENT_THRESHOLDS.DAILY_LOGIN_STREAK_7) {
        newAchievements.push("daily_login_streak_7");
      }
      if (stats.daily_login_streak >= this.ACHIEVEMENT_THRESHOLDS.DAILY_LOGIN_STREAK_30) {
        newAchievements.push("daily_login_streak_30");
      }
      if (stats.daily_login_streak >= this.ACHIEVEMENT_THRESHOLDS.DAILY_LOGIN_STREAK_100) {
        newAchievements.push("daily_login_streak_100");
      }
    }

    return newAchievements;
  }

  /**
   * Get user scoring statistics
   */
  static async getUserScore(userId: string) {
    try {
      const userLevelModel = coreApp.odm.db.collection("user_level");
      const userLevel = await userLevelModel.findOne({
        "user._id": coreApp.odm.ObjectId(userId),
      });

      if (!userLevel) {
        // Create initial user level
        const initialData = {
          _id: coreApp.odm.ObjectId(),
          user: { _id: coreApp.odm.ObjectId(userId) },
          current_points: 0,
          total_lifetime_points: 0,
          level: 1,
          achievements: [],
          achievement_count: 0,
          points_to_next_level: this.POINTS_CONFIG.LEVEL_THRESHOLD,
          level_progress_percentage: 0,
          total_purchases: 0,
          total_courses_completed: 0,
          total_referrals: 0,
          total_logins: 0,
          daily_login_streak: 0,
          max_daily_login_streak: 0,
          points_from_purchases: 0,
          points_from_courses: 0,
          points_from_referrals: 0,
          points_from_activities: 0,
          points_from_bonuses: 0,
          total_penalties: 0,
          points_lost_penalties: 0,
          current_multiplier: 1.0,
          is_frozen: false,
          manual_adjustments: 0,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        };

        await userLevelModel.insertOne(initialData);
        return {
          success: true,
          data: initialData,
        };
      }

      return {
        success: true,
        data: userLevel,
      };
    } catch (error) {
      console.error("Error getting user score:", error);
      return {
        success: false,
        message: "Failed to get user score",
        error: error.message,
      };
    }
  }

  /**
   * Get leaderboard data
   */
  static async getLeaderboard(params: { limit?: number; skip?: number } = {}) {
    try {
      const { limit = 50, skip = 0 } = params;
      const userLevelModel = coreApp.odm.db.collection("user_level");

      const leaderboard = await userLevelModel
        .aggregate([
          {
            $match: {
              is_frozen: { $ne: true },
              status: "active",
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "user._id",
              foreignField: "_id",
              as: "user_details",
            },
          },
          {
            $unwind: "$user_details",
          },
          {
            $sort: {
              total_lifetime_points: -1,
              level: -1,
              current_points: -1,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              user_id: "$user._id",
              name: {
                $concat: ["$user_details.first_name", " ", "$user_details.last_name"],
              },
              avatar: "$user_details.avatar",
              current_points: 1,
              total_lifetime_points: 1,
              level: 1,
              achievement_count: 1,
              rank_position: { $add: [skip, { $literal: 1 }] },
            },
          },
        ])
        .toArray();

      return {
        success: true,
        data: {
          leaderboard,
          total_count: await userLevelModel.countDocuments({
            is_frozen: { $ne: true },
            status: "active",
          }),
          page: Math.floor(skip / limit) + 1,
          limit,
        },
      };
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return {
        success: false,
        message: "Failed to get leaderboard",
        error: error.message,
      };
    }
  }

  /**
   * Get user statistics for achievements
   */
  static async getUserStatistics(userId: string) {
    try {
      const userLevelModel = coreApp.odm.db.collection("user_level");
      const userStats = await userLevelModel.findOne(
        { "user._id": coreApp.odm.ObjectId(userId) },
        {
          projection: {
            total_purchases: 1,
            total_courses_completed: 1,
            total_referrals: 1,
            total_logins: 1,
            daily_login_streak: 1,
            max_daily_login_streak: 1,
          },
        }
      );

      return {
        success: true,
        data: userStats || {
          total_purchases: 0,
          total_courses_completed: 0,
          total_referrals: 0,
          total_logins: 0,
          daily_login_streak: 0,
          max_daily_login_streak: 0,
        },
      };
    } catch (error) {
      console.error("Error getting user statistics:", error);
      return {
        success: false,
        message: "Failed to get user statistics",
        error: error.message,
      };
    }
  }

  /**
   * Calculate points for purchase
   */
  static calculatePurchasePoints(amount: number, currency: string = "IRR"): number {
    // Convert to IRR if needed
    let irrAmount = amount;
    if (currency === "USD") {
      irrAmount = amount * 42000; // Approximate conversion
    }

    // 1 point per 1000 IRR spent
    return Math.floor(irrAmount / 1000) * this.POINTS_CONFIG.PRODUCT_PURCHASE_RATE;
  }

  /**
   * Process daily login
   */
  static async processDailyLogin(userId: string, metadata: Record<string, any> = {}) {
    try {
      const userLevelModel = coreApp.odm.db.collection("user_level");
      const today = new Date().toISOString().split('T')[0];

      // Check if user already logged in today
      const userLevel = await userLevelModel.findOne({
        "user._id": coreApp.odm.ObjectId(userId),
      });

      const lastLoginDate = userLevel?.last_points_earned_at
        ? new Date(userLevel.last_points_earned_at).toISOString().split('T')[0]
        : null;

      if (lastLoginDate === today) {
        return {
          success: false,
          message: "Daily login already processed for today",
          data: { already_processed: true },
        };
      }

      // Calculate streak
      let newStreak = 1;
      if (userLevel && lastLoginDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastLoginDate === yesterdayStr) {
          newStreak = (userLevel.daily_login_streak || 0) + 1;
        }
      }

      // Update streak
      await userLevelModel.updateOne(
        { "user._id": coreApp.odm.ObjectId(userId) },
        {
          $set: {
            daily_login_streak: newStreak,
            max_daily_login_streak: Math.max(userLevel?.max_daily_login_streak || 0, newStreak),
            total_logins: (userLevel?.total_logins || 0) + 1,
            updated_at: new Date(),
          },
        },
        { upsert: true }
      );

      // Award points
      return await this.awardPoints({
        userId,
        action: "daily_login",
        points: this.POINTS_CONFIG.DAILY_LOGIN,
        description: `Daily login bonus - Streak: ${newStreak}`,
        metadata: { ...metadata, streak: newStreak, login_date: today },
      });
    } catch (error) {
      console.error("Error processing daily login:", error);
      return {
        success: false,
        message: "Failed to process daily login",
        error: error.message,
      };
    }
  }
}

export const scoringService = ScoringService;
