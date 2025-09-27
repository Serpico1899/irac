import {  coreApp  } from "@app";
import { ObjectId } from "npm:mongodb";
import { smsService, type SMSMessage } from "../../sms/smsService.ts";

export interface SendSMSNotificationInput {
  recipient_phone: string;
  user_id?: string;
  template_type?: string;
  language?: "fa" | "en";
  message_fa?: string;
  message_en?: string;
  template_variables?: {
    user_name?: string;
    course_name?: string;
    course_name_fa?: string;
    course_name_en?: string;
    booking_date?: string;
    booking_time?: string;
    amount?: string;
    currency?: string;
    verification_code?: string;
    transaction_id?: string;
    deadline?: string;
    custom_fields?: Record<string, any>;
  };
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  scheduled_at?: string;
  template_id?: string;
  metadata?: {
    source?: string;
    reference_id?: string;
    context?: string;
    notification_id?: string;
  };
  bypass_user_preferences?: boolean;
  created_by_admin?: boolean;
  admin_id?: string;
  test_mode?: boolean;
  test_recipient_override?: string;
}

export const sendSMSNotificationFn = async (body: SendSMSNotificationInput) => {
  const {
    recipient_phone,
    user_id,
    template_type,
    language = "fa",
    message_fa,
    message_en,
    template_variables = {},
    priority = "NORMAL",
    scheduled_at,
    template_id,
    metadata,
    bypass_user_preferences = false,
    created_by_admin = false,
    admin_id,
    test_mode = false,
    test_recipient_override
  } = body;

  // Validate Iranian phone number format
  const phoneRegex = /^(\+98|0)?9\d{9}$/;
  if (!phoneRegex.test(recipient_phone.replace(/\s/g, ''))) {
    throw new Error("Invalid Iranian phone number format");
  }

  // Check user SMS preferences (unless bypassing)
  if (!bypass_user_preferences && user_id) {
    const userPrefs = await getUserSMSPreferences(user_id);
    if (userPrefs && !userPrefs.sms_notifications_enabled) {
      // Check if this is a critical SMS type that should bypass preferences
      const criticalTypes = ["PASSWORD_RESET", "2FA_CODE", "PAYMENT_FAILED"];
      if (!criticalTypes.includes(template_type || "")) {
        return {
          success: false,
          message: "SMS notifications disabled for user",
          bypassed: true
        };
      }
    }
  }

  // Generate unique SMS ID
  const smsId = new ObjectId();
  const now = new Date();
  const scheduledDate = scheduled_at ? new Date(scheduled_at) : now;

  // Process template and content
  const smsContent = await processSMSTemplate({
    template_type,
    template_id,
    language,
    message_fa,
    message_en,
    template_variables
  });

  // Clean phone number for sending
  const cleanPhone = recipient_phone.replace(/\s/g, '').replace(/^\+98/, '0');
  const finalRecipient = test_mode && test_recipient_override
    ? test_recipient_override
    : cleanPhone;

  // Prepare SMS record for database
  const smsRecord = {
    _id: smsId,
    recipient_phone: finalRecipient,
    user_id: user_id ? new ObjectId(user_id) : null,
    template_type,
    template_id,
    language,
    message: smsContent.message,
    priority,
    scheduled_at: scheduledDate,
    metadata: {
      ...metadata,
      created_by_admin,
      admin_id: admin_id ? new ObjectId(admin_id) : null,
      test_mode,
      original_recipient: test_mode ? recipient_phone : null,
      character_count: smsContent.message.length,
      estimated_parts: Math.ceil(smsContent.message.length / 70) // Standard SMS length
    },
    delivery_status: {
      status: "pending",
      attempts: 0,
      last_attempt: null,
      delivered_at: null,
      error_message: null,
      cost: null
    },
    created_at: now,
    updated_at: now
  };

  // Save SMS record
  const result = await coreApp.odm.db.collection("sms_notifications").insertOne(smsRecord);

  if (!result.insertedId) {
    throw new Error("Failed to create SMS notification record");
  }

  // Send SMS immediately or schedule
  if (scheduledDate <= now) {
    try {
      await deliverSMS(smsRecord);
    } catch (error) {
      // Update status to failed but don't throw error
      await coreApp.odm.db.collection("sms_notifications").updateOne(
        { _id: smsId },
        {
          $set: {
            "delivery_status.status": "failed",
            "delivery_status.error_message": error.message,
            "delivery_status.last_attempt": now,
            "delivery_status.attempts": 1
          }
        }
      );

      throw error;
    }
  } else {
    // Schedule for later delivery
    await scheduleSMSDelivery(smsRecord);
  }

  // Log SMS event
  await logSMSEvent({
    sms_id: smsId,
    user_id: user_id ? new ObjectId(user_id) : null,
    event_type: "CREATED",
    event_data: {
      template_type,
      priority,
      scheduled: scheduledDate > now,
      test_mode,
      character_count: smsContent.message.length
    }
  });

  return {
    success: true,
    sms_id: smsId.toHexString(),
    scheduled_for: scheduledDate,
    character_count: smsContent.message.length,
    estimated_cost: Math.ceil(smsContent.message.length / 70) * 50, // Estimated cost in IRR
    message: "SMS notification processed successfully"
  };
};

// Helper function to get user SMS preferences
async function getUserSMSPreferences(user_id: string) {
  const user = await coreApp.odm.db.collection("users").findOne({
    _id: new ObjectId(user_id)
  });

  if (!user) return null;

  const preferences = await coreApp.odm.db.collection("user_notification_preferences").findOne({
    user_id: new ObjectId(user_id)
  });

  return {
    sms_notifications_enabled: preferences?.sms_notifications ?? false,
    urgent_sms_enabled: preferences?.urgent_sms ?? true
  };
}

// Helper function to process SMS template
async function processSMSTemplate(templateData: any) {
  const {
    template_type,
    template_id,
    language,
    message_fa,
    message_en,
    template_variables
  } = templateData;

  let message = "";

  // Use predefined templates or custom content
  if (template_type && !template_id) {
    const template = await getBuiltInSMSTemplate(template_type, language);
    message = template.message;
  } else if (template_id) {
    const customTemplate = await getCustomSMSTemplate(template_id, language);
    message = customTemplate.message;
  } else {
    // Use provided content
    message = language === "fa" ? (message_fa || message_en || "") : (message_en || message_fa || "");
  }

  // Replace template variables
  message = replaceTemplateVariables(message, template_variables);

  // Ensure message length is reasonable for SMS
  if (message.length > 612) { // 9 SMS parts max
    message = message.substring(0, 609) + "...";
  }

  return { message };
}

// Helper function to get built-in SMS templates
async function getBuiltInSMSTemplate(template_type: string, language: string) {
  const templates: Record<string, any> = {
    COURSE_ENROLLMENT: {
      fa: {
        message: "سلام {userName}، شما در دوره {courseName} ثبت‌نام شدید. شروع: {startDate}. ایراک"
      },
      en: {
        message: "Hello {userName}, you've enrolled in {courseName}. Start: {startDate}. IRAC"
      }
    },
    PAYMENT_SUCCESS: {
      fa: {
        message: "سلام {userName}، پرداخت {amount} تومان شما موفق بود. کد پیگیری: {transactionId}. ایراک"
      },
      en: {
        message: "Hello {userName}, your payment of {amount} IRR was successful. Ref: {transactionId}. IRAC"
      }
    },
    BOOKING_REMINDER: {
      fa: {
        message: "سلام {userName}، رزرو شما فردا {bookingTime} است. آدرس: ایراک، خیابان فلسطین. تلفن: ۰۲۱۶۶۴۸۴۰۰۶"
      },
      en: {
        message: "Hello {userName}, your booking is tomorrow at {bookingTime}. Address: IRAC, Palestine St. Tel: 021-66484006"
      }
    },
    PASSWORD_RESET: {
      fa: {
        message: "کد بازیابی رمز عبور شما: {verificationCode}. این کد تا 10 دقیقه معتبر است. ایراک"
      },
      en: {
        message: "Your password reset code: {verificationCode}. Valid for 10 minutes. IRAC"
      }
    },
    CERTIFICATE_READY: {
      fa: {
        message: "گواهینامه دوره {courseName} شما آماده است. برای دانلود به پنل کاربری مراجعه کنید. ایراک"
      },
      en: {
        message: "Your certificate for {courseName} is ready. Visit your dashboard to download. IRAC"
      }
    },
    BOOKING_CONFIRMED: {
      fa: {
        message: "رزرو شما تایید شد. تاریخ: {bookingDate} ساعت: {bookingTime}. آدرس: ایراک، فلسطین. ۰۲۱۶۶۴۸۴۰۰۶"
      },
      en: {
        message: "Booking confirmed. Date: {bookingDate} Time: {bookingTime}. Address: IRAC, Palestine St. 021-66484006"
      }
    }
  };

  const template = templates[template_type]?.[language];
  if (!template) {
    throw new Error(`SMS template not found: ${template_type} (${language})`);
  }

  return template;
}

// Helper function to get custom SMS template
async function getCustomSMSTemplate(template_id: string, language: string) {
  const template = await coreApp.odm.db.collection("sms_templates").findOne({
    _id: new ObjectId(template_id)
  });

  if (!template) {
    throw new Error(`Custom SMS template not found: ${template_id}`);
  }

  return {
    message: language === "fa" ? template.message_fa : template.message_en
  };
}

// Helper function to replace template variables
function replaceTemplateVariables(content: string, variables: any): string {
  if (!content || !variables) return content;

  let processed = content;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    processed = processed.replace(regex, String(value || ''));
  });

  return processed;
}

// Helper function to deliver SMS using existing SMS service
async function deliverSMS(smsRecord: any) {
  const now = new Date();

  try {
    // Update status to attempting
    await coreApp.odm.db.collection("sms_notifications").updateOne(
      { _id: smsRecord._id },
      {
        $set: {
          "delivery_status.status": "attempting",
          "delivery_status.last_attempt": now,
          "delivery_status.attempts": smsRecord.delivery_status.attempts + 1
        }
      }
    );

    // Use existing SMS service to send
    const smsMessage: SMSMessage = {
      to: smsRecord.recipient_phone,
      message: smsRecord.message
    };

    const deliveryResult = await smsService.sendSMS(smsMessage);

    if (deliveryResult.success) {
      await coreApp.odm.db.collection("sms_notifications").updateOne(
        { _id: smsRecord._id },
        {
          $set: {
            "delivery_status.status": "delivered",
            "delivery_status.delivered_at": now,
            "delivery_status.cost": deliveryResult.cost || 0,
            "delivery_status.provider_message_id": deliveryResult.message_id
          }
        }
      );

      await logSMSEvent({
        sms_id: smsRecord._id,
        user_id: smsRecord.user_id,
        event_type: "DELIVERED",
        event_data: {
          cost: deliveryResult.cost,
          provider_message_id: deliveryResult.message_id,
          character_count: smsRecord.message.length
        }
      });
    } else {
      throw new Error(deliveryResult.error || "SMS delivery failed");
    }

  } catch (error) {
    await coreApp.odm.db.collection("sms_notifications").updateOne(
      { _id: smsRecord._id },
      {
        $set: {
          "delivery_status.status": "failed",
          "delivery_status.error_message": error.message
        }
      }
    );

    throw error;
  }
}

// Helper function to schedule SMS delivery
async function scheduleSMSDelivery(smsRecord: any) {
  await logSMSEvent({
    sms_id: smsRecord._id,
    user_id: smsRecord.user_id,
    event_type: "SCHEDULED",
    event_data: {
      scheduled_for: smsRecord.scheduled_at,
      character_count: smsRecord.message.length
    }
  });
}

// Helper function to log SMS events
async function logSMSEvent(eventData: any) {
  try {
    await coreApp.odm.db.collection("sms_logs").insertOne({
      ...eventData,
      created_at: new Date()
    });
  } catch (error) {
    console.error("Failed to log SMS event:", error);
    // Don't throw error as logging is not critical
  }
}
