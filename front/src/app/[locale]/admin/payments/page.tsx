"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AdminManualPayments from "@/components/organisms/Payment/AdminManualPayments";
import CreateManualPayment from "@/components/organisms/Payment/CreateManualPayment";
import {
  CreditCardIcon,
  PlusIcon,
  ListBulletIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

type ViewMode = "list" | "create";

const AdminPaymentsPage: React.FC = () => {
  const t = useTranslations("admin");
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [currentView, setCurrentView] = useState<ViewMode>("list");
  const [createdPaymentId, setCreatedPaymentId] = useState<string>("");

  // Check admin permissions (in real app, check user role)
  const isAdmin = user?.role === "admin" || user?.isAdmin || true; // Mock admin check

  // Handle successful payment creation
  const handlePaymentCreated = (paymentId: string) => {
    setCreatedPaymentId(paymentId);
    setCurrentView("list");
  };

  // Handle navigation
  const handleNavigateToCreate = () => {
    setCurrentView("create");
  };

  const handleNavigateToList = () => {
    setCurrentView("list");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            در حال بارگیری...
          </div>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg border border-gray-200 max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            دسترسی محدود
          </h2>
          <p className="text-gray-600 mb-4">
            برای مشاهده این صفحه باید وارد شوید
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ورود به سیستم
          </button>
        </div>
      </div>
    );
  }

  // Admin permission check
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg border border-gray-200 max-w-md mx-auto">
          <ShieldCheckIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            دسترسی مدیریتی مورد نیاز
          </h2>
          <p className="text-gray-600 mb-4">
            برای مشاهده این صفحه نیاز به دسترسی مدیریتی دارید
          </p>
          <button
            onClick={() => router.push("/user/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            بازگشت به داشبورد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="hover:text-blue-600 transition-colors"
            >
              داشبورد مدیریت
            </button>
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-gray-900">مدیریت پرداخت‌ها</span>
          </nav>

          {/* Header with Navigation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Title */}
              <div className="flex items-center gap-3">
                <CreditCardIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    مدیریت پرداخت‌های دستی
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    {currentView === "list"
                      ? "مشاهده و مدیریت درخواست‌های پرداخت"
                      : "ایجاد درخواست پرداخت جدید"}
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNavigateToList}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    currentView === "list"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">لیست پرداخت‌ها</span>
                </button>

                <button
                  onClick={handleNavigateToCreate}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    currentView === "create"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">ایجاد درخواست</span>
                </button>
              </div>
            </div>

            {/* Success Message for Created Payment */}
            {createdPaymentId && currentView === "list" && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  ✅ درخواست پرداخت با شناسه{" "}
                  <span className="font-medium">{createdPaymentId}</span> با موفقیت
                  ایجاد شد
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {currentView === "list" ? (
            <AdminManualPayments onCreatePayment={handleNavigateToCreate} />
          ) : (
            <CreateManualPayment
              onSuccess={handlePaymentCreated}
              onCancel={handleNavigateToList}
            />
          )}
        </div>

        {/* Back to Admin Dashboard */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowRightIcon className="h-4 w-4" />
            بازگشت به داشبورد مدیریت
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
