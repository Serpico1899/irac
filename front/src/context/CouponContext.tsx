"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { couponApi, CouponData, CouponValidationRequest } from "@/services/coupon/couponApi";
import { useCart } from "./CartContext";
import { toast } from "react-hot-toast";

export interface AppliedCoupon {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed_amount";
  discountAmount: number;
  appliedAt: Date;
}

export interface CouponCalculation {
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  finalTotal: number;
  appliedCoupons: AppliedCoupon[];
}

export interface CouponState {
  // Applied coupons
  appliedCoupons: AppliedCoupon[];

  // Available coupons for user
  availableCoupons: CouponData[];

  // Loading states
  isValidating: boolean;
  isApplying: boolean;
  isLoading: boolean;

  // Error states
  validationError: string | null;
  applicationError: string | null;

  // Input state
  currentCode: string;

  // Calculations
  calculations: CouponCalculation;
}

export interface CouponContextType {
  // State
  state: CouponState;

  // Actions
  validateCoupon: (code: string, orderAmount?: number) => Promise<boolean>;
  applyCoupon: (code: string, orderId?: string, orderAmount?: number) => Promise<boolean>;
  removeCoupon: (couponId: string) => void;
  clearAllCoupons: () => void;
  setCurrentCode: (code: string) => void;
  loadAvailableCoupons: (orderAmount?: number) => Promise<void>;

  // Utilities
  canApplyCoupon: (code: string) => boolean;
  getCouponDiscount: (code: string, orderAmount: number) => number;
  formatDiscount: (coupon: AppliedCoupon, locale?: string) => string;
  calculateTotals: (subtotal: number) => CouponCalculation;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

const initialState: CouponState = {
  appliedCoupons: [],
  availableCoupons: [],
  isValidating: false,
  isApplying: false,
  isLoading: false,
  validationError: null,
  applicationError: null,
  currentCode: "",
  calculations: {
    subtotal: 0,
    totalDiscount: 0,
    taxAmount: 0,
    finalTotal: 0,
    appliedCoupons: [],
  },
};

export function CouponProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CouponState>(initialState);
  const { cart } = useCart();

  // Load applied coupons from localStorage on mount
  useEffect(() => {
    const savedCoupons = localStorage.getItem("irac_applied_coupons");
    if (savedCoupons) {
      try {
        const parsedCoupons = JSON.parse(savedCoupons);
        const couponsWithDates = parsedCoupons.map((coupon: any) => ({
          ...coupon,
          appliedAt: new Date(coupon.appliedAt),
        }));

        setState(prev => ({
          ...prev,
          appliedCoupons: couponsWithDates,
        }));
      } catch (error) {
        console.error("Error loading applied coupons:", error);
        localStorage.removeItem("irac_applied_coupons");
      }
    }
  }, []);

  // Save applied coupons to localStorage whenever they change
  useEffect(() => {
    if (state.appliedCoupons.length > 0) {
      localStorage.setItem("irac_applied_coupons", JSON.stringify(state.appliedCoupons));
    } else {
      localStorage.removeItem("irac_applied_coupons");
    }
  }, [state.appliedCoupons]);

  // Recalculate totals when cart or applied coupons change
  useEffect(() => {
    const calculations = calculateTotals(cart.total);
    setState(prev => ({ ...prev, calculations }));
  }, [cart.total, state.appliedCoupons]);

  // Calculate totals with applied coupons and tax
  const calculateTotals = useCallback((subtotal: number): CouponCalculation => {
    const totalDiscount = state.appliedCoupons.reduce(
      (sum, coupon) => sum + coupon.discountAmount,
      0
    );

    const afterDiscount = Math.max(0, subtotal - totalDiscount);
    const taxAmount = Math.floor(afterDiscount * 0.09); // 9% Iranian VAT
    const finalTotal = afterDiscount + taxAmount;

    return {
      subtotal,
      totalDiscount,
      taxAmount,
      finalTotal,
      appliedCoupons: state.appliedCoupons,
    };
  }, [state.appliedCoupons]);

  // Validate a coupon code
  const validateCoupon = useCallback(async (
    code: string,
    orderAmount?: number
  ): Promise<boolean> => {
    if (!code.trim()) return false;

    setState(prev => ({
      ...prev,
      isValidating: true,
      validationError: null,
    }));

    try {
      const request: CouponValidationRequest = {
        coupon_code: code.trim(),
        order_amount: orderAmount || cart.total,
        order_items: cart.items.map(item => ({
          item_id: item.id,
          item_type: item.type as "course" | "workshop" | "product",
          quantity: item.quantity,
        })),
      };

      const response = await couponApi.validateCoupon(request);

      if (response.success && response.data.is_valid) {
        setState(prev => ({
          ...prev,
          isValidating: false,
          validationError: null,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isValidating: false,
          validationError: response.data.error || "کد تخفیف نامعتبر است",
        }));
        return false;
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      setState(prev => ({
        ...prev,
        isValidating: false,
        validationError: "خطا در اعتبارسنجی کد تخفیف",
      }));
      return false;
    }
  }, [cart.total, cart.items]);

  // Apply a coupon
  const applyCoupon = useCallback(async (
    code: string,
    orderId?: string,
    orderAmount?: number
  ): Promise<boolean> => {
    if (!code.trim()) return false;

    // Check if coupon is already applied
    const isAlreadyApplied = state.appliedCoupons.some(
      coupon => coupon.code.toLowerCase() === code.toLowerCase()
    );

    if (isAlreadyApplied) {
      setState(prev => ({
        ...prev,
        applicationError: "این کد تخفیف قبلاً اعمال شده است",
      }));
      toast.error("این کد تخفیف قبلاً اعمال شده است");
      return false;
    }

    setState(prev => ({
      ...prev,
      isApplying: true,
      applicationError: null,
    }));

    try {
      // First validate the coupon
      const isValid = await validateCoupon(code, orderAmount);
      if (!isValid) {
        setState(prev => ({ ...prev, isApplying: false }));
        return false;
      }

      // Get coupon details for discount calculation
      const request: CouponValidationRequest = {
        coupon_code: code.trim(),
        order_amount: orderAmount || cart.total,
        order_items: cart.items.map(item => ({
          item_id: item.id,
          item_type: item.type as "course" | "workshop" | "product",
          quantity: item.quantity,
        })),
      };

      const validationResponse = await couponApi.validateCoupon(request);

      if (validationResponse.success && validationResponse.data.discount && validationResponse.data.coupon_details) {
        const discount = validationResponse.data.discount;
        const details = validationResponse.data.coupon_details;

        const appliedCoupon: AppliedCoupon = {
          id: `coupon_${Date.now()}`,
          code: details.code,
          name: details.name,
          type: discount.type,
          discountAmount: discount.amount,
          appliedAt: new Date(),
        };

        setState(prev => ({
          ...prev,
          appliedCoupons: [...prev.appliedCoupons, appliedCoupon],
          isApplying: false,
          currentCode: "",
          applicationError: null,
        }));

        toast.success(`کد تخفیف "${code}" با موفقیت اعمال شد`);
        return true;
      }

      setState(prev => ({
        ...prev,
        isApplying: false,
        applicationError: "خطا در اعمال کد تخفیف",
      }));
      return false;
    } catch (error) {
      console.error("Coupon application error:", error);
      setState(prev => ({
        ...prev,
        isApplying: false,
        applicationError: "خطا در اعمال کد تخفیف",
      }));
      toast.error("خطا در اعمال کد تخفیف");
      return false;
    }
  }, [state.appliedCoupons, validateCoupon, cart.total, cart.items]);

  // Remove a specific coupon
  const removeCoupon = useCallback((couponId: string) => {
    const couponToRemove = state.appliedCoupons.find(c => c.id === couponId);

    setState(prev => ({
      ...prev,
      appliedCoupons: prev.appliedCoupons.filter(c => c.id !== couponId),
      applicationError: null,
      validationError: null,
    }));

    if (couponToRemove) {
      toast.success(`کد تخفیف "${couponToRemove.code}" حذف شد`);
    }
  }, [state.appliedCoupons]);

  // Clear all applied coupons
  const clearAllCoupons = useCallback(() => {
    setState(prev => ({
      ...prev,
      appliedCoupons: [],
      currentCode: "",
      applicationError: null,
      validationError: null,
    }));

    localStorage.removeItem("irac_applied_coupons");
    toast.success("همه کدهای تخفیف حذف شدند");
  }, []);

  // Set current input code
  const setCurrentCode = useCallback((code: string) => {
    setState(prev => ({
      ...prev,
      currentCode: code,
      validationError: null,
      applicationError: null,
    }));
  }, []);

  // Load available coupons for user
  const loadAvailableCoupons = useCallback(async (orderAmount?: number) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await couponApi.getCoupons({
        only_available: true,
        for_order_amount: orderAmount || cart.total,
        limit: 20,
      });

      if (response.success) {
        setState(prev => ({
          ...prev,
          availableCoupons: response.data.coupons,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          availableCoupons: [],
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Error loading available coupons:", error);
      setState(prev => ({
        ...prev,
        availableCoupons: [],
        isLoading: false,
      }));
    }
  }, [cart.total]);

  // Check if a coupon can be applied
  const canApplyCoupon = useCallback((code: string): boolean => {
    return !state.appliedCoupons.some(
      coupon => coupon.code.toLowerCase() === code.toLowerCase()
    );
  }, [state.appliedCoupons]);

  // Get discount amount for a specific coupon
  const getCouponDiscount = useCallback((code: string, orderAmount: number): number => {
    const appliedCoupon = state.appliedCoupons.find(
      c => c.code.toLowerCase() === code.toLowerCase()
    );

    if (appliedCoupon) {
      return appliedCoupon.discountAmount;
    }

    // If not applied, try to find in available coupons
    const availableCoupon = state.availableCoupons.find(
      c => c.code.toLowerCase() === code.toLowerCase()
    );

    if (availableCoupon) {
      if (availableCoupon.type === "percentage" && availableCoupon.discount_percentage) {
        let discount = (orderAmount * availableCoupon.discount_percentage) / 100;
        if (availableCoupon.max_discount_amount) {
          discount = Math.min(discount, availableCoupon.max_discount_amount);
        }
        return Math.floor(discount);
      } else if (availableCoupon.discount_amount) {
        return Math.min(availableCoupon.discount_amount, orderAmount);
      }
    }

    return 0;
  }, [state.appliedCoupons, state.availableCoupons]);

  // Format discount text for display
  const formatDiscount = useCallback((coupon: AppliedCoupon, locale: string = "fa"): string => {
    const isRTL = locale === "fa";
    const amount = coupon.discountAmount.toLocaleString(isRTL ? "fa-IR" : "en-US");

    if (coupon.type === "percentage") {
      return isRTL ? `${amount} تومان تخفیف` : `${amount} IRR Discount`;
    }

    return isRTL ? `${amount} تومان` : `${amount} IRR`;
  }, []);

  const contextValue: CouponContextType = {
    state,
    validateCoupon,
    applyCoupon,
    removeCoupon,
    clearAllCoupons,
    setCurrentCode,
    loadAvailableCoupons,
    canApplyCoupon,
    getCouponDiscount,
    formatDiscount,
    calculateTotals,
  };

  return (
    <CouponContext.Provider value={contextValue}>
      {children}
    </CouponContext.Provider>
  );
}

// Hook to use coupon context
export function useCoupon() {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error("useCoupon must be used within a CouponProvider");
  }
  return context;
}

// Export context for advanced usage
export { CouponContext };
