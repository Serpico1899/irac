import { ActFn, ObjectId } from "@deps";
import { groups } from "@model";

export interface CalculateGroupDiscountInput {
  group_id: string;
  course_price: number;
  member_count?: number; // If not provided, will use current group member count
}

export interface CalculateGroupDiscountOutput {
  success: boolean;
  discount_info: {
    original_price: number;
    discount_percentage: number;
    discount_amount: number;
    final_price: number;
    discount_tier: string;
    member_count: number;
    savings_per_member: number;
  };
}

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

const calculateGroupDiscountHandler: ActFn = async (body) => {
  const {
    group_id,
    course_price,
    member_count
  }: CalculateGroupDiscountInput = body.details;

  try {
    // Check if user is authenticated
    if (!body.user?._id) {
      throw new Error("User must be authenticated to calculate group discount");
    }

    // Find the group
    const group = await groups().findOne({
      filters: { _id: new ObjectId(group_id) },
    });

    if (!group) {
      throw new Error("گروه مورد نظر یافت نشد");
    }

    // Use provided member count or current group member count
    const effectiveMemberCount = member_count || group.current_member_count;

    // Get discount tier information
    const discountTier = getDiscountTier(effectiveMemberCount);

    // Calculate discount amounts
    const discountAmount = (course_price * discountTier.percentage) / 100;
    const finalPrice = course_price - discountAmount;
    const savingsPerMember = discountAmount / effectiveMemberCount;

    const result: CalculateGroupDiscountOutput = {
      success: true,
      discount_info: {
        original_price: course_price,
        discount_percentage: discountTier.percentage,
        discount_amount: discountAmount,
        final_price: finalPrice,
        discount_tier: `${discountTier.tier} (${discountTier.tierName})`,
        member_count: effectiveMemberCount,
        savings_per_member: savingsPerMember,
      },
    };

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error("Error calculating group discount:", error);
    return {
      success: false,
      message: `خطا در محاسبه تخفیف گروهی: ${error.message}`,
      error: error.message
    };
  }
};

export default calculateGroupDiscountHandler;
