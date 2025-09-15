import { ActFn } from "@deps";
import { scoringService } from "../scoringService.ts";

export const getUserScoreFn: ActFn = async (body) => {
  try {
    const {
      user_id,
    } = body.details.set;

    const userId = user_id || body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
        details: { auth_required: true },
      };
    }

    // Get user score from scoring service
    const scoreResult = await scoringService.getUserScore(userId.toString());

    if (!scoreResult.success) {
      return {
        success: false,
        message: scoreResult.message || "Failed to get user score",
        details: { error: scoreResult.error },
      };
    }

    const userLevel = scoreResult.data;

    // Get user's recent scoring transactions for activity history
    const scoringTransactionModel = body.coreApp?.odm?.db?.collection("scoring_transaction") ||
      (await import("../../../mod.ts")).coreApp.odm.db.collection("scoring_transaction");

    const recentTransactions = await scoringTransactionModel
      .find({
        "user._id": (await import("../../../mod.ts")).coreApp.odm.ObjectId(userId),
        status: "completed",
      })
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    // Calculate additional statistics
    const pointsBreakdown = {
      purchases: userLevel.points_from_purchases || 0,
      courses: userLevel.points_from_courses || 0,
      referrals: userLevel.points_from_referrals || 0,
      activities: userLevel.points_from_activities || 0,
      bonuses: userLevel.points_from_bonuses || 0,
    };

    const totalEarned = Object.values(pointsBreakdown).reduce((sum, points) => sum + points, 0);

    return {
      success: true,
      body: {
        user_score: {
          user_id: userId,
          current_points: userLevel.current_points || 0,
          total_lifetime_points: userLevel.total_lifetime_points || 0,
          level: userLevel.level || 1,
          status: userLevel.status || "active",
          is_frozen: userLevel.is_frozen || false,
        },
        level_progress: {
          points_to_next_level: userLevel.points_to_next_level || 500,
          progress_percentage: userLevel.level_progress_percentage || 0,
          current_level: userLevel.level || 1,
          next_level: (userLevel.level || 1) + 1,
        },
        achievements: {
          earned: userLevel.achievements || [],
          count: userLevel.achievement_count || 0,
          recent: userLevel.achievements?.slice(-3) || [],
        },
        statistics: {
          total_purchases: userLevel.total_purchases || 0,
          total_courses_completed: userLevel.total_courses_completed || 0,
          total_referrals: userLevel.total_referrals || 0,
          total_logins: userLevel.total_logins || 0,
          daily_login_streak: userLevel.daily_login_streak || 0,
          max_daily_login_streak: userLevel.max_daily_login_streak || 0,
        },
        points_breakdown: pointsBreakdown,
        recent_activity: recentTransactions.map(transaction => ({
          action: transaction.action,
          points: transaction.points,
          description: transaction.description,
          date: transaction.created_at,
          reference_type: transaction.reference_type,
          reference_id: transaction.reference_id,
        })),
        multiplier: {
          current: userLevel.current_multiplier || 1.0,
          bonus_expires_at: userLevel.bonus_expires_at,
        },
        penalties: {
          total_penalties: userLevel.total_penalties || 0,
          points_lost: userLevel.points_lost_penalties || 0,
        },
        last_activity: {
          points_earned_at: userLevel.last_points_earned_at,
          level_up_at: userLevel.last_level_up_at,
          achievement_at: userLevel.last_achievement_at,
        },
        rank: {
          position: userLevel.rank_position,
          updated_at: userLevel.rank_updated_at,
        },
      },
      message: "User score retrieved successfully",
    };
  } catch (error) {
    console.error("Error in getUserScore function:", error);
    return {
      success: false,
      message: "Internal server error while getting user score",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        requested_user_id: body.details.set.user_id,
      },
    };
  }
};
