import { coreApp } from "@app";
import {
  ActFn,
  boolean,
  coerce,
  date,
  defaulted,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";
import {
  coupon_applicable_to_enums,
  coupon_status_enums,
  coupon_type_enums,
} from "@model";
import { CouponService } from "../service.ts";

// Input validation schema
const getCouponsInp = () => {
  return object({
    set: object({
      // Pagination
      page: optional(defaulted(number(), 1)),
      limit: optional(defaulted(number(), 10)),

      // Admin filters
      status: optional(coupon_status_enums),
      type: optional(coupon_type_enums),
      applicable_to: optional(coupon_applicable_to_enums),
      is_public: optional(boolean()),

      // Date filters
      valid_from_start: optional(coerce(date(), string(), (value) => new Date(value))),
      valid_from_end: optional(coerce(date(), string(), (value) => new Date(value))),
      valid_until_start: optional(coerce(date(), string(), (value) => new Date(value))),
      valid_until_end: optional(coerce(date(), string(), (value) => new Date(value))),

      // Search
      search: optional(string()), // Search in code, name, description

      // User-specific options
      only_available: optional(boolean()), // For regular users, get only applicable coupons
      for_order_amount: optional(number()), // To filter by minimum order amount
    }),
    get: coreApp.schemas.selectStruct("coupon", 2),
  });
};

// Get coupons act function
const getCouponsAct: ActFn = async (body) => {
  const { set, get } = body.details;

  try {
    // Check if user is authenticated
    if (!body.user?.userId) {
      throw new Error("کاربر احراز هویت نشده است");
    }

    const userId = body.user.userId;
    const user = await coreApp.odm.findOne("user", { _id: userId });

    if (!user) {
      throw new Error("کاربر یافت نشد");
    }

    const isAdmin = user.role === "admin";
    const {
      page = 1,
      limit = 10,
      status,
      type,
      applicable_to,
      is_public,
      valid_from_start,
      valid_from_end,
      valid_until_start,
      valid_until_end,
      search,
      only_available = !isAdmin, // Default true for non-admins
      for_order_amount,
    } = set;

    // If user requested only available coupons, use the service
    if (only_available && !isAdmin) {
      const availableCoupons = await CouponService.getAvailableCoupons(userId);

      // Filter by order amount if specified
      let filteredCoupons = availableCoupons;
      if (for_order_amount) {
        filteredCoupons = availableCoupons.filter(coupon =>
          coupon.minimum_order_amount <= for_order_amount
        );
      }

      // Apply search if specified
      if (search && search.trim().length > 0) {
        const searchTerm = search.trim().toLowerCase();
        filteredCoupons = filteredCoupons.filter(coupon =>
          coupon.code.toLowerCase().includes(searchTerm) ||
          coupon.name.toLowerCase().includes(searchTerm) ||
          coupon.description.toLowerCase().includes(searchTerm)
        );
      }

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedCoupons = filteredCoupons.slice(skip, skip + limit);

      // Project only user-safe fields
      const userSafeCoupons = paginatedCoupons.map(coupon => ({
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        discount_percentage: coupon.discount_percentage,
        discount_amount: coupon.discount_amount,
        max_discount_amount: coupon.max_discount_amount,
        applicable_to: coupon.applicable_to,
        minimum_order_amount: coupon.minimum_order_amount,
        valid_from: coupon.valid_from,
        valid_until: coupon.valid_until,
        usage_limit_per_user: coupon.usage_limit_per_user,
        currency: coupon.currency,
      }));

      return {
        success: true,
        message: "کدهای تخفیف در دسترس با موفقیت دریافت شد",
        data: {
          coupons: userSafeCoupons,
          total: filteredCoupons.length,
          page,
          limit,
          total_pages: Math.ceil(filteredCoupons.length / limit),
        },
      };
    }

    // Admin or comprehensive query
    if (!isAdmin && !only_available) {
      throw new Error("دسترسی غیرمجاز");
    }

    // Build query for admins
    const query: any = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Applicable to filter
    if (applicable_to) {
      query.applicable_to = applicable_to;
    }

    // Public filter
    if (is_public !== undefined) {
      query.is_public = is_public;
    }

    // Date range filters
    if (valid_from_start || valid_from_end) {
      query.valid_from = {};
      if (valid_from_start) {
        query.valid_from.$gte = valid_from_start;
      }
      if (valid_from_end) {
        query.valid_from.$lte = valid_from_end;
      }
    }

    if (valid_until_start || valid_until_end) {
      query.valid_until = {};
      if (valid_until_start) {
        query.valid_until.$gte = valid_until_start;
      }
      if (valid_until_end) {
        query.valid_until.$lte = valid_until_end;
      }
    }

    // Order amount filter
    if (for_order_amount) {
      query.minimum_order_amount = { $lte: for_order_amount };
    }

    // Search functionality
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      query.$or = [
        { code: { $regex: searchTerm, $options: "i" } },
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await coreApp.odm.count("coupon", query);

    // Get coupons with pagination
    const coupons = await coreApp.odm.find("coupon", query, {
      skip,
      limit,
      sort: { created_at: -1 }, // Newest first
      projection: get,
    });

    // For admin users, calculate additional statistics
    const couponStats = await Promise.all(
      coupons.map(async (coupon) => {
        const stats = await CouponService.getCouponStats(coupon._id);
        return {
          ...coupon,
          usage_stats: stats,
        };
      })
    );

    return {
      success: true,
      message: "کدهای تخفیف با موفقیت دریافت شد",
      data: {
        coupons: isAdmin ? couponStats : coupons,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        filters_applied: {
          status,
          type,
          applicable_to,
          is_public,
          has_date_filter: !!(valid_from_start || valid_from_end || valid_until_start || valid_until_end),
          has_search: !!search,
          order_amount_filter: for_order_amount,
        },
      },
    };

  } catch (error) {
    console.error("Get coupons error:", error);

    const errorMessage = error instanceof Error ? error.message : "خطا در دریافت کدهای تخفیف";

    return {
      success: false,
      message: errorMessage,
      data: {
        coupons: [],
        total: 0,
        page: set.page || 1,
        limit: set.limit || 10,
        total_pages: 0,
      },
    };
  }
};

// Setup function
export const getCouponsSetup = () => {
  coreApp.acts.setAct({
    schema: "main",
    actName: "getCoupons",
    validator: getCouponsInp(),
    fn: getCouponsAct,
  });
};
