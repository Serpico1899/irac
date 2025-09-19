import { type ActFn, ObjectId } from "@deps";
import { enrollment } from "../../../mod.ts";

export const updateProgressFn: ActFn = async (body) => {
  const { set, get } = body.details;

  const {
    _id,
    progress_percentage,
    attendance_count,
    assignment_scores,
    final_grade,
    points_earned,
    ...rest
  } = set;

  // Build update object
  const updateData: any = {
    ...rest,
    updated_at: new Date(),
  };

  // Handle progress percentage
  if (progress_percentage !== undefined) {
    updateData.progress_percentage = progress_percentage;

    // Auto-complete enrollment if progress reaches 100%
    if (progress_percentage >= 100) {
      updateData.status = "Completed";
      updateData.completed_date = new Date();
    }
  }

  // Handle attendance
  if (attendance_count !== undefined) {
    updateData.attendance_count = attendance_count;
  }

  // Handle assignment scores
  if (assignment_scores !== undefined) {
    updateData.assignment_scores = assignment_scores;
  }

  // Handle final grade
  if (final_grade !== undefined) {
    updateData.final_grade = final_grade;
  }

  // Handle points earned
  if (points_earned !== undefined) {
    updateData.points_earned = points_earned;
  }

  const updatedEnrollment = await enrollment.updateOne({
    filter: { _id: new ObjectId(_id) },
    update: { $set: updateData },
    projection: get,
  });

  return updatedEnrollment;
};
