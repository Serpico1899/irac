// Notification Functions
export { createNotificationFn } from "./createNotification/createNotification.fn.ts";
export { markAsReadFn } from "./markAsRead/markAsRead.fn.ts";
export { getUserNotificationsFn } from "./getUserNotifications/getUserNotifications.fn.ts";
export { sendEmailNotificationFn } from "./sendEmailNotification/sendEmailNotification.fn.ts";

// Notification Validators
export { createNotificationValidator } from "./createNotification/createNotification.val.ts";
export { markAsReadValidator } from "./markAsRead/markAsRead.val.ts";
export { getUserNotificationsValidator } from "./getUserNotifications/getUserNotifications.val.ts";
export { sendEmailNotificationValidator } from "./sendEmailNotification/sendEmailNotification.val.ts";

// Type Exports
export type { CreateNotificationInput } from "./createNotification/createNotification.val.ts";
export type { MarkAsReadInput } from "./markAsRead/markAsRead.val.ts";
export type { GetUserNotificationsInput } from "./getUserNotifications/getUserNotifications.val.ts";
export type { SendEmailNotificationInput } from "./sendEmailNotification/sendEmailNotification.val.ts";

// Notification Templates and Helpers
export const NOTIFICATION_TEMPLATES = {
  COURSE_ENROLLMENT: {
    title_fa: 'ثبت‌نام در دوره',
    title_en: 'Course Enrollment',
    message_fa: 'شما با موفقیت در دوره "{courseName}" ثبت‌نام شدید',
    message_en: 'You have successfully enrolled in the course "{courseName}"'
  },
  PAYMENT_SUCCESS: {
    title_fa: 'پرداخت موفق',
    title_en: 'Payment Successful',
    message_fa: 'پرداخت شما به مبلغ {amount} تومان انجام شد',
    message_en: 'Your payment of {amount} IRR has been processed'
  },
  BOOKING_CONFIRMED: {
    title_fa: 'تایید رزرو',
    title_en: 'Booking Confirmed',
    message_fa: 'رزرو فضای کاری شما برای تاریخ {date} تایید شد',
    message_en: 'Your workspace booking for {date} has been confirmed'
  },
  CERTIFICATE_READY: {
    title_fa: 'گواهینامه آماده',
    title_en: 'Certificate Ready',
    message_fa: 'گواهینامه دوره "{courseName}" شما آماده دانلود است',
    message_en: 'Your certificate for "{courseName}" is ready for download'
  },
  PAYMENT_FAILED: {
    title_fa: 'خطا در پرداخت',
    title_en: 'Payment Failed',
    message_fa: 'پرداخت شما ناموفق بود. لطفاً مجدداً تلاش کنید',
    message_en: 'Your payment was unsuccessful. Please try again'
  },
  BOOKING_CANCELLED: {
    title_fa: 'لغو رزرو',
    title_en: 'Booking Cancelled',
    message_fa: 'رزرو شما برای تاریخ {date} لغو شد',
    message_en: 'Your booking for {date} has been cancelled'
  },
  COURSE_REMINDER: {
    title_fa: 'یادآوری دوره',
    title_en: 'Course Reminder',
    message_fa: 'دوره "{courseName}" شما فردا شروع می‌شود',
    message_en: 'Your course "{courseName}" starts tomorrow'
  },
  BOOKING_REMINDER: {
    title_fa: 'یادآوری رزرو',
    title_en: 'Booking Reminder',
    message_fa: 'رزرو فضای کاری شما برای امروز است',
    message_en: 'Your workspace booking is scheduled for today'
  },
  WELCOME: {
    title_fa: 'خوش آمدید',
    title_en: 'Welcome',
    message_fa: 'به مرکز معماری ایراک خوش آمدید',
    message_en: 'Welcome to Iranian Architecture Center'
  },
  PASSWORD_RESET: {
    title_fa: 'تغییر رمز عبور',
    title_en: 'Password Reset',
    message_fa: 'درخواست تغییر رمز عبور شما دریافت شد',
    message_en: 'Your password reset request has been received'
  }
} as const;

// Notification Categories
export const NOTIFICATION_CATEGORIES = {
  COURSE: 'COURSE',
  PAYMENT: 'PAYMENT',
  BOOKING: 'BOOKING',
  CERTIFICATE: 'CERTIFICATE',
  SYSTEM: 'SYSTEM',
  MARKETING: 'MARKETING',
  SECURITY: 'SECURITY'
} as const;

// Notification Priority Levels
export const NOTIFICATION_PRIORITIES = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

// Helper function to create standardized notifications
export const createStandardNotification = async (params: {
  user_id: string;
  template_key: keyof typeof NOTIFICATION_TEMPLATES;
  template_data?: Record<string, any>;
  delivery_methods?: {
    in_app?: boolean;
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  priority?: keyof typeof NOTIFICATION_PRIORITIES;
  action_url?: string;
}) => {
  const { createNotificationFn } = await import("./createNotification/createNotification.fn.ts");

  const template = NOTIFICATION_TEMPLATES[params.template_key];

  const categoryMap: Record<string, string> = {
    COURSE_ENROLLMENT: NOTIFICATION_CATEGORIES.COURSE,
    PAYMENT_SUCCESS: NOTIFICATION_CATEGORIES.PAYMENT,
    PAYMENT_FAILED: NOTIFICATION_CATEGORIES.PAYMENT,
    BOOKING_CONFIRMED: NOTIFICATION_CATEGORIES.BOOKING,
    BOOKING_CANCELLED: NOTIFICATION_CATEGORIES.BOOKING,
    CERTIFICATE_READY: NOTIFICATION_CATEGORIES.CERTIFICATE,
    COURSE_REMINDER: NOTIFICATION_CATEGORIES.COURSE,
    BOOKING_REMINDER: NOTIFICATION_CATEGORIES.BOOKING,
    WELCOME: NOTIFICATION_CATEGORIES.SYSTEM,
    PASSWORD_RESET: NOTIFICATION_CATEGORIES.SECURITY
  };

  return await createNotificationFn({
    user_id: params.user_id,
    type: params.template_key,
    category: categoryMap[params.template_key] as any,
    title_fa: template.title_fa,
    title_en: template.title_en,
    message_fa: template.message_fa,
    message_en: template.message_en,
    template_data: params.template_data,
    delivery_methods: params.delivery_methods || { in_app: true },
    priority: params.priority || NOTIFICATION_PRIORITIES.NORMAL,
    action_url: params.action_url
  });
};

// Helper function to send bulk notifications
export const sendBulkNotifications = async (params: {
  user_ids: string[];
  template_key: keyof typeof NOTIFICATION_TEMPLATES;
  template_data?: Record<string, any>;
  delivery_methods?: {
    in_app?: boolean;
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  priority?: keyof typeof NOTIFICATION_PRIORITIES;
}) => {
  const results = [];

  for (const user_id of params.user_ids) {
    try {
      const result = await createStandardNotification({
        user_id,
        template_key: params.template_key,
        template_data: params.template_data,
        delivery_methods: params.delivery_methods,
        priority: params.priority
      });
      results.push({ user_id, success: true, notification_id: result.notification_id });
    } catch (error) {
      results.push({ user_id, success: false, error: error.message });
    }
  }

  return {
    success: true,
    total_sent: results.filter(r => r.success).length,
    total_failed: results.filter(r => !r.success).length,
    results
  };
};

// Database Collections Schema References
export const NOTIFICATION_COLLECTIONS = {
  notifications: 'notifications',
  notification_logs: 'notification_logs',
  email_notifications: 'email_notifications',
  email_logs: 'email_logs',
  email_retry_queue: 'email_retry_queue',
  user_notification_preferences: 'user_notification_preferences',
  push_tokens: 'push_tokens',
  email_templates: 'email_templates'
} as const;
