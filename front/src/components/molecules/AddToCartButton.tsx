"use client";

import React, { useState } from "react";
// SVG Icons as inline components
const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);
import { useCart } from "@/context/CartContext";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

interface CourseData {
  _id: string;
  name: string;
  name_en?: string;
  slug: string;
  price: number;
  original_price?: number;
  discounted_price?: number;
  is_free?: boolean;
  featured_image?: {
    url: string;
    alt?: string;
  };
  instructor?: {
    details?: {
      name?: string;
      name_en?: string;
      first_name?: string;
      last_name?: string;
    };
    name?: string;
    name_en?: string;
  };
  duration_hours?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
  type: "Course" | "Workshop" | "Bootcamp" | "Seminar";
}

interface AddToCartButtonProps {
  course: CourseData;
  variant?: "default" | "outline" | "ghost" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  onSuccess?: () => void;
  onFreeEnroll?: () => void;
}

export default function AddToCartButton({
  course,
  variant = "default",
  size = "md",
  className = "",
  showIcon = true,
  showText = true,
  onSuccess,
  onFreeEnroll,
}: AddToCartButtonProps) {
  const { cart, addToCart } = useCart();
  const locale = useLocale();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isRTL = locale === "fa";
  const isInCart = cart.items.some((item) => item.id === course._id);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: "px-3 py-2 text-sm",
      icon: "w-4 h-4",
      spacing: isRTL ? "ml-2" : "mr-2",
    },
    md: {
      button: "px-4 py-2.5 text-base",
      icon: "w-5 h-5",
      spacing: isRTL ? "ml-2" : "mr-2",
    },
    lg: {
      button: "px-6 py-3 text-lg",
      icon: "w-6 h-6",
      spacing: isRTL ? "ml-3" : "mr-3",
    },
  };

  // Variant configurations
  const variantConfig = {
    default:
      "bg-primary text-white hover:bg-primary-dark border border-primary",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white bg-transparent",
    ghost:
      "text-primary hover:bg-primary/10 hover:text-primary-dark border border-transparent",
    minimal:
      "text-primary hover:text-primary-dark underline-offset-4 hover:underline bg-transparent border-none p-2",
  };

  const config = sizeConfig[size];
  const variantClass = variantConfig[variant];

  // Handle free course enrollment
  const handleFreeEnroll = () => {
    if (onFreeEnroll) {
      onFreeEnroll();
    } else {
      router.push(
        `/${locale}/login?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`,
      );
    }
  };

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (isAdding || isInCart) return;

    setIsAdding(true);

    try {
      // Get instructor name
      const instructor =
        course.instructor?.details?.name ||
        course.instructor?.name ||
        (course.instructor?.details?.first_name &&
        course.instructor?.details?.last_name
          ? `${course.instructor.details.first_name} ${course.instructor.details.last_name}`
          : "Unknown");

      const instructorEn =
        course.instructor?.details?.name_en ||
        course.instructor?.name_en ||
        instructor;

      // Add to cart
      addToCart({
        id: course._id,
        type: course.type === "Course" ? "course" : "workshop",
        name: course.name,
        name_en: course.name_en,
        slug: course.slug,
        price: course.price,
        discounted_price:
          course.discounted_price ||
          (course.original_price && course.original_price > course.price
            ? course.price
            : undefined),
        featured_image: course.featured_image,
        instructor: instructor,
        instructor_en: instructorEn,
        duration: course.duration_hours,
        level: course.level,
      });

      // Show success state
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Get button text
  const getButtonText = () => {
    if (course.is_free) {
      return locale === "fa" ? "ثبت‌نام رایگان" : "Enroll Free";
    }

    if (justAdded) {
      return locale === "fa" ? "اضافه شد!" : "Added!";
    }

    if (isInCart) {
      return locale === "fa" ? "در سبد خرید" : "In Cart";
    }

    if (isAdding) {
      return locale === "fa" ? "در حال افزودن..." : "Adding...";
    }

    if (variant === "minimal") {
      return locale === "fa" ? "افزودن" : "Add";
    }

    return locale === "fa" ? "افزودن به سبد" : "Add to Cart";
  };

  // Get button icon
  const getButtonIcon = () => {
    if (justAdded) {
      return <CheckIcon className={config.icon} />;
    }

    if (isInCart) {
      return <CheckIcon className={config.icon} />;
    }

    if (course.is_free) {
      return <PlusIcon className={config.icon} />;
    }

    return <ShoppingCartIcon className={config.icon} />;
  };

  // Handle button click
  const handleClick = () => {
    if (course.is_free) {
      handleFreeEnroll();
    } else {
      handleAddToCart();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isAdding || (isInCart && !course.is_free)}
      className={`
        inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed
        ${config.button}
        ${variantClass}
        ${isInCart && !course.is_free ? "bg-green-100 text-green-700 border-green-200" : ""}
        ${justAdded ? "bg-green-500 text-white border-green-500" : ""}
        ${className}
      `}
      title={getButtonText()}
    >
      {showIcon && (
        <span className={showText ? config.spacing : ""}>
          {getButtonIcon()}
        </span>
      )}

      {showText && (
        <span className={`${isAdding ? "opacity-75" : ""} whitespace-nowrap`}>
          {getButtonText()}
        </span>
      )}

      {/* Loading spinner overlay */}
      {isAdding && (
        <span
          className={`animate-spin ${showIcon && showText ? config.spacing : ""}`}
        >
          <svg className={config.icon} fill="none" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8v8H4z"
              className="opacity-75"
            />
          </svg>
        </span>
      )}
    </button>
  );
}
