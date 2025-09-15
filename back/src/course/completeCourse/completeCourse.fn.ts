import { ActFn } from "@deps";
import { scoringService } from "../../scoring/scoringService.ts";
import { coreApp } from "../../../mod.ts";

export const completeCourseFn: ActFn = async (body) => {
  try {
    const {
      course_id,
      completion_percentage = 100,
      completion_time_minutes,
      quiz_score,
      certificate_requested = false,
      final_assessment_score,
      chapters_completed,
      total_chapters,
      metadata = {},
      completion_notes,
    } = body.details.set;

    const userId = body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
        details: { auth_required: true },
      };
    }

    // Validate course_id
    if (!course_id) {
      return {
        success: false,
        message: "Course ID is required",
        details: { missing_course_id: true },
      };
    }

    // Validate completion percentage
    if (completion_percentage < 0 || completion_percentage > 100) {
      return {
        success: false,
        message: "Completion percentage must be between 0 and 100",
        details: { invalid_percentage: completion_percentage },
      };
    }

    const courseModel = coreApp.odm.db.collection("course");
    const enrollmentModel = coreApp.odm.db.collection("enrollment");

    // Check if course exists
    const course = await courseModel.findOne({
      _id: coreApp.odm.ObjectId(course_id),
    });

    if (!course) {
      return {
        success: false,
        message: "Course not found",
        details: { course_id, course_exists: false },
      };
    }

    // Check if user is enrolled in the course
    const enrollment = await enrollmentModel.findOne({
      "user._id": coreApp.odm.ObjectId(userId),
      "course._id": coreApp.odm.ObjectId(course_id),
    });

    if (!enrollment) {
      return {
        success: false,
        message: "User is not enrolled in this course",
        details: { course_id, user_enrolled: false },
      };
    }

    // Check if course is already completed
    if (enrollment.status === "completed" && enrollment.completion_percentage === 100) {
      return {
        success: false,
        message: "Course is already completed",
        details: {
          course_id,
          already_completed: true,
          completion_date: enrollment.completed_at,
        },
      };
    }

    // Determine if this is a full completion (>= 80% considered complete)
    const isFullCompletion = completion_percentage >= 80;
    const wasAlreadyCompleted = enrollment.completion_percentage >= 80;

    // Prepare enrollment update data
    const completionTime = new Date();
    const updateData = {
      completion_percentage,
      completion_time_minutes,
      quiz_score,
      final_assessment_score,
      chapters_completed,
      total_chapters,
      completion_notes,
      status: isFullCompletion ? "completed" : "in_progress",
      updated_at: completionTime,
    };

    // Add completion timestamp if fully completed for the first time
    if (isFullCompletion && !wasAlreadyCompleted) {
      updateData.completed_at = completionTime;
    }

    // Update enrollment record
    const enrollmentUpdateResult = await enrollmentModel.updateOne(
      {
        "user._id": coreApp.odm.ObjectId(userId),
        "course._id": coreApp.odm.ObjectId(course_id),
      },
      { $set: updateData }
    );

    if (enrollmentUpdateResult.matchedCount === 0) {
      return {
        success: false,
        message: "Failed to update course completion",
        details: { update_failed: true },
      };
    }

    let pointsAwarded = 0;
    let leveledUp = false;
    let newAchievements = [];

    // Award points for course completion (only if fully completed for the first time)
    if (isFullCompletion && !wasAlreadyCompleted) {
      try {
        const pointsResult = await scoringService.awardPoints({
          userId: userId.toString(),
          action: "course_complete",
          points: scoringService.POINTS_CONFIG.COURSE_COMPLETION,
          description: `Course completion reward: ${course.title}`,
          metadata: {
            course_id,
            course_title: course.title,
            course_title_en: course.title_en,
            completion_percentage,
            completion_time_minutes,
            quiz_score,
            final_assessment_score,
            chapters_completed,
            total_chapters,
            completion_date: completionTime.toISOString(),
            certificate_requested,
            ...metadata,
          },
          referenceId: course_id,
          referenceType: "course",
          courseId: course_id,
        });

        if (pointsResult.success) {
          pointsAwarded = pointsResult.data.points_awarded;
          leveledUp = pointsResult.data.leveled_up;
          newAchievements = pointsResult.data.new_achievements;
        }

        // Update user level statistics for course completion
        const userLevelModel = coreApp.odm.db.collection("user_level");
        await userLevelModel.updateOne(
          { "user._id": coreApp.odm.ObjectId(userId) },
          {
            $inc: { total_courses_completed: 1 },
            $set: { updated_at: new Date() }
          },
          { upsert: true }
        );

      } catch (error) {
        console.error("Error awarding course completion points:", error);
        // Continue with completion even if scoring fails
      }
    }

    // Prepare certificate data if requested
    let certificateData = null;
    if (certificate_requested && isFullCompletion) {
      certificateData = {
        certificate_id: `CERT-${Date.now()}-${course_id.slice(-6)}`,
        course_title: course.title,
        course_title_en: course.title_en,
        user_name: `${body.user.first_name} ${body.user.last_name}`,
        completion_date: completionTime.toISOString(),
        final_score: final_assessment_score || quiz_score,
        certificate_url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/certificates/${userId}/${course_id}`,
        is_verified: true,
      };
    }

    // Calculate progress statistics
    const progressStats = {
      completion_percentage,
      chapters_progress: chapters_completed && total_chapters ?
        `${chapters_completed}/${total_chapters}` : null,
      time_invested: completion_time_minutes,
      assessment_performance: {
        quiz_score,
        final_assessment_score,
        passing_grade: course.passing_grade || 70,
        passed: final_assessment_score ?
          final_assessment_score >= (course.passing_grade || 70) :
          quiz_score ? quiz_score >= (course.passing_grade || 70) : null,
      },
    };

    return {
      success: true,
      body: {
        course_completion: {
          course_id,
          course_title: course.title,
          course_title_en: course.title_en,
          status: updateData.status,
          completion_percentage,
          completed_at: updateData.completed_at,
          is_first_completion: isFullCompletion && !wasAlreadyCompleted,
        },
        progress_stats: progressStats,
        scoring_rewards: {
          points_awarded: pointsAwarded,
          total_course_points: scoringService.POINTS_CONFIG.COURSE_COMPLETION,
          leveled_up: leveledUp,
          new_achievements: newAchievements,
          bonus_eligible: isFullCompletion,
        },
        certificate: certificateData,
        enrollment_update: {
          enrollment_id: enrollment._id,
          previous_percentage: enrollment.completion_percentage || 0,
          new_percentage: completion_percentage,
          status_changed: enrollment.status !== updateData.status,
        },
        next_steps: {
          certificate_available: isFullCompletion,
          can_retake: course.allow_retake || false,
          related_courses: [], // Could be populated with recommended courses
          share_achievement: isFullCompletion,
        },
      },
      message: isFullCompletion ?
        `Congratulations! You've completed ${course.title}${pointsAwarded > 0 ? ` and earned ${pointsAwarded} points!` : ''}` :
        `Course progress updated to ${completion_percentage}%`,
    };

  } catch (error) {
    console.error("Error in completeCourse function:", error);
    return {
      success: false,
      message: "Internal server error while completing course",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        course_id: body.details.set.course_id,
        completion_percentage: body.details.set.completion_percentage,
      },
    };
  }
};
