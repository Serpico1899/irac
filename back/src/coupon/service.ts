import { coreApp } from "../../mod.ts";
import { WalletService } from "../wallet/service.ts";

export interface CouponValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
  discount?: {
    type: "percentage" | "fixed_amount";
    value: number;
    amount: number;
    maxDiscount?: number;
  };
}

export interface CouponApplicationResult {
  success: boolean;
  error?: string;
  couponId?: string;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
}

export interface OrderCouponCalculation {
  originalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  appliedCoupons: Array<{
    code: string;
    discountAmount: number;
    type: string;
  }>;
}

export class CouponService {
  /**
   * Validate a coupon code for a specific user and order
   */
  static async validateCoupon(
    couponCode: string,
    userId: string,
    orderAmount: number,
    orderItems?: Array<{
      item_id: string;
      item_type: "course" | "workshop" | "product";
      quantity: number;
    }>
  ): Promise<CouponValidationResult> {
    try {
      // Get coupon by code
      const coupon = await coreApp.odm.findOne("coupon", {
        code: couponCode.toUpperCase(),
      });

      if (!coupon) {
        return {
          isValid: false,
          error: "کد تخفیف وارد شده معتبر نیست",
          errorCode: "COUPON_NOT_FOUND",
        };
      }

      // Check coupon status
      if (coupon.status !== "active") {
        return {
          isValid: false,
          error: "کد تخفیف غیرفعال است",
          errorCode: "COUPON_INACTIVE",
        };
      }

      // Check validity dates
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

      if (now < validFrom) {
        return {
          isValid: false,
          error: "کد تخفیف هنوز فعال نشده است",
          errorCode: "COUPON_NOT_YET_VALID",
        };
      }

      if (validUntil && now > validUntil) {
        return {
          isValid: false,
          error: "کد تخفیف منقضی شده است",
          errorCode: "COUPON_EXPIRED",
        };
      }

      // Check minimum order amount
      if (orderAmount < coupon.minimum_order_amount) {
        return {
          isValid: false,
          error: `حداقل مبلغ سفارش برای استفاده از این کد تخفیف ${coupon.minimum_order_amount.toLocaleString("fa-IR")} تومان می‌باشد`,
          errorCode: "INSUFFICIENT_ORDER_AMOUNT",
        };
      }

      // Check total usage limit
      if (coupon.usage_limit_total && coupon.current_usage_count >= coupon.usage_limit_total) {
        return {
          isValid: false,
          error: "ظرفیت استفاده از این کد تخفیف به پایان رسیده است",
          errorCode: "USAGE_LIMIT_EXCEEDED",
        };
      }

      // Check per-user usage limit
      const userUsageCount = await this.getUserCouponUsageCount(couponCode, userId);
      if (userUsageCount >= coupon.usage_limit_per_user) {
        return {
          isValid: false,
          error: "شما قبلاً از این کد تخفیف استفاده کرده‌اید",
          errorCode: "USER_USAGE_LIMIT_EXCEEDED",
        };
      }

      // Check first-time user restriction
      if (coupon.first_time_users_only) {
        const isFirstTimeUser = await this.isFirstTimeUser(userId);
        if (!isFirstTimeUser) {
          return {
            isValid: false,
            error: "این کد تخفیف فقط برای کاربران جدید معتبر است",
            errorCode: "NOT_FIRST_TIME_USER",
          };
        }
      }

      // Check excluded users
      if (coupon.excluded_users && coupon.excluded_users.includes(userId)) {
        return {
          isValid: false,
          error: "شما مجاز به استفاده از این کد تخفیف نیستید",
          errorCode: "USER_EXCLUDED",
        };
      }

      // Check applicable items
      if (orderItems && coupon.applicable_to !== "all") {
        const isApplicable = await this.isCouponApplicableToItems(coupon, orderItems);
        if (!isApplicable) {
          return {
            isValid: false,
            error: "این کد تخفیف برای اقلام موجود در سبد خرید شما قابل استفاده نیست",
            errorCode: "NOT_APPLICABLE_TO_ITEMS",
          };
        }
      }

      // Calculate discount amount
      const discount = this.calculateDiscount(coupon, orderAmount);

      return {
        isValid: true,
        discount,
      };
    } catch (error) {
      console.error("Coupon validation error:", error);
      return {
        isValid: false,
        error: "خطا در اعتبارسنجی کد تخفیف",
        errorCode: "VALIDATION_ERROR",
      };
    }
  }

  /**
   * Apply coupon to an order and update usage tracking
   */
  static async applyCoupon(
    couponCode: string,
    userId: string,
    orderId: string,
    orderAmount: number,
    orderItems?: Array<{
      item_id: string;
      item_type: "course" | "workshop" | "product";
      quantity: number;
    }>
  ): Promise<CouponApplicationResult> {
    try {
      // Validate coupon first
      const validation = await this.validateCoupon(couponCode, userId, orderAmount, orderItems);

      if (!validation.isValid || !validation.discount) {
        return {
          success: false,
          error: validation.error,
          discountAmount: 0,
          finalAmount: orderAmount,
        };
      }

      // Get coupon details
      const coupon = await coreApp.odm.findOne("coupon", {
        code: couponCode.toUpperCase(),
      });

      if (!coupon) {
        return {
          success: false,
          error: "کد تخفیف یافت نشد",
          discountAmount: 0,
          finalAmount: orderAmount,
        };
      }

      const discountAmount = validation.discount.amount;
      const finalAmount = Math.max(0, orderAmount - discountAmount);

      // Update coupon usage tracking
      await this.trackCouponUsage(coupon._id, userId, orderId, discountAmount);

      // Update coupon statistics
      await this.updateCouponStats(coupon._id, discountAmount);

      return {
        success: true,
        couponId: coupon._id,
        couponCode: coupon.code,
        discountAmount,
        finalAmount,
      };
    } catch (error) {
      console.error("Coupon application error:", error);
      return {
        success: false,
        error: "خطا در اعمال کد تخفیف",
        discountAmount: 0,
        finalAmount: orderAmount,
      };
    }
  }

  /**
   * Calculate discount amount based on coupon type
   */
  private static calculateDiscount(coupon: any, orderAmount: number): {
    type: "percentage" | "fixed_amount";
    value: number;
    amount: number;
    maxDiscount?: number;
  } {
    if (coupon.type === "percentage") {
      const percentage = coupon.discount_percentage || 0;
      let discountAmount = (orderAmount * percentage) / 100;

      // Apply max discount limit if specified
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }

      return {
        type: "percentage",
        value: percentage,
        amount: Math.floor(discountAmount),
        maxDiscount: coupon.max_discount_amount,
      };
    } else {
      // Fixed amount discount
      const fixedAmount = coupon.discount_amount || 0;
      const discountAmount = Math.min(fixedAmount, orderAmount); // Can't discount more than order amount

      return {
        type: "fixed_amount",
        value: fixedAmount,
        amount: discountAmount,
      };
    }
  }

  /**
   * Calculate final order amounts with multiple coupons and tax
   */
  static async calculateOrderWithCoupons(
    userId: string,
    orderAmount: number,
    couponCodes: string[],
    taxRate: number = 0.09, // 9% Iranian VAT
    orderItems?: Array<{
      item_id: string;
      item_type: "course" | "workshop" | "product";
      quantity: number;
    }>
  ): Promise<OrderCouponCalculation> {
    let currentAmount = orderAmount;
    let totalDiscount = 0;
    const appliedCoupons: Array<{
      code: string;
      discountAmount: number;
      type: string;
    }> = [];

    // Sort coupons by priority (higher priority first)
    const sortedCoupons = await this.sortCouponsByPriority(couponCodes);

    for (const couponCode of sortedCoupons) {
      const validation = await this.validateCoupon(couponCode, userId, currentAmount, orderItems);

      if (validation.isValid && validation.discount) {
        // Check if this coupon can be combined with others
        const coupon = await coreApp.odm.findOne("coupon", {
          code: couponCode.toUpperCase(),
        });

        if (appliedCoupons.length > 0 && !coupon.combinable_with_other_coupons) {
          continue; // Skip this coupon if it can't be combined
        }

        const discountAmount = validation.discount.amount;
        totalDiscount += discountAmount;
        currentAmount -= discountAmount;

        appliedCoupons.push({
          code: couponCode,
          discountAmount,
          type: validation.discount.type,
        });

        // If coupon is not stackable, stop applying more coupons
        if (!coupon.stackable) {
          break;
        }
      }
    }

    // Calculate tax on the discounted amount
    const taxAmount = Math.floor(currentAmount * taxRate);
    const finalAmount = currentAmount + taxAmount;

    return {
      originalAmount: orderAmount,
      discountAmount: totalDiscount,
      taxAmount,
      finalAmount,
      appliedCoupons,
    };
  }

  /**
   * Get user's coupon usage count for a specific coupon
   */
  private static async getUserCouponUsageCount(couponCode: string, userId: string): Promise<number> {
    try {
      const orders = await coreApp.odm.find("order", {
        "user.objId": userId,
        "status": { $ne: "cancelled" },
        // Look for orders that used this coupon code
        $or: [
          { "admin_notes": { $regex: couponCode, $options: "i" } },
          { "internal_notes": { $regex: couponCode, $options: "i" } }
        ]
      });

      return orders.length;
    } catch (error) {
      console.error("Error getting user coupon usage:", error);
      return 0;
    }
  }

  /**
   * Check if user is a first-time user (no previous successful orders)
   */
  private static async isFirstTimeUser(userId: string): Promise<boolean> {
    try {
      const successfulOrders = await coreApp.odm.find("order", {
        "user.objId": userId,
        "status": { $in: ["delivered", "confirmed"] }
      });

      return successfulOrders.length === 0;
    } catch (error) {
      console.error("Error checking first-time user:", error);
      return false;
    }
  }

  /**
   * Check if coupon is applicable to specific order items
   */
  private static async isCouponApplicableToItems(
    coupon: any,
    orderItems: Array<{
      item_id: string;
      item_type: "course" | "workshop" | "product";
      quantity: number;
    }>
  ): Promise<boolean> {
    try {
      if (coupon.applicable_to === "all") {
        return true;
      }

      if (coupon.applicable_to === "courses") {
        return orderItems.some(item => item.item_type === "course");
      }

      if (coupon.applicable_to === "workshops") {
        return orderItems.some(item => item.item_type === "workshop");
      }

      if (coupon.applicable_to === "products") {
        return orderItems.some(item => item.item_type === "product");
      }

      if (coupon.applicable_to === "specific_items" && coupon.applicable_items) {
        return orderItems.some(orderItem =>
          coupon.applicable_items.some((applicableItem: any) =>
            applicableItem.item_id === orderItem.item_id &&
            applicableItem.item_type === orderItem.item_type
          )
        );
      }

      return false;
    } catch (error) {
      console.error("Error checking coupon applicability:", error);
      return false;
    }
  }

  /**
   * Track coupon usage for analytics and limits
   */
  private static async trackCouponUsage(
    couponId: string,
    userId: string,
    orderId: string,
    discountAmount: number
  ): Promise<void> {
    try {
      const now = new Date();
      const usageRecord = {
        user_id: userId,
        order_id: orderId,
        used_at: now,
        discount_amount: discountAmount,
      };

      // Update coupon with usage tracking
      await coreApp.odm.findOneAndUpdate("coupon",
        { _id: couponId },
        {
          $inc: { current_usage_count: 1, success_count: 1 },
          $set: { last_used_at: now },
          $push: {
            recent_usage: {
              $each: [usageRecord],
              $slice: -10 // Keep only last 10 usage records
            }
          }
        }
      );
    } catch (error) {
      console.error("Error tracking coupon usage:", error);
    }
  }

  /**
   * Update coupon statistics
   */
  private static async updateCouponStats(couponId: string, discountAmount: number): Promise<void> {
    try {
      await coreApp.odm.findOneAndUpdate("coupon",
        { _id: couponId },
        {
          $inc: { application_count: 1 }
        }
      );
    } catch (error) {
      console.error("Error updating coupon stats:", error);
    }
  }

  /**
   * Sort coupons by priority (highest first)
   */
  private static async sortCouponsByPriority(couponCodes: string[]): Promise<string[]> {
    try {
      const coupons = await coreApp.odm.find("coupon", {
        code: { $in: couponCodes.map(code => code.toUpperCase()) }
      });

      // Sort by priority (higher priority first), then by discount amount
      const sortedCoupons = coupons.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }

        // If same priority, prioritize higher discount
        const aDiscount = a.discount_percentage || a.discount_amount || 0;
        const bDiscount = b.discount_percentage || b.discount_amount || 0;
        return bDiscount - aDiscount;
      });

      return sortedCoupons.map(coupon => coupon.code);
    } catch (error) {
      console.error("Error sorting coupons by priority:", error);
      return couponCodes; // Return original order if sorting fails
    }
  }

  /**
   * Get available coupons for a user
   */
  static async getAvailableCoupons(userId: string): Promise<any[]> {
    try {
      const now = new Date();
      const user = await coreApp.odm.findOne("user", { _id: userId });
      const isFirstTime = await this.isFirstTimeUser(userId);

      const query: any = {
        status: "active",
        is_public: true,
        valid_from: { $lte: now },
        $or: [
          { valid_until: { $exists: false } },
          { valid_until: { $gte: now } }
        ]
      };

      // Add user-specific filters
      if (!isFirstTime) {
        query.first_time_users_only = { $ne: true };
      }

      query.excluded_users = { $nin: [userId] };

      const coupons = await coreApp.odm.find("coupon", query);

      // Filter out coupons that have reached usage limits
      const availableCoupons = [];
      for (const coupon of coupons) {
        // Check total usage limit
        if (coupon.usage_limit_total && coupon.current_usage_count >= coupon.usage_limit_total) {
          continue;
        }

        // Check per-user usage limit
        const userUsageCount = await this.getUserCouponUsageCount(coupon.code, userId);
        if (userUsageCount >= coupon.usage_limit_per_user) {
          continue;
        }

        availableCoupons.push(coupon);
      }

      return availableCoupons;
    } catch (error) {
      console.error("Error getting available coupons:", error);
      return [];
    }
  }

  /**
   * Validate coupon code format
   */
  static validateCouponCodeFormat(code: string): boolean {
    const codePattern = /^[A-Z0-9]{3,20}$/;
    return codePattern.test(code.toUpperCase());
  }

  /**
   * Generate a random coupon code
   */
  static generateCouponCode(prefix?: string, length: number = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = prefix || "";

    for (let i = result.length; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Revoke/deactivate a coupon
   */
  static async revokeCoupon(couponId: string, reason?: string): Promise<boolean> {
    try {
      const result = await coreApp.odm.findOneAndUpdate("coupon",
        { _id: couponId },
        {
          $set: {
            status: "suspended",
            notes: reason ? `Revoked: ${reason}` : "Coupon revoked",
            updated_at: new Date()
          }
        }
      );

      return result !== null;
    } catch (error) {
      console.error("Error revoking coupon:", error);
      return false;
    }
  }

  /**
   * Get coupon usage statistics
   */
  static async getCouponStats(couponId: string): Promise<{
    totalUsage: number;
    uniqueUsers: number;
    totalDiscount: number;
    averageDiscount: number;
    conversionRate: number;
  } | null> {
    try {
      const coupon = await coreApp.odm.findOne("coupon", { _id: couponId });
      if (!coupon) return null;

      const orders = await coreApp.odm.find("order", {
        $or: [
          { "admin_notes": { $regex: coupon.code, $options: "i" } },
          { "internal_notes": { $regex: coupon.code, $options: "i" } }
        ]
      });

      const uniqueUsers = new Set(orders.map(order => order.user.objId)).size;
      const totalDiscount = orders.reduce((sum, order) => sum + (order.discount_amount || 0), 0);
      const averageDiscount = orders.length > 0 ? totalDiscount / orders.length : 0;
      const conversionRate = coupon.application_count > 0 ?
        (coupon.success_count / coupon.application_count) * 100 : 0;

      return {
        totalUsage: orders.length,
        uniqueUsers,
        totalDiscount,
        averageDiscount,
        conversionRate,
      };
    } catch (error) {
      console.error("Error getting coupon stats:", error);
      return null;
    }
  }
}
