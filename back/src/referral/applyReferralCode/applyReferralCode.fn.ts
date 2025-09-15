import { ActFn } from "@deps";
import { referralService } from "../referralService.ts";

export const applyReferralCodeFn: ActFn = async (body) => {
  try {
    const {
      referral_code,
      ip_address,
      user_agent,
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

    // Validate referral code format
    if (!referral_code || typeof referral_code !== "string") {
      return {
        success: false,
        message: "Valid referral code is required",
        details: {
          referral_code_provided: !!referral_code,
          referral_code_type: typeof referral_code,
        },
      };
    }

    const cleanReferralCode = referral_code.trim().toUpperCase();

    // Basic format validation
    if (!referralService.validateReferralCode(cleanReferralCode)) {
      return {
        success: false,
        message: "Invalid referral code format",
        details: {
          referral_code: cleanReferralCode,
          expected_format: `${referralService.REFERRAL_CONFIG.CODE_PREFIX}-XXXXXX-XXXX`,
          format_valid: false,
        },
      };
    }

    // Apply referral code using the referral service
    const result = await referralService.applyReferralCode({
      referralCode: cleanReferralCode,
      newUserId: userId.toString(),
      ipAddress: ip_address,
      userAgent: user_agent,
      metadata,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Failed to apply referral code",
        details: result.data || { error: result.error },
      };
    }

    const referralData = result.data;

    // Track the referral click
    try {
      await referralService.trackReferralClick({
        referralCode: cleanReferralCode,
        ipAddress: ip_address,
        userAgent: user_agent,
        source: "manual_application",
      });
    } catch (error) {
      console.error("Error tracking referral click:", error);
      // Continue with successful application even if tracking fails
    }

    return {
      success: true,
      body: {
        referral_applied: true,
        referral_code: cleanReferralCode,
        referrer_info: {
          referrer_id: referralData.referrer_id,
          referral_benefits: {
            commission_rate: referralData.benefits.referrer_commission_rate,
            points_reward: referralService.REFERRAL_CONFIG.REFERRAL_POINTS_REWARD,
          },
        },
        referee_benefits: {
          group_discount: referralData.group_discount,
          immediate_benefits: referralData.group_discount.applied ?
            `${referralData.group_discount.percentage}% discount on your purchases` :
            "Join the referral group for potential discounts",
        },
        group_status: {
          current_size: referralData.group_discount.group_size,
          threshold_for_discount: referralService.REFERRAL_CONFIG.GROUP_DISCOUNT_THRESHOLD,
          discount_available: referralData.group_discount.applied,
          discount_percentage: referralData.group_discount.percentage,
        },
        next_steps: {
          make_purchase: "Make your first purchase to activate referral rewards",
          minimum_amount: referralService.REFERRAL_CONFIG.MIN_PURCHASE_AMOUNT,
          group_benefits: referralData.group_discount.applied ?
            "Group discount will be automatically applied to your purchases" :
            `Invite ${referralService.REFERRAL_CONFIG.GROUP_DISCOUNT_THRESHOLD - referralData.group_discount.group_size} more people to unlock group discounts`,
        },
        tracking: {
          applied_at: new Date().toISOString(),
          referral_source: "manual_application",
          ip_address: ip_address,
        },
        terms: {
          commission_rate: `${referralData.benefits.referrer_commission_rate}% of your first purchase goes to the referrer`,
          minimum_purchase: `${referralService.REFERRAL_CONFIG.MIN_PURCHASE_AMOUNT} IRR minimum purchase for referral activation`,
          expiry: "Referral benefits are valid for your account lifetime",
        },
      },
      message: referralData.group_discount.applied ?
        `Referral code applied! You're part of a group and get ${referralData.group_discount.percentage}% discount.` :
        "Referral code applied successfully! Complete your first purchase to activate rewards.",
    };
  } catch (error) {
    console.error("Error in applyReferralCode function:", error);
    return {
      success: false,
      message: "Internal server error while applying referral code",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        referral_code: body.details.set.referral_code,
        timestamp: new Date().toISOString(),
      },
    };
  }
};
