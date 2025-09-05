"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { manualPaymentApi } from "@/services/payment/manualPaymentApi";
import {
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import type { CreateManualPaymentRequest } from "@/types";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface CreateManualPaymentProps {
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
  preFilledUserId?: string;
  preFilledWorkshopId?: string;
  preFilledProductId?: string;
  preFilledOrderId?: string;
}

const CreateManualPayment: React.FC<CreateManualPaymentProps> = ({
  onSuccess,
  onCancel,
  preFilledUserId = "",
  preFilledWorkshopId = "",
  preFilledProductId = "",
  preFilledOrderId = "",
}) => {
  const t = useTranslations("admin");
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    user_id: preFilledUserId,
    title: "",
    description: "",
    amount: "",
    payment_deadline: "",
    payment_instructions: "",
    related_workshop_id: preFilledWorkshopId,
    related_product_id: preFilledProductId,
    related_order_id: preFilledOrderId,
  });

  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock users for demonstration
  const mockUsers: User[] = [
    {
      id: "user_1",
      name: "علی احمدی",
      email: "ali@example.com",
      phone: "+989123456789",
      avatar: "/images/avatars/user1.jpg",
    },
    {
      id: "user_2",
      name: "مریم کریمی",
      email: "maryam@example.com",
      phone: "+989987654321",
    },
    {
      id: "user_3",
      name: "حسن رضایی",
      email: "hassan@example.com",
      phone: "+989112233445",
    },
  ];

  // Search users
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Mock search - in real app, this would call an API
      const filtered = mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.phone?.includes(query) ||
          user.id.toLowerCase().includes(query.toLowerCase()),
      );

      setSearchResults(filtered);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle user search input
  useEffect(() => {
    if (userSearch) {
      searchUsers(userSearch);
    } else {
      setSearchResults([]);
    }
  }, [userSearch]);

  // Load selected user if pre-filled
  useEffect(() => {
    if (preFilledUserId) {
      const user = mockUsers.find((u) => u.id === preFilledUserId);
      if (user) {
        setSelectedUser(user);
        setFormData((prev) => ({ ...prev, user_id: user.id }));
      }
    }
  }, [preFilledUserId]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_id) {
      newErrors.user_id = "انتخاب کاربر الزامی است";
    }

    if (!formData.title.trim()) {
      newErrors.title = "عنوان درخواست الزامی است";
    }

    if (!formData.description.trim()) {
      newErrors.description = "توضیحات الزامی است";
    }

    if (!formData.amount || parseFloat(formData.amount.replace(/,/g, "")) <= 0) {
      newErrors.amount = "مبلغ معتبر وارد کنید";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format currency input
  const handleAmountChange = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");

    // Format with commas
    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    setFormData((prev) => ({ ...prev, amount: formatted }));

    // Clear amount error when user starts typing
    if (errors.amount && digits) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  // Handle user selection
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, user_id: user.id }));
    setShowUserSearch(false);
    setUserSearch("");
    setSearchResults([]);

    // Clear user error
    if (errors.user_id) {
      setErrors((prev) => ({ ...prev, user_id: "" }));
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const request: CreateManualPaymentRequest = {
        user_id: formData.user_id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount.replace(/,/g, "")),
        payment_deadline: formData.payment_deadline || undefined,
        payment_instructions: formData.payment_instructions.trim() || undefined,
        related_workshop_id: formData.related_workshop_id || undefined,
        related_product_id: formData.related_product_id || undefined,
        related_order_id: formData.related_order_id || undefined,
      };

      const response = await manualPaymentApi.createPayment(request);

      if (response.success && response.data) {
        setSuccess("درخواست پرداخت با موفقیت ایجاد شد");

        // Reset form
        setFormData({
          user_id: "",
          title: "",
          description: "",
          amount: "",
          payment_deadline: "",
          payment_instructions: "",
          related_workshop_id: "",
          related_product_id: "",
          related_order_id: "",
        });
        setSelectedUser(null);

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data._id);
        }
      } else {
        setError(response.error || "خطا در ایجاد درخواست پرداخت");
      }
    } catch (err) {
      setError("خطا در اتصال به سرور");
      console.error("Error creating payment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">برای مشاهده این صفحه باید وارد شوید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ایجاد درخواست پرداخت دستی
          </h1>
          <p className="text-gray-600 mt-1">
            درخواست پرداخت جدید برای کاربران ایجاد کنید
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              انتخاب کاربر *
            </label>

            {selectedUser ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    {selectedUser.phone && (
                      <p className="text-xs text-gray-500">{selectedUser.phone}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setFormData((prev) => ({ ...prev, user_id: "" }));
                    setShowUserSearch(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  تغییر
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowUserSearch(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  انتخاب کاربر
                </button>

                {showUserSearch && (
                  <div className="mt-3 space-y-3">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="نام، ایمیل، تلفن یا شناسه کاربر"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>

                    {isSearching && (
                      <div className="flex items-center justify-center py-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          در حال جستجو...
                        </div>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                          >
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {user.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {userSearch && searchResults.length === 0 && !isSearching && (
                      <div className="text-center py-3 text-gray-500">
                        کاربری یافت نشد
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserSearch(false);
                        setUserSearch("");
                        setSearchResults([]);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      لغو
                    </button>
                  </div>
                )}
              </>
            )}

            {errors.user_id && (
              <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان درخواست *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="مثال: پرداخت ثبت نام کارگاه روانشناسی"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="توضیح کاملی از درخواست پرداخت ارائه دهید"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مبلغ (ریال) *
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="1,000,000"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? "border-red-300" : "border-gray-300"
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Payment Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مهلت پرداخت
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="datetime-local"
                value={formData.payment_deadline}
                onChange={(e) =>
                  handleInputChange("payment_deadline", e.target.value)
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              اختیاری - تاریخ و زمان انقضای درخواست
            </p>
          </div>

          {/* Payment Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              راهنمای پرداخت
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={formData.payment_instructions}
                onChange={(e) =>
                  handleInputChange("payment_instructions", e.target.value)
                }
                placeholder="مثال: لطفاً مبلغ را به حساب شماره ۱۲۳۴۵۶۷۸۹۰ واریز کرده و فیش واریزی را ارسال کنید"
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              اختیاری - راهنمایی برای کاربر جهت انجام پرداخت
            </p>
          </div>

          {/* Related Items */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ارتباط با موارد دیگر (اختیاری)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Related Workshop */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شناسه کارگاه
                </label>
                <div className="relative">
                  <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.related_workshop_id}
                    onChange={(e) =>
                      handleInputChange("related_workshop_id", e.target.value)
                    }
                    placeholder="workshop_123"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Related Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شناسه محصول
                </label>
                <div className="relative">
                  <ShoppingBagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.related_product_id}
                    onChange={(e) =>
                      handleInputChange("related_product_id", e.target.value)
                    }
                    placeholder="product_123"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Related Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شناسه سفارش
                </label>
                <div className="relative">
                  <ClipboardDocumentListIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.related_order_id}
                    onChange={(e) =>
                      handleInputChange("related_order_id", e.target.value)
                    }
                    placeholder="order_123"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <PlusIcon className="h-5 w-5" />
            )}
            ایجاد درخواست پرداخت
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
              لغو
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateManualPayment;
