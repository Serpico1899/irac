import { coreApp } from "@app";
import {
  ActFn,
  number,
  object,
  optional,
  string,
} from "@deps";
import { CouponService } from "../service.ts";

// Input validation schema
const revokeCouponInp = () => {
  return object({
    set: object({
      coupon_id: string(),
      reason: optional(string()),
    }),
    get: object({
      success: optional(number()),
      revoked_coupon: optional(object({
        _id: optional(number()),
        code: optional(number()),
        name: optional(number()),
        status: optional(number()),
        notes: optional(number()),
      })),
    }),
  });
};

// Revoke coupon act function
const revokeCouponAct: ActFn = async (body) => {
  const { set, get } = body.details;

  try {
    // Check if user is admin
    const user = await coreApp.odm.findOne("user", { _id: body.user?.userId });
    if (!user || user.role !== "admin") {
      throw new Error("فقط مدیران سیستم اجازه لغو کد تخفیف را دارند");
    }

    const { coupon_id, reason } = set;

    // Validate required fields
    if (!coupon_id || coupon_id.trim().length === 0) {
      throw new Error("شناسه کد تخفیف مشخص نشده است");
    }

    // Find the coupon
    const coupon = await coreApp.odm.findOne("coupon", {
      _id: coupon_id.trim(),
    });

    if (!coupon) {
      throw new Error("کد تخفیف یافت نشد");
    }

    // Check if coupon is already revoked/suspended
    if (coupon.status === "suspended") {
      throw new Error("این کد تخفیف قبلاً لغو شده است");
    }

    if (coupon.status === "expired") {
      throw new Error("این کد تخفیف منقضی شده و نیازی به لغو ندارد");
    }

    // Prepare revocation data
    const revocationReason = reason && reason.trim().length > 0
      ? reason.trim()
      : "لغو شده توسط مدیر سیستم";

    const currentNotes = coupon.notes || "";
    const updatedNotes = currentNotes
      ? `${currentNotes}\n\n[${new Date().toLocaleString("fa-IR")}] لغو شد: ${revocationReason}`
      : `[${new Date().toLocaleString("fa-IR")}] لغو شد: ${revocationReason}`;

    // Revoke the coupon
    const updateResult = await coreApp.odm.findOneAndUpdate("coupon",
      { _id: coupon_id.trim() },
      {
        $set: {
          status: "suspended",
          notes: updatedNotes,
          updated_at: new Date(),
        }
      }
    );

    if (!updateResult) {
      throw new Error("خطا در لغو کد تخفیف");
    }

    // Get the updated coupon for response
    const updatedCoupon = await coreApp.odm.findOne("coupon",
      { _id: coupon_id.trim() },
      { projection: get.revoked_coupon || {} }
    );

    return {
      success: true,
      message: `کد تخفیف "${coupon.code}" با موفقیت لغو شد`,
      data: {
        success: true,
        revoked_coupon: updatedCoupon,
      },
    };

  } catch (error) {
    console.error("Revoke coupon error:", error);

    const errorMessage = error instanceof Error ? error.message : "خطا در لغو کد تخفیف";

    return {
      success: false,
      message: errorMessage,
      data: {
        success: false,
        revoked_coupon: null,
      },
    };
  }
};

// Setup function
export const revokeCouponSetup = () => {
  coreApp.acts.setAct({
    schema: "main",
    actName: "revokeCoupon",
    validator: revokeCouponInp(),
    fn: revokeCouponAct,
  });
};
