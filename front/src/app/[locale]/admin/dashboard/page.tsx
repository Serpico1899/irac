"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FinancialDashboard from "@/components/organisms/Analytics/FinancialDashboard";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  Cog6ToothIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const { isAuthenticated, userLevel, user } = useAuth();
  const router = useRouter();

  // Check admin authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/admin/dashboard");
      return;
    }

    if (userLevel !== "Manager" && userLevel !== "Ghost") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, userLevel, router]);

  // Show loading if not authenticated yet
  if (!isAuthenticated || (userLevel !== "Manager" && userLevel !== "Ghost")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                داشبورد مدیریت
              </h1>
              <p className="text-sm text-gray-600">مدیریت سیستم IRAC</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                داشبورد مدیریت
              </h1>
              <p className="text-gray-600 mt-1">
                مدیریت سیستم آموزشی و مالی IRAC
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "مدیر سیستم"}
                </p>
                <p className="text-xs text-gray-600">
                  {userLevel === "Ghost" ? "مدیر کل" : "مدیر"}
                </p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards - Mobile First */}
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Revenue */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600 mb-1">
                  درآمد کل
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  ۲۵۰,۰۰۰,۰۰۰
                </p>
                <p className="text-xs text-green-600 mt-1">+۱۲.۵%</p>
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UsersIcon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600 mb-1">کاربران</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  ۱,۲۳۴
                </p>
                <p className="text-xs text-blue-600 mt-1">+۸.۳%</p>
              </div>
            </div>

            {/* Active Workshops */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AcademicCapIcon className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600 mb-1">
                  کارگاه‌ها
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  ۴۲
                </p>
                <p className="text-xs text-purple-600 mt-1">+۵.۱%</p>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
                </div>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600 mb-1">سفارشات</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  ۵۶۷
                </p>
                <p className="text-xs text-orange-600 mt-1">+۱۵.۲%</p>
              </div>
            </div>
          </div>

          {/* Quick Actions - Mobile First */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <button
              onClick={() => router.push("/admin/analytics")}
              className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
            >
              <ChartBarIcon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">تحلیل‌ها</p>
              <p className="text-xs text-gray-600 mt-1">گزارش‌های مالی</p>
            </button>

            <button
              onClick={() => router.push("/admin/users")}
              className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
            >
              <UsersIcon className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">کاربران</p>
              <p className="text-xs text-gray-600 mt-1">مدیریت کاربران</p>
            </button>

            <button
              onClick={() => router.push("/admin/workshops")}
              className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
            >
              <AcademicCapIcon className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">کارگاه‌ها</p>
              <p className="text-xs text-gray-600 mt-1">مدیریت کارگاه‌ها</p>
            </button>

            <button
              onClick={() => router.push("/admin/products")}
              className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
            >
              <CurrencyDollarIcon className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">محصولات</p>
              <p className="text-xs text-gray-600 mt-1">مدیریت فروشگاه</p>
            </button>

            <button
              onClick={() => router.push("/admin/payments")}
              className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
            >
              <CreditCardIcon className="h-6 w-6 lg:h-8 lg:w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">پرداخت‌ها</p>
              <p className="text-xs text-gray-600 mt-1">
                مدیریت پرداخت‌های دستی
              </p>
            </button>
          </div>

          {/* Financial Dashboard Component */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                داشبورد مالی
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                تحلیل عملکرد مالی سیستم
              </p>
            </div>
            <div className="p-0">
              <FinancialDashboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
