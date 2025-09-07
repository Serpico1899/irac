"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { zarinpalApi } from "@/services/payment/zarinpal/zarinpalApi";
import {
  CreditCardIcon,
  WalletIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

interface DepositFormData {
  amount: string;
  mobile: string;
  email: string;
  description: string;
}

interface FormErrors {
  amount?: string;
  mobile?: string;
  email?: string;
  description?: string;
  general?: string;
}

const WalletDeposit: React.FC = () => {
  const t = useTranslations("wallet");
  const { user } = useAuth();
  const { balance, refreshWallet } = useWallet();

  // Form state
  const [formData, setFormData] = useState<DepositFormData>({
    amount: "",
    mobile: "",
    email: "",
    description: "شارژ کیف پول",
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        mobile: user.mobile || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (field: keyof DepositFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Format amount input (add thousand separators)
  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except for Persian/Arabic digits
    const cleaned = value.replace(/[^\d۰-۹]/g, "");

    // Convert Persian/Arabic digits to English
    const englishDigits = cleaned.replace(/[۰-۹]/g, (match) => {
      const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
      return persianDigits.indexOf(match).toString();
    });

    // Format with thousand separators for display
    const formatted = parseInt(englishDigits || "0").toLocaleString("fa-IR");

    handleInputChange("amount", englishDigits);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Amount validation
    const amount = parseInt(formData.amount);
    if (!formData.amount.trim()) {
      newErrors.amount = "مبلغ الزامی است";
    } else if (isNaN(amount)) {
      newErrors.amount = "مبلغ وارد شده معتبر نیست";
    } else if (amount < zarinpalApi.getMinimumAmount()) {
      newErrors.amount = `حداقل مبلغ قابل شارژ ${zarinpalApi.formatAmount(zarinpalApi.getMinimumAmount())} است`;
    } else if (amount > 50000000) {
      newErrors.amount = "حداکثر مبلغ قابل شارژ 5,000,000 تومان است";
    }

    // Mobile validation (optional)
    if (formData.mobile.trim() && !zarinpalApi.validateMobile(formData.mobile)) {
      newErrors.mobile = "شماره موبایل وارد شده معتبر نیست";
    }

    // Email validation (optional)
    if (formData.email.trim() && !zarinpalApi.validateEmail(formData.email)) {
      newErrors.email = "آدرس ایمیل وارد شده معتبر نیست";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "توضیحات الزامی است";
    } else if (formData.description.length < 3) {
      newErrors.description = "توضیحات باید حداقل 3 کاراکتر باشد";
    } else if (formData.description.length > 255) {
      newErrors.description = "توضیحات نباید بیشتر از 255 کاراکتر باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const amount = parseInt(formData.amount);

      // Store payment data for callback recovery
      zarinpalApi.storePaymentData({
        authority: "", // Will be filled by API
        amount,
        description: formData.description,
        timestamp: new Date().toISOString(),
      });

      // Create payment metadata
      const metadata = zarinpalApi.createPaymentMetadata({
        purpose: "wallet_deposit",
        user_id: user?._id,
      });

      // Create ZarinPal payment request
      const paymentResult = await zarinpalApi.createPayment({
        amount,
        description: formData.description,
        mobile: formData.mobile.trim() || undefined,
        email: formData.email.trim() || undefined,
        metadata,
      });

      if (!paymentResult.success) {
        setErrors({
          general: paymentResult.message,
        });
        setIsLoading(false);
        return;
      }

      // Redirect to ZarinPal payment page
      zarinpalApi.redirectToPayment(paymentResult.data.payment_url);

    } catch (error) {
      console.error("Deposit submission error:", error);
      setErrors({
        general: "خطا در ایجاد درخواست پرداخت. لطفاً مجدد تلاش کنید.",
      });
      setIsLoading(false);
    }
  };

  // Quick amount buttons
  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  const handleQuickAmount = (amount: number) => {
    handleInputChange("amount", amount.toString());
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg p-2">
            <CreditCardIcon className="h-6 w-6 text-white" />
          </div>
          <div className="text-white">
            <h2 className="text-lg font-semibold">شارژ کیف پول</h2>
            <p className="text-blue-100 text-sm">
              از طریق درگاه امن زرین‌پال
            </p>
          </div>
        </div>
      </div>

      {/* Current Balance */}
      <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-600">موجودی فعلی:</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {zarinpalApi.formatAmount(balance)}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <BanknotesIcon className="h-4 w-4 inline-block ml-1" />
            مبلغ شارژ (تومان) *
          </label>

          <div className="relative">
            <input
              type="text"
              value={formData.amount ? parseInt(formData.amount).toLocaleString("fa-IR") : ""}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="مبلغ مورد نظر را وارد کنید"
              className={`w-full px-4 py-3 border rounded-lg text-right placeholder-gray-400 transition-colors ${
                errors.amount
                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              disabled={isLoading}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <span className="text-gray-500 text-sm">تومان</span>
            </div>
          </div>

          {errors.amount && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <ExclamationTriangleIcon className="h-4 w-4" />
              {errors.amount}
            </p>
          )}

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickAmount(amount)}
                className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                disabled={isLoading}
              >
                {zarinpalApi.formatAmount(amount)}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <ChatBubbleLeftRightIcon className="h-4 w-4 inline-block ml-1" />
            توضیحات *
          </label>

          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="توضیحاتی درباره این پرداخت..."
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg placeholder-gray-400 resize-none transition-colors ${
              errors.description
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            disabled={isLoading}
          />

          {errors.description && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <ExclamationTriangleIcon className="h-4 w-4" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Advanced Options Toggle */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            disabled={isLoading}
          >
            <InformationCircleIcon className="h-4 w-4" />
            {showAdvancedOptions ? "پنهان کردن" : "نمایش"} تنظیمات پیشرفته
          </button>

          {showAdvancedOptions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <DevicePhoneMobileIcon className="h-4 w-4 inline-block ml-1" />
                  شماره موبایل
                </label>

                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  placeholder="09123456789"
                  className={`w-full px-4 py-3 border rounded-lg text-left placeholder-gray-400 transition-colors ${
                    errors.mobile
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  disabled={isLoading}
                />

                {errors.mobile && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.mobile}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <EnvelopeIcon className="h-4 w-4 inline-block ml-1" />
                  آدرس ایمیل
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 border rounded-lg text-left placeholder-gray-400 transition-colors ${
                    errors.email
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  disabled={isLoading}
                />

                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                پس از کلیک بر روی دکمه پرداخت، به درگاه امن زرین‌پال منتقل می‌شوید.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>حداقل مبلغ شارژ: {zarinpalApi.formatAmount(zarinpalApi.getMinimumAmount())}</li>
                <li>حداکثر مبلغ شارژ: ۵,۰۰۰,۰۰۰ تومان</li>
                <li>امکان پرداخت با تمام کارت‌های بانکی</li>
                <li>پس از پرداخت موفق، مبلغ فوراً به کیف پول شما اضافه می‌شود</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading || !formData.amount || !formData.description}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                در حال انتقال به درگاه...
              </>
            ) : (
              <>
                <CreditCardIcon className="h-5 w-5" />
                پرداخت امن از طریق زرین‌پال
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            با کلیک بر روی دکمه پرداخت،
            <a href="/terms" className="text-blue-600 hover:text-blue-700 mx-1">
              قوانین و مقررات
            </a>
            را می‌پذیرید
          </p>
        </div>
      </form>
    </div>
  );
};

export default WalletDeposit;
