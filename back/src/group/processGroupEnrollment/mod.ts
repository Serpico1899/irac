import { ActFn, ObjectId } from "@deps";
import { groups, group_members, courses, enrollments, users } from "@model";

export interface ProcessGroupEnrollmentInput {
  group_id: string;
  course_id: string;
  enrollment_type?: "bulk" | "individual";
  member_ids?: string[]; // If not provided, will enroll all active members
  payment_method?: "centralized" | "individual";
  notes?: string;
}

export interface ProcessGroupEnrollmentOutput {
  success: boolean;
  enrollment_summary: {
    group_name: string;
    course_name: string;
    total_members: number;
    successful_enrollments: number;
    failed_enrollments: number;
    total_discount: number;
    individual_price: number;
    group_price: number;
    savings_per_member: number;
  };
  enrollments: Array<{
    member_id: string;
    user_name: string;
    enrollment_status: "success" | "failed" | "already_enrolled";
    error_message?: string;
  }>;
  payment_info?: {
    payment_method: string;
    total_amount: number;
    discount_applied: number;
    requires_payment: boolean;
  };
}

const processGroupEnrollmentHandler: ActFn = async (body) => {
  const {
    group_id,
    course_id,
    enrollment_type = "bulk",
    member_ids,
    payment_method = "centralized",
    notes
  }: ProcessGroupEnrollmentInput = body.details;

  try {
    // Check if user is authenticated
    if (!body.user?._id) {
      throw new Error("User must be authenticated to process group enrollment");
    }

    // Find and validate the group
    const group = await groups().findOne({
      filters: { _id: new ObjectId(group_id) },
      populate: {
        leader: {
          first_name: 1,
          last_name: 1,
          mobile: 1,
        },
      },
    });

    if (!group) {
      throw new Error("گروه مورد نظر یافت نشد");
    }

    // Check if current user has permission to process enrollments
    const currentUserMembership = await group_members().findOne({
      filters: {
        "group._id": new ObjectId(group_id),
        "user._id": new ObjectId(body.user._id),
      },
    });

    const isLeader = group.leader._id.toString() === body.user._id.toString();
    const canProcessEnrollments = currentUserMembership?.role === "Admin" ||
      currentUserMembership?.can_approve_members ||
      isLeader;

    if (!canProcessEnrollments) {
      throw new Error("شما اجازه ثبت‌نام گروهی را ندارید");
    }

    // Find and validate the course
    const course = await courses().findOne({
      filters: { _id: new ObjectId(course_id) },
    });

    if (!course) {
      throw new Error("دوره مورد نظر یافت نشد");
    }

    if (course.status !== "Active") {
      throw new Error("این دوره در حال حاضر قابل ثبت‌نام نیست");
    }

    // Get target members for enrollment
    let targetMembers;
    if (member_ids && member_ids.length > 0) {
      // Enroll specific members
      targetMembers = await group_members().find({
        filters: {
          "group._id": new ObjectId(group_id),
          "user._id": { $in: member_ids.map(id => new ObjectId(id)) },
          status: "Active",
        },
        populate: {
          user: {
            first_name: 1,
            last_name: 1,
            mobile: 1,
            email: 1,
          },
        },
      });
    } else {
      // Enroll all active members
      targetMembers = await group_members().find({
        filters: {
          "group._id": new ObjectId(group_id),
          status: "Active",
        },
        populate: {
          user: {
            first_name: 1,
            last_name: 1,
            mobile: 1,
            email: 1,
          },
        },
      });
    }

    if (!targetMembers.length) {
      throw new Error("عضو فعالی برای ثبت‌نام یافت نشد");
    }

    // Calculate group discount
    const memberCount = targetMembers.length;
    const originalPrice = course.price || 0;
    let discountPercentage = 0;

    // Apply group discount logic
    if (memberCount >= 21) {
      discountPercentage = 25;
    } else if (memberCount >= 11) {
      discountPercentage = 20;
    } else if (memberCount >= 6) {
      discountPercentage = 15;
    } else if (memberCount >= 3) {
      discountPercentage = 10;
    }

    const discountAmount = (originalPrice * discountPercentage) / 100;
    const discountedPrice = originalPrice - discountAmount;
    const savingsPerMember = discountAmount;
    const totalDiscount = discountAmount * memberCount;

    // Process enrollments
    const enrollmentResults = [];
    let successfulEnrollments = 0;
    let failedEnrollments = 0;

    for (const member of targetMembers) {
      try {
        // Check if already enrolled
        const existingEnrollment = await enrollments().findOne({
          filters: {
            "user._id": new ObjectId(member.user._id),
            "course._id": new ObjectId(course_id),
          },
        });

        if (existingEnrollment) {
          enrollmentResults.push({
            member_id: member._id.toString(),
            user_name: `${member.user.first_name} ${member.user.last_name}`,
            enrollment_status: "already_enrolled" as const,
            error_message: "قبلاً در این دوره ثبت‌نام شده",
          });
          continue;
        }

        // Create enrollment
        const enrollmentData = {
          status: "Active",
          enrollment_date: new Date(),
          progress_percentage: 0,
          is_group_enrollment: true,
          group_discount_percentage: discountPercentage,
          group_discount_amount: savingsPerMember,
          original_price: originalPrice,
          paid_price: discountedPrice,
          payment_method: payment_method,
          payment_status: payment_method === "centralized" ? "Pending" : "Unpaid",
          notes: notes,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const newEnrollment = await enrollments().insertOne({
          doc: enrollmentData,
          relations: {
            user: member.user._id.toString(),
            course: course_id,
            group: group_id,
          },
        });

        if (newEnrollment) {
          // Update member's enrollment count
          await group_members().updateOne({
            filters: { _id: new ObjectId(member._id) },
            update: {
              $inc: { enrollments_count: 1 },
              $set: { updated_at: new Date() },
            },
          });

          enrollmentResults.push({
            member_id: member._id.toString(),
            user_name: `${member.user.first_name} ${member.user.last_name}`,
            enrollment_status: "success" as const,
          });

          successfulEnrollments++;
        }
      } catch (error) {
        enrollmentResults.push({
          member_id: member._id.toString(),
          user_name: `${member.user.first_name} ${member.user.last_name}`,
          enrollment_status: "failed" as const,
          error_message: error.message,
        });
        failedEnrollments++;
      }
    }

    // Update group statistics
    if (successfulEnrollments > 0) {
      await groups().updateOne({
        filters: { _id: new ObjectId(group_id) },
        update: {
          $inc: {
            total_enrollments: successfulEnrollments,
            total_savings: totalDiscount,
          },
          $set: {
            current_discount_percentage: discountPercentage,
            updated_at: new Date(),
          },
        },
      });
    }

    const result: ProcessGroupEnrollmentOutput = {
      success: true,
      enrollment_summary: {
        group_name: group.name,
        course_name: course.name || course.name_en,
        total_members: memberCount,
        successful_enrollments: successfulEnrollments,
        failed_enrollments: failedEnrollments,
        total_discount: totalDiscount,
        individual_price: originalPrice,
        group_price: discountedPrice,
        savings_per_member: savingsPerMember,
      },
      enrollments: enrollmentResults,
      payment_info: {
        payment_method,
        total_amount: discountedPrice * successfulEnrollments,
        discount_applied: totalDiscount,
        requires_payment: !course.is_free && successfulEnrollments > 0,
      },
    };

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error("Error processing group enrollment:", error);
    return {
      success: false,
      message: `خطا در ثبت‌نام گروهی: ${error.message}`,
      error: error.message
    };
  }
};

export default processGroupEnrollmentHandler;
