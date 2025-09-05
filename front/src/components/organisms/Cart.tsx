"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/currency";
// SVG Icons as inline components
const XIcon = ({ className }: { className?: string }) => (
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
      d="M6 18L18 6M6 6l12 12"
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

const MinusIcon = ({ className }: { className?: string }) => (
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
      d="M20 12H4"
    />
  </svg>
);

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

const Trash2Icon = ({ className }: { className?: string }) => (
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
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
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
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
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
      d="M9 5l7 7-7 7"
    />
  </svg>
);
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";

interface CartProps {
  className?: string;
}

export default function Cart({ className = "" }: CartProps) {
  const { cart, removeFromCart, updateQuantity, clearCart, closeCart } =
    useCart();
  const router = useRouter();
  const locale = useLocale();
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  const isRTL = locale === "fa";

  // Handle quantity change with loading state
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setProcessingItem(itemId);
    setTimeout(() => {
      updateQuantity(itemId, newQuantity);
      setProcessingItem(null);
    }, 200);
  };

  // Handle remove item with confirmation
  const handleRemoveItem = (itemId: string) => {
    setProcessingItem(itemId);
    setTimeout(() => {
      removeFromCart(itemId);
      setProcessingItem(null);
    }, 200);
  };

  // Handle checkout navigation
  const handleCheckout = () => {
    closeCart();
    router.push(`/${locale}/checkout`);
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    closeCart();
    router.push(`/${locale}/courses`);
  };

  // Get localized content for cart item
  const getLocalizedItemContent = (item: any) => {
    return {
      name: locale === "fa" ? item.name : item.name_en || item.name,
      instructor:
        locale === "fa"
          ? item.instructor
          : item.instructor_en || item.instructor,
    };
  };

  // Get level text in local language
  const getLevelText = (level: string) => {
    if (locale === "fa") {
      switch (level) {
        case "Beginner":
          return "مقدماتی";
        case "Intermediate":
          return "متوسط";
        case "Advanced":
          return "پیشرفته";
        default:
          return level;
      }
    }
    return level;
  };

  if (!cart.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${className}`}
        style={{
          transform: cart.isOpen
            ? "translateX(0)"
            : `translateX(${isRTL ? "100%" : "-100%"})`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <ShoppingBagIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">
              {locale === "fa" ? "سبد خرید" : "Shopping Cart"}
            </h2>
            {cart.itemCount > 0 && (
              <span className="bg-primary text-white text-sm px-2 py-1 rounded-full">
                {cart.itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            /* Empty Cart State */
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingBagIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {locale === "fa" ? "سبد خرید خالی است" : "Your cart is empty"}
              </h3>
              <p className="text-gray-500 mb-6">
                {locale === "fa"
                  ? "دوره‌ها و کارگاه‌های مورد علاقه خود را اضافه کنید"
                  : "Add your favorite courses and workshops"}
              </p>
              <button
                onClick={handleContinueShopping}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
              >
                {locale === "fa" ? "مشاهده دوره‌ها" : "Browse Courses"}
              </button>
            </div>
          ) : (
            /* Cart Items */
            <div className="p-4 space-y-4">
              {cart.items.map((item) => {
                const { name, instructor } = getLocalizedItemContent(item);
                const isProcessing = processingItem === item.id;
                const currentPrice = item.discounted_price ?? item.price;

                return (
                  <div
                    key={item.id}
                    className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
                      isProcessing ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <div className="flex space-x-4 rtl:space-x-reverse">
                      {/* Course Image */}
                      <div className="flex-shrink-0">
                        {item.featured_image?.url ? (
                          <Image
                            src={item.featured_image.url}
                            alt={item.featured_image.alt || name}
                            width={80}
                            height={60}
                            className="w-20 h-15 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                          {name}
                        </h4>

                        {instructor && (
                          <p className="text-xs text-gray-500 mb-1">
                            {locale === "fa" ? "مدرس: " : "Instructor: "}
                            {instructor}
                          </p>
                        )}

                        {item.level && (
                          <p className="text-xs text-primary mb-2">
                            {getLevelText(item.level)}
                          </p>
                        )}

                        {/* Price */}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                          {item.discounted_price &&
                          item.discounted_price < item.price ? (
                            <>
                              <span className="font-bold text-primary">
                                {formatPrice(item.discounted_price, locale)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(item.price, locale)}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-primary">
                              {formatPrice(item.price, locale)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={isProcessing || item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="font-semibold text-lg min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              disabled={isProcessing}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isProcessing}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              locale === "fa"
                                ? "حذف از سبد"
                                : "Remove from cart"
                            }
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              {locale === "fa" ? "پاک کردن سبد خرید" : "Clear cart"}
            </button>

            {/* Total */}
            <div className="flex items-center justify-between text-lg font-bold">
              <span>{locale === "fa" ? "مجموع:" : "Total:"}</span>
              <span className="text-primary">
                {formatPrice(cart.total, locale)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <span>
                  {locale === "fa" ? "ادامه خرید" : "Proceed to Checkout"}
                </span>
                {isRTL ? (
                  <ArrowLeftIcon className="w-5 h-5" />
                ) : (
                  <ArrowRightIcon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={handleContinueShopping}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {locale === "fa" ? "ادامه خرید" : "Continue Shopping"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
