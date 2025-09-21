import {
  boolean,
  enums,
  number,
  object,
  optional,
  string,
} from "https://deno.land/x/valibot@v0.36.0/mod.ts";

// Notification type enums
const notification_type_array = [
  "COURSE_ENROLLMENT",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "BOOKING_CONFIRMED",
  "BOOKING_CANCELLED",
  "CERTIFICATE_READY",
  "CERTIFICATE_ISSUED",
  "COURSE_REMINDER",
  "BOOKING_REMINDER",
  "SYSTEM_ANNOUNCEMENT",
  "PROMOTION",
  "WELCOME",
  "PASSWORD_RESET",
  "EMAIL_VERIFICATION",
  "PROFILE_UPDATE",
  "SUBSCRIPTION_EXPIRY",
  "REFUND_PROCESSED",
  "COURSE_COMPLETED"
] as const;

const notification_type_enums = enums(notification_type_array);

// Delivery method enums
const delivery_method_array = [
  "IN_APP",
  "EMAIL",
  "PUSH",
  "SMS"
] as const;

const delivery_method_enums = enums(delivery_method_array);

// Priority level enums
const priority_level_array = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT"
] as const;

const priority_level_enums = enums(priority_level_array);

// Category enums for grouping notifications
const category_array = [
  "COURSE",
  "PAYMENT",
  "BOOKING",
  "CERTIFICATE",
  "SYSTEM",
  "MARKETING",
  "SECURITY"
] as const;

const category_enums = enums(category_array);

export const createNotificationValidator = {
  details: {
    summary: "Create new notification",
    description: "Creates a new notification for a user with bilingual support and multiple delivery methods",
    tags: ["Notification"]
  },

  set: object({
    // User identification (required)
    user_id: string(),

    // Notification type and category (required)
    type: notification_type_enums,
    category: category_enums,

    // Bilingual content (at least one language required)
    title_fa: optional(string()),
    title_en: optional(string()),
    message_fa: optional(string()),
    message_en: optional(string()),

    // Delivery preferences
    delivery_methods: optional(object({
      in_app: optional(boolean()),
      email: optional(boolean()),
      push: optional(boolean()),
      sms: optional(boolean())
    })),

    // Priority and scheduling
    priority: optional(priority_level_enums),
    scheduled_at: optional(string()), // ISO date string for scheduling
    expires_at: optional(string()), // ISO date string for expiration

    // Action and navigation
    action_url: optional(string()),
    action_label_fa: optional(string()),
    action_label_en: optional(string()),

    // Template data for dynamic content
    template_data: optional(object({
      course_name: optional(string()),
      course_name_fa: optional(string()),
      course_name_en: optional(string()),
      amount: optional(string()),
      currency: optional(string()),
      booking_date: optional(string()),
      booking_time: optional(string()),
      certificate_id: optional(string()),
      user_name: optional(string()),
      deadline: optional(string()),
      custom_fields: optional(object({}))
    })),

    // Email specific settings
    email_settings: optional(object({
      subject_fa: optional(string()),
      subject_en: optional(string()),
      template_id: optional(string()),
      from_name: optional(string()),
      reply_to: optional(string()),
      attachments: optional(object({
        certificate_url: optional(string()),
        invoice_url: optional(string()),
        course_materials: optional(string())
      }))
    })),

    // Push notification settings
    push_settings: optional(object({
      badge_count: optional(number()),
      sound: optional(string()),
      icon: optional(string()),
      image: optional(string()),
      click_action: optional(string())
    })),

    // SMS settings
    sms_settings: optional(object({
      sender_id: optional(string()),
      message_type: optional(enums(["TRANSACTIONAL", "PROMOTIONAL"]))
    })),

    // Metadata
    metadata: optional(object({
      source: optional(string()),
      campaign_id: optional(string()),
      reference_id: optional(string()),
      tracking_params: optional(object({}))
    })),

    // Auto actions
    auto_mark_read_after: optional(number()), // seconds
    auto_delete_after: optional(number()), // seconds

    // Admin options
    created_by_admin: optional(boolean()),
    admin_id: optional(string()),
    bypass_user_preferences: optional(boolean()) // For critical notifications
  })
};

export type CreateNotificationInput = {
  user_id: string;
  type: typeof notification_type_array[number];
  category: typeof category_array[number];
  title_fa?: string;
  title_en?: string;
  message_fa?: string;
  message_en?: string;
  delivery_methods?: {
    in_app?: boolean;
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  priority?: typeof priority_level_array[number];
  scheduled_at?: string;
  expires_at?: string;
  action_url?: string;
  action_label_fa?: string;
  action_label_en?: string;
  template_data?: {
    course_name?: string;
    course_name_fa?: string;
    course_name_en?: string;
    amount?: string;
    currency?: string;
    booking_date?: string;
    booking_time?: string;
    certificate_id?: string;
    user_name?: string;
    deadline?: string;
    custom_fields?: Record<string, any>;
  };
  email_settings?: {
    subject_fa?: string;
    subject_en?: string;
    template_id?: string;
    from_name?: string;
    reply_to?: string;
    attachments?: {
      certificate_url?: string;
      invoice_url?: string;
      course_materials?: string;
    };
  };
  push_settings?: {
    badge_count?: number;
    sound?: string;
    icon?: string;
    image?: string;
    click_action?: string;
  };
  sms_settings?: {
    sender_id?: string;
    message_type?: "TRANSACTIONAL" | "PROMOTIONAL";
  };
  metadata?: {
    source?: string;
    campaign_id?: string;
    reference_id?: string;
    tracking_params?: Record<string, any>;
  };
  auto_mark_read_after?: number;
  auto_delete_after?: number;
  created_by_admin?: boolean;
  admin_id?: string;
  bypass_user_preferences?: boolean;
};
