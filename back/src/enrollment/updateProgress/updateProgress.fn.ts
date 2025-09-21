import { type ActFn, ObjectId } from "@deps";
import { enrollment } from "../../../mod.ts";
import { triggerAutomaticCertificateGeneration } from "../../certificate/integrations/automaticGeneration.ts";

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

  // Trigger automatic certificate generation if course completed
  if (progress_percentage !== undefined && progress_percentage >= 100 && updatedEnrollment) {
    try {
      // Get enrollment details for certificate generation
      const enrollmentDetails = await enrollment.findOne({
        filter: { _id: new ObjectId(_id) },
        projection: {
          user: { _id: 1 },
          course: { _id: 1 },
          completed_date: 1,
          final_grade: 1,
          progress_percentage: 1
        }
      });

      if (enrollmentDetails) {
        // Trigger certificate generation in background
        triggerAutomaticCertificateGeneration(
          _id,
          enrollmentDetails.user._id.toString(),
          enrollmentDetails.course._id.toString(),
          {
            completion_date: updateData.completed_date || new Date(),
            final_grade: final_grade,
            progress_percentage: progress_percentage
          }
        ).catch(error => {
          console.error('Failed to trigger automatic certificate generation:', error);
          // Don't fail the enrollment update if certificate generation fails
        });

        console.log(`Triggered automatic certificate generation for enrollment: ${_id}`);
      }
    } catch (error) {
      console.error('Error in certificate generation trigger:', error);
      // Continue with enrollment update even if certificate trigger fails
    }
  }

  return updatedEnrollment;
};
