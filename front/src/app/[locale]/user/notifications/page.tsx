"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

// Toggle Switch Component
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch = ({
  enabled,
  onChange,
  disabled = false,
}: ToggleSwitchProps) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      enabled ? "bg-primary" : "bg-background-darkest"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// Icons
const BellIcon = ({ className }: { className?: string }) => (
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
      d="M15 17h5l-5 5v-5zM4.868 4.868l14.264 14.264m0 0l-3.75-3.75m3.75 3.75h-4.5v-4.5"
    />
  </svg>
);

const EmailIcon = ({ className }: { className?: string }) => (
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
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
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
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const SmartphoneIcon = ({ className }: { className?: string }) => (
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
      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const SaveIcon = ({ className }: { className?: string }) => (
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
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
);

interface NotificationPreferences {
  // General settings
  all_notifications_enabled: boolean;

  // Delivery methods
  in_app_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;

  // Email preferences
  email_frequency: "immediate" | "daily" | "weekly" | "never";
  marketing_emails: boolean;
  newsletter_subscription: boolean;

  // Category-specific preferences
  course_notifications: boolean;
  payment_notifications: boolean;
  booking_notifications: boolean;
  certificate_notifications: boolean;
  system_notifications: boolean;
  security_notifications: boolean;

  // Specific notification types
  course_enrollment_confirmations: boolean;
  course_reminders: boolean;
  course_updates: boolean;
  payment_confirmations: boolean;
  payment_failures: boolean;
  booking_confirmations: boolean;
  booking_reminders: boolean;
  booking_cancellations: boolean;
  certificate_ready: boolean;
  certificate_expiry: boolean;
  password_changes: boolean;
  login_alerts: boolean;

  // Advanced settings
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  urgent_override: boolean; // Allow urgent notifications during quiet hours
}

export default function NotificationPreferences({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = useTranslations("notificationSettings");
  const isRTL = locale === "fa";

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    all_notifications_enabled: true,
    in_app_notifications: true,
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
    email_frequency: "immediate",
    marketing_emails: false,
    newsletter_subscription: true,
    course_notifications: true,
    payment_notifications: true,
    booking_notifications: true,
    certificate_notifications: true,
    system_notifications: true,
    security_notifications: true,
    course_enrollment_confirmations: true,
    course_reminders: true,
    course_updates: true,
    payment_confirmations: true,
    payment_failures: true,
    booking_confirmations: true,
    booking_reminders: true,
    booking_cancellations: true,
    certificate_ready: true,
    certificate_expiry: true,
    password_changes: true,
    login_alerts: true,
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
    urgent_override: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // In real implementation, load from API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error("Failed to load preferences:", error);
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Update preference
  const updatePreference = (
    key: keyof NotificationPreferences,
    value: boolean | string,
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  // Save preferences
  const savePreferences = async () => {
    setSaving(true);
    try {
      // In real implementation, save to API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col max-w-4xl mx-auto p-6 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary bg-opacity-10 rounded-full">
          <BellIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{t("title")}</h1>
          <p className="text-text-secondary mt-1">
            {t("description") ||
              (locale === "fa"
                ? "مدیریت تنظیمات اعلان‌های خود"
                : "Manage your notification settings")}
          </p>
        </div>
      </div>

      {/* Master Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 bg-background rounded-lg border mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary bg-opacity-10 rounded-full">
            <BellIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {t("allNotifications") ||
                (locale === "fa" ? "همه اعلان‌ها" : "All Notifications")}
            </h2>
            <p className="text-sm text-text-secondary">
              {t("allNotificationsDesc") ||
                (locale === "fa"
                  ? "فعال یا غیرفعال کردن تمام اعلان‌ها"
                  : "Enable or disable all notifications")}
            </p>
          </div>
        </div>
        <ToggleSwitch
          enabled={preferences.all_notifications_enabled}
          onChange={(enabled) =>
            updatePreference("all_notifications_enabled", enabled)
          }
        />
      </motion.div>

      {/* Delivery Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col bg-background rounded-lg p-6 mb-6"
      >
        <h2 className="text-xl font-bold mb-6 text-text-primary">
          {t("deliveryMethods") ||
            (locale === "fa" ? "روش‌های تحویل" : "Delivery Methods")}
        </h2>

        <div className="flex flex-col gap-6">
          {/* In-App Notifications */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary bg-opacity-10 rounded-full">
                <BellIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">
                  {t("inAppNotifications") ||
                    (locale === "fa"
                      ? "اعلان‌های درون‌برنامه‌ای"
                      : "In-App Notifications")}
                </h3>
                <p className="text-sm text-text-secondary">
                  {t("inAppNotificationsDesc") ||
                    (locale === "fa"
                      ? "اعلان‌ها در داخل وب‌سایت"
                      : "Notifications within the website")}
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={
                preferences.in_app_notifications &&
                preferences.all_notifications_enabled
              }
              onChange={(enabled) =>
                updatePreference("in_app_notifications", enabled)
              }
              disabled={!preferences.all_notifications_enabled}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary bg-opacity-10 rounded-full">
                <EmailIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">
                  {t("emailNotifications")}
                </h3>
                <p className="text-sm text-text-secondary">
                  {t("emailNotificationsDesc") ||
                    (locale === "fa"
                      ? "دریافت اعلان‌ها از طریق ایمیل"
                      : "Receive notifications via email")}
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={
                preferences.email_notifications &&
                preferences.all_notifications_enabled
              }
              onChange={(enabled) =>
                updatePreference("email_notifications", enabled)
              }
              disabled={!preferences.all_notifications_enabled}
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary bg-opacity-10 rounded-full">
                <SmartphoneIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">
                  {t("pushNotifications")}
                </h3>
                <p className="text-sm text-text-secondary">
                  {t("pushNotificationsDesc") ||
                    (locale === "fa"
                      ? "اعلان‌های فوری روی دستگاه"
                      : "Instant notifications on your device")}
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={
                preferences.push_notifications &&
                preferences.all_notifications_enabled
              }
              onChange={(enabled) =>
                updatePreference("push_notifications", enabled)
              }
              disabled={!preferences.all_notifications_enabled}
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary bg-opacity-10 rounded-full">
                <PhoneIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">
                  {t("smsNotifications") ||
                    (locale === "fa"
                      ? "اعلان‌های پیامکی"
                      : "SMS Notifications")}
                </h3>
                <p className="text-sm text-text-secondary">
                  {t("smsNotificationsDesc") ||
                    (locale === "fa"
                      ? "دریافت پیامک برای اعلان‌های مهم"
                      : "Receive SMS for important notifications")}
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={
                preferences.sms_notifications &&
                preferences.all_notifications_enabled
              }
              onChange={(enabled) =>
                updatePreference("sms_notifications", enabled)
              }
              disabled={!preferences.all_notifications_enabled}
            />
          </div>
        </div>
      </motion.div>

      {/* Email Frequency */}
      {preferences.email_notifications &&
        preferences.all_notifications_enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col bg-background rounded-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-6 text-text-primary">
              {t("emailFrequency") ||
                (locale === "fa" ? "تناوب ایمیل‌ها" : "Email Frequency")}
            </h2>

            <div className="flex flex-col gap-3">
              {[
                {
                  value: "immediate",
                  label: locale === "fa" ? "فوری" : "Immediate",
                },
                { value: "daily", label: locale === "fa" ? "روزانه" : "Daily" },
                {
                  value: "weekly",
                  label: locale === "fa" ? "هفتگی" : "Weekly",
                },
                {
                  value: "never",
                  label: locale === "fa" ? "هیچ‌وقت" : "Never",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 border border-background-darkest rounded-lg cursor-pointer hover:bg-background-primary"
                >
                  <input
                    type="radio"
                    name="emailFrequency"
                    value={option.value}
                    checked={preferences.email_frequency === option.value}
                    onChange={(e) =>
                      updatePreference("email_frequency", e.target.value)
                    }
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-text-primary font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        )}

      {/* Notification Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col bg-background rounded-lg p-6 mb-6"
      >
        <h2 className="text-xl font-bold mb-6 text-text-primary">
          {t("categories") || (locale === "fa" ? "دسته‌بندی‌ها" : "Categories")}
        </h2>

        <div className="flex flex-col gap-4">
          {/* Course Notifications */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex flex-col">
              <h3 className="font-bold text-text-primary">
                {t("courseUpdates")}
              </h3>
              <p className="text-sm text-text-secondary">
                {t("courseUpdatesDesc")}
              </p>
            </div>
            <ToggleSwitch
              enabled={
                preferences.course_notifications &&
                preferences.all_notifications_enabled
              }
              onChange={(enabled) =>
                updatePreference("course_notifications", enabled)
              }
              disabled={!preferences.all_notifications_enabled}
            />
          </div>

          {/* Payment Notifications */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex flex-col">
              <h3 className="font-bold text-text-primary">
                {t("paymentNotifications") ||
                  (locale === "fa"
                    ? "اعلان‌های پرداخت"
                    : "Payment Notifications")}
              </h3>
              <p className="text-sm text-text-secondary">
                {t("paymentNotificationsDesc") ||
                  (locale === "fa"
                    ? "اطلاع از وضعیت پرداخت‌ها"
                    : "Get notified about payment status")}
              </p>
            </div>
            <ToggleSwitch
              enabled={
                preferences.payment_notifications &&
                preferences.all_notifications_enabled
              }
              onChange={(enabled) =>
                updatePreference("payment_notifications", enabled)
              }
              disabled={!preferences.all_notifications_enabled}
            />
          </div>

          {/* Booking Notifications */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex flex-col">
              <h3 className="font-bold text-text-primary">
                {t("bookingReminders")}
              </h3>
              <p className="text-sm text-text-secondary">
                {t("bookingRemindersDesc")}
              </p>
            </div>
            <ToggleSwitch
              enabled={
                preferences.booking_notifications &&
                preferences.all_notifications_enabled
              }
              onChange={(enabled) =>
                updatePreference("booking_notifications", enabled)
              }
              disabled={!preferences.all_notifications_enabled}
            />
          </div>

          {/* Certificate Notifications */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex flex-col">
              <h3 className="font-bold text-text-primary">
                {t("certificateNotifications") ||
                  (locale === "fa"
                    ? "اعلان‌های گواهینامه"
                    : "Certificate Notifications")}
              </h3>
              <p className="text-sm text-text-secondary">
                {t("certificateNotificationsDesc") ||
                  (locale === "fa"
                    ? "اطلاع از آمادگی گواهینامه‌ها"
                    : "Get notified when certificates are ready")}
              </p>
            </div>
            <ToggleSwitch
              enabled={
                preferences.certificate_notifications &&
                preferences.all_notifications_enabled
              }
              onChange={(enabled) =>
                updatePreference("certificate_notifications", enabled)
              }
              disabled={!preferences.all_notifications_enabled}
            />
          </div>

          {/* Security Notifications */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex flex-col">
              <h3 className="font-bold text-text-primary">
                {t("securityNotifications") ||
                  (locale === "fa"
                    ? "اعلان‌های امنیتی"
                    : "Security Notifications")}
              </h3>
              <p className="text-sm text-text-secondary">
                {t("securityNotificationsDesc") ||
                  (locale === "fa"
                    ? "اعلان‌های مربوط به امنیت حساب"
                    : "Notifications about account security")}
              </p>
            </div>
            <ToggleSwitch
              enabled={preferences.security_notifications}
              onChange={(enabled) =>
                updatePreference("security_notifications", enabled)
              }
              disabled={false} // Security notifications should always be available
            />
          </div>
        </div>
      </motion.div>

      {/* Marketing Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col bg-background rounded-lg p-6 mb-6"
      >
        <h2 className="text-xl font-bold mb-6 text-text-primary">
          {t("marketingPreferences") ||
            (locale === "fa" ? "تنظیمات بازاریابی" : "Marketing Preferences")}
        </h2>

        <div className="flex flex-col gap-4">
          {/* Marketing Emails */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex flex-col">
              <h3 className="font-bold text-text-primary">
                {t("marketingEmails") ||
                  (locale === "fa" ? "ایمیل‌های تبلیغاتی" : "Marketing Emails")}
              </h3>
              <p className="text-sm text-text-secondary">
                {t("marketingEmailsDesc") ||
                  (locale === "fa"
                    ? "دریافت ایمیل‌های تبلیغاتی و پیشنهادات ویژه"
                    : "Receive promotional emails and special offers")}
              </p>
            </div>
            <ToggleSwitch
              enabled={preferences.marketing_emails}
              onChange={(enabled) =>
                updatePreference("marketing_emails", enabled)
              }
            />
          </div>

          {/* Newsletter */}
          <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
            <div className="flex flex-col">
              <h3 className="font-bold text-text-primary">
                {t("newsletter") ||
                  (locale === "fa" ? "خبرنامه" : "Newsletter")}
              </h3>
              <p className="text-sm text-text-secondary">
                {t("newsletterDesc") ||
                  (locale === "fa"
                    ? "دریافت خبرنامه ماهانه با آخرین اخبار و مطالب"
                    : "Receive monthly newsletter with latest news and content")}
              </p>
            </div>
            <ToggleSwitch
              enabled={preferences.newsletter_subscription}
              onChange={(enabled) =>
                updatePreference("newsletter_subscription", enabled)
              }
            />
          </div>
        </div>
      </motion.div>

      {/* Quiet Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col bg-background rounded-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            {t("quietHours") ||
              (locale === "fa" ? "ساعات سکوت" : "Quiet Hours")}
          </h2>
          <ToggleSwitch
            enabled={preferences.quiet_hours_enabled}
            onChange={(enabled) =>
              updatePreference("quiet_hours_enabled", enabled)
            }
          />
        </div>

        {preferences.quiet_hours_enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("quietHoursStart") ||
                    (locale === "fa" ? "شروع ساعات سکوت" : "Quiet Hours Start")}
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start}
                  onChange={(e) =>
                    updatePreference("quiet_hours_start", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("quietHoursEnd") ||
                    (locale === "fa" ? "پایان ساعات سکوت" : "Quiet Hours End")}
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end}
                  onChange={(e) =>
                    updatePreference("quiet_hours_end", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-background-darkest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-background-darkest rounded-lg">
              <div className="flex flex-col">
                <h3 className="font-bold text-text-primary">
                  {t("urgentOverride") ||
                    (locale === "fa"
                      ? "رد کردن برای اعلان‌های فوری"
                      : "Override for Urgent Notifications")}
                </h3>
                <p className="text-sm text-text-secondary">
                  {t("urgentOverrideDesc") ||
                    (locale === "fa"
                      ? "اجازه دریافت اعلان‌های فوری در ساعات سکوت"
                      : "Allow urgent notifications during quiet hours")}
                </p>
              </div>
              <ToggleSwitch
                enabled={preferences.urgent_override}
                onChange={(enabled) =>
                  updatePreference("urgent_override", enabled)
                }
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-end gap-4"
      >
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-green-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">
              {t("saveSuccess") ||
                (locale === "fa"
                  ? "تنظیمات ذخیره شد"
                  : "Settings saved successfully")}
            </span>
          </motion.div>
        )}

        <button
          onClick={savePreferences}
          disabled={saving}
          className={`flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-bold transition-all ${
            saving ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-dark"
          }`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SaveIcon className="w-5 h-5" />
          )}
          <span>
            {t("saveSettings") ||
              (locale === "fa" ? "ذخیره تنظیمات" : "Save Settings")}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
