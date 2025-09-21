import { coreApp } from "../../../mod.ts";
import {
  ActFn,
  array,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";
import { coupon_positive_amount } from "../../../models/coupon.ts";
import { CouponService } from "../service.ts";

// Input validation schema
const validateCouponInp = () => {
  return object({
    set: object({
      coupon_code: string(),
      order_amount: optional(coupon_positive_amount),
      order_items: optional(array(object({
        item_id: string(),
        item_type: enums(["course", "workshop", "product"]),
        quantity: number(),
      }))),
    }),
    get: object({
      is_valid: optional(number()),
      error: optional(number()),
      error_code: optional(number()),
      discount: optional(object({
        type: optional(number()),
        value: optional(number()),
        amount: optional(number()),
        max_discount: optional(number()),
      })),
      coupon_details: optional(object({
        code: optional(number()),
        name: optional(number()),
        description: optional(number()),
        type: optional(number()),
        discount_percentage: optional(number()),
        discount_amount: optional(number()),
        minimum_order_amount: optional(number()),
        valid_until: optional(number()),
        usage_limit_per_user: optional(number()),
      })),
    }),
  });
};

// Validate coupon act function
const validateCouponAct: ActFn = async (body) => {
  const { set, get } = body.details;

  try {
    // Check if user is authenticated
    if (!body.user?.userId) {
      throw new Error("کاربر احراز هویت نشده است");
    }

    const userId = body.user.userId;
    const { coupon_code, order_amount = 0, order_items } = set;

    // Validate coupon code format
    if (!coupon_code || coupon_code.trim().length === 0) {
      throw new Error("کد تخفیف نمی‌تواند خالی باشد");
    }

    // Validate coupon using the service
    const validationResult = await CouponService.validateCoupon(
      coupon_code.trim(),
      userId,
      order_amount,
      order_items
    );

    let response: any = {
      is_valid: validationResult.isValid,
      error: validationResult.error || null,
      error_code: validationResult.errorCode || null,
      discount: validationResult.discount || null,
    };

    // If validation was successful and coupon details are requested, get them
    if (validationResult.isValid && get.coupon_details) {
      try {
        const coupon = await coreApp.odm.findOne("coupon", {
          code: coupon_code.toUpperCase(),
        });

        if (coupon) {
          // Update click count for analytics
          await coreApp.odm.findOneAndUpdate("coupon",
            { _id: coupon._id },
            { $inc: { click_count: 1 } }
          );

          response.coupon_details = {
            code: coupon.code,
            name: coupon.name,
            description: coupon.description,
            type: coupon.type,
            discount_percentage: coupon.discount_percentage,
            discount_amount: coupon.discount_amount,
            minimum_order_amount: coupon.minimum_order_amount,
            valid_until: coupon.valid_until,
            usage_limit_per_user: coupon.usage_limit_per_user,
          };
        }
      } catch (error) {
        console.error("Error fetching coupon details:", error);
        // Don't fail the validation if we can't get details
      }
    }

    return {
      success: true,
      message: validationResult.isValid ?
        "کد تخفیف معتبر است" :
        validationResult.error || "کد تخفیف نامعتبر است",
      data: response,
    };

  } catch (error) {
    console.error("Validate coupon error:", error);

    const errorMessage = error instanceof Error ? error.message : "خطا در اعتبارسنجی کد تخفیف";

    return {
      success: false,
      message: errorMessage,
      data: {
        is_valid: false,
        error: errorMessage,
        error_code: "VALIDATION_ERROR",
        discount: null,
      },
    };
  }
};

// Setup function
export const validateCouponSetup = () => {
  coreApp.acts.setAct({
    schema: "main",
    actName: "validateCoupon",
    validator: validateCouponInp(),
    fn: validateCouponAct,
  });
};
