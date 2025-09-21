"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types";
import {
  ShoppingCartIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  TagIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface CouponState {
  code: string;
  isValid: boolean;
  isApplied: boolean;
  discountAmount: number;
  error: string | null;
  isLoading: false;
}

interface EnhancedCartProps {
  locale?: string;
  className?: string;
  onCheckout?: () => void;
}

export default function EnhancedCart({
  locale = "fa",
  className = "",
  onCheckout
}: EnhancedCartProps) {
  const t = useTranslations("Cart");
  const tCoupon = useTranslations("Coupon");
  const tCommon = useTranslations("Common");

  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const isRTL = locale === "fa";

  // Coupon state
  const [coupon, setCoupon] = useState<CouponState>({
    code: "",
    isValid: false,
    isApplied: false,
    discountAmount: 0,
    error: null,
    isLoading: false,
  });

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Format numbers based on locale
  const formatNumber = useCallback((num: number): string => {
    if (isRTL) {
      return num.toLocaleString("fa-IR");
    }
    return num.toLocaleString("en-US");
  }, [isRTL]);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    const formatted = formatNumber(amount);
    return isRTL ? `${formatted} تومان` : `${formatted} IRR`;
  }, [formatNumber, isRTL]);

  // Calculate totals with coupon and tax
  const calculations = useMemo(() => {
    const subtotal = cart.total;
    const discountAmount = coupon.isApplied ? coupon.discountAmount : 0;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.floor(afterDiscount * 0.09); // 9% Iranian VAT
    const finalTotal = afterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      finalTotal,
    };
  }, [cart.total, coupon.isApplied, coupon.discountAmount]);

  // Handle quantity change
  const handleQuantityChange = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
    toast.success(t("cartUpdated"));
  }, [updateQuantity, t]);

  // Handle item removal
  const handleRemoveItem = useCallback((itemId: string) => {
    removeFromCart(itemId);
    toast.success(t("itemRemoved"));
  }, [removeFromCart, t]);

  // Handle clear cart
  const handleClearCart = useCallback(() => {
    clearCart();
    setCoupon(prev => ({ ...prev, isApplied: false, discountAmount: 0, error: null }));
    setShowClearConfirm(false);
    toast.success(t("cartUpdated"));
  }, [clearCart, t]);

  // Mock coupon validation (replace with actual API call)
  const validateCoupon = useCallback(async (code: string) => {
    setCoupon(prev => ({ ...prev, isLoading: true, error: null }));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation logic
    const mockCoupons: Record<string, { discount: number; type: "percentage" | "fixed" }> = {
      "WELCOME10": { discount: 10, type: "percentage" },
      "SAVE50000": { discount: 50000, type: "fixed" },
      "FIRST20": { discount: 20, type: "percentage" },
      "COURSE15": { discount: 15, type: "percentage" },
    };

    const couponData = mockCoupons[code.toUpperCase()];

    if (!couponData) {
      setCoupon(prev => ({
        ...prev,
        isValid: false,
        error: tCoupon("errors.notFound"),
        isLoading: false
      }));
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (couponData.type === "percentage") {
      discountAmount = Math.floor((cart.total * couponData.discount) / 100);
    } else {
      discountAmount = Math.min(couponData.discount, cart.total);
    }

    setCoupon(prev => ({
      ...prev,
      isValid: true,
      isApplied: true,
      discountAmount,
      error: null,
      isLoading: false,
    }));

    toast.success(tCoupon("success"));
  }, [cart.total, tCoupon]);

  // Handle coupon application
  const handleApplyCoupon = useCallback(async () => {
    if (!coupon.code.trim()) return;
    await validateCoupon(coupon.code.trim());
  }, [coupon.code, validateCoupon]);

  // Handle coupon removal
  const handleRemoveCoupon = useCallback(() => {
    setCoupon({
      code: "",
      isValid: false,
      isApplied: false,
      discountAmount: 0,
      error: null,
      isLoading: false,
    });
    toast.success(tCoupon("removed"));
  }, [tCoupon]);

  // Handle checkout
  const handleCheckout = useCallback(async () => {
    if (cart.items.length === 0) return;

    setIsProcessing(true);
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 1500));
      onCheckout?.();
      toast.success(t("orderPlaced"));
    } catch (error) {
      toast.error("خطا در پردازش سفارش");
    } finally {
      setIsProcessing(false);
    }
  }, [cart.items.length, onCheckout, t]);

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center bg-background rounded-lg shadow-lg p-8 min-h-96 ${className}`}>
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="flex items-center justify-center w-24 h-24 bg-background-secondary rounded-full mb-6">
            <ShoppingCartIcon className="w-12 h-12 text-text-light" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-3">
            {t("emptyCart")}
          </h2>
          <p className="text-text-secondary mb-6">
            {t("emptyCartDescription")}
          </p>
          <Button
            variant="primary"
            className="px-8 py-3"
            onClick={() => window.history.back()}
          >
            {t("continueShopping")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-background rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-background-secondary">
        <div className="flex items-center gap-3">
          <ShoppingCartIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">
            {t("title")}
          </h2>
          <span className="bg-primary text-white text-sm px-2 py-1 rounded-full">
            {formatNumber(cart.itemCount)} {cart.itemCount === 1 ? t("item") : t("items")}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowClearConfirm(true)}
          className="text-red-600 hover:bg-red-50"
        >
          <TrashIcon className="w-4 h-4 ml-2" />
          {t("clear")}
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex flex-col gap-4 p-6">
        {cart.items.map((item: CartItem) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 border border-background-darkest rounded-lg hover:shadow-sm transition-shadow"
          >
            {/* Item Image */}
            <div className="flex-shrink-0 w-16 h-16 bg-background-secondary rounded-lg overflow-hidden">
              {item.featured_image?.url ? (
                <Image
                  src={item.featured_image.url}
                  alt={item.featured_image.alt || item.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-background-secondary">
                  <ShoppingCartIcon className="w-6 h-6 text-text-light" />
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="font-medium text-text-primary truncate">
                {isRTL ? item.name : (item.name_en || item.name)}
              </h3>
              <p className="text-sm text-text-secondary capitalize">
                {item.type === "course" ? (isRTL ? "دوره" : "Course") :
                 item.type === "workshop" ? (isRTL ? "کارگاه" : "Workshop") :
                 isRTL ? "محصول" : "Product"}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 bg-background-secondary rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 p-0 hover:bg-background-darkest"
              >
                <MinusIcon className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-text-primary min-w-8 text-center">
                {formatNumber(item.quantity)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                className="w-8 h-8 p-0 hover:bg-background-darkest"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Price */}
            <div className="flex flex-col items-end text-sm">
              {item.discounted_price && item.discounted_price < item.price ? (
                <>
                  <span className="text-text-light line-through">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(item.discounted_price)}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-text-primary">
                  {formatCurrency(item.price)}
                </span>
              )}
              <span className="text-xs text-text-secondary mt-1">
                {formatCurrency((item.discounted_price || item.price) * item.quantity)}
              </span>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveItem(item.id)}
              className="w-8 h-8 p-0 text-red-600 hover:bg-red-50"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="px-6 pb-4">
        <div className="flex flex-col gap-3 p-4 bg-background-primary rounded-lg border">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-accent" />
            <span className="font-medium text-text-primary">{tCoupon("title")}</span>
          </div>

          {coupon.isApplied ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <div className="flex flex-col">
                  <span className="font-medium text-green-800">{coupon.code}</span>
                  <span className="text-sm text-green-600">
                    {tCoupon("applied")} - {formatCurrency(coupon.discountAmount)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="text-green-600 hover:bg-green-100"
              >
                {tCoupon("remove")}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon.code}
                  onChange={(e) => setCoupon(prev => ({ ...prev, code: e.target.value, error: null }))}
                  placeholder={tCoupon("placeholder")}
                  className="flex-1 px-3 py-2 border border-background-darkest rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={!coupon.code.trim() || coupon.isLoading}
                  className="px-6 py-2 bg-accent text-white hover:bg-accent/90"
                >
                  {coupon.isLoading ? tCommon("loading") : tCoupon("apply")}
                </Button>
              </div>

              {coupon.error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-800">{coupon.error}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="px-6 pb-6">
        <div className="flex flex-col gap-3 p-4 bg-background-secondary rounded-lg">
          <h3 className="font-semibold text-text-primary border-b border-background-darkest pb-2">
            {t("cartSummary")}
          </h3>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">{t("subtotal")}:</span>
              <span className="font-medium text-text-primary">
                {formatCurrency(calculations.subtotal)}
              </span>
            </div>

            {calculations.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t("discount")}:</span>
                <span className="font-medium">
                  -{formatCurrency(calculations.discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-text-secondary">{t("taxRate")}:</span>
              <span className="font-medium text-text-primary">
                {formatCurrency(calculations.taxAmount)}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-background-darkest">
              <span className="font-semibold text-text-primary text-lg">{t("finalTotal")}:</span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(calculations.finalTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 p-6 pt-0">
        <Button
          onClick={handleCheckout}
          disabled={isProcessing || cart.items.length === 0}
          className="w-full py-3 bg-primary text-white hover:bg-primary-dark font-medium"
          size="lg"
        >
          {isProcessing ? tCommon("loading") : t("checkout")}
          <span className="mr-2">
            {formatCurrency(calculations.finalTotal)}
          </span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="w-full py-2 text-text-secondary hover:text-text-primary"
        >
          {t("continueShopping")}
        </Button>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t("confirmClear")}
            </h3>
            <p className="text-text-secondary mb-6">
              {t("clearConfirmation")}
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1"
              >
                {t("no")}
              </Button>
              <Button
                onClick={handleClearCart}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                {t("yes")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
