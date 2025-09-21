"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useCoupon } from "@/context/CouponContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { CouponData } from "@/services/coupon/couponApi";
import {
  TagIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  GiftIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

interface CouponSelectorProps {
  locale?: string;
  className?: string;
  onCouponSelect?: (coupon: CouponData) => void;
  showHeader?: boolean;
  maxCoupons?: number;
}

export default function CouponSelector({
  locale = "fa",
  className = "",
  onCouponSelect,
  showHeader = true,
  maxCoupons = 6,
}: CouponSelectorProps) {
  const t = useTranslations("Coupon");
  const tCommon = useTranslations("Common");
  const { state, applyCoupon, loadAvailableCoupons, canApplyCoupon, formatDiscount } = useCoupon();
  const { cart } = useCart();

  const isRTL = locale === "fa";
  const [showAll, setShowAll] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  // Load available coupons on mount
  useEffect(() => {
    loadAvailableCoupons(cart.total);
  }, [loadAvailableCoupons, cart.total]);

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

  // Get coupon type display name
  const getCouponTypeDisplay = useCallback((type: string): string => {
    const typeMap = {
      percentage: isRTL ? "درصد تخفیف" : "Percentage",
      fixed_amount: isRTL ? "مبلغ ثابت" : "Fixed Amount",
      first_time_user: isRTL ? "کاربر جدید" : "New User",
      course_specific: isRTL ? "دوره خاص" : "Course Specific",
      category_specific: isRTL ? "دسته خاص" : "Category",
      bulk_purchase: isRTL ? "خرید عمده" : "Bulk Purchase",
      referral_bonus: isRTL ? "پاداش معرفی" : "Referral",
    };

    return typeMap[type as keyof typeof typeMap] || type;
  }, [isRTL]);

  // Get coupon icon based on type
  const getCouponIcon = useCallback((type: string) => {
    switch (type) {
      case "first_time_user":
        return <SparklesIcon className="w-5 h-5" />;
      case "course_specific":
        return <UserGroupIcon className="w-5 h-5" />;
      case "bulk_purchase":
        return <GiftIcon className="w-5 h-5" />;
      default:
        return <TagIcon className="w-5 h-5" />;
    }
  }, []);

  // Calculate discount preview
  const getDiscountPreview = useCallback((coupon: CouponData): string => {
    if (coupon.type === "percentage" && coupon.discount_percentage) {
      const discountAmount = Math.floor((cart.total * coupon.discount_percentage) / 100);
      const maxed = coupon.max_discount_amount && discountAmount > coupon.max_discount_amount;
      const finalAmount = maxed ? coupon.max_discount_amount! : discountAmount;

      return isRTL
        ? `${formatNumber(coupon.discount_percentage)}% (${formatCurrency(finalAmount)})`
        : `${coupon.discount_percentage}% (${formatCurrency(finalAmount)})`;
    }

    if (coupon.discount_amount) {
      const discountAmount = Math.min(coupon.discount_amount, cart.total);
      return formatCurrency(discountAmount);
    }

    return isRTL ? "تخفیف" : "Discount";
  }, [cart.total, formatCurrency, formatNumber, isRTL]);

  // Handle coupon application
  const handleApplyCoupon = useCallback(async (coupon: CouponData) => {
    if (!canApplyCoupon(coupon.code)) {
      toast.error(t("alreadyApplied"));
      return;
    }

    setIsApplying(coupon._id);
    setSelectedCoupon(coupon._id);

    try {
      const success = await applyCoupon(coupon.code, undefined, cart.total);

      if (success) {
        onCouponSelect?.(coupon);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
    } finally {
      setIsApplying(null);
      setSelectedCoupon(null);
    }
  }, [canApplyCoupon, applyCoupon, cart.total, onCouponSelect, t]);

  // Copy coupon code to clipboard
  const handleCopyCode = useCallback(async (code: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("codeCopied"));
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        toast.success(t("codeCopied"));
      } catch (fallbackError) {
        console.error("Failed to copy code:", fallbackError);
      }

      document.body.removeChild(textArea);
    }
  }, [t]);

  // Format validity date
  const formatValidityDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return isRTL
      ? date.toLocaleDateString("fa-IR")
      : date.toLocaleDateString("en-US");
  }, [isRTL]);

  const couponsToShow = showAll
    ? state.availableCoupons
    : state.availableCoupons.slice(0, maxCoupons);

  if (state.isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-text-secondary">{tCommon("loading")}</span>
        </div>
      </div>
    );
  }

  if (state.availableCoupons.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="flex flex-col items-center gap-4 max-w-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-background-secondary rounded-full">
            <TagIcon className="w-8 h-8 text-text-light" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {t("noCouponsAvailable")}
            </h3>
            <p className="text-text-secondary text-sm">
              {isRTL
                ? "در حال حاضر کد تخفیفی برای شما در دسترس نیست"
                : "No coupons are currently available for you"
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
              <TagIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {t("availableCoupons")}
              </h3>
              <p className="text-sm text-text-secondary">
                {formatNumber(state.availableCoupons.length)} {
                  isRTL ? "کد موجود" : "codes available"
                }
              </p>
            </div>
          </div>

          {state.availableCoupons.length > maxCoupons && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-primary hover:bg-primary/10"
            >
              {showAll ? t("hideAvailable") : t("viewAvailable")}
            </Button>
          )}
        </div>
      )}

      {/* Coupons Grid */}
      <div className="flex flex-col gap-4">
        {couponsToShow.map((coupon) => {
          const isApplied = !canApplyCoupon(coupon.code);
          const isCurrentlyApplying = isApplying === coupon._id;
          const isSelected = selectedCoupon === coupon._id;

          return (
            <div
              key={coupon._id}
              className={`
                flex flex-col p-4 border rounded-lg transition-all duration-200 cursor-pointer
                ${isApplied
                  ? "bg-green-50 border-green-200"
                  : "bg-background border-background-darkest hover:shadow-md hover:border-primary/20"
                }
                ${isSelected ? "ring-2 ring-primary/20" : ""}
              `}
              onClick={() => !isApplied && !isCurrentlyApplying && handleApplyCoupon(coupon)}
            >
              {/* Coupon Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-lg
                    ${isApplied ? "bg-green-100 text-green-600" : "bg-accent/10 text-accent"}
                  `}>
                    {isApplied ? (
                      <CheckCircleIconSolid className="w-5 h-5" />
                    ) : (
                      getCouponIcon(coupon.type)
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        {coupon.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleCopyCode(coupon.code, e)}
                        className="w-6 h-6 p-0 text-text-light hover:text-primary"
                        title={t("copyCode")}
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    <h4 className="font-medium text-text-primary truncate">
                      {isRTL ? coupon.name : (coupon.name_en || coupon.name)}
                    </h4>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <span className="text-lg font-bold text-green-600">
                    {getDiscountPreview(coupon)}
                  </span>
                  <span className="text-xs text-text-light bg-background-secondary px-2 py-1 rounded">
                    {getCouponTypeDisplay(coupon.type)}
                  </span>
                </div>
              </div>

              {/* Coupon Description */}
              <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                {isRTL ? coupon.description : (coupon.description_en || coupon.description)}
              </p>

              {/* Coupon Details */}
              <div className="flex flex-wrap gap-3 text-xs text-text-light mb-3">
                {coupon.minimum_order_amount > 0 && (
                  <div className="flex items-center gap-1">
                    <span>{t("info.minimumOrder")}:</span>
                    <span className="font-medium">{formatCurrency(coupon.minimum_order_amount)}</span>
                  </div>
                )}

                {coupon.valid_until && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{t("info.validUntil")}: {formatValidityDate(coupon.valid_until)}</span>
                  </div>
                )}

                {coupon.usage_limit_per_user > 1 && (
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="w-3 h-3" />
                    <span>{formatNumber(coupon.usage_limit_per_user)} {isRTL ? "بار" : "uses"}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-background-secondary">
                {isApplied ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("applied")}</span>
                  </div>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyCoupon(coupon);
                    }}
                    disabled={isCurrentlyApplying}
                    size="sm"
                    className="bg-primary text-white hover:bg-primary-dark"
                  >
                    {isCurrentlyApplying ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                        {tCommon("loading")}
                      </div>
                    ) : (
                      t("selectCoupon")
                    )}
                  </Button>
                )}

                {cart.total < coupon.minimum_order_amount && (
                  <span className="text-xs text-red-500">
                    {isRTL
                      ? `حداقل ${formatCurrency(coupon.minimum_order_amount)} نیاز`
                      : `Min ${formatCurrency(coupon.minimum_order_amount)} required`
                    }
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {!showAll && state.availableCoupons.length > maxCoupons && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            onClick={() => setShowAll(true)}
            className="text-primary hover:bg-primary/10"
          >
            {isRTL
              ? `مشاهده ${formatNumber(state.availableCoupons.length - maxCoupons)} کد دیگر`
              : `Show ${state.availableCoupons.length - maxCoupons} more codes`
            }
          </Button>
        </div>
      )}
    </div>
  );
}
