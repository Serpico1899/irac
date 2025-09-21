import { coreApp } from "../../mod.ts";
import { ObjectId } from "npm:mongodb";
import type { CreateNotificationInput } from "./createNotification.val.ts";

export const createNotificationFn = async (body: CreateNotificationInput) => {
  const {
    user_id,
    type,
    category,
    title_fa,
    title_en,
    message_fa,
    message_en,
    delivery_methods = { in_app: true },
    priority = "NORMAL",
    scheduled_at,
    expires_at,
    action_url,
    action_label_fa,
    action_label_en,
    template_data,
    email_settings,
    push_settings,
    sms_settings,
    metadata,
    auto_mark_read_after,
    auto_delete_after,
    created_by_admin = false,
    admin_id,
    bypass_user_preferences = false
  } = body;

  // Validate required content - at least one title and message must be provided
  if (!title_fa && !title_en) {
    throw new Error("At least one title (Persian or English) is required");
  }
  if (!message_fa && !message_en) {
    throw new Error("At least one message (Persian or English) is required");
  }

  // Verify user exists
  const user = await coreApp.odm.db.collection("users").findOne({
    _id: new ObjectId(user_id)
  });

  if (!user) {
    throw new Error(`User with ID ${user_id} not found`);
  }

  // Get user notification preferences (unless bypassing)
  let userPreferences = null;
  if (!bypass_user_preferences) {
    userPreferences = await coreApp.odm.db.collection("user_notification_preferences").findOne({
      user_id: new ObjectId(user_id)
    });
  }

  // Apply template data to content if provided
  const processedContent = processTemplateData({
    title_fa,
    title_en,
    message_fa,
    message_en,
    action_label_fa,
    action_label_en,
    template_data
  });

  // Determine final delivery methods based on user preferences
  const finalDeliveryMethods = determineDeliveryMethods(
    delivery_methods,
    userPreferences,
    bypass_user_preferences,
    priority
  );

  // Create notification record
  const notificationId = new ObjectId();
  const now = new Date();
  const scheduledDate = scheduled_at ? new Date(scheduled_at) : now;
  const expirationDate = expires_at ? new Date(expires_at) : null;

  const notificationDoc = {
    _id: notificationId,
    user_id: new ObjectId(user_id),
    type,
    category,
    title_fa: processedContent.title_fa,
    title_en: processedContent.title_en,
    message_fa: processedContent.message_fa,
    message_en: processedContent.message_en,
    action_url,
    action_label_fa: processedContent.action_label_fa,
    action_label_en: processedContent.action_label_en,
    delivery_methods: finalDeliveryMethods,
    priority,
    is_read: false,
    is_delivered: false,
    scheduled_at: scheduledDate,
    expires_at: expirationDate,
    template_data,
    email_settings,
    push_settings,
    sms_settings,
    metadata: {
      ...metadata,
      created_by_admin,
      admin_id: admin_id ? new ObjectId(admin_id) : null,
      bypass_user_preferences,
      user_language_preference: user.language_preference || "fa"
    },
    auto_mark_read_after,
    auto_delete_after,
    delivery_status: {
      in_app: finalDeliveryMethods.in_app ? { status: "pending", attempted_at: null, delivered_at: null } : null,
      email: finalDeliveryMethods.email ? { status: "pending", attempted_at: null, delivered_at: null, email_address: user.email } : null,
      push: finalDeliveryMethods.push ? { status: "pending", attempted_at: null, delivered_at: null } : null,
      sms: finalDeliveryMethods.sms ? { status: "pending", attempted_at: null, delivered_at: null, phone_number: user.phone } : null
    },
    created_at: now,
    updated_at: now
  };

  // Insert notification
  const result = await coreApp.odm.db.collection("notifications").insertOne(notificationDoc);

  if (!result.insertedId) {
    throw new Error("Failed to create notification");
  }

  // Handle immediate or scheduled delivery
  if (scheduledDate <= now) {
    // Deliver immediately
    await processNotificationDelivery(notificationDoc);
  } else {
    // Schedule for later delivery
    await scheduleNotificationDelivery(notificationDoc);
  }

  // Update user's unread notification count
  if (finalDeliveryMethods.in_app) {
    await coreApp.odm.db.collection("users").updateOne(
      { _id: new ObjectId(user_id) },
      {
        $inc: { unread_notifications_count: 1 },
        $set: { last_notification_at: now }
      }
    );
  }

  // Log notification creation
  await logNotificationEvent({
    notification_id: notificationId,
    user_id: new ObjectId(user_id),
    event_type: "CREATED",
    event_data: {
      type,
      category,
      priority,
      delivery_methods: finalDeliveryMethods,
      scheduled: scheduledDate > now
    }
  });

  return {
    success: true,
    notification_id: notificationId.toHexString(),
    scheduled_for: scheduledDate,
    delivery_methods: finalDeliveryMethods,
    message: "Notification created successfully"
  };
};

// Helper function to process template data
function processTemplateData(content: any): any {
  const { template_data } = content;

  if (!template_data) {
    return {
      title_fa: content.title_fa,
      title_en: content.title_en,
      message_fa: content.message_fa,
      message_en: content.message_en,
      action_label_fa: content.action_label_fa,
      action_label_en: content.action_label_en
    };
  }

  const replaceTemplateVariables = (text: string | undefined): string | undefined => {
    if (!text) return text;

    let processedText = text;

    // Replace common template variables
    if (template_data.course_name) {
      processedText = processedText.replace(/\{courseName\}/g, template_data.course_name);
    }
    if (template_data.course_name_fa) {
      processedText = processedText.replace(/\{courseName\}/g, template_data.course_name_fa);
    }
    if (template_data.course_name_en) {
      processedText = processedText.replace(/\{courseName\}/g, template_data.course_name_en);
    }
    if (template_data.amount) {
      processedText = processedText.replace(/\{amount\}/g, template_data.amount);
    }
    if (template_data.booking_date) {
      processedText = processedText.replace(/\{date\}/g, template_data.booking_date);
    }
    if (template_data.user_name) {
      processedText = processedText.replace(/\{userName\}/g, template_data.user_name);
    }

    // Replace custom fields
    if (template_data.custom_fields) {
      Object.entries(template_data.custom_fields).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        processedText = processedText.replace(regex, String(value));
      });
    }

    return processedText;
  };

  return {
    title_fa: replaceTemplateVariables(content.title_fa),
    title_en: replaceTemplateVariables(content.title_en),
    message_fa: replaceTemplateVariables(content.message_fa),
    message_en: replaceTemplateVariables(content.message_en),
    action_label_fa: replaceTemplateVariables(content.action_label_fa),
    action_label_en: replaceTemplateVariables(content.action_label_en)
  };
}

// Helper function to determine final delivery methods
function determineDeliveryMethods(
  requested: any,
  userPreferences: any,
  bypassPreferences: boolean,
  priority: string
): any {
  if (bypassPreferences || !userPreferences) {
    return {
      in_app: requested.in_app ?? true,
      email: requested.email ?? false,
      push: requested.push ?? false,
      sms: requested.sms ?? false
    };
  }

  // For urgent notifications, override some user preferences
  if (priority === "URGENT") {
    return {
      in_app: true, // Always show urgent in-app
      email: requested.email ?? userPreferences.email_notifications ?? false,
      push: requested.push ?? userPreferences.push_notifications ?? false,
      sms: requested.sms ?? (userPreferences.sms_notifications && userPreferences.urgent_sms) ?? false
    };
  }

  // Apply user preferences
  return {
    in_app: (requested.in_app ?? true) && (userPreferences.in_app_notifications ?? true),
    email: (requested.email ?? false) && (userPreferences.email_notifications ?? false),
    push: (requested.push ?? false) && (userPreferences.push_notifications ?? false),
    sms: (requested.sms ?? false) && (userPreferences.sms_notifications ?? false)
  };
}

// Helper function to process notification delivery
async function processNotificationDelivery(notification: any) {
  const deliveryPromises = [];

  // In-app delivery (update delivery status)
  if (notification.delivery_methods.in_app) {
    deliveryPromises.push(
      coreApp.odm.db.collection("notifications").updateOne(
        { _id: notification._id },
        {
          $set: {
            "delivery_status.in_app.status": "delivered",
            "delivery_status.in_app.delivered_at": new Date()
          }
        }
      )
    );
  }

  // Email delivery
  if (notification.delivery_methods.email) {
    deliveryPromises.push(deliverEmailNotification(notification));
  }

  // Push notification delivery
  if (notification.delivery_methods.push) {
    deliveryPromises.push(deliverPushNotification(notification));
  }

  // SMS delivery
  if (notification.delivery_methods.sms) {
    deliveryPromises.push(deliverSMSNotification(notification));
  }

  await Promise.allSettled(deliveryPromises);
}

// Helper function to deliver email notification
async function deliverEmailNotification(notification: any) {
  try {
    // Update status to attempting
    await coreApp.odm.db.collection("notifications").updateOne(
      { _id: notification._id },
      {
        $set: {
          "delivery_status.email.status": "attempting",
          "delivery_status.email.attempted_at": new Date()
        }
      }
    );

    // Here you would integrate with your email service
    // For now, we'll mark as delivered
    await coreApp.odm.db.collection("notifications").updateOne(
      { _id: notification._id },
      {
        $set: {
          "delivery_status.email.status": "delivered",
          "delivery_status.email.delivered_at": new Date()
        }
      }
    );

    await logNotificationEvent({
      notification_id: notification._id,
      user_id: notification.user_id,
      event_type: "EMAIL_DELIVERED",
      event_data: { email_address: notification.delivery_status.email.email_address }
    });

  } catch (error) {
    await coreApp.odm.db.collection("notifications").updateOne(
      { _id: notification._id },
      {
        $set: {
          "delivery_status.email.status": "failed",
          "delivery_status.email.error": error.message
        }
      }
    );
  }
}

// Helper function to deliver push notification
async function deliverPushNotification(notification: any) {
  try {
    await coreApp.odm.db.collection("notifications").updateOne(
      { _id: notification._id },
      {
        $set: {
          "delivery_status.push.status": "attempting",
          "delivery_status.push.attempted_at": new Date()
        }
      }
    );

    // Push notification delivery logic would go here
    await coreApp.odm.db.collection("notifications").updateOne(
      { _id: notification._id },
      {
        $set: {
          "delivery_status.push.status": "delivered",
          "delivery_status.push.delivered_at": new Date()
        }
      }
    );

    await logNotificationEvent({
      notification_id: notification._id,
      user_id: notification.user_id,
      event_type: "PUSH_DELIVERED",
      event_data: {}
    });

  } catch (error) {
    await coreApp.odm.db.collection("notifications").updateOne(
      { _id: notification._id },
      {
        $set: {
          "delivery_status.push.status": "failed",
          "delivery_status.push.error": error.message
        }
      }
    );
  }
}

// Helper function to deliver SMS notification
async function deliverSMSNotification(notification: any) {
  try {
    await coreApp.odm.db.collection("notifications").updateOne(
      { _id: notification._id },
      {
        $set: {
          "delivery_status.sms.status": "attempting",
          "delivery_status.sms.attempted_at": new Date()
        }
      }
    );

    // SMS delivery logic would go here
    await coreApp.odm.db.collection("notifications").updateOne(
      { _id: notification._id },
      {
        $set: {
          "delivery_status.sms.status": "delivered",
          "delivery_status.sms.delivered_at": new Date()
        }
      }
    );

    await logNotificationEvent({
      notification_id: notification._id,
      user_id: notification.user_id,
      event_type: "SMS_DELIVERED",
      event_data: { phone_number: notification.delivery_status.sms.phone_number }
    });

  } catch (error) {
    await coreApp.odm.db.collection("notifications").updateOne(
      { _id: notification._id },
      {
        $set: {
          "delivery_status.sms.status": "failed",
          "delivery_status.sms.error": error.message
        }
      }
    );
  }
}

// Helper function to schedule notification delivery
async function scheduleNotificationDelivery(notification: any) {
  // In a production system, you would integrate with a job queue
  // For now, we'll just log the scheduling
  await logNotificationEvent({
    notification_id: notification._id,
    user_id: notification.user_id,
    event_type: "SCHEDULED",
    event_data: {
      scheduled_for: notification.scheduled_at,
      delivery_methods: notification.delivery_methods
    }
  });
}

// Helper function to log notification events
async function logNotificationEvent(eventData: any) {
  await coreApp.odm.db.collection("notification_logs").insertOne({
    ...eventData,
    created_at: new Date()
  });
}
