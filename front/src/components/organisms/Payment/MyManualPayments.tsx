"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { manualPaymentApi } from "@/services/payment/manualPaymentApi";
import {
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ClockIcon as ClockIconSolid,
} from "@heroicons/react/24/solid";
import type {
  ManualPayment,
  ManualPaymentStatus,
  ManualPaymentQuery,
} from "@/types";

interface FilterState {
  status: ManualPaymentStatus | "all";
  dateFrom: string;
  dateTo: string;
  search: string;
  amountMin: string;
  amountMax: string;
}

const MyManualPayments: React.FC = () => {
  const t = useTranslations("payment");
  const { user, isAuthenticated } = useAuth();

  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [uploadingPaymentId, setUploadingPaymentId] = useState<string>("");

  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
    amountMin: "",
    amountMax: "",
  });

  // Load manual payments on component mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadPayments();
    }
  }, [isAuthenticated, user?.id]);

  // Reload when filters change
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadPayments();
    }
  }, [filters]);

  const loadPayments = async () => {
    setIsLoading(true);
    setError("");

    try {
      const query: ManualPaymentQuery = {
        user_id: user?.id,
        page: 1,
        limit: 50,
      };

      // Apply filters
      if (filters.status !== "all") {
        query.status = filters.status;
      }

      if (filters.dateFrom) {
        query.date_from = filters.dateFrom;
      }

      if (filters.dateTo) {
        query.date_to = filters.dateTo;
      }

      if (filters.amountMin) {
        query.amount_min = parseInt(filters.amountMin);
      }

      if (filters.amountMax) {
        query.amount_max = parseInt(filters.amountMax);
      }

      const response = await manualPaymentApi.getManualPayments(query);

      if (response.success && response.data) {
        let filteredPayments = response.data.payments;

        // Apply search filter (client-side)
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredPayments = filteredPayments.filter(
            (payment) =>
              payment.title.toLowerCase().includes(searchTerm) ||
              payment.description.toLowerCase().includes(searchTerm) ||
              payment._id.toLowerCase().includes(searchTerm),
          );
        }

        setPayments(filteredPayments);
      } else {
        setError(response.error || "خطا در بارگذاری پرداخت‌ها");
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      setError("خطا در بارگذاری پرداخت‌ها");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: ManualPaymentStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "در انتظار بررسی",
          color: "text-yellow-700",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          icon: ClockIconSolid,
        };
      case "approved":
        return {
          label: "تأیید شده",
          color: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: CheckCircleIconSolid,
        };
      case "rejected":
        return {
          label: "رد شده",
          color: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: XCircleIconSolid,
        };
      case "cancelled":
        return {
          label: "لغو شده",
          color: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          icon: XCircleIcon,
        };
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("fa-IR"),
      time: date.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString("fa-IR");
  };

  const handleProofUpload = async (
    paymentId: string,
    file: File,
    notes?: string,
  ) => {
    setUploadingPaymentId(paymentId);
    setError("");

    try {
      const response = await manualPaymentApi.uploadProofOfPayment(
        paymentId,
        file,
        notes,
      );

      if (response.success) {
        // Reload payments to show updated status
        await loadPayments();
      } else {
        setError(response.error || "خطا در آپلود فیش پرداخت");
      }
    } catch (error) {
      console.error("Error uploading proof:", error);
      setError("خطا در آپلود فیش پرداخت");
    } finally {
      setUploadingPaymentId("");
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      dateFrom: "",
      dateTo: "",
      search: "",
      amountMin: "",
      amountMax: "",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">برای مشاهده پرداخت‌ها وارد شوید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            پرداخت‌های دستی
          </h1>
          <p className="text-gray-600 mt-1">
            مدیریت درخواست‌های پرداخت دستی شما
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-4 w-4" />
            <span className="text-sm">فیلترها</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                جستجو
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجو در عنوان، توضیحات یا شناسه..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وضعیت
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as ManualPaymentStatus | "all",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار بررسی</option>
                <option value="approved">تأیید شده</option>
                <option value="rejected">رد شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                از تاریخ
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تا تاریخ
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداقل مبلغ (تومان)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.amountMin}
                onChange={(e) =>
                  setFilters({ ...filters, amountMin: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر مبلغ (تومان)
              </label>
              <input
                type="number"
                placeholder="بدون محدودیت"
                value={filters.amountMax}
                onChange={(e) =>
                  setFilters({ ...filters, amountMax: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              پاک کردن فیلترها
            </button>
            <div className="text-sm text-gray-600">
              {payments.length} نتیجه یافت شد
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-16 bg-gray-200 rounded"></div>
                <div className="w-full h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payments List */}
      {!isLoading && payments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            پرداختی یافت نشد
          </h3>
          <p className="text-gray-600">
            در حال حاضر درخواست پرداخت دستی ندارید
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {payments.map((payment) => {
            const statusConfig = getStatusConfig(payment.status);
            const { date, time } = formatDateTime(payment.created_at);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={payment._id}
                className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${statusConfig.bgColor}`}
                      >
                        <StatusIcon
                          className={`h-5 w-5 ${statusConfig.color}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {payment.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          شناسه: {payment._id}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {date}
                      </p>
                      <p className="text-sm text-gray-600">{time}</p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-start gap-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatAmount(payment.amount)} تومان
                      </p>
                      <p className="text-sm text-gray-600">مبلغ پرداخت</p>
                    </div>
                  </div>

                  {/* Deadline */}
                  {payment.payment_deadline && (
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDateTime(payment.payment_deadline).date}
                        </p>
                        <p className="text-sm text-gray-600">مهلت پرداخت</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700">{payment.description}</p>
                </div>

                {/* Payment Instructions */}
                {payment.payment_instructions && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <DocumentTextIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          راهنمای پرداخت:
                        </p>
                        <p className="text-sm text-blue-800">
                          {payment.payment_instructions}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Proof of Payment */}
                {payment.proof_of_payment ? (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          فیش پرداخت ارسال شده
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            payment.proof_of_payment!.file_url,
                            "_blank",
                          )
                        }
                        className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        مشاهده
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      ارسال شده در{" "}
                      {
                        formatDateTime(payment.proof_of_payment!.uploaded_at)
                          .date
                      }
                    </p>
                  </div>
                ) : payment.status === "pending" ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      آپلود فیش پرداخت
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleProofUpload(payment._id, file);
                          }
                        }}
                        disabled={uploadingPaymentId === payment._id}
                        className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                      />
                      {uploadingPaymentId === payment._id && (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      فرمت‌های مجاز: JPG, PNG, PDF - حداکثر 5MB
                    </p>
                  </div>
                ) : null}

                {/* Admin/User Notes */}
                {payment.admin_notes && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      یادداشت مدیر:
                    </p>
                    <p className="text-sm text-gray-700">
                      {payment.admin_notes}
                    </p>
                  </div>
                )}

                {payment.user_notes && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      یادداشت شما:
                    </p>
                    <p className="text-sm text-blue-800">
                      {payment.user_notes}
                    </p>
                  </div>
                )}

                {/* Rejection Reason */}
                {payment.status === "rejected" && payment.rejection_reason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-1">
                      دلیل رد درخواست:
                    </p>
                    <p className="text-sm text-red-800">
                      {payment.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyManualPayments;
