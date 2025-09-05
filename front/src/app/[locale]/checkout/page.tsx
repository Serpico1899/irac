"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/currency";

// Types
interface BillingForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  special_instructions?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  icon: string;
  available: boolean;
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const isRTL = locale === "fa";
  const router = useRouter();
  const { cart, clearCart } = useCart();

  // Form state
  const [billingData, setBillingData] = useState<BillingForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Iran",
    special_instructions: "",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreesToTerms, setAgreesToTerms] = useState(false);

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "zarinpal",
      name: "زرین‌پال",
      name_en: "ZarinPal",
      description: "پرداخت آنلاین با کارت‌های بانکی",
      description_en: "Online payment with bank cards",
      icon: "💳",
      available: true,
    },
    {
      id: "bank_transfer",
      name: "انتقال بانکی",
      name_en: "Bank Transfer",
      description: "واریز مستقیم به حساب بانکی",
      description_en: "Direct bank transfer",
      icon: "🏦",
      available: true,
    },
    {
      id: "wallet",
      name: "کیف پول دیجیتال",
      name_en: "Digital Wallet",
      description: "پرداخت با کیف‌پول‌های دیجیتال",
      description_en: "Payment with digital wallets",
      icon: "📱",
      available: false,
    },
  ];

  // Redirect if cart is empty
  if (cart.items.length === 0) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <div className="mb-8">
            <svg
              className="w-24 h-24 text-gray-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M8 11V7a4 4 0 118 0v4m-4 8h.01M8 19h8a2 2 0 002-2V9a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {isRTL ? "سبد خرید شما خالی است" : "Your cart is empty"}
          </h1>
          <p className="text-gray-600 mb-8">
            {isRTL
              ? "برای ادامه خرید، دوره‌ها یا کارگاه‌های مورد نظر خود را انتخاب کنید"
              : "Please add some courses or workshops to your cart to continue"}
          </p>
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center px-6 py-3 bg-[#168c95] text-white rounded-lg font-medium hover:bg-[#147a82] transition-colors"
          >
            {isRTL ? "مشاهده دوره‌ها" : "View Courses"}
          </Link>
        </div>
      </div>
    );
  }

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setBillingData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!billingData.first_name.trim()) {
      newErrors.first_name = isRTL
        ? "نام الزامی است"
        : "First name is required";
    }

    if (!billingData.last_name.trim()) {
      newErrors.last_name = isRTL
        ? "نام خانوادگی الزامی است"
        : "Last name is required";
    }

    if (!billingData.email.trim()) {
      newErrors.email = isRTL ? "ایمیل الزامی است" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingData.email)) {
      newErrors.email = isRTL ? "فرمت ایمیل صحیح نیست" : "Invalid email format";
    }

    if (!billingData.phone.trim()) {
      newErrors.phone = isRTL
        ? "شماره تلفن الزامی است"
        : "Phone number is required";
    }

    if (!billingData.address.trim()) {
      newErrors.address = isRTL ? "آدرس الزامی است" : "Address is required";
    }

    if (!billingData.city.trim()) {
      newErrors.city = isRTL ? "شهر الزامی است" : "City is required";
    }

    if (!selectedPaymentMethod) {
      newErrors.payment_method = isRTL
        ? "روش پرداخت را انتخاب کنید"
        : "Please select a payment method";
    }

    if (!agreesToTerms) {
      newErrors.terms = isRTL
        ? "پذیرش قوانین و مقررات الزامی است"
        : "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate totals
  const subtotal = cart.total;
  const tax = Math.round(subtotal * 0.09); // 9% tax
  const total = subtotal + tax;

  // Handle order submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Simulate API call to create order
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create order object
      const order = {
        items: cart.items,
        billing: billingData,
        payment_method: selectedPaymentMethod,
        subtotal,
        tax,
        total,
        created_at: new Date().toISOString(),
      };

      console.log("Order created:", order);

      // Clear cart after successful order
      clearCart();

      // Redirect to success page
      router.push(`/${locale}/order-confirmation/12345`);
    } catch (error) {
      console.error("Order creation failed:", error);
      setErrors({
        general: isRTL ? "خطا در ثبت سفارش" : "Failed to place order",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {isRTL ? "تسویه حساب" : "Checkout"}
            </h1>
            <Link
              href={`/${locale}/courses`}
              className="text-[#168c95] hover:text-[#147a82] font-medium transition-colors"
            >
              {isRTL ? "← ادامه خرید" : "← Continue Shopping"}
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cart Review */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {isRTL ? "بررسی سفارش" : "Order Review"}
              </h2>

              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                      {item.featured_image?.url ? (
                        <Image
                          src={item.featured_image.url}
                          alt={item.featured_image.alt || item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {isRTL ? item.name : item.name_en || item.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {isRTL
                          ? item.instructor
                          : item.instructor_en || item.instructor}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-500 me-2">
                          {isRTL ? "نوع:" : "Type:"}
                        </span>
                        <span className="text-sm font-medium text-[#168c95]">
                          {isRTL
                            ? item.type === "course"
                              ? "دوره"
                              : "کارگاه"
                            : item.type === "course"
                              ? "Course"
                              : "Workshop"}
                        </span>
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="font-semibold text-gray-800">
                        {formatPrice(
                          item.discounted_price || item.price,
                          locale,
                        )}
                      </div>
                      {item.discounted_price &&
                        item.discounted_price < item.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(item.price, locale)}
                          </div>
                        )}
                      <div className="text-sm text-gray-600 mt-1">
                        {isRTL ? "تعداد:" : "Qty:"} {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {isRTL ? "اطلاعات صورتحساب" : "Billing Information"}
              </h2>

              <form className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? "نام" : "First Name"} *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={billingData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                        errors.first_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={
                        isRTL ? "نام خود را وارد کنید" : "Enter your first name"
                      }
                    />
                    {errors.first_name && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? "نام خانوادگی" : "Last Name"} *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={billingData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                        errors.last_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={
                        isRTL
                          ? "نام خانوادگی خود را وارد کنید"
                          : "Enter your last name"
                      }
                    />
                    {errors.last_name && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? "ایمیل" : "Email"} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={billingData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? "شماره تلفن" : "Phone Number"} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={billingData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={isRTL ? "۰۹۱۲۳۴۵۶۷۸۹" : "+98 912 345 6789"}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "آدرس" : "Address"} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={billingData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={
                      isRTL
                        ? "آدرس کامل خود را وارد کنید"
                        : "Enter your full address"
                    }
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* City and Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? "شهر" : "City"} *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={billingData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={
                        isRTL ? "شهر خود را وارد کنید" : "Enter your city"
                      }
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? "کد پستی" : "Postal Code"}
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={billingData.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors"
                      placeholder={isRTL ? "کد پستی" : "Postal code"}
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "توضیحات ویژه" : "Special Instructions"}
                  </label>
                  <textarea
                    name="special_instructions"
                    value={billingData.special_instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#168c95] focus:border-[#168c95] transition-colors resize-vertical"
                    placeholder={
                      isRTL
                        ? "اگر نکته خاصی دارید، اینجا بنویسید..."
                        : "Any special notes or instructions..."
                    }
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {isRTL ? "روش پرداخت" : "Payment Method"}
              </h2>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      !method.available
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : selectedPaymentMethod === method.id
                          ? "border-[#168c95] bg-[#168c95]/5"
                          : "border-gray-200 hover:border-[#168c95]/50"
                    }`}
                    onClick={() =>
                      method.available && setSelectedPaymentMethod(method.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={() =>
                            method.available &&
                            setSelectedPaymentMethod(method.id)
                          }
                          disabled={!method.available}
                          className="w-5 h-5 text-[#168c95] focus:ring-[#168c95]"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="font-medium text-gray-800">
                            {isRTL ? method.name : method.name_en}
                          </div>
                          <div className="text-sm text-gray-600">
                            {isRTL ? method.description : method.description_en}
                          </div>
                        </div>
                      </div>
                      {!method.available && (
                        <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          {isRTL ? "به زودی" : "Coming Soon"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {errors.payment_method && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.payment_method}
                </p>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {isRTL ? "خلاصه سفارش" : "Order Summary"}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "جمع کل:" : "Subtotal:"}</span>
                  <span>{formatPrice(subtotal, locale)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "مالیات (۹%):" : "Tax (9%):"}</span>
                  <span>{formatPrice(tax, locale)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-800">
                    <span>{isRTL ? "مجموع:" : "Total:"}</span>
                    <span className="text-[#168c95]">
                      {formatPrice(total, locale)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <label className="flex items-start space-x-2 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    checked={agreesToTerms}
                    onChange={(e) => setAgreesToTerms(e.target.checked)}
                    className="w-5 h-5 text-[#168c95] focus:ring-[#168c95] mt-0.5"
                  />
                  <span className="text-sm text-gray-600">
                    {isRTL ? (
                      <>
                        با{" "}
                        <Link
                          href={`/${locale}/terms`}
                          className="text-[#168c95] hover:underline"
                        >
                          قوانین و مقررات
                        </Link>{" "}
                        و{" "}
                        <Link
                          href={`/${locale}/privacy`}
                          className="text-[#168c95] hover:underline"
                        >
                          حریم خصوصی
                        </Link>{" "}
                        موافق هستم
                      </>
                    ) : (
                      <>
                        I agree to the{" "}
                        <Link
                          href={`/${locale}/terms`}
                          className="text-[#168c95] hover:underline"
                        >
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href={`/${locale}/privacy`}
                          className="text-[#168c95] hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </>
                    )}
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-600 text-sm mt-1">{errors.terms}</p>
                )}
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-[#168c95] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#147a82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {isRTL ? "در حال پردازش..." : "Processing..."}
                  </>
                ) : isRTL ? (
                  "ثبت سفارش"
                ) : (
                  "Place Order"
                )}
              </button>

              {errors.general && (
                <p className="text-red-600 text-sm mt-4 text-center">
                  {errors.general}
                </p>
              )}

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-green-600 me-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    {isRTL
                      ? "پرداخت شما با رمزنگاری SSL محافظت می‌شود"
                      : "Your payment is secured with SSL encryption"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
