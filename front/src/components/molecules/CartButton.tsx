"use client";

import React from "react";
// SVG Icon as inline component
const ShoppingBagIcon = ({ className }: { className?: string }) => (
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
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);
import { useCart } from "@/context/CartContext";
import { useLocale } from "next-intl";

interface CartButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function CartButton({
  className = "",
  variant = "default",
  size = "md",
}: CartButtonProps) {
  const { cart, toggleCart } = useCart();
  const locale = useLocale();

  const isRTL = locale === "fa";

  // Size configurations
  const sizeConfig = {
    sm: {
      button: "p-2",
      icon: "w-4 h-4",
      badge: "text-xs px-1.5 py-0.5 -top-1 -right-1",
    },
    md: {
      button: "p-2.5",
      icon: "w-5 h-5",
      badge: "text-xs px-1.5 py-0.5 -top-2 -right-2",
    },
    lg: {
      button: "p-3",
      icon: "w-6 h-6",
      badge: "text-sm px-2 py-0.5 -top-2 -right-2",
    },
  };

  // Variant configurations
  const variantConfig = {
    default: "bg-primary text-white hover:bg-primary-dark",
    outline:
      "border border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "text-gray-600 hover:text-primary hover:bg-gray-100",
  };

  const config = sizeConfig[size];
  const variantClass = variantConfig[variant];

  return (
    <button
      onClick={toggleCart}
      className={`
        relative rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${config.button}
        ${variantClass}
        ${className}
      `}
      aria-label={locale === "fa" ? "سبد خرید" : "Shopping cart"}
      title={locale === "fa" ? "سبد خرید" : "Shopping cart"}
    >
      <ShoppingBagIcon className={config.icon} />

      {/* Cart Item Count Badge */}
      {cart.itemCount > 0 && (
        <span
          className={`
            absolute rounded-full bg-accent text-white font-bold min-w-[1.25rem] h-5 flex items-center justify-center leading-none
            ${config.badge}
            ${isRTL ? "-left-2" : "-right-2"}
          `}
          style={{
            fontSize:
              size === "sm"
                ? "0.625rem"
                : size === "md"
                  ? "0.75rem"
                  : "0.875rem",
          }}
        >
          {cart.itemCount > 99 ? "99+" : cart.itemCount}
        </span>
      )}

      {/* Pulse animation for new items */}
      {cart.itemCount > 0 && (
        <span
          className={`
            absolute rounded-full bg-accent animate-ping
            ${config.badge}
            ${isRTL ? "-left-2" : "-right-2"}
          `}
          style={{
            animationDuration: "2s",
            animationIterationCount: "3",
          }}
        />
      )}
    </button>
  );
}
