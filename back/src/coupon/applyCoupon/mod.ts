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
const applyCouponInp = () => {
  return object({
    set: object({
      coupon_code: string(),
      order_id: string(),
      order_amount: coupon_positive_amount,
      order_items: optional(array(object({
        item_id: string(),
        item_type: enums(["course", "workshop", "product"]),
        quantity: number(),
      }))),
    }),
    get: object({
      success: optional(number()),
      coupon_id: optional(number()),
      coupon_code: optional(number()),
      discount_amount: optional(number()),
      final_amount: optional(number()),
      original_amount: optional(number()),
      error: optional(number()),
    }),
  });
};

// Apply coupon act function
const applyCouponAct: ActFn = async (body) => {
  const { set, get } = body.details;

  try {
    // Check if user is authenticated
    if (!body.user?.userId) {
      throw new Error("کاربر احراز هویت نشده است");
    }

    const userId = body.user.userId;
    const { coupon_code, order_id, order_amount, order_items } = set;

    // Validate required fields
    if (!coupon_code || coupon_code.trim().length === 0) {
      throw new Error("کد تخفیف نمی‌تواند خالی باشد");
    }

    if (!order_id || order_id.trim().length === 0) {
      throw new Error("شناسه سفارش مشخص نشده است");
    }

    if (!order_amount || order_amount <= 0) {
      throw new Error("مبلغ سفارش نامعتبر است");
    }

    // Check if order belongs to the user
    const order = await coreApp.odm.findOne("order", {
      _id: order_id,
      "user.objId": userId,
    });

    if (!order) {
      throw new Error("سفارش یافت نشد یا متعلق به شما نیست");
    }

    // Check if order is in valid state for coupon application
    if (order.status !== "pending") {
      throw new Error("فقط سفارش‌های در حالت انتظار قابل اعمال کد تخفیف هستند");
    }

    // Check if coupon is already applied to this order
    if (order.discount_amount > 0) {
      throw new Error("کد تخفیف قبلاً به این سفارش اعمال شده است");
    }

    // Apply coupon using the service
    const applicationResult = await CouponService.applyCoupon(
      coupon_code.trim(),
      userId,
      order_id,
      order_amount,
      order_items
    );

    if (!applicationResult.success) {
      return {
        success: false,
        message: applicationResult.error || "خطا در اعمال کد تخفیف",
        data: {
          success: false,
          discount_amount: 0,
          final_amount: order_amount,
          original_amount: order_amount,
          error: applicationResult.error,
        },
      };
    }

    // Update the order with coupon information
    const discountAmount = applicationResult.discountAmount;
    const finalAmount = applicationResult.finalAmount;

    // Calculate tax (9% Iranian VAT) on the discounted amount
    const taxAmount = Math.floor(finalAmount * 0.09);
    const totalWithTax = finalAmount + taxAmount;

    const updateResult = await coreApp.odm.findOneAndUpdate("order",
      { _id: order_id },
      {
        $set: {
          discount_amount: discountAmount,
          total_amount: totalWithTax,
          tax_amount: taxAmount,
          admin_notes: `کد تخفیف اعمال شده: ${applicationResult.couponCode}`,
          internal_notes: `Coupon applied: ${applicationResult.couponCode} (${discountAmount} IRR discount)`,
          updated_at: new Date(),
        }
      }
    );

    if (!updateResult) {
      // If order update failed, we should revert the coupon usage
      // This is a critical error that should be handled properly
      console.error("Failed to update order after coupon application");
      throw new Error("خطا در به‌روزرسانی سفارش. لطفاً مجدداً تلاش کنید");
    }

    return {
      success: true,
      message: `کد تخفیف با موفقیت اعمال شد. مبلغ ${discountAmount.toLocaleString("fa-IR")} تومان تخفیف دریافت کردید`,
      data: {
        success: true,
        coupon_id: applicationResult.couponId,
        coupon_code: applicationResult.couponCode,
        discount_amount: discountAmount,
        final_amount: totalWithTax,
        original_amount: order_amount,
        error: null,
      },
    };

  } catch (error) {
    console.error("Apply coupon error:", error);

    const errorMessage = error instanceof Error ? error.message : "خطا در اعمال کد تخفیف";

    return {
      success: false,
      message: errorMessage,
      data: {
        success: false,
        discount_amount: 0,
        final_amount: set.order_amount || 0,
        original_amount: set.order_amount || 0,
        error: errorMessage,
      },
    };
  }
};

// Setup function
export const applyCouponSetup = () => {
  coreApp.acts.setAct({
    schema: "main",
    actName: "applyCoupon",
    validator: applyCouponInp(),
    fn: applyCouponAct,
  });
};
