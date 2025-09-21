import { coreApp } from "../../../mod.ts";
import {
  ActFn,
  array,
  boolean,
  coerce,
  date,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";
import {
  coupon_applicable_to_enums,
  coupon_code,
  coupon_percentage,
  coupon_positive_amount,
  coupon_type_enums,
  coupon_usage_limit,
} from "../../../models/coupon.ts";
import { CouponService } from "../service.ts";

// Input validation schema
const createCouponInp = () => {
  return object({
    set: object({
      code: optional(coupon_code), // If not provided, will be auto-generated
      name: string(),
      name_en: optional(string()),
      description: string(),
      description_en: optional(string()),

      // Coupon type and value
      type: coupon_type_enums,
      discount_percentage: optional(coupon_percentage),
      discount_amount: optional(coupon_positive_amount),
      max_discount_amount: optional(coupon_positive_amount),

      // Applicability
      applicable_to: optional(coupon_applicable_to_enums),
      applicable_items: optional(array(object({
        item_type: enums(["course", "workshop", "product", "category"]),
        item_id: string(),
        item_name: optional(string()),
      }))),
      minimum_order_amount: optional(coupon_positive_amount),

      // Usage limitations
      usage_limit_total: optional(coupon_usage_limit),
      usage_limit_per_user: optional(coupon_usage_limit),

      // Time limitations
      valid_from: coerce(date(), string(), (value) => new Date(value)),
      valid_until: optional(coerce(date(), string(), (value) => new Date(value))),

      // User restrictions
      first_time_users_only: optional(boolean()),
      specific_user_groups: optional(array(string())),
      excluded_users: optional(array(string())),

      // Combination rules
      combinable_with_other_coupons: optional(boolean()),
      stackable: optional(boolean()),
      priority: optional(number()),

      // Visibility
      is_public: optional(boolean()),
      requires_admin_approval: optional(boolean()),

      // Campaign tracking
      campaign_id: optional(string()),
      referral_source: optional(string()),
      auto_apply: optional(boolean()),

      // Advanced features
      bulk_discount_threshold: optional(number()),
      category_restrictions: optional(array(string())),
      user_level_restrictions: optional(array(string())),

      // Admin fields
      notes: optional(string()),
    }),
    get: coreApp.schemas.selectStruct("coupon", 1),
  });
};

// Create coupon act function
const createCouponAct: ActFn = async (body) => {
  const { set, get } = body.details;

  try {
    // Check if user is admin
    const user = await coreApp.odm.findOne("user", { _id: body.user?.userId });
    if (!user || user.role !== "admin") {
      throw new Error("فقط مدیران سیستم اجازه ایجاد کد تخفیف را دارند");
    }

    // Validate coupon type and discount values
    if (set.type === "percentage") {
      if (!set.discount_percentage || set.discount_percentage <= 0 || set.discount_percentage > 100) {
        throw new Error("درصد تخفیف باید بین 1 تا 100 باشد");
      }
      if (set.discount_amount) {
        throw new Error("برای کد تخفیف درصدی، مبلغ ثابت تخفیف نباید مشخص شود");
      }
    } else if (set.type === "fixed_amount") {
      if (!set.discount_amount || set.discount_amount <= 0) {
        throw new Error("مبلغ تخفیف باید بیشتر از صفر باشد");
      }
      if (set.discount_percentage) {
        throw new Error("برای کد تخفیف با مبلغ ثابت، درصد تخفیف نباید مشخص شود");
      }
    } else {
      // For other types like first_time_user, course_specific, etc.
      if (!set.discount_percentage && !set.discount_amount) {
        throw new Error("باید درصد تخفیف یا مبلغ تخفیف مشخص شود");
      }
    }

    // Generate coupon code if not provided
    if (!set.code) {
      let attempts = 0;
      let generatedCode;
      let isUnique = false;

      while (!isUnique && attempts < 10) {
        generatedCode = CouponService.generateCouponCode(
          set.type === "first_time_user" ? "WELCOME" :
            set.type === "course_specific" ? "COURSE" :
              set.type === "percentage" ? "SAVE" : "DISC",
          10
        );

        const existingCoupon = await coreApp.odm.findOne("coupon", { code: generatedCode });
        isUnique = !existingCoupon;
        attempts++;
      }

      if (!isUnique) {
        throw new Error("خطا در تولید کد تخفیف یکتا. لطفاً کد تخفیف را دستی وارد کنید");
      }

      set.code = generatedCode;
    } else {
      // Validate provided code format
      if (!CouponService.validateCouponCodeFormat(set.code)) {
        throw new Error("کد تخفیف باید شامل 3-20 کاراکتر انگلیسی و عدد باشد");
      }

      // Check if code already exists
      const existingCoupon = await coreApp.odm.findOne("coupon", { code: set.code.toUpperCase() });
      if (existingCoupon) {
        throw new Error("این کد تخفیف قبلاً استفاده شده است");
      }

      set.code = set.code.toUpperCase();
    }

    // Validate date range
    if (set.valid_until && set.valid_until <= set.valid_from) {
      throw new Error("تاریخ پایان باید بعد از تاریخ شروع باشد");
    }

    // Set defaults
    const couponData = {
      ...set,
      status: "draft", // Start as draft, admin can activate later
      current_usage_count: 0,
      click_count: 0,
      application_count: 0,
      success_count: 0,
      created_by: body.user?.userId,
      currency: set.currency || "IRR",
      usage_limit_per_user: set.usage_limit_per_user || 1,
      priority: set.priority || 0,
      is_public: set.is_public !== undefined ? set.is_public : true,
      combinable_with_other_coupons: set.combinable_with_other_coupons || false,
      stackable: set.stackable || false,
      first_time_users_only: set.first_time_users_only || false,
      requires_admin_approval: set.requires_admin_approval || false,
      auto_apply: set.auto_apply || false,
      applicable_to: set.applicable_to || "all",
      minimum_order_amount: set.minimum_order_amount || 0,
      recent_usage: [],
    };

    // Create the coupon
    const createdCoupon = await coreApp.odm.insertOne("coupon", couponData);

    // Get the created coupon with selected fields
    const newCoupon = await coreApp.odm.findOne("coupon",
      { _id: createdCoupon.insertedId },
      { projection: get }
    );

    return {
      success: true,
      message: "کد تخفیف با موفقیت ایجاد شد",
      data: newCoupon,
    };

  } catch (error) {
    console.error("Create coupon error:", error);

    if (error instanceof Error) {
      throw error; // Re-throw known errors
    }

    throw new Error("خطا در ایجاد کد تخفیف");
  }
};

// Setup function
export const createCouponSetup = () => {
  coreApp.acts.setAct({
    schema: "main",
    actName: "createCoupon",
    validator: createCouponInp(),
    fn: createCouponAct,
  });
};
