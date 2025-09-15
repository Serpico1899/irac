import { ActFn } from "@deps";
import { referralService } from "../referralService.ts";

export const getReferralStatsFn: ActFn = async (body) => {
  try {
    const {
      user_id,
      include_detailed_history = false,
      timeframe = "all_time",
    } = body.details.set;

    const userId = user_id || body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
        details: { auth_required: true },
      };
    }

    // Get referral statistics from referral service
    const statsResult = await referralService.getReferralStats(userId.toString());

    if (!statsResult.success) {
      return {
        success: false,
        message: statsResult.message || "Failed to get referral statistics",
        details: { error: statsResult.error },
      };
    }

    const stats = statsResult.data;

    // Get detailed history if requested
    let detailedHistory = null;
    if (include_detailed_history) {
      const historyResult = await referralService.getReferralHistory({
        userId: userId.toString(),
        limit: 50,
        skip: 0,
      });

      if (historyResult.success) {
        detailedHistory = historyResult.data.referrals;
      }
    }

    // Calculate timeframe-specific statistics (simplified for now)
    let timeframeStats = stats.summary;
    if (timeframe !== "all_time") {
      // In a real implementation, you'd filter by date ranges
      // For now, we'll return the same stats but mark the timeframe
      timeframeStats = {
        ...stats.summary,
        timeframe_note: `Filtered by ${timeframe} (implementation pending)`,
      };
    }

    // Calculate performance metrics
    const performanceMetrics = {
      efficiency_score: stats.summary.conversion_rate,
      activity_level: stats.summary.total_referrals > 10 ? "high" :
        stats.summary.total_referrals > 5 ? "medium" : "low",
      earnings_potential: stats.commission_details.total_earned > 100000 ? "high" :
        stats.commission_details.total_earned > 50000 ? "medium" : "low",
      growth_trend: "stable", // Would calculate from historical data
    };

    // Generate recommendations
    const recommendations = [];
    if (stats.summary.conversion_rate < 10) {
      recommendations.push({
        type: "improve_conversion",
        title: "Improve Conversion Rate",
        description: "Share your referral code with people more likely to make purchases",
        priority: "high",
      });
    }

    if (stats.summary.total_clicks < 50) {
      recommendations.push({
        type: "increase_visibility",
        title: "Increase Referral Visibility",
        description: "Share your referral link on social media and with friends",
        priority: "medium",
      });
    }

    if (stats.active_codes.length === 0) {
      recommendations.push({
        type: "create_code",
        title: "Create Your First Referral Code",
        description: "Generate a referral code to start earning commissions",
        priority: "high",
      });
    }

    return {
      success: true,
      body: {
        user_referral_stats: {
          user_id: userId,
          timeframe,
          generated_at: new Date().toISOString(),
        },
        overview: {
          summary: timeframeStats,
          performance_metrics: performanceMetrics,
          status_breakdown: stats.status_breakdown,
        },
        financial: {
          commission_details: stats.commission_details,
          earning_potential: {
            per_successful_referral: `${referralService.REFERRAL_CONFIG.COMMISSION_RATE}% of first purchase`,
            points_per_referral: referralService.REFERRAL_CONFIG.REFERRAL_POINTS_REWARD,
            minimum_purchase_threshold: referralService.REFERRAL_CONFIG.MIN_PURCHASE_AMOUNT,
          },
        },
        active_campaigns: {
          active_codes: stats.active_codes,
          total_active: stats.active_codes.length,
          most_successful: stats.active_codes.length > 0 ?
            stats.active_codes.reduce((best, current) =>
              current.clicks > (best.clicks || 0) ? current : best
            ) : null,
        },
        recent_activity: {
          recent_referrals: stats.recent_referrals,
          recent_count: stats.recent_referrals.length,
          last_activity: stats.recent_referrals.length > 0 ?
            stats.recent_referrals[0].created_at : null,
        },
        detailed_history: include_detailed_history ? detailedHistory : null,
        insights: {
          best_performing_period: "Analysis pending", // Would analyze historical data
          peak_activity_time: "Analysis pending",
          most_effective_channels: "Analysis pending",
          recommendations,
        },
        configuration: {
          commission_rate: referralService.REFERRAL_CONFIG.COMMISSION_RATE,
          group_discount_threshold: referralService.REFERRAL_CONFIG.GROUP_DISCOUNT_THRESHOLD,
          group_discount_rate: referralService.REFERRAL_CONFIG.GROUP_DISCOUNT_RATE,
          referral_points_reward: referralService.REFERRAL_CONFIG.REFERRAL_POINTS_REWARD,
          minimum_purchase: referralService.REFERRAL_CONFIG.MIN_PURCHASE_AMOUNT,
          code_expiry_days: referralService.REFERRAL_CONFIG.EXPIRY_DAYS,
        },
        tools: {
          share_links: stats.active_codes.map(code => ({
            code: code.code,
            url: code.url,
            qr_code_url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/api/qr/${code.code}`,
            social_share: {
              twitter: `https://twitter.com/intent/tweet?text=Join%20IRAC%20Architecture%20Platform&url=${encodeURIComponent(code.url)}`,
              telegram: `https://t.me/share/url?url=${encodeURIComponent(code.url)}&text=Join%20IRAC%20Architecture%20Platform`,
              whatsapp: `https://wa.me/?text=Join%20IRAC%20Architecture%20Platform%20${encodeURIComponent(code.url)}`,
            },
          })),
          tracking_dashboard: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/user/referrals`,
        },
      },
      message: `Referral statistics retrieved successfully. ${stats.summary.total_referrals} total referrals, ${stats.summary.successful_referrals} successful.`,
    };
  } catch (error) {
    console.error("Error in getReferralStats function:", error);
    return {
      success: false,
      message: "Internal server error while getting referral statistics",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        requested_user_id: body.details.set.user_id,
        timeframe: body.details.set.timeframe,
      },
    };
  }
};
