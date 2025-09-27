import {  coreApp  } from "@app";
import { ActFn } from "@deps";

export class ReferralService {
  // Referral configuration
  static readonly REFERRAL_CONFIG = {
    COMMISSION_RATE: 20, // 20% of first purchase
    GROUP_DISCOUNT_RATE: 10, // 10% discount for groups of 3+
    GROUP_DISCOUNT_THRESHOLD: 3, // Minimum group size for discount
    REFERRAL_POINTS_REWARD: 200, // Points awarded for successful referral
    CODE_PREFIX: "ARCH",
    CODE_LENGTH: 4, // Length of random part
    EXPIRY_DAYS: 365, // Days until referral code expires
    MAX_CLICKS_PER_IP: 10, // Max clicks per IP to prevent abuse
    MIN_PURCHASE_AMOUNT: 10000, // Minimum purchase amount for commission (IRR)
  };

  // Referral statuses
  static readonly REFERRAL_STATUS = {
    PENDING: "pending",
    REGISTERED: "registered",
    FIRST_PURCHASE: "first_purchase",
    COMPLETED: "completed",
    REWARDED: "rewarded",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
  };

  /**
   * Generate a unique referral code for a user
   */
  static async generateReferralCode(params: {
    userId: string;
    campaignId?: string;
    customCode?: string;
    expiryDays?: number;
  }) {
    try {
      const { userId, campaignId, customCode, expiryDays = this.REFERRAL_CONFIG.EXPIRY_DAYS } = params;

      const referralModel = coreApp.odm.db.collection("referral");

      // Generate referral code
      let referralCode: string;
      let attempts = 0;
      const maxAttempts = 10;

      if (customCode) {
        referralCode = customCode.toUpperCase();
      } else {
        do {
          const randomPart = Math.random().toString(36).substring(2, 2 + this.REFERRAL_CONFIG.CODE_LENGTH).toUpperCase();
          referralCode = `${this.REFERRAL_CONFIG.CODE_PREFIX}-${userId.slice(-6)}-${randomPart}`;
          attempts++;

          // Check if code already exists
          const existingCode = await referralModel.findOne({ referral_code: referralCode });
          if (!existingCode) break;

          if (attempts >= maxAttempts) {
            throw new Error("Unable to generate unique referral code after multiple attempts");
          }
        } while (attempts < maxAttempts);
      }

      // Check if user already has an active referral code
      const existingReferral = await referralModel.findOne({
        "referrer._id": coreApp.odm.ObjectId(userId),
        status: { $in: ["pending", "registered", "first_purchase", "completed"] },
      });

      if (existingReferral && !customCode) {
        return {
          success: true,
          data: {
            referral_code: existingReferral.referral_code,
            referral_id: existingReferral._id,
            is_new: false,
            expires_at: existingReferral.expires_at,
            status: existingReferral.status,
          },
        };
      }

      // Create expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Create new referral record
      const referralData = {
        _id: coreApp.odm.ObjectId(),
        referrer: { _id: coreApp.odm.ObjectId(userId) },
        referral_code: referralCode,
        referral_type: campaignId ? "campaign" : "direct",
        status: this.REFERRAL_STATUS.PENDING,
        commission_rate: this.REFERRAL_CONFIG.COMMISSION_RATE,
        commission_earned: 0,
        commission_status: "pending",
        total_purchase_amount: 0,
        purchase_count: 0,
        group_discount_applied: false,
        group_size: 1,
        group_discount_percentage: 0,
        campaign_id: campaignId,
        is_verified: true,
        fraud_check_status: "passed",
        bonus_amount: 0,
        penalty_amount: 0,
        click_count: 0,
        conversion_rate: 0,
        expires_at: expiresAt,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const insertResult = await referralModel.insertOne(referralData);

      if (!insertResult.insertedId) {
        return {
          success: false,
          message: "Failed to create referral code",
        };
      }

      return {
        success: true,
        data: {
          referral_code: referralCode,
          referral_id: insertResult.insertedId,
          is_new: true,
          expires_at: expiresAt.toISOString(),
          status: this.REFERRAL_STATUS.PENDING,
          commission_rate: this.REFERRAL_CONFIG.COMMISSION_RATE,
          referral_url: this.generateReferralUrl(referralCode),
        },
      };
    } catch (error) {
      console.error("Error generating referral code:", error);
      return {
        success: false,
        message: "Failed to generate referral code",
        error: error.message,
      };
    }
  }

  /**
   * Apply referral code during user registration
   */
  static async applyReferralCode(params: {
    referralCode: string;
    newUserId: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const { referralCode, newUserId, ipAddress, userAgent, metadata = {} } = params;

      const referralModel = coreApp.odm.db.collection("referral");

      // Find referral by code
      const referral = await referralModel.findOne({
        referral_code: referralCode.toUpperCase(),
      });

      if (!referral) {
        return {
          success: false,
          message: "Invalid referral code",
          data: { code_valid: false },
        };
      }

      // Check if referral has expired
      if (referral.expires_at && new Date() > new Date(referral.expires_at)) {
        await referralModel.updateOne(
          { _id: referral._id },
          { $set: { status: this.REFERRAL_STATUS.EXPIRED, updated_at: new Date() } }
        );

        return {
          success: false,
          message: "Referral code has expired",
          data: { code_expired: true },
        };
      }

      // Check if referral is still valid
      if (!["pending", "registered"].includes(referral.status)) {
        return {
          success: false,
          message: "Referral code is no longer valid",
          data: { code_status: referral.status },
        };
      }

      // Prevent self-referral
      if (referral.referrer._id.toString() === newUserId.toString()) {
        return {
          success: false,
          message: "Cannot use your own referral code",
          data: { self_referral: true },
        };
      }

      // Check if user already used a referral code
      const existingRefereeReferral = await referralModel.findOne({
        "referee._id": coreApp.odm.ObjectId(newUserId),
      });

      if (existingRefereeReferral) {
        return {
          success: false,
          message: "User has already used a referral code",
          data: { already_referred: true, existing_referral_code: existingRefereeReferral.referral_code },
        };
      }

      // Update referral with referee information
      const updateData = {
        referee: { _id: coreApp.odm.ObjectId(newUserId) },
        status: this.REFERRAL_STATUS.REGISTERED,
        registered_at: new Date(),
        click_count: referral.click_count + 1,
        tracking_data: JSON.stringify({
          ...metadata,
          ip_address: ipAddress,
          user_agent: userAgent,
          registration_timestamp: new Date().toISOString(),
        }),
        updated_at: new Date(),
      };

      const updateResult = await referralModel.updateOne(
        { _id: referral._id },
        { $set: updateData }
      );

      if (updateResult.matchedCount === 0) {
        return {
          success: false,
          message: "Failed to apply referral code",
        };
      }

      // Check for group discount eligibility
      const groupReferrals = await referralModel.find({
        referral_code: referralCode,
        status: { $in: ["registered", "first_purchase", "completed"] },
      }).toArray();

      let groupDiscountApplied = false;
      let groupDiscountPercentage = 0;

      if (groupReferrals.length >= this.REFERRAL_CONFIG.GROUP_DISCOUNT_THRESHOLD) {
        groupDiscountApplied = true;
        groupDiscountPercentage = this.REFERRAL_CONFIG.GROUP_DISCOUNT_RATE;

        // Update all group members with group discount
        await referralModel.updateMany(
          { referral_code: referralCode },
          {
            $set: {
              group_discount_applied: true,
              group_size: groupReferrals.length,
              group_discount_percentage: this.REFERRAL_CONFIG.GROUP_DISCOUNT_RATE,
              updated_at: new Date(),
            },
          }
        );
      }

      return {
        success: true,
        data: {
          referral_applied: true,
          referrer_id: referral.referrer._id,
          referral_code: referralCode,
          group_discount: {
            applied: groupDiscountApplied,
            percentage: groupDiscountPercentage,
            group_size: groupReferrals.length,
            threshold_met: groupReferrals.length >= this.REFERRAL_CONFIG.GROUP_DISCOUNT_THRESHOLD,
          },
          benefits: {
            referrer_commission_rate: referral.commission_rate,
            referee_discount: groupDiscountApplied ? groupDiscountPercentage : 0,
          },
        },
      };
    } catch (error) {
      console.error("Error applying referral code:", error);
      return {
        success: false,
        message: "Failed to apply referral code",
        error: error.message,
      };
    }
  }

  /**
   * Process referral reward when referee makes first purchase
   */
  static async processReferralReward(params: {
    orderId: string;
    purchaseAmount: number;
    currency?: string;
    buyerId: string;
  }) {
    try {
      const { orderId, purchaseAmount, currency = "IRR", buyerId } = params;

      const referralModel = coreApp.odm.db.collection("referral");

      // Find referral where this user is the referee
      const referral = await referralModel.findOne({
        "referee._id": coreApp.odm.ObjectId(buyerId),
        status: { $in: ["registered", "first_purchase"] },
      });

      if (!referral) {
        return {
          success: false,
          message: "No active referral found for this user",
          data: { referral_found: false },
        };
      }

      // Check minimum purchase amount
      if (purchaseAmount < this.REFERRAL_CONFIG.MIN_PURCHASE_AMOUNT) {
        return {
          success: false,
          message: "Purchase amount below minimum threshold for referral rewards",
          data: {
            minimum_required: this.REFERRAL_CONFIG.MIN_PURCHASE_AMOUNT,
            purchase_amount: purchaseAmount,
          },
        };
      }

      // Calculate commission
      const commissionAmount = Math.floor((purchaseAmount * referral.commission_rate) / 100);

      // Check if this is the first purchase
      const isFirstPurchase = referral.purchase_count === 0;

      // Update referral record
      const updateData = {
        status: this.REFERRAL_STATUS.FIRST_PURCHASE,
        first_purchase_amount: isFirstPurchase ? purchaseAmount : referral.first_purchase_amount,
        first_purchase_at: isFirstPurchase ? new Date() : referral.first_purchase_at,
        total_purchase_amount: referral.total_purchase_amount + purchaseAmount,
        purchase_count: referral.purchase_count + 1,
        commission_earned: referral.commission_earned + commissionAmount,
        commission_status: "calculated",
        triggering_order: { _id: coreApp.odm.ObjectId(orderId) },
        conversion_rate: Math.round(((referral.purchase_count + 1) / Math.max(referral.click_count, 1)) * 100),
        updated_at: new Date(),
      };

      // If this is first purchase and meets criteria, mark as completed
      if (isFirstPurchase && commissionAmount > 0) {
        updateData.status = this.REFERRAL_STATUS.COMPLETED;
        updateData.completed_at = new Date();
      }

      await referralModel.updateOne(
        { _id: referral._id },
        { $set: updateData }
      );

      // Award points to referrer using scoring service
      let pointsAwarded = 0;
      if (isFirstPurchase && commissionAmount > 0) {
        try {
          const scoringService = await import("../scoring/scoringService.ts");
          const pointsResult = await scoringService.scoringService.awardPoints({
            userId: referral.referrer._id.toString(),
            action: "referral",
            points: this.REFERRAL_CONFIG.REFERRAL_POINTS_REWARD,
            description: `Referral reward for successful referral`,
            metadata: {
              referral_code: referral.referral_code,
              referee_id: buyerId,
              purchase_amount: purchaseAmount,
              commission_earned: commissionAmount,
              order_id: orderId,
            },
            referenceId: referral._id.toString(),
            referenceType: "referral",
          });

          if (pointsResult.success) {
            pointsAwarded = pointsResult.data.points_awarded;

            // Update user level statistics for referrals
            const userLevelModel = coreApp.odm.db.collection("user_level");
            await userLevelModel.updateOne(
              { "user._id": referral.referrer._id },
              {
                $inc: { total_referrals: 1 },
                $set: { updated_at: new Date() }
              },
              { upsert: true }
            );
          }
        } catch (error) {
          console.error("Error awarding referral points:", error);
        }
      }

      return {
        success: true,
        data: {
          referral_processed: true,
          referral_id: referral._id,
          referral_code: referral.referral_code,
          referrer_id: referral.referrer._id,
          referee_id: buyerId,
          commission: {
            amount: commissionAmount,
            rate: referral.commission_rate,
            currency,
            status: "calculated",
          },
          purchase_info: {
            order_id: orderId,
            amount: purchaseAmount,
            is_first_purchase: isFirstPurchase,
            purchase_number: referral.purchase_count + 1,
          },
          rewards: {
            points_awarded_to_referrer: pointsAwarded,
            referral_status: updateData.status,
            commission_earned: updateData.commission_earned,
          },
          group_benefits: {
            discount_applied: referral.group_discount_applied,
            group_size: referral.group_size,
            discount_percentage: referral.group_discount_percentage,
          },
        },
      };
    } catch (error) {
      console.error("Error processing referral reward:", error);
      return {
        success: false,
        message: "Failed to process referral reward",
        error: error.message,
      };
    }
  }

  /**
   * Get referral statistics for a user
   */
  static async getReferralStats(userId: string) {
    try {
      const referralModel = coreApp.odm.db.collection("referral");

      // Get all referrals created by this user
      const userReferrals = await referralModel
        .find({ "referrer._id": coreApp.odm.ObjectId(userId) })
        .sort({ created_at: -1 })
        .toArray();

      // Calculate statistics
      const totalReferrals = userReferrals.length;
      const successfulReferrals = userReferrals.filter(r => ["completed", "rewarded"].includes(r.status)).length;
      const pendingReferrals = userReferrals.filter(r => r.status === "pending").length;
      const totalCommissionEarned = userReferrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
      const totalClicks = userReferrals.reduce((sum, r) => sum + (r.click_count || 0), 0);
      const conversionRate = totalClicks > 0 ? Math.round((successfulReferrals / totalClicks) * 100) : 0;

      // Get recent referrals with referee details
      const recentReferrals = await referralModel
        .aggregate([
          { $match: { "referrer._id": coreApp.odm.ObjectId(userId) } },
          { $sort: { created_at: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "user",
              localField: "referee._id",
              foreignField: "_id",
              as: "referee_details",
            },
          },
          {
            $project: {
              referral_code: 1,
              status: 1,
              commission_earned: 1,
              created_at: 1,
              registered_at: 1,
              first_purchase_at: 1,
              referee_name: {
                $cond: {
                  if: { $gt: [{ $size: "$referee_details" }, 0] },
                  then: {
                    $concat: [
                      { $arrayElemAt: ["$referee_details.first_name", 0] },
                      " ",
                      { $arrayElemAt: ["$referee_details.last_name", 0] },
                    ],
                  },
                  else: "Pending",
                },
              },
            },
          },
        ])
        .toArray();

      // Status breakdown
      const statusBreakdown = {
        pending: userReferrals.filter(r => r.status === "pending").length,
        registered: userReferrals.filter(r => r.status === "registered").length,
        first_purchase: userReferrals.filter(r => r.status === "first_purchase").length,
        completed: userReferrals.filter(r => r.status === "completed").length,
        rewarded: userReferrals.filter(r => r.status === "rewarded").length,
        expired: userReferrals.filter(r => r.status === "expired").length,
      };

      return {
        success: true,
        data: {
          summary: {
            total_referrals: totalReferrals,
            successful_referrals: successfulReferrals,
            pending_referrals: pendingReferrals,
            total_commission_earned: totalCommissionEarned,
            total_clicks: totalClicks,
            conversion_rate: conversionRate,
            success_rate: totalReferrals > 0 ? Math.round((successfulReferrals / totalReferrals) * 100) : 0,
          },
          status_breakdown: statusBreakdown,
          recent_referrals: recentReferrals,
          active_codes: userReferrals
            .filter(r => ["pending", "registered", "first_purchase", "completed"].includes(r.status))
            .map(r => ({
              code: r.referral_code,
              status: r.status,
              created_at: r.created_at,
              expires_at: r.expires_at,
              clicks: r.click_count,
              commission_rate: r.commission_rate,
              url: this.generateReferralUrl(r.referral_code),
            })),
          commission_details: {
            total_earned: totalCommissionEarned,
            currency: "IRR",
            pending_amount: userReferrals
              .filter(r => r.commission_status === "calculated")
              .reduce((sum, r) => sum + (r.commission_earned || 0), 0),
            paid_amount: userReferrals
              .filter(r => r.commission_status === "paid")
              .reduce((sum, r) => sum + (r.commission_earned || 0), 0),
          },
        },
      };
    } catch (error) {
      console.error("Error getting referral stats:", error);
      return {
        success: false,
        message: "Failed to get referral statistics",
        error: error.message,
      };
    }
  }

  /**
   * Get referral history with detailed tracking
   */
  static async getReferralHistory(params: {
    userId: string;
    limit?: number;
    skip?: number;
    status?: string;
  }) {
    try {
      const { userId, limit = 20, skip = 0, status } = params;

      const referralModel = coreApp.odm.db.collection("referral");

      // Build query
      const query: any = { "referrer._id": coreApp.odm.ObjectId(userId) };
      if (status) {
        query.status = status;
      }

      const referrals = await referralModel
        .aggregate([
          { $match: query },
          { $sort: { created_at: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "user",
              localField: "referee._id",
              foreignField: "_id",
              as: "referee_details",
            },
          },
          {
            $lookup: {
              from: "order",
              localField: "triggering_order._id",
              foreignField: "_id",
              as: "order_details",
            },
          },
        ])
        .toArray();

      const totalCount = await referralModel.countDocuments(query);

      return {
        success: true,
        data: {
          referrals: referrals.map(r => ({
            referral_id: r._id,
            referral_code: r.referral_code,
            status: r.status,
            commission_earned: r.commission_earned || 0,
            commission_status: r.commission_status,
            referee: r.referee_details[0] ? {
              name: `${r.referee_details[0].first_name} ${r.referee_details[0].last_name}`,
              email: r.referee_details[0].email,
              registered_at: r.registered_at,
            } : null,
            purchase_info: {
              count: r.purchase_count || 0,
              total_amount: r.total_purchase_amount || 0,
              first_purchase_amount: r.first_purchase_amount,
              first_purchase_at: r.first_purchase_at,
            },
            group_info: {
              discount_applied: r.group_discount_applied || false,
              group_size: r.group_size || 1,
              discount_percentage: r.group_discount_percentage || 0,
            },
            tracking: {
              clicks: r.click_count || 0,
              conversion_rate: r.conversion_rate || 0,
              created_at: r.created_at,
              expires_at: r.expires_at,
            },
            order: r.order_details[0] || null,
          })),
          pagination: {
            total_count: totalCount,
            current_page: Math.floor(skip / limit) + 1,
            total_pages: Math.ceil(totalCount / limit),
            limit,
            skip,
          },
        },
      };
    } catch (error) {
      console.error("Error getting referral history:", error);
      return {
        success: false,
        message: "Failed to get referral history",
        error: error.message,
      };
    }
  }

  /**
   * Generate referral URL
   */
  static generateReferralUrl(referralCode: string): string {
    const baseUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  /**
   * Validate referral code format
   */
  static validateReferralCode(code: string): boolean {
    const pattern = new RegExp(`^${this.REFERRAL_CONFIG.CODE_PREFIX}-[A-Z0-9]{6}-[A-Z0-9]{${this.REFERRAL_CONFIG.CODE_LENGTH}}$`);
    return pattern.test(code.toUpperCase());
  }

  /**
   * Track referral click
   */
  static async trackReferralClick(params: {
    referralCode: string;
    ipAddress?: string;
    userAgent?: string;
    source?: string;
  }) {
    try {
      const { referralCode, ipAddress, userAgent, source } = params;

      const referralModel = coreApp.odm.db.collection("referral");

      await referralModel.updateOne(
        { referral_code: referralCode.toUpperCase() },
        {
          $inc: { click_count: 1 },
          $set: {
            updated_at: new Date(),
            tracking_data: JSON.stringify({
              last_click_ip: ipAddress,
              last_click_user_agent: userAgent,
              last_click_source: source,
              last_click_at: new Date().toISOString(),
            }),
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error("Error tracking referral click:", error);
      return { success: false, error: error.message };
    }
  }
}

export const referralService = ReferralService;
