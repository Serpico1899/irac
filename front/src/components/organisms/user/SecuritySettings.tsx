"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { smsApi } from "@/services/sms/smsApi";
import TwoFactorSetup from "../Auth/TwoFactorSetup";
import PhoneVerification from "../Auth/PhoneVerification";
import SMSPasswordReset from "../Auth/SMS/SMSPasswordReset";
import {
  ShieldCheckIcon,
  PhoneIcon,
  KeyIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  LockClosedIcon,
  BellIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  ShieldCheckIcon as ShieldCheckIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  BellIcon as BellIconSolid,
} from "@heroicons/react/24/solid";

interface SecuritySettingsState {
  activeTab:
    | "overview"
    | "2fa"
    | "phone"
    | "password"
    | "activity"
    | "preferences";
  twoFactorEnabled: boolean;
  phoneVerified: boolean;
  smsNotificationsEnabled: boolean;
  securityAlertsEnabled: boolean;
  loginNotificationsEnabled: boolean;
  isLoading: boolean;
  error: string;
  success: string;
  showChangePhone: boolean;
  showPasswordReset: boolean;
  show2FASetup: boolean;
}

interface SecurityActivity {
  id: string;
  type:
    | "login"
    | "logout"
    | "2fa_enabled"
    | "2fa_disabled"
    | "phone_changed"
    | "password_changed";
  description: string;
  ip_address: string;
  device: string;
  location: string;
  timestamp: Date;
  status: "success" | "failed" | "suspicious";
}

interface TrustedDevice {
  id: string;
  name: string;
  device_type: "mobile" | "desktop" | "tablet";
  browser: string;
  last_used: Date;
  ip_address: string;
  location: string;
  is_current: boolean;
}

const SecuritySettings: React.FC = () => {
  const t = useTranslations("auth");
  const { user, isAuthenticated, updateUser } = useAuth();

  const [state, setState] = useState<SecuritySettingsState>({
    activeTab: "overview",
    twoFactorEnabled: false,
    phoneVerified: false,
    smsNotificationsEnabled: true,
    securityAlertsEnabled: true,
    loginNotificationsEnabled: true,
    isLoading: false,
    error: "",
    success: "",
    showChangePhone: false,
    showPasswordReset: false,
    show2FASetup: false,
  });

  // Mock data - in real app, this would come from API
  const [securityActivity] = useState<SecurityActivity[]>([
    {
      id: "1",
      type: "login",
      description: "ورود موفق به حساب کاربری",
      ip_address: "192.168.1.1",
      device: "Chrome on Windows",
      location: "تهران، ایران",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "success",
    },
    {
      id: "2",
      type: "2fa_enabled",
      description: "احراز هویت دو مرحله‌ای فعال شد",
      ip_address: "192.168.1.1",
      device: "Chrome on Windows",
      location: "تهران، ایران",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "success",
    },
    {
      id: "3",
      type: "login",
      description: "تلاش ناموفق برای ورود",
      ip_address: "203.0.113.1",
      device: "Unknown",
      location: "ناشناخته",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "failed",
    },
  ]);

  const [trustedDevices] = useState<TrustedDevice[]>([
    {
      id: "1",
      name: "کامپیوتر شخصی",
      device_type: "desktop",
      browser: "Chrome 119.0",
      last_used: new Date(),
      ip_address: "192.168.1.1",
      location: "تهران، ایران",
      is_current: true,
    },
    {
      id: "2",
      name: "گوشی همراه",
      device_type: "mobile",
      browser: "Safari 17.0",
      last_used: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      ip_address: "192.168.1.10",
      location: "تهران، ایران",
      is_current: false,
    },
  ]);

  // Load user security settings
  useEffect(() => {
    if (user && isAuthenticated) {
      setState((prev) => ({
        ...prev,
        twoFactorEnabled: user.two_factor_enabled || false,
        phoneVerified: user.phone_verified || false,
      }));
    }
  }, [user, isAuthenticated]);

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} دقیقه پیش`;
    } else if (hours < 24) {
      return `${hours} ساعت پیش`;
    } else {
      return `${days} روز پیش`;
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    const iconClass = `h-5 w-5 ${
      status === "success"
        ? "text-green-600"
        : status === "failed"
          ? "text-red-600"
          : "text-yellow-600"
    }`;

    switch (type) {
      case "login":
      case "logout":
        return <ComputerDesktopIcon className={iconClass} />;
      case "2fa_enabled":
      case "2fa_disabled":
        return <ShieldCheckIconSolid className={iconClass} />;
      case "phone_changed":
        return <PhoneIcon className={iconClass} />;
      case "password_changed":
        return <KeyIcon className={iconClass} />;
      default:
        return <ExclamationTriangleIcon className={iconClass} />;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const iconClass = "h-5 w-5 text-gray-600";

    switch (deviceType) {
      case "desktop":
        return <ComputerDesktopIcon className={iconClass} />;
      case "mobile":
      case "tablet":
        return <DevicePhoneMobileIcon className={iconClass} />;
      default:
        return <ComputerDesktopIcon className={iconClass} />;
    }
  };

  const handleToggleNotification = (type: string) => {
    setState((prev) => ({
      ...prev,
      [type]: !prev[type as keyof SecuritySettingsState],
      success: "تنظیمات اعلانات به‌روزرسانی شد",
    }));

    // Clear success message after 3 seconds
    setTimeout(() => {
      setState((prev) => ({ ...prev, success: "" }));
    }, 3000);
  };

  const handle2FAComplete = (enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      twoFactorEnabled: enabled,
      show2FASetup: false,
      success: enabled
        ? "احراز هویت دو مرحله‌ای با موفقیت فعال شد"
        : "احراز هویت دو مرحله‌ای غیرفعال شد",
    }));

    if (updateUser) {
      updateUser({ ...user, two_factor_enabled: enabled });
    }

    setTimeout(() => {
      setState((prev) => ({ ...prev, success: "" }));
    }, 5000);
  };

  const handlePhoneVerificationComplete = () => {
    setState((prev) => ({
      ...prev,
      phoneVerified: true,
      showChangePhone: false,
      success: "شماره تلفن با موفقیت تأیید شد",
    }));

    if (updateUser) {
      updateUser({ ...user, phone_verified: true });
    }

    setTimeout(() => {
      setState((prev) => ({ ...prev, success: "" }));
    }, 3000);
  };

  const tabs = [
    { id: "overview", label: "نمای کلی", icon: CogIcon },
    { id: "2fa", label: "احراز هویت دو مرحله‌ای", icon: ShieldCheckIcon },
    { id: "phone", label: "شماره تلفن", icon: PhoneIcon },
    { id: "password", label: "رمز عبور", icon: KeyIcon },
    { id: "activity", label: "فعالیت‌های امنیتی", icon: ClockIcon },
    { id: "preferences", label: "تنظیمات اعلانات", icon: BellIcon },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          تنظیمات امنیتی
        </h1>
        <p className="text-gray-600">مدیریت امنیت و حریم خصوصی حساب کاربری</p>
      </div>

      {/* Success/Error Messages */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 space-x-reverse">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{state.error}</span>
        </div>
      )}

      {state.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3 space-x-reverse">
          <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <span className="text-green-700 text-sm">{state.success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setState((prev) => ({ ...prev, activeTab: tab.id as any }))
                  }
                  className={`w-full flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg text-right transition-colors ${
                    state.activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      state.activeTab === tab.id
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Overview Tab */}
            {state.activeTab === "overview" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  نمای کلی امنیت
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Security Score */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-green-900">
                        امتیاز امنیتی
                      </h3>
                      <ShieldCheckIconSolid className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex items-baseline space-x-2 space-x-reverse">
                      <span className="text-3xl font-bold text-green-900">
                        {state.twoFactorEnabled && state.phoneVerified
                          ? "85"
                          : "65"}
                      </span>
                      <span className="text-sm text-green-700">از 100</span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      {state.twoFactorEnabled && state.phoneVerified
                        ? "امنیت خوب - همه موارد فعال است"
                        : "امنیت متوسط - برای بهبود امنیت، 2FA را فعال کنید"}
                    </p>
                  </div>

                  {/* Account Status */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-blue-900">وضعیت حساب</h3>
                      <LockClosedIconSolid className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">
                          تأیید هویت
                        </span>
                        <CheckCircleIconSolid className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">
                          تأیید شماره تلفن
                        </span>
                        {state.phoneVerified ? (
                          <CheckCircleIconSolid className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    ویژگی‌های امنیتی
                  </h3>

                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <ShieldCheckIconSolid
                        className={`h-6 w-6 ${
                          state.twoFactorEnabled
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          احراز هویت دو مرحله‌ای
                        </h4>
                        <p className="text-sm text-gray-600">
                          {state.twoFactorEnabled
                            ? "فعال - حساب شما بیشتر محافظت می‌شود"
                            : "غیرفعال - برای امنیت بیشتر فعال کنید"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setState((prev) => ({ ...prev, show2FASetup: true }))
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        state.twoFactorEnabled
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {state.twoFactorEnabled ? "مدیریت" : "فعال‌سازی"}
                    </button>
                  </div>

                  {/* Phone Verification */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <PhoneIcon
                        className={`h-6 w-6 ${
                          state.phoneVerified
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          تأیید شماره تلفن
                        </h4>
                        <p className="text-sm text-gray-600">
                          {state.phoneVerified
                            ? `تأیید شده - ${user?.mobile || "نامشخص"}`
                            : "تأیید نشده - شماره تلفن خود را تأیید کنید"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setState((prev) => ({ ...prev, showChangePhone: true }))
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      {state.phoneVerified ? "تغییر" : "تأیید"}
                    </button>
                  </div>

                  {/* Password Security */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <KeyIcon className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">رمز عبور</h4>
                        <p className="text-sm text-gray-600">
                          آخرین تغییر: 2 ماه پیش
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          showPasswordReset: true,
                        }))
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      تغییر
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Two-Factor Authentication Tab */}
            {state.activeTab === "2fa" && (
              <div className="p-6">
                <TwoFactorSetup
                  onComplete={handle2FAComplete}
                  onCancel={() =>
                    setState((prev) => ({ ...prev, activeTab: "overview" }))
                  }
                />
              </div>
            )}

            {/* Phone Management Tab */}
            {state.activeTab === "phone" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  مدیریت شماره تلفن
                </h2>

                <div className="space-y-6">
                  {/* Current Phone */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <PhoneIcon className="h-6 w-6 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            شماره تلفن فعلی
                          </h3>
                          <p className="text-sm text-gray-600">
                            {user?.mobile || "شماره تلفن ثبت نشده"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            state.phoneVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {state.phoneVerified ? "تأیید شده" : "تأیید نشده"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Change Phone Section */}
                  {state.showChangePhone ? (
                    <div className="border border-blue-200 rounded-lg p-6">
                      <PhoneVerification
                        onVerificationComplete={handlePhoneVerificationComplete}
                        onCancel={() =>
                          setState((prev) => ({
                            ...prev,
                            showChangePhone: false,
                          }))
                        }
                        initialPhoneNumber={user?.mobile || ""}
                        purpose="register"
                        showTitle={false}
                      />
                    </div>
                  ) : (
                    <div className="flex space-x-3 space-x-reverse">
                      <button
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            showChangePhone: true,
                          }))
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        {state.phoneVerified
                          ? "تغییر شماره تلفن"
                          : "تأیید شماره تلفن"}
                      </button>
                    </div>
                  )}

                  {/* SMS Usage Statistics */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      آمار استفاده از پیامک
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          12
                        </div>
                        <div className="text-xs text-gray-600">
                          پیامک این ماه
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          3
                        </div>
                        <div className="text-xs text-gray-600">کد ورود</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          2
                        </div>
                        <div className="text-xs text-gray-600">
                          اعلانات رزرو
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          1
                        </div>
                        <div className="text-xs text-gray-600">
                          هشدار امنیتی
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {state.activeTab === "password" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  تغییر رمز عبور
                </h2>

                {state.showPasswordReset ? (
                  <SMSPasswordReset
                    onSuccess={() => {
                      setState((prev) => ({
                        ...prev,
                        showPasswordReset: false,
                        success: "رمز عبور با موفقیت تغییر یافت",
                      }));
                    }}
                    onCancel={() =>
                      setState((prev) => ({
                        ...prev,
                        showPasswordReset: false,
                      }))
                    }
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <LockClosedIconSolid className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">توصیه‌های امنیتی:</p>
                          <ul className="space-y-1">
                            <li>• رمز عبور حداقل 8 کاراکتر باشد</li>
                            <li>• ترکیبی از حروف، اعداد و علائم باشد</li>
                            <li>
                              • از رمزهای شخصی مانند تاریخ تولد استفاده نکنید
                            </li>
                            <li>• رمز عبور را هر 3 ماه یکبار تغییر دهید</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          showPasswordReset: true,
                        }))
                      }
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      شروع تغییر رمز عبور
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Security Activity Tab */}
            {state.activeTab === "activity" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    فعالیت‌های امنیتی
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    مشاهده همه
                  </button>
                </div>

                <div className="space-y-4">
                  {securityActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 space-x-reverse p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type, activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.status === "success"
                                ? "bg-green-100 text-green-800"
                                : activity.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {activity.status === "success"
                              ? "موفق"
                              : activity.status === "failed"
                                ? "ناموفق"
                                : "مشکوک"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 space-y-1">
                          <div>
                            {activity.device} • {activity.location}
                          </div>
                          <div>
                            IP: {activity.ip_address} •{" "}
                            {formatRelativeTime(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trusted Devices */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    دستگاه‌های مورد اعتماد
                  </h3>
                  <div className="space-y-3">
                    {trustedDevices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          {getDeviceIcon(device.device_type)}
                          <div>
                            <h4 className="font-medium text-gray-900 flex items-center">
                              {device.name}
                              {device.is_current && (
                                <span className="mr-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  فعلی
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {device.browser} • آخرین استفاده:{" "}
                              {formatRelativeTime(device.last_used)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {device.location} • {device.ip_address}
                            </p>
                          </div>
                        </div>
                        {!device.is_current && (
                          <button className="text-red-600 hover:text-red-700 p-2">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notification Preferences Tab */}
            {state.activeTab === "preferences" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  تنظیمات اعلانات
                </h2>

                <div className="space-y-6">
                  {/* SMS Notifications */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <BellIconSolid className="h-6 w-6 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            اعلانات پیامکی
                          </h3>
                          <p className="text-sm text-gray-600">
                            دریافت اعلانات از طریق پیامک
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleNotification("smsNotificationsEnabled")
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          state.smsNotificationsEnabled
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            state.smsNotificationsEnabled
                              ? "translate-x-1"
                              : "translate-x-6"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Security Alerts */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <ShieldCheckIconSolid className="h-6 w-6 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            هشدارهای امنیتی
                          </h3>
                          <p className="text-sm text-gray-600">
                            اطلاع‌رسانی فعالیت‌های مشکوک
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleNotification("securityAlertsEnabled")
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          state.securityAlertsEnabled
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            state.securityAlertsEnabled
                              ? "translate-x-1"
                              : "translate-x-6"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Login Notifications */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <ComputerDesktopIcon className="h-6 w-6 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            اعلانات ورود
                          </h3>
                          <p className="text-sm text-gray-600">
                            اطلاع‌رسانی ورود از دستگاه‌های جدید
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleNotification("loginNotificationsEnabled")
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          state.loginNotificationsEnabled
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            state.loginNotificationsEnabled
                              ? "translate-x-1"
                              : "translate-x-6"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Notification Schedule */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      زمان‌بندی اعلانات
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ساعت شروع
                        </label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                          <option>08:00</option>
                          <option>09:00</option>
                          <option>10:00</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ساعت پایان
                        </label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                          <option>20:00</option>
                          <option>21:00</option>
                          <option>22:00</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      اعلانات فقط در بازه زمانی انتخابی ارسال می‌شوند
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {state.show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TwoFactorSetup
              onComplete={handle2FAComplete}
              onCancel={() =>
                setState((prev) => ({ ...prev, show2FASetup: false }))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
