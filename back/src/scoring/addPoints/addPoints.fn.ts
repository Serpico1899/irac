import { ActFn } from "@deps";
import { scoringService } from "../scoringService.ts";

export const addPointsFn: ActFn = async (body) => {
  try {
    const {
      action,
      points,
      description,
      metadata = {},
      reference_id,
      reference_type,
      order_id,
      course_id,
    } = body.details.set;

    const userId = body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
        details: { auth_required: true },
      };
    }

    // Validate points value
    if (typeof points !== "number" || points === 0) {
      return {
        success: false,
        message: "Points must be a non-zero number",
        details: { invalid_points: points },
      };
    }

    // Award points using the scoring service
    const result = await scoringService.awardPoints({
      userId: userId.toString(),
      action,
      points,
      description,
      metadata,
      referenceId: reference_id,
      referenceType: reference_type,
      orderId: order_id,
      courseId: course_id,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Failed to award points",
        details: result.data || { error: result.error },
      };
    }

    return {
      success: true,
      body: {
        points_awarded: result.data.points_awarded,
        user_score: {
          total_points: result.data.new_total_points,
          current_level: result.data.new_level,
          leveled_up: result.data.leveled_up,
          new_achievements: result.data.new_achievements,
          level_progress: result.data.level_progress,
        },
        transaction_details: {
          action,
          description,
          reference_id,
          reference_type,
        },
      },
      message: `Successfully awarded ${points} points for ${action}`,
    };
  } catch (error) {
    console.error("Error in addPoints function:", error);
    return {
      success: false,
      message: "Internal server error while awarding points",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        action: body.details.set.action,
        points: body.details.set.points,
      },
    };
  }
};
