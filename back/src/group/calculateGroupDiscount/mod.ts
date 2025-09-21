import { lesan, string, object, number, optional, boolean } from "@deps";
import { coreApp } from "../../../mod.ts";

const calculateGroupDiscountValidator = {
  set: {
    group_id: string(),
    course_price: number(),
    member_count: optional(number()), // If not provided, will use current group member count
  },
  get: object({
    success: boolean(),
    discount_info: object({
      original_price: number(),
      discount_percentage: number(),
      discount_amount: number(),
      final_price: number(),
      discount_tier: string(),
      member_count: number(),
      savings_per_member: number(),
    }),
  }),
};

/**
 * Calculate group discount based on member count
 * Discount Tiers:
 * - 3-5 members: 10% discount (Tier1)
 * - 6-10 members: 15% discount (Tier2)
 * - 11-20 members: 20% discount (Tier3)
 * - 21+ members: 25% discount (Tier4)
 */
function getDiscountTier(memberCount: number): {
  percentage: number;
  tier: string;
  tierName: string;
} {
  if (memberCount >= 21) {
    return { percentage: 25, tier: "Tier4", tierName: "پلاتین" };
  } else if (memberCount >= 11) {
    return { percentage: 20, tier: "Tier3", tierName: "طلایی" };
  } else if (memberCount >= 6) {
    return { percentage: 15, tier: "Tier2", tierName: "نقره‌ای" };
  } else if (memberCount >= 3) {
    return { percentage: 10, tier: "Tier1", tierName: "برنزی" };
  } else {
    return { percentage: 0, tier: "None", tierName: "بدون تخفیف" };
  }
}

export const calculateGroupDiscountFn = lesan.Fn(calculateGroupDiscountValidator, async (body, context, coreApp) => {
  // Check if user is authenticated
  if (!context?.user?._id) {
    throw new Error("User must be authenticated to calculate group discount");
  }

  const groupModel = coreApp.odm.newModel("group", {}, {});

  try {
    const { group_id, course_price, member_count } = body.details.set;

    // Find the group
    const group = await groupModel.findOne({
      filters: { _id: group_id },
    });

    if (!group) {
      throw new Error("گروه مورد نظر یافت نشد");
    }

    // Determine member count to use for calculation
    const actualMemberCount = member_count || group.current_member_count;

    // Validate minimum requirements
    if (actualMemberCount < group.min_members_for_discount) {
      return {
        success: true,
        body: {
          success: true,
          discount_info: {
            original_price: course_price,
            discount_percentage: 0,
            discount_amount: 0,
            final_price: course_price,
            discount_tier: "None",
            member_count: actualMemberCount,
            savings_per_member: 0,
          },
        },
      };
    }

    // Calculate discount based on member count
    const discountInfo = getDiscountTier(actualMemberCount);

    const discountAmount = Math.round((course_price * discountInfo.percentage) / 100);
    const finalPrice = course_price - discountAmount;
    const savingsPerMember = Math.round(discountAmount / actualMemberCount);

    // Update group discount information if this is the current member count
    if (!member_count || member_count === group.current_member_count) {
      const totalGroupSavings = group.total_savings + discountAmount;

      await groupModel.updateOne({
        filters: { _id: group_id },
        update: {
          $set: {
            discount_tier: discountInfo.tier,
            current_discount_percentage: discountInfo.percentage,
            total_savings: totalGroupSavings,
            updated_at: new Date(),
          },
        },
      });
    }

    return {
      success: true,
      body: {
        success: true,
        discount_info: {
          original_price: course_price,
          discount_percentage: discountInfo.percentage,
          discount_amount: discountAmount,
          final_price: finalPrice,
          discount_tier: discountInfo.tier,
          member_count: actualMemberCount,
          savings_per_member: savingsPerMember,
        },
      },
    };

  } catch (error) {
    console.error("Error calculating group discount:", error);
    throw new Error(`خطا در محاسبه تخفیف گروهی: ${error.message}`);
  }
});

/**
 * Utility function to get discount percentage for a given member count
 * Can be used by other functions without full validation
 */
export function getGroupDiscountPercentage(memberCount: number, minMembers: number = 3): number {
  if (memberCount < minMembers) {
    return 0;
  }

  return getDiscountTier(memberCount).percentage;
}

/**
 * Utility function to calculate bulk enrollment discount
 * Used when processing group enrollments
 */
export function calculateBulkDiscount(
  originalPrice: number,
  memberCount: number,
  minMembers: number = 3
): {
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  tier: string;
} {
  const discountInfo = getDiscountTier(memberCount);

  if (memberCount < minMembers) {
    return {
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: originalPrice,
      tier: "None",
    };
  }

  const discountAmount = Math.round((originalPrice * discountInfo.percentage) / 100);
  const finalPrice = originalPrice - discountAmount;

  return {
    discountPercentage: discountInfo.percentage,
    discountAmount,
    finalPrice,
    tier: discountInfo.tier,
  };
}

export default calculateGroupDiscountFn;
