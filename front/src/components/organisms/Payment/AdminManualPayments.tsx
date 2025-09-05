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
  PlusIcon,
  EyeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
} from "@heroicons/react/24/solid";
import type {
  ManualPayment,
  ManualPaymentStatus,
  ManualPaymentQuery,
  ManualPaymentHistoryResponse,
} from "@/types";

interface FilterState {
  status: ManualPaymentStatus | "all";
  dateFrom: string;
  dateTo: string;
  search: string;
  amountMin: string;
  amountMax: string;
  userId: string;
}

interface AdminManualPaymentsProps {
  onCreatePayment?: () => void;
}

const AdminManualPayments: React.FC<AdminManualPaymentsProps> = ({
  onCreatePayment,
}) => {
  const t = useTranslations("admin");
  const { user, isAuthenticated } = useAuth();

  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [statistics, setStatistics] = useState({
    total_count: 0,
    total_amount: 0,
    status_counts: {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actioningPaymentId, setActioningPaymentId] = useState<string>("");

  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
    amountMin: "",
    amountMax: "",
    userId: "",
  });

  // Load payments
  const loadPayments = async (page = 1) => {
    try {
      setIsLoading(true);
      setError("");

      const query: ManualPaymentQuery = {
        page,
        limit: 10,
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
        query.amount_min = parseFloat(filters.amountMin.replace(/,/g, ""));
      }
      if (filters.amountMax) {
        query.amount_max = parseFloat(filters.amountMax.replace(/,/g, ""));
      }
      if (filters.userId) {
        query.user_id = filters.userId;
      }

      const response = await manualPaymentApi.getPaymentHistory(query);

      if (response.success && response.data) {
        setPayments(response.data.payments);
        setStatistics({
          total_count: response.data.total_count,
          total_amount: response.data.total_amount,
          status_counts: response.data.status_counts,
        });
        setCurrentPage(response.data.page);
        setTotalPages(response.data.total_pages);

        // Apply search filter locally
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const filtered = response.data.payments.filter(
            (payment) =>
              payment.title.toLowerCase().includes(searchTerm) ||
              payment.description.toLowerCase().includes(searchTerm) ||
              payment._id.toLowerCase().includes(searchTerm) ||
              payment.user_id.toLowerCase().includes(searchTerm),
          );
          setPayments(filtered);
        }
      } else {
        setError(response.error || "خطا در بارگیری پرداخت‌ها");
      }
    } catch (err) {
      setError("خطا در اتصال به سرور");
      console.error("Error loading payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPayments();
    }
  }, [isAuthenticated, user, filters]);

  // Format date and time
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("fa-IR");
  };

  // Get status configuration
  const getStatusConfig = (status: ManualPaymentStatus) => {
    const configs = {
      pending: {
        label: "در انتظار",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: ClockIconSolid,
        iconColor: "text-yellow-600",
      },
      approved: {
        label: "تأیید شده",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircleIconSolid,
        iconColor: "text-green-600",
      },
      rejected: {
        label: "رد شده",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircleIconSolid,
        iconColor: "text-red-600",
      },
      cancelled: {
        label: "لغو شده",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: ExclamationTriangleIconSolid,
        iconColor: "text-gray-600",
      },
    };
    return configs[status];
  };

  // Handle payment approval
  const handleApprovePayment = async (paymentId: string, notes?: string) => {
    setActioningPaymentId(paymentId);
    setError("");

    try {
      const response = await manualPaymentApi.updatePayment(paymentId, {
        status: "approved",
        admin_notes: notes,
      });

      if (response.success) {
        await loadPayments(currentPage);
      } else {
        setError(response.error || "خطا در تأیید پرداخت");
      }
    } catch (err) {
      setError("خطا در اتصال به سرور");
      console.error("Error approving payment:", err);
    } finally {
      setActioningPaymentId("");
    }
  };

  // Handle payment rejection
  const handleRejectPayment = async (
    paymentId: string,
    reason: string,
    notes?: string,
  ) => {
    setActioningPaymentId(paymentId);
    setError("");

    try {
      const response = await manualPaymentApi.updatePayment(paymentId, {
        status: "rejected",
        rejection_reason: reason,
        admin_notes: notes,
      });

      if (response.success) {
        await loadPayments(currentPage);
      } else {
        setError(response.error || "خطا در رد پرداخت");
      }
    } catch (err) {
      setError("خطا در اتصال به سرور");
      console.error("Error rejecting payment:", err);
    } finally {
      setActioningPaymentId("");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: "all",
      dateFrom: "",
      dateTo: "",
      search: "",
      amountMin: "",
      amountMax: "",
      userId: "",
    });
    setCurrentPage(1);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            مدیریت پرداخت‌های دستی
          </h1>
          <p className="text-gray-600 mt-1">
            مدیریت و بررسی درخواست‌های پرداخت کاربران
          </p>
        </div>

        <button
          onClick={onCreatePayment}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          ایجاد درخواست پرداخت
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل درخواست‌ها</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.total_count}
              </p>
            </div>
            <CreditCardIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">در انتظار</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statistics.status_counts.pending}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">تأیید شده</p>
              <p className="text-2xl font-bold text-green-600">
                {statistics.status_counts.approved}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل مبلغ</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(statistics.total_amount)} ریال
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <FunnelIcon className="h-5 w-5" />
            فیلترها
            <span
              className={`transform transition-transform ${
                isFiltersOpen ? "rotate-180" : ""
              }`}
            >
              ⌄
            </span>
          </button>
        </div>

        {isFiltersOpen && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  جستجو
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, search: e.target.value }))
                    }
                    placeholder="عنوان، شناسه یا کاربر"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  وضعیت
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.value as ManualPaymentStatus | "all",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">همه</option>
                  <option value="pending">در انتظار</option>
                  <option value="approved">تأیید شده</option>
                  <option value="rejected">رد شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
              </div>

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  شناسه کاربر
                </label>
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, userId: e.target.value }))
                  }
                  placeholder="user_123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  از تاریخ
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تا تاریخ
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Amount Range */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  محدوده مبلغ (ریال)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={filters.amountMin}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        amountMin: e.target.value,
                      }))
                    }
                    placeholder="حداقل"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={filters.amountMax}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        amountMax: e.target.value,
                      }))
                    }
                    placeholder="حداکثر"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => loadPayments(1)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                اعمال فیلتر
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                پاک کردن
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Payments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            در حال بارگیری پرداخت‌ها...
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">هیچ پرداختی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const statusConfig = getStatusConfig(payment.status);
            const { date, time } = formatDateTime(payment.created_at);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={payment._id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {payment.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            کاربر: {payment.user_id}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {date} - {time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                    >
                      <StatusIcon className={`h-3 w-3 ${statusConfig.iconColor}`} />
                      {statusConfig.label}
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(payment.amount)} ریال
                      </p>
                      {payment.payment_deadline && (
                        <p className="text-xs text-red-600">
                          مهلت:{" "}
                          {formatDateTime(payment.payment_deadline).date}
                        </p>
                      )}
                    </div>
                  </div>
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
                {payment.proof_of_payment && (
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
                        <EyeIcon className="h-4 w-4" />
                        مشاهده فیش
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      ارسال شده در{" "}
                      {
                        formatDateTime(payment.proof_of_payment.uploaded_at)
                          .date
                      }
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
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

                {/* Action Buttons */}
                {payment.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() =>
                        handleApprovePayment(
                          payment._id,
                          "پرداخت توسط مدیر تأیید شد",
                        )
                      }
                      disabled={actioningPaymentId === payment._id}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {actioningPaymentId === payment._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                      تأیید پرداخت
                    </button>

                    <button
                      onClick={() =>
                        handleRejectPayment(
                          payment._id,
                          "اطلاعات پرداخت نادرست است",
                          "پرداخت توسط مدیر رد شد",
                        )
                      }
                      disabled={actioningPaymentId === payment._id}
                      className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {actioningPaymentId === payment._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <XCircleIcon className="h-4 w-4" />
                      )}
                      رد پرداخت
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            صفحه {currentPage} از {totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                  loadPayments(currentPage - 1);
                }
              }}
              disabled={currentPage <= 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              قبلی
            </button>

            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1);
                  loadPayments(currentPage + 1);
                }
              }}
              disabled={currentPage >= totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManualPayments;
