import { AppApi } from "@/services/api";

// Types for coupon validation and application
export interface CouponValidationRequest {
  coupon_code: string;
  order_amount?: number;
  order_items?: Array<{
    item_id: string;
    item_type: "course" | "workshop" | "product";
    quantity: number;
  }>;
}

export interface CouponValidationResponse {
  success: boolean;
  data: {
    is_valid: boolean;
    error?: string;
    error_code?: string;
    discount?: {
      type: "percentage" | "fixed_amount";
      value: number;
      amount: number;
      max_discount?: number;
    };
    coupon_details?: {
      code: string;
      name: string;
      description: string;
      type: string;
      discount_percentage?: number;
      discount_amount?: number;
      minimum_order_amount: number;
      valid_until?: string;
      usage_limit_per_user: number;
    };
  };
  message: string;
}

export interface CouponApplicationRequest {
  coupon_code: string;
  order_id: string;
  order_amount: number;
  order_items?: Array<{
    item_id: string;
    item_type: "course" | "workshop" | "product";
    quantity: number;
  }>;
}

export interface CouponApplicationResponse {
  success: boolean;
  data: {
    success: boolean;
    coupon_id?: string;
    coupon_code?: string;
    discount_amount: number;
    final_amount: number;
    original_amount: number;
    error?: string;
  };
  message: string;
}

export interface CreateCouponRequest {
  code?: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  type: "percentage" | "fixed_amount" | "first_time_user" | "course_specific" | "category_specific" | "bulk_purchase" | "referral_bonus";
  discount_percentage?: number;
  discount_amount?: number;
  max_discount_amount?: number;
  applicable_to?: "all" | "courses" | "workshops" | "products" | "specific_items";
  applicable_items?: Array<{
    item_type: "course" | "workshop" | "product" | "category";
    item_id: string;
    item_name?: string;
  }>;
  minimum_order_amount?: number;
  usage_limit_total?: number;
  usage_limit_per_user?: number;
  valid_from: string;
  valid_until?: string;
  first_time_users_only?: boolean;
  specific_user_groups?: string[];
  excluded_users?: string[];
  combinable_with_other_coupons?: boolean;
  stackable?: boolean;
  priority?: number;
  is_public?: boolean;
  requires_admin_approval?: boolean;
  campaign_id?: string;
  referral_source?: string;
  auto_apply?: boolean;
  bulk_discount_threshold?: number;
  category_restrictions?: string[];
  user_level_restrictions?: string[];
  notes?: string;
}

export interface GetCouponsRequest {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "expired" | "suspended" | "draft";
  type?: string;
  applicable_to?: "all" | "courses" | "workshops" | "products" | "specific_items";
  is_public?: boolean;
  valid_from_start?: string;
  valid_from_end?: string;
  valid_until_start?: string;
  valid_until_end?: string;
  search?: string;
  only_available?: boolean;
  for_order_amount?: number;
}

export interface CouponData {
  _id: string;
  code: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  type: string;
  discount_percentage?: number;
  discount_amount?: number;
  max_discount_amount?: number;
  applicable_to: string;
  minimum_order_amount: number;
  usage_limit_total?: number;
  usage_limit_per_user: number;
  current_usage_count: number;
  valid_from: string;
  valid_until?: string;
  status: string;
  is_public: boolean;
  currency: string;
  created_at: string;
  updated_at: string;
  usage_stats?: {
    totalUsage: number;
    uniqueUsers: number;
    totalDiscount: number;
    averageDiscount: number;
    conversionRate: number;
  };
}

export interface GetCouponsResponse {
  success: boolean;
  data: {
    coupons: CouponData[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    filters_applied?: {
      status?: string;
      type?: string;
      applicable_to?: string;
      is_public?: boolean;
      has_date_filter: boolean;
      has_search: boolean;
      order_amount_filter?: number;
    };
  };
  message: string;
}

export interface RevokeCouponRequest {
  coupon_id: string;
  reason?: string;
}

export interface RevokeCouponResponse {
  success: boolean;
  data: {
    success: boolean;
    revoked_coupon?: {
      _id: string;
      code: string;
      name: string;
      status: string;
      notes: string;
    };
  };
  message: string;
}

class CouponApiService {
  private getToken(): string | undefined {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token") || undefined;
    }
    return undefined;
  }

  /**
   * Validate a coupon code
   */
  async validateCoupon(request: CouponValidationRequest): Promise<CouponValidationResponse> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "coupon",
          act: "validateCoupon",
          details: {
            set: {
              coupon_code: request.coupon_code,
              order_amount: request.order_amount,
              order_items: request.order_items,
            },
            get: {
              is_valid: 1,
              error: 1,
              error_code: 1,
              discount: {
                type: 1,
                value: 1,
                amount: 1,
                max_discount: 1,
              },
              coupon_details: {
                code: 1,
                name: 1,
                description: 1,
                type: 1,
                discount_percentage: 1,
                discount_amount: 1,
                minimum_order_amount: 1,
                valid_until: 1,
                usage_limit_per_user: 1,
              },
            },
          },
        },
        { token }
      );

      return {
        success: result.success,
        data: result.data,
        message: result.message || (result.success ? "کد تخفیف معتبر است" : "کد تخفیف نامعتبر است"),
      };
    } catch (error) {
      console.error("Validate coupon error:", error);

      const errorMessage = error instanceof Error ? error.message : "خطا در اعتبارسنجی کد تخفیف";

      return {
        success: false,
        data: {
          is_valid: false,
          error: errorMessage,
          error_code: "VALIDATION_ERROR",
        },
        message: errorMessage,
      };
    }
  }

  /**
   * Apply coupon to an order
   */
  async applyCoupon(request: CouponApplicationRequest): Promise<CouponApplicationResponse> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "coupon",
          act: "applyCoupon",
          details: {
            set: {
              coupon_code: request.coupon_code,
              order_id: request.order_id,
              order_amount: request.order_amount,
              order_items: request.order_items,
            },
            get: {
              success: 1,
              coupon_id: 1,
              coupon_code: 1,
              discount_amount: 1,
              final_amount: 1,
              original_amount: 1,
              error: 1,
            },
          },
        },
        { token }
      );

      return {
        success: result.success,
        data: result.data,
        message: result.message || (result.success ? "کد تخفیف با موفقیت اعمال شد" : "خطا در اعمال کد تخفیف"),
      };
    } catch (error) {
      console.error("Apply coupon error:", error);

      const errorMessage = error instanceof Error ? error.message : "خطا در اعمال کد تخفیف";

      return {
        success: false,
        data: {
          success: false,
          discount_amount: 0,
          final_amount: request.order_amount,
          original_amount: request.order_amount,
          error: errorMessage,
        },
        message: errorMessage,
      };
    }
  }

  /**
   * Get available coupons for user or admin
   */
  async getCoupons(request: GetCouponsRequest = {}): Promise<GetCouponsResponse> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "coupon",
          act: "getCoupons",
          details: {
            set: {
              page: request.page || 1,
              limit: request.limit || 10,
              status: request.status,
              type: request.type,
              applicable_to: request.applicable_to,
              is_public: request.is_public,
              valid_from_start: request.valid_from_start,
              valid_from_end: request.valid_from_end,
              valid_until_start: request.valid_until_start,
              valid_until_end: request.valid_until_end,
              search: request.search,
              only_available: request.only_available,
              for_order_amount: request.for_order_amount,
            },
            get: {
              coupons: {
                _id: 1,
                code: 1,
                name: 1,
                name_en: 1,
                description: 1,
                description_en: 1,
                type: 1,
                discount_percentage: 1,
                discount_amount: 1,
                max_discount_amount: 1,
                applicable_to: 1,
                minimum_order_amount: 1,
                usage_limit_total: 1,
                usage_limit_per_user: 1,
                current_usage_count: 1,
                valid_from: 1,
                valid_until: 1,
                status: 1,
                is_public: 1,
                currency: 1,
                created_at: 1,
                updated_at: 1,
                usage_stats: {
                  totalUsage: 1,
                  uniqueUsers: 1,
                  totalDiscount: 1,
                  averageDiscount: 1,
                  conversionRate: 1,
                },
              },
              total: 1,
              page: 1,
              limit: 1,
              total_pages: 1,
              filters_applied: {
                status: 1,
                type: 1,
                applicable_to: 1,
                is_public: 1,
                has_date_filter: 1,
                has_search: 1,
                order_amount_filter: 1,
              },
            },
          },
        },
        { token }
      );

      return {
        success: result.success,
        data: result.data,
        message: result.message || (result.success ? "کدهای تخفیف دریافت شد" : "خطا در دریافت کدهای تخفیف"),
      };
    } catch (error) {
      console.error("Get coupons error:", error);

      const errorMessage = error instanceof Error ? error.message : "خطا در دریافت کدهای تخفیف";

      return {
        success: false,
        data: {
          coupons: [],
          total: 0,
          page: request.page || 1,
          limit: request.limit || 10,
          total_pages: 0,
        },
        message: errorMessage,
      };
    }
  }

  /**
   * Create a new coupon (admin only)
   */
  async createCoupon(request: CreateCouponRequest): Promise<{ success: boolean; data?: CouponData; message: string }> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "coupon",
          act: "createCoupon",
          details: {
            set: request,
            get: {
              _id: 1,
              code: 1,
              name: 1,
              name_en: 1,
              description: 1,
              description_en: 1,
              type: 1,
              discount_percentage: 1,
              discount_amount: 1,
              max_discount_amount: 1,
              applicable_to: 1,
              minimum_order_amount: 1,
              usage_limit_total: 1,
              usage_limit_per_user: 1,
              valid_from: 1,
              valid_until: 1,
              status: 1,
              is_public: 1,
              currency: 1,
              created_at: 1,
              updated_at: 1,
            },
          },
        },
        { token }
      );

      return {
        success: result.success,
        data: result.data,
        message: result.message || (result.success ? "کد تخفیف ایجاد شد" : "خطا در ایجاد کد تخفیف"),
      };
    } catch (error) {
      console.error("Create coupon error:", error);

      const errorMessage = error instanceof Error ? error.message : "خطا در ایجاد کد تخفیف";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Revoke a coupon (admin only)
   */
  async revokeCoupon(request: RevokeCouponRequest): Promise<RevokeCouponResponse> {
    try {
      const token = this.getToken();
      const api = AppApi();

      const result = await api.send(
        {
          service: "main",
          model: "coupon",
          act: "revokeCoupon",
          details: {
            set: request,
            get: {
              success: 1,
              revoked_coupon: {
                _id: 1,
                code: 1,
                name: 1,
                status: 1,
                notes: 1,
              },
            },
          },
        },
        { token }
      );

      return {
        success: result.success,
        data: result.data,
        message: result.message || (result.success ? "کد تخفیف لغو شد" : "خطا در لغو کد تخفیف"),
      };
    } catch (error) {
      console.error("Revoke coupon error:", error);

      const errorMessage = error instanceof Error ? error.message : "خطا در لغو کد تخفیف";

      return {
        success: false,
        data: {
          success: false,
        },
        message: errorMessage,
      };
    }
  }

  /**
   * Calculate order totals with coupons and tax
   */
  static calculateOrderTotals(
    subtotal: number,
    discountAmount: number = 0,
    taxRate: number = 0.09
  ): {
    subtotal: number;
    discountAmount: number;
    afterDiscount: number;
    taxAmount: number;
    finalTotal: number;
  } {
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.floor(afterDiscount * taxRate);
    const finalTotal = afterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount,
      afterDiscount,
      taxAmount,
      finalTotal,
    };
  }

  /**
   * Format discount display text
   */
  static formatDiscountText(
    coupon: Pick<CouponData, "type" | "discount_percentage" | "discount_amount">,
    locale: string = "fa"
  ): string {
    const isRTL = locale === "fa";

    if (coupon.type === "percentage" && coupon.discount_percentage) {
      return isRTL
        ? `${coupon.discount_percentage}% تخفیف`
        : `${coupon.discount_percentage}% Discount`;
    }

    if (coupon.discount_amount) {
      const amount = coupon.discount_amount.toLocaleString(isRTL ? "fa-IR" : "en-US");
      return isRTL
        ? `${amount} تومان تخفیف`
        : `${amount} IRR Discount`;
    }

    return isRTL ? "تخفیف" : "Discount";
  }

  /**
   * Validate coupon code format
   */
  static validateCouponCodeFormat(code: string): boolean {
    const codePattern = /^[A-Z0-9]{3,20}$/;
    return codePattern.test(code.toUpperCase());
  }

  /**
   * Get coupon type display name
   */
  static getCouponTypeDisplay(type: string, locale: string = "fa"): string {
    const isRTL = locale === "fa";

    const typeMap = {
      percentage: isRTL ? "درصد تخفیف" : "Percentage Discount",
      fixed_amount: isRTL ? "مبلغ ثابت" : "Fixed Amount",
      first_time_user: isRTL ? "کاربر جدید" : "New User",
      course_specific: isRTL ? "دوره خاص" : "Course Specific",
      category_specific: isRTL ? "دسته خاص" : "Category Specific",
      bulk_purchase: isRTL ? "خرید عمده" : "Bulk Purchase",
      referral_bonus: isRTL ? "پاداش معرفی" : "Referral Bonus",
    };

    return typeMap[type as keyof typeof typeMap] || type;
  }
}

export const couponApi = new CouponApiService();
export default couponApi;
