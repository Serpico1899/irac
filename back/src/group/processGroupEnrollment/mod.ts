import { lesan, string, object, array, number, optional, boolean } from "@deps";
import { coreApp } from "../../../mod.ts";
import { calculateBulkDiscount } from "../calculateGroupDiscount/mod.ts";

const processGroupEnrollmentValidator = {
  set: {
    group_id: string(),
    course_id: string(),
    member_ids: array(string()), // Array of user IDs to enroll
    payment_method: optional(string()),
    use_centralized_billing: optional(boolean()),
    apply_group_discount: optional(boolean()),
    notes: optional(string()),
  },
  get: object({
    success: boolean(),
    message: string(),
    enrollment_summary: object({
      total_enrolled: number(),
      successful_enrollments: number(),
      failed_enrollments: number(),
      total_original_price: number(),
      total_discount_amount: number(),
      total_final_price: number(),
      discount_percentage: number(),
    }),
    enrollments: array(object({
      user_id: string(),
      user_name: string(),
      status: string(),
      enrollment_id: optional(string()),
      error_message: optional(string()),
    })),
  }),
};

export const processGroupEnrollmentFn = lesan.Fn(processGroupEnrollmentValidator, async (body, context, coreApp) => {
  // Check if user is authenticated
  if (!context?.user?._id) {
    throw new Error("User must be authenticated to process group enrollment");
  }

  const groupModel = coreApp.odm.newModel("group", {}, {});
  const groupMemberModel = coreApp.odm.newModel("group_member", {}, {});
  const courseModel = coreApp.odm.newModel("course", {}, {});
  const enrollmentModel = coreApp.odm.newModel("enrollment", {}, {});
  const userModel = coreApp.odm.newModel("user", {}, {});

  try {
    const { group_id, course_id, member_ids, apply_group_discount = true } = body.details.set;

    // Find and validate the group
    const group = await groupModel.findOne({
      filters: { _id: group_id },
      relations: {
        leader: {
          users: {
            _id: 1,
            first_name: 1,
            last_name: 1,
          },
        },
      },
    });

    if (!group) {
      throw new Error("گروه مورد نظر یافت نشد");
    }

    // Check if current user has permission to process group enrollments
    const currentUserMembership = await groupMemberModel.findOne({
      filters: {
        group: group_id,
        user: context.user._id,
      },
    });

    const isLeader = group.leader._id.toString() === context.user._id.toString();
    const canProcessEnrollments = currentUserMembership?.role === "Admin" ||
      currentUserMembership?.can_approve_members ||
      isLeader;

    if (!canProcessEnrollments) {
      throw new Error("شما اجازه ثبت‌نام گروهی در این گروه را ندارید");
    }

    // Find and validate the course
    const course = await courseModel.findOne({
      filters: { _id: course_id },
    });

    if (!course) {
      throw new Error("دوره مورد نظر یافت نشد");
    }

    if (!course.is_active) {
      throw new Error("این دوره در حال حاضر فعال نیست");
    }

    // Validate member IDs and check if they're part of the group
    const validMembers = [];
    const invalidMembers = [];

    for (const member_id of member_ids) {
      // Check if user exists
      const user = await userModel.findOne({
        filters: { _id: member_id },
      });

      if (!user) {
        invalidMembers.push({
          user_id: member_id,
          user_name: "کاربر نامشخص",
          error: "کاربر یافت نشد",
        });
        continue;
      }

      // Check if user is an active member of the group
      const membership = await groupMemberModel.findOne({
        filters: {
          group: group_id,
          user: member_id,
          status: "Active",
        },
      });

      if (!membership) {
        invalidMembers.push({
          user_id: member_id,
          user_name: `${user.first_name} ${user.last_name}`,
          error: "کاربر عضو فعال گروه نیست",
        });
        continue;
      }

      // Check if user is already enrolled in the course
      const existingEnrollment = await enrollmentModel.findOne({
        filters: {
          user: member_id,
          course: course_id,
        },
      });

      if (existingEnrollment) {
        invalidMembers.push({
          user_id: member_id,
          user_name: `${user.first_name} ${user.last_name}`,
          error: "قبلاً در این دوره ثبت‌نام شده",
        });
        continue;
      }

      validMembers.push({
        user_id: member_id,
        user_name: `${user.first_name} ${user.last_name}`,
        user: user,
        membership: membership,
      });
    }

    if (validMembers.length === 0) {
      throw new Error("هیچ عضو معتبری برای ثبت‌نام یافت نشد");
    }

    // Calculate pricing and discounts
    const coursePrice = course.price || 0;
    const totalOriginalPrice = coursePrice * validMembers.length;

    let discountInfo = {
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: coursePrice,
      tier: "None",
    };

    if (apply_group_discount && group.current_member_count >= group.min_members_for_discount) {
      discountInfo = calculateBulkDiscount(
        coursePrice,
        group.current_member_count,
        group.min_members_for_discount
      );
    }

    const totalDiscountAmount = discountInfo.discountAmount * validMembers.length;
    const totalFinalPrice = totalOriginalPrice - totalDiscountAmount;

    // Process enrollments
    const successfulEnrollments = [];
    const failedEnrollments = [];

    for (const member of validMembers) {
      try {
        const enrollmentData = {
          enrollment_date: new Date(),
          status: "Active", // Can be set to "Pending_Payment" if payment processing is separate
          progress_percentage: 0,
          points_earned: 0,
          points_used_for_enrollment: 0,
          total_paid: discountInfo.finalPrice,
          discount_applied: discountInfo.discountAmount,
          is_group_enrollment: true,
          group_discount_percentage: discountInfo.discountPercentage,
          original_price: coursePrice,
          group_savings: discountInfo.discountAmount,
          attendance_count: 0,
          certificate_issued: false,
          certificate_revoked: false,
          notes: body.details.set.notes || `ثبت‌نام گروهی - گروه: ${group.name}`,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const enrollment = await enrollmentModel.insertOne({
          doc: enrollmentData,
          relations: {
            user: member.user_id,
            course: course_id,
            group: group_id,
          },
        });

        if (enrollment) {
          // Update member statistics
          await groupMemberModel.updateOne({
            filters: { _id: member.membership._id },
            update: {
              $inc: {
                enrollments_count: 1,
                total_savings: discountInfo.discountAmount,
              },
              $set: { updated_at: new Date() },
            },
          });

          successfulEnrollments.push({
            user_id: member.user_id,
            user_name: member.user_name,
            status: "success",
            enrollment_id: enrollment._id,
          });
        }
      } catch (error) {
        console.error(`Error enrolling user ${member.user_id}:`, error);
        failedEnrollments.push({
          user_id: member.user_id,
          user_name: member.user_name,
          status: "failed",
          error_message: error.message,
        });
      }
    }

    // Update group statistics
    if (successfulEnrollments.length > 0) {
      await groupModel.updateOne({
        filters: { _id: group_id },
        update: {
          $inc: {
            total_enrollments: successfulEnrollments.length,
            total_savings: totalDiscountAmount,
          },
          $set: { updated_at: new Date() },
        },
      });
    }

    // Prepare response
    const allEnrollments = [
      ...successfulEnrollments,
      ...failedEnrollments,
      ...invalidMembers.map(m => ({
        user_id: m.user_id,
        user_name: m.user_name,
        status: "failed",
        error_message: m.error,
      })),
    ];

    const enrollmentSummary = {
      total_enrolled: member_ids.length,
      successful_enrollments: successfulEnrollments.length,
      failed_enrollments: failedEnrollments.length + invalidMembers.length,
      total_original_price: totalOriginalPrice,
      total_discount_amount: totalDiscountAmount,
      total_final_price: totalFinalPrice,
      discount_percentage: discountInfo.discountPercentage,
    };

    const message = successfulEnrollments.length > 0
      ? `${successfulEnrollments.length} عضو با موفقیت در دوره "${course.title}" ثبت‌نام شدند`
      : "هیچ ثبت‌نام موفقی انجام نشد";

    return {
      success: true,
      body: {
        success: true,
        message,
        enrollment_summary: enrollmentSummary,
        enrollments: allEnrollments,
      },
    };

  } catch (error) {
    console.error("Error processing group enrollment:", error);
    throw new Error(`خطا در پردازش ثبت‌نام گروهی: ${error.message}`);
  }
});

export default processGroupEnrollmentFn;
