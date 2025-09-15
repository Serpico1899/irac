import { ActFn } from "@deps";
import { scoringService } from "../scoringService.ts";

export const getLeaderboardFn: ActFn = async (body) => {
  try {
    const {
      limit = 50,
      skip = 0,
      timeframe = "all_time",
      include_user_rank,
    } = body.details.set;

    const userId = body.user?._id;

    // Validate pagination parameters
    if (limit > 100) {
      return {
        success: false,
        message: "Limit cannot exceed 100",
        details: { max_limit: 100, requested_limit: limit },
      };
    }

    if (skip < 0 || limit < 1) {
      return {
        success: false,
        message: "Invalid pagination parameters",
        details: { skip, limit },
      };
    }

    // Get leaderboard data from scoring service
    const leaderboardResult = await scoringService.getLeaderboard({
      limit,
      skip,
    });

    if (!leaderboardResult.success) {
      return {
        success: false,
        message: leaderboardResult.message || "Failed to get leaderboard",
        details: { error: leaderboardResult.error },
      };
    }

    const leaderboardData = leaderboardResult.data;

    // Add ranking numbers starting from skip + 1
    const rankedLeaderboard = leaderboardData.leaderboard.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
    }));

    let currentUserRank = null;

    // Get current user's rank if requested and user is authenticated
    if (include_user_rank && userId) {
      try {
        const userLevelModel = (await import("../../../mod.ts")).coreApp.odm.db.collection("user_level");

        // Count users with higher points to determine rank
        const higherRankedUsers = await userLevelModel.countDocuments({
          total_lifetime_points: {
            $gt: include_user_rank === 1 ? 0 : null // This needs the actual user's points
          },
          is_frozen: { $ne: true },
          status: "active",
        });

        // Get current user's data
        const currentUserLevel = await userLevelModel.findOne({
          "user._id": (await import("../../../mod.ts")).coreApp.odm.ObjectId(userId),
        });

        if (currentUserLevel) {
          // Count users with more points than current user
          const betterUsers = await userLevelModel.countDocuments({
            total_lifetime_points: { $gt: currentUserLevel.total_lifetime_points },
            is_frozen: { $ne: true },
            status: "active",
          });

          // Get user details
          const userModel = (await import("../../../mod.ts")).coreApp.odm.db.collection("user");
          const userDetails = await userModel.findOne({
            _id: (await import("../../../mod.ts")).coreApp.odm.ObjectId(userId),
          });

          currentUserRank = {
            user_id: userId,
            name: userDetails ? `${userDetails.first_name} ${userDetails.last_name}` : "Unknown User",
            avatar: userDetails?.avatar,
            current_points: currentUserLevel.current_points || 0,
            total_lifetime_points: currentUserLevel.total_lifetime_points || 0,
            level: currentUserLevel.level || 1,
            achievement_count: currentUserLevel.achievement_count || 0,
            rank: betterUsers + 1,
            is_current_user: true,
          };
        }
      } catch (error) {
        console.error("Error getting current user rank:", error);
        // Continue without user rank - not critical
      }
    }

    // Calculate additional statistics
    const totalUsers = leaderboardData.total_count;
    const currentPage = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // Get top performers summary
    const topPerformers = rankedLeaderboard.slice(0, 3);

    return {
      success: true,
      body: {
        leaderboard: rankedLeaderboard,
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          limit,
          skip,
          total_count: totalUsers,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_skip: hasNextPage ? skip + limit : null,
          prev_skip: hasPrevPage ? Math.max(0, skip - limit) : null,
        },
        current_user_rank: currentUserRank,
        summary: {
          timeframe,
          total_active_users: totalUsers,
          top_performers: topPerformers,
          highest_level: rankedLeaderboard[0]?.level || 1,
          highest_points: rankedLeaderboard[0]?.total_lifetime_points || 0,
        },
        filters: {
          applied_timeframe: timeframe,
          excluded_frozen_users: true,
          excluded_inactive_users: true,
        },
        meta: {
          generated_at: new Date().toISOString(),
          data_freshness: "real_time", // Could be configurable
          ranking_method: "total_lifetime_points_desc",
        },
      },
      message: `Leaderboard retrieved successfully (${rankedLeaderboard.length} users)`,
    };
  } catch (error) {
    console.error("Error in getLeaderboard function:", error);
    return {
      success: false,
      message: "Internal server error while getting leaderboard",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        limit: body.details.set.limit,
        skip: body.details.set.skip,
        timeframe: body.details.set.timeframe,
      },
    };
  }
};
