import { ActFn } from "@deps";
import { referralService } from "../referralService.ts";

export const generateReferralCodeFn: ActFn = async (body) => {
  try {
    const {
      campaign_id,
      custom_code,
      expiry_days,
    } = body.details.set;

    const userId = body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
        details: { auth_required: true },
      };
    }

    // Validate custom_code format if provided
    if (custom_code && !referralService.validateReferralCode(custom_code)) {
      return {
        success: false,
        message: "Invalid custom referral code format",
        details: {
          custom_code,
          expected_format: `${referralService.REFERRAL_CONFIG.CODE_PREFIX}-XXXXXX-XXXX`,
          validation_failed: true,
        },
      };
    }

    // Validate expiry_days if provided
    if (expiry_days !== undefined && (expiry_days < 1 || expiry_days > 730)) {
      return {
        success: false,
        message: "Expiry days must be between 1 and 730 days",
        details: {
          expiry_days,
          min_days: 1,
          max_days: 730,
        },
      };
    }

    // Generate referral code using the referral service
    const result = await referralService.generateReferralCode({
      userId: userId.toString(),
      campaignId: campaign_id,
      customCode: custom_code,
      expiryDays: expiry_days,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Failed to generate referral code",
        details: { error: result.error },
      };
    }

    const referralData = result.data;

    return {
      success: true,
      body: {
        referral_code: referralData.referral_code,
        referral_id: referralData.referral_id,
        referral_url: referralData.referral_url,
        status: referralData.status,
        is_new_code: referralData.is_new,
        configuration: {
          commission_rate: referralData.commission_rate,
          expires_at: referralData.expires_at,
          code_format: `${referralService.REFERRAL_CONFIG.CODE_PREFIX}-XXXXXX-XXXX`,
        },
        benefits: {
          commission_percentage: referralService.REFERRAL_CONFIG.COMMISSION_RATE,
          points_reward: referralService.REFERRAL_CONFIG.REFERRAL_POINTS_REWARD,
          group_discount_threshold: referralService.REFERRAL_CONFIG.GROUP_DISCOUNT_THRESHOLD,
          group_discount_rate: referralService.REFERRAL_CONFIG.GROUP_DISCOUNT_RATE,
        },
        usage_instructions: {
          share_url: referralData.referral_url,
          share_code: referralData.referral_code,
          tracking: "Clicks and conversions are automatically tracked",
          rewards: "You'll earn points and commission when someone uses your code and makes a purchase",
        },
        campaign_info: campaign_id ? {
          campaign_id,
          campaign_type: "campaign",
        } : {
          campaign_type: "direct",
        },
      },
      message: referralData.is_new
        ? `New referral code generated: ${referralData.referral_code}`
        : `Existing referral code retrieved: ${referralData.referral_code}`,
    };
  } catch (error) {
    console.error("Error in generateReferralCode function:", error);
    return {
      success: false,
      message: "Internal server error while generating referral code",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        campaign_id: body.details.set.campaign_id,
        custom_code: body.details.set.custom_code,
      },
    };
  }
};
