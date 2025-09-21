import {
  array,
  boolean,
  enums,
  number,
  object,
  optional,
  string,
} from "https://deno.land/x/valibot@v0.36.0/mod.ts";

// Email template type enums
const email_template_array = [
  "COURSE_ENROLLMENT",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "BOOKING_CONFIRMED",
  "BOOKING_CANCELLED",
  "CERTIFICATE_READY",
  "COURSE_REMINDER",
  "BOOKING_REMINDER",
  "PASSWORD_RESET",
  "EMAIL_VERIFICATION",
  "WELCOME",
  "NEWSLETTER",
  "PROMOTION",
  "SYSTEM_ANNOUNCEMENT",
  "CUSTOM"
] as const;

const email_template_enums = enums(email_template_array);

// Email priority enums
const email_priority_array = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
const email_priority_enums = enums(email_priority_array);

// Email format enums
const email_format_array = ["HTML", "TEXT", "BOTH"] as const;
const email_format_enums = enums(email_format_array);

// Attachment type enums
const attachment_type_array = [
  "CERTIFICATE",
  "INVOICE",
  "COURSE_MATERIALS",
  "IMAGE",
  "DOCUMENT",
  "OTHER"
] as const;
const attachment_type_enums = enums(attachment_type_array);

// Language enums
const language_array = ["fa", "en"] as const;
const language_enums = enums(language_array);

export const sendEmailNotificationValidator = {
  details: {
    summary: "Send email notification",
    description: "Send email notification with bilingual template support and attachments",
    tags: ["Notification", "Email"]
  },

  set: object({
    // Recipient information (required)
    recipient_email: string(),
    recipient_name: optional(string()),
    user_id: optional(string()), // For tracking purposes

    // Email template or custom content
    template_type: optional(email_template_enums),
    template_id: optional(string()), // Custom template ID

    // Language preference
    language: optional(language_enums),

    // Email content (bilingual support)
    subject_fa: optional(string()),
    subject_en: optional(string()),
    body_fa: optional(string()),
    body_en: optional(string()),

    // HTML content (optional, for rich emails)
    html_body_fa: optional(string()),
    html_body_en: optional(string()),

    // Template variables for dynamic content
    template_variables: optional(object({
      user_name: optional(string()),
      course_name: optional(string()),
      course_name_fa: optional(string()),
      course_name_en: optional(string()),
      booking_date: optional(string()),
      booking_time: optional(string()),
      amount: optional(string()),
      currency: optional(string()),
      certificate_id: optional(string()),
      verification_code: optional(string()),
      reset_link: optional(string()),
      login_link: optional(string()),
      expiration_date: optional(string()),
      custom_fields: optional(object({}))
    })),

    // Email settings
    email_format: optional(email_format_enums),
    priority: optional(email_priority_enums),

    // Sender configuration
    from_email: optional(string()),
    from_name: optional(string()),
    reply_to: optional(string()),

    // Scheduling options
    send_immediately: optional(boolean()),
    scheduled_at: optional(string()), // ISO date string

    // Attachments
    attachments: optional(array(object({
      type: attachment_type_enums,
      filename: string(),
      url: optional(string()), // URL to download file
      content: optional(string()), // Base64 encoded content
      mime_type: optional(string()),
      size: optional(number()) // Size in bytes
    }))),

    // Tracking options
    track_opens: optional(boolean()),
    track_clicks: optional(boolean()),
    track_delivery: optional(boolean()),

    // Email headers
    custom_headers: optional(object({
      "X-Campaign-ID": optional(string()),
      "X-Source": optional(string()),
      "X-Priority": optional(string()),
      "X-Notification-Type": optional(string())
    })),

    // Retry configuration
    max_retry_attempts: optional(number()),
    retry_delay_minutes: optional(number()),

    // Email content validation
    require_unsubscribe_link: optional(boolean()),
    include_branding: optional(boolean()),

    // Campaign and analytics
    campaign_id: optional(string()),
    utm_parameters: optional(object({
      utm_source: optional(string()),
      utm_medium: optional(string()),
      utm_campaign: optional(string()),
      utm_term: optional(string()),
      utm_content: optional(string())
    })),

    // Personalization
    personalization_data: optional(object({
      greeting_type: optional(string()), // "formal", "casual", "none"
      include_user_preferences: optional(boolean()),
      locale_specific_formatting: optional(boolean())
    })),

    // Email service provider options
    provider_settings: optional(object({
      provider: optional(string()), // "sendgrid", "mailgun", "ses", etc.
      template_id: optional(string()),
      tag: optional(string()),
      category: optional(string()),
      batch_id: optional(string())
    })),

    // Metadata
    metadata: optional(object({
      source: optional(string()),
      reference_id: optional(string()),
      context: optional(string()),
      tags: optional(array(string()))
    })),

    // Admin options
    created_by_admin: optional(boolean()),
    admin_id: optional(string()),
    bypass_user_preferences: optional(boolean()), // For critical emails

    // Testing options
    test_mode: optional(boolean()),
    test_recipient_override: optional(string())
  })
};

export type SendEmailNotificationInput = {
  recipient_email: string;
  recipient_name?: string;
  user_id?: string;
  template_type?: typeof email_template_array[number];
  template_id?: string;
  language?: typeof language_array[number];
  subject_fa?: string;
  subject_en?: string;
  body_fa?: string;
  body_en?: string;
  html_body_fa?: string;
  html_body_en?: string;
  template_variables?: {
    user_name?: string;
    course_name?: string;
    course_name_fa?: string;
    course_name_en?: string;
    booking_date?: string;
    booking_time?: string;
    amount?: string;
    currency?: string;
    certificate_id?: string;
    verification_code?: string;
    reset_link?: string;
    login_link?: string;
    expiration_date?: string;
    custom_fields?: Record<string, any>;
  };
  email_format?: typeof email_format_array[number];
  priority?: typeof email_priority_array[number];
  from_email?: string;
  from_name?: string;
  reply_to?: string;
  send_immediately?: boolean;
  scheduled_at?: string;
  attachments?: Array<{
    type: typeof attachment_type_array[number];
    filename: string;
    url?: string;
    content?: string;
    mime_type?: string;
    size?: number;
  }>;
  track_opens?: boolean;
  track_clicks?: boolean;
  track_delivery?: boolean;
  custom_headers?: {
    "X-Campaign-ID"?: string;
    "X-Source"?: string;
    "X-Priority"?: string;
    "X-Notification-Type"?: string;
  };
  max_retry_attempts?: number;
  retry_delay_minutes?: number;
  require_unsubscribe_link?: boolean;
  include_branding?: boolean;
  campaign_id?: string;
  utm_parameters?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  personalization_data?: {
    greeting_type?: string;
    include_user_preferences?: boolean;
    locale_specific_formatting?: boolean;
  };
  provider_settings?: {
    provider?: string;
    template_id?: string;
    tag?: string;
    category?: string;
    batch_id?: string;
  };
  metadata?: {
    source?: string;
    reference_id?: string;
    context?: string;
    tags?: string[];
  };
  created_by_admin?: boolean;
  admin_id?: string;
  bypass_user_preferences?: boolean;
  test_mode?: boolean;
  test_recipient_override?: string;
};
