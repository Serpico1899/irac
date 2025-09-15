import { ActFn } from "@deps";
import { scoringService } from "../scoringService.ts";

export const processDailyLoginFn: ActFn = async (body) => {
  try {
    const {
      ip_address,
      user_agent,
      device_info,
      location,
      metadata = {},
    } = body.details.set;

    const userId = body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
        details: { auth_required: true },
      };
    }

    // Prepare metadata for daily login
    const loginMetadata = {
      ...metadata,
      ip_address,
      user_agent,
      device_info,
      location,
      login_timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Process daily login using scoring service
    const result = await scoringService.processDailyLogin(
      userId.toString(),
      loginMetadata
    );

    if (!result.success) {
      // If already processed today, return success with message
      if (result.data?.already_processed) {
        return {
          success: true,
          body: {
            already_processed: true,
            message: result.message,
            daily_login_status: "completed_today",
          },
          message: "Daily login already processed for today",
        };
      }

      return {
        success: false,
        message: result.message || "Failed to process daily login",
        details: { error: result.error },
      };
    }

    // Get updated user score after processing login
    const userScoreResult = await scoringService.getUserScore(userId.toString());

    let userScore = null;
    if (userScoreResult.success) {
      userScore = {
        current_points: userScoreResult.data.current_points || 0,
        total_lifetime_points: userScoreResult.data.total_lifetime_points || 0,
        level: userScoreResult.data.level || 1,
        daily_login_streak: userScoreResult.data.daily_login_streak || 1,
        max_daily_login_streak: userScoreResult.data.max_daily_login_streak || 1,
      };
    }

    return {
      success: true,
      body: {
        daily_login_processed: true,
        points_awarded: result.data?.points_awarded || scoringService.POINTS_CONFIG.DAILY_LOGIN,
        streak_info: {
          current_streak: loginMetadata.streak || 1,
          is_new_streak: loginMetadata.streak === 1,
          streak_bonus: loginMetadata.streak >= 7 ? "week_bonus" :
            loginMetadata.streak >= 30 ? "month_bonus" : null,
        },
        user_score: userScore,
        login_details: {
          login_date: new Date().toISOString().split('T')[0],
          login_time: new Date().toISOString(),
          total_logins: userScore?.total_logins || 1,
          device_info,
          location,
        },
        achievements: {
          new_achievements: result.data?.new_achievements || [],
          leveled_up: result.data?.leveled_up || false,
          new_level: result.data?.new_level,
        },
        next_login_bonus: {
          available_in: "24 hours",
          next_points: scoringService.POINTS_CONFIG.DAILY_LOGIN,
          streak_milestone: loginMetadata.streak < 7 ? 7 :
            loginMetadata.streak < 30 ? 30 : 100,
        },
      },
      message: `Daily login bonus awarded! Current streak: ${loginMetadata.streak || 1} days`,
    };
  } catch (error) {
    console.error("Error in processDailyLogin function:", error);
    return {
      success: false,
      message: "Internal server error while processing daily login",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        timestamp: new Date().toISOString(),
      },
    };
  }
};
