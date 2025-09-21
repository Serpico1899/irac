// Import coupon act setup functions
import { createCouponSetup } from "./createCoupon/mod.ts";
import { validateCouponSetup } from "./validateCoupon/mod.ts";
import { applyCouponSetup } from "./applyCoupon/mod.ts";
import { getCouponsSetup } from "./getCoupons/mod.ts";
import { revokeCouponSetup } from "./revokeCoupon/mod.ts";

// Export coupon service and types
export { CouponService } from "./service.ts";
export type {
  CouponValidationResult,
  CouponApplicationResult,
  OrderCouponCalculation,
} from "./service.ts";

// Coupon module setup function
export const couponSetup = () => {
  createCouponSetup();
  validateCouponSetup();
  applyCouponSetup();
  getCouponsSetup();
  revokeCouponSetup();
  console.log("Coupon module initialized with complete e-commerce discount system");
};
