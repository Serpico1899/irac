import {  coreApp  } from "@app";
import { ObjectId } from "npm:mongodb";
import { emailService, type EmailMessage } from "../../email/emailService.ts";
import type { SendEmailNotificationInput } from "./sendEmailNotification.val.ts";

export const sendEmailNotificationFn = async (body: SendEmailNotificationInput) => {
  const {
    recipient_email,
    recipient_name,
    user_id,
    template_type,
    template_id,
    language = "fa",
    subject_fa,
    subject_en,
    body_fa,
    body_en,
    html_body_fa,
    html_body_en,
    template_variables = {},
    email_format = "HTML",
    priority = "NORMAL",
    from_email = "noreply@irac.ir",
    from_name = "مرکز معماری ایراک",
    reply_to = "info@irac.ir",
    send_immediately = true,
    scheduled_at,
    attachments = [],
    track_opens = true,
    track_clicks = true,
    track_delivery = true,
    custom_headers = {},
    max_retry_attempts = 3,
    retry_delay_minutes = 5,
    require_unsubscribe_link = false,
    include_branding = true,
    campaign_id,
    utm_parameters,
    personalization_data,
    provider_settings,
    metadata,
    created_by_admin = false,
    admin_id,
    bypass_user_preferences = false,
    test_mode = false,
    test_recipient_override
  } = body;

  // Validate email address format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipient_email)) {
    throw new Error("Invalid email address format");
  }

  // Check user email preferences (unless bypassing)
  if (!bypass_user_preferences && user_id) {
    const userPrefs = await getUserEmailPreferences(user_id);
    if (userPrefs && !userPrefs.email_notifications_enabled) {
      // Check if this is a critical email type that should bypass preferences
      const criticalTypes = ["PASSWORD_RESET", "EMAIL_VERIFICATION", "PAYMENT_SUCCESS"];
      if (!criticalTypes.includes(template_type || "")) {
        return {
          success: false,
          message: "Email notifications disabled for user",
          bypassed: true
        };
      }
    }
  }

  // Generate unique email ID
  const emailId = new ObjectId();
  const now = new Date();
  const scheduledDate = scheduled_at ? new Date(scheduled_at) : now;

  // Process template and content using existing email service templates
  const emailContent = await processEmailTemplate({
    template_type,
    template_id,
    language,
    subject_fa,
    subject_en,
    body_fa,
    body_en,
    html_body_fa,
    html_body_en,
    template_variables,
    personalization_data,
    recipient_name,
    include_branding
  });

  // Add UTM parameters to links if provided
  if (utm_parameters) {
    emailContent.html_body = addUTMParametersToLinks(emailContent.html_body, utm_parameters);
  }

  // Add unsubscribe link if required
  if (require_unsubscribe_link && user_id) {
    emailContent.html_body = addUnsubscribeLink(emailContent.html_body, user_id);
  }

  // Process attachments
  const processedAttachments = await processEmailAttachments(attachments);

  // Prepare email record for database
  const emailRecord = {
    _id: emailId,
    recipient_email: test_mode && test_recipient_override ? test_recipient_override : recipient_email,
    recipient_name,
    user_id: user_id ? new ObjectId(user_id) : null,
    template_type,
    template_id,
    language,
    subject: emailContent.subject,
    body_text: emailContent.text_body,
    body_html: emailContent.html_body,
    email_format,
    priority,
    from_email,
    from_name,
    reply_to,
    scheduled_at: scheduledDate,
    attachments: processedAttachments,
    tracking: {
      track_opens,
      track_clicks,
      track_delivery,
      tracking_id: emailId.toHexString()
    },
    custom_headers,
    max_retry_attempts,
    retry_delay_minutes,
    campaign_id,
    utm_parameters,
    provider_settings,
    metadata: {
      ...metadata,
      created_by_admin,
      admin_id: admin_id ? new ObjectId(admin_id) : null,
      test_mode,
      original_recipient: test_mode ? recipient_email : null
    },
    delivery_status: {
      status: "pending",
      attempts: 0,
      last_attempt: null,
      delivered_at: null,
      opened_at: null,
      clicked_at: null,
      bounced_at: null,
      error_message: null
    },
    created_at: now,
    updated_at: now
  };

  // Save email record
  const result = await coreApp.odm.db.collection("email_notifications").insertOne(emailRecord);

  if (!result.insertedId) {
    throw new Error("Failed to create email notification record");
  }

  // Send email immediately or schedule
  if (send_immediately && scheduledDate <= now) {
    try {
      await deliverEmail(emailRecord);
    } catch (error) {
      // Update status to failed but don't throw error
      await coreApp.odm.db.collection("email_notifications").updateOne(
        { _id: emailId },
        {
          $set: {
            "delivery_status.status": "failed",
            "delivery_status.error_message": error.message,
            "delivery_status.last_attempt": now,
            "delivery_status.attempts": 1
          }
        }
      );

      // Schedule retry if configured
      if (max_retry_attempts > 1) {
        await scheduleEmailRetry(emailId, retry_delay_minutes);
      }

      throw error;
    }
  } else if (scheduledDate > now) {
    // Schedule for later delivery
    await scheduleEmailDelivery(emailRecord);
  }

  // Log email event
  await logEmailEvent({
    email_id: emailId,
    user_id: user_id ? new ObjectId(user_id) : null,
    event_type: "CREATED",
    event_data: {
      template_type,
      priority,
      scheduled: scheduledDate > now,
      test_mode
    }
  });

  return {
    success: true,
    email_id: emailId.toHexString(),
    scheduled_for: scheduledDate,
    tracking_id: emailId.toHexString(),
    message: "Email notification processed successfully"
  };
};

// Helper function to get user email preferences
async function getUserEmailPreferences(user_id: string) {
  const user = await coreApp.odm.db.collection("users").findOne({
    _id: new ObjectId(user_id)
  });

  if (!user) return null;

  // Check for specific email notification preferences
  const preferences = await coreApp.odm.db.collection("user_notification_preferences").findOne({
    user_id: new ObjectId(user_id)
  });

  return {
    email_notifications_enabled: preferences?.email_notifications ?? true,
    marketing_emails_enabled: preferences?.marketing_notifications ?? false,
    transactional_emails_enabled: preferences?.transactional_notifications ?? true
  };
}

// Helper function to process email template
async function processEmailTemplate(templateData: any) {
  const {
    template_type,
    template_id,
    language,
    subject_fa,
    subject_en,
    body_fa,
    body_en,
    html_body_fa,
    html_body_en,
    template_variables,
    personalization_data,
    recipient_name,
    include_branding
  } = templateData;

  let subject = "";
  let text_body = "";
  let html_body = "";

  // Use predefined templates or custom content
  if (template_type && !template_id) {
    const template = await getBuiltInEmailTemplate(template_type, language);
    subject = template.subject;
    text_body = template.text_body;
    html_body = template.html_body;
  } else if (template_id) {
    const customTemplate = await getCustomEmailTemplate(template_id, language);
    subject = customTemplate.subject;
    text_body = customTemplate.text_body;
    html_body = customTemplate.html_body;
  } else {
    // Use provided content
    subject = language === "fa" ? (subject_fa || subject_en || "") : (subject_en || subject_fa || "");
    text_body = language === "fa" ? (body_fa || body_en || "") : (body_en || body_fa || "");
    html_body = language === "fa" ? (html_body_fa || html_body_en || "") : (html_body_en || html_body_fa || "");
  }

  // Replace template variables
  subject = replaceTemplateVariables(subject, template_variables);
  text_body = replaceTemplateVariables(text_body, template_variables);
  html_body = replaceTemplateVariables(html_body, template_variables);

  // Add personalization
  if (personalization_data?.greeting_type && recipient_name) {
    const greeting = getPersonalizedGreeting(personalization_data.greeting_type, recipient_name, language);
    text_body = greeting + "\n\n" + text_body;
    html_body = `<p>${greeting}</p>` + html_body;
  }

  // Add branding if requested
  if (include_branding) {
    html_body = addEmailBranding(html_body, language);
  }

  // Generate text version from HTML if not provided
  if (!text_body && html_body) {
    text_body = htmlToText(html_body);
  }

  return {
    subject,
    text_body,
    html_body
  };
}

// Helper function to get built-in email templates
async function getBuiltInEmailTemplate(template_type: string, language: string) {
  // Use existing email service for certificate notifications
  if (template_type === 'CERTIFICATE_READY') {
    // Leverage existing certificate email functionality
    const baseTemplate = {
      subject: language === 'fa' ? "گواهینامه شما آماده است - {courseName}" : "Your Certificate is Ready - {courseName}",
      html_body: language === 'fa'
        ? `<div style="font-family: Vazirmatn, Arial, sans-serif; direction: rtl; text-align: right;">
             <h2>گواهینامه شما آماده است!</h2>
             <p>سلام {userName}،</p>
             <p>تبریک! گواهینامه دوره <strong>«{courseName}»</strong> شما آماده است.</p>
             <a href="/user/certificates" style="background: #168c95; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">دانلود گواهینامه</a>
           </div>`
        : `<div style="font-family: Arial, sans-serif;">
             <h2>Your Certificate is Ready!</h2>
             <p>Hello {userName},</p>
             <p>Congratulations! Your certificate for <strong>'{courseName}'</strong> is ready.</p>
             <a href="/user/certificates" style="background: #168c95; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Download Certificate</a>
           </div>`,
      text_body: language === 'fa'
        ? "سلام {userName}، گواهینامه دوره «{courseName}» شما آماده است."
        : "Hello {userName}, your certificate for '{courseName}' is ready."
    };
    return baseTemplate;
  }

  // Simplified templates for other types
  const templates: Record<string, any> = {
    COURSE_ENROLLMENT: {
      fa: {
        subject: "تایید ثبت‌نام در دوره {courseName}",
        text_body: "سلام {userName}، شما با موفقیت در دوره «{courseName}» ثبت‌نام شدید.",
        html_body: `<div style="font-family: Vazirmatn, Arial, sans-serif; direction: rtl;">
          <h2>تایید ثبت‌نام در دوره</h2>
          <p>سلام {userName}، شما با موفقیت در دوره <strong>«{courseName}»</strong> ثبت‌نام شدید.</p>
        </div>`
      },
      en: {
        subject: "Course Enrollment Confirmation - {courseName}",
        text_body: "Hello {userName}, you have successfully enrolled in '{courseName}'.",
        html_body: `<div style="font-family: Arial, sans-serif;">
          <h2>Course Enrollment Confirmation</h2>
          <p>Hello {userName}, you have successfully enrolled in <strong>'{courseName}'</strong>.</p>
        </div>`
      }
    },
    PAYMENT_SUCCESS: {
      fa: {
        subject: "تایید پرداخت - {amount} تومان",
        text_body: "سلام {userName}، پرداخت شما به مبلغ {amount} {currency} با موفقیت انجام شد.",
        html_body: `<div style="font-family: Vazirmatn, Arial, sans-serif; direction: rtl;">
          <h2>تایید پرداخت</h2>
          <p>سلام {userName}، پرداخت شما به مبلغ <strong>{amount} {currency}</strong> با موفقیت انجام شد.</p>
        </div>`
      },
      en: {
        subject: "Payment Confirmation - {amount} IRR",
        text_body: "Hello {userName}, your payment of {amount} {currency} has been processed successfully.",
        html_body: `<div style="font-family: Arial, sans-serif;">
          <h2>Payment Confirmation</h2>
          <p>Hello {userName}, your payment of <strong>{amount} {currency}</strong> has been processed successfully.</p>
        </div>`
      }
    }
  };

  const template = templates[template_type]?.[language];
  if (!template) {
    throw new Error(`Template not found: ${template_type} (${language})`);
  }

  return template;
}

// Helper function to get custom email template
async function getCustomEmailTemplate(template_id: string, language: string) {
  const template = await coreApp.odm.db.collection("email_templates").findOne({
    _id: new ObjectId(template_id)
  });

  if (!template) {
    throw new Error(`Custom template not found: ${template_id}`);
  }

  return {
    subject: language === "fa" ? template.subject_fa : template.subject_en,
    text_body: language === "fa" ? template.body_fa : template.body_en,
    html_body: language === "fa" ? template.html_body_fa : template.html_body_en
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

// Helper function to get personalized greeting
function getPersonalizedGreeting(greetingType: string, name: string, language: string): string {
  const greetings: Record<string, Record<string, string>> = {
    formal: {
      fa: `جناب آقای/سرکار خانم ${name}`,
      en: `Dear Mr./Ms. ${name}`
    },
    casual: {
      fa: `سلام ${name}`,
      en: `Hello ${name}`
    },
    none: {
      fa: "",
      en: ""
    }
  };

  return greetings[greetingType]?.[language] || "";
}

// Helper function to add email branding
function addEmailBranding(htmlContent: string, language: string): string {
  const brandingFooter = language === "fa" ? `
    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-top: 1px solid #dee2e6; text-align: center;">
      <img src="https://irac.ir/logo.png" alt="IRAC" style="height: 40px; margin-bottom: 10px;">
      <p style="margin: 0; color: #6c757d; font-size: 14px;">
        مرکز معماری اسلامی ایراک<br>
        تهران، خیابان فلسطین جنوبی<br>
        تلفن: ۰۲۱-۶۶۴۸۴۰۰۶ | ایمیل: info@irac.ir
      </p>
    </div>
  ` : `
    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-top: 1px solid #dee2e6; text-align: center;">
      <img src="https://irac.ir/logo.png" alt="IRAC" style="height: 40px; margin-bottom: 10px;">
      <p style="margin: 0; color: #6c757d; font-size: 14px;">
        Iranian Architecture Center<br>
        Tehran, South Palestine Street<br>
        Phone: +98-21-66484006 | Email: info@irac.ir
      </p>
    </div>
  `;

  return htmlContent + brandingFooter;
}

// Helper function to convert HTML to text
function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to add UTM parameters to links
function addUTMParametersToLinks(html: string, utm: any): string {
  const utmString = Object.entries(utm)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

  return html.replace(/href="([^"]*)"(?![^<]*<\/a>)/g, (match, url) => {
    const separator = url.includes('?') ? '&' : '?';
    return `href="${url}${separator}${utmString}"`;
  });
}

// Helper function to add unsubscribe link
function addUnsubscribeLink(html: string, user_id: string): string {
  const unsubscribeUrl = `https://irac.ir/unsubscribe?user=${user_id}`;
  const unsubscribeLink = `
    <div style="margin-top: 20px; padding: 10px; font-size: 12px; color: #6c757d; text-align: center;">
      <a href="${unsubscribeUrl}" style="color: #6c757d;">لغو اشتراک</a> |
      <a href="${unsubscribeUrl}" style="color: #6c757d;">Unsubscribe</a>
    </div>
  `;

  return html + unsubscribeLink;
}

// Helper function to process email attachments
async function processEmailAttachments(attachments: any[]): Promise<any[]> {
  const processed = [];

  for (const attachment of attachments) {
    const processedAttachment = {
      ...attachment,
      processed_at: new Date(),
      status: "ready"
    };

    // Here you would handle file validation, virus scanning, etc.
    processed.push(processedAttachment);
  }

  return processed;
}

// Helper function to deliver email
async function deliverEmail(emailRecord: any) {
  const now = new Date();

  try {
    // Update status to attempting
    await coreApp.odm.db.collection("email_notifications").updateOne(
      { _id: emailRecord._id },
      {
        $set: {
          "delivery_status.status": "attempting",
          "delivery_status.last_attempt": now,
          "delivery_status.attempts": emailRecord.delivery_status.attempts + 1
        }
      }
    );

    // Here you would integrate with actual email service provider
    // For now, simulate successful delivery
    const deliveryResult = await sendEmailViaProvider(emailRecord);

    if (deliveryResult.success) {
      await coreApp.odm.db.collection("email_notifications").updateOne(
        { _id: emailRecord._id },
        {
          $set: {
            "delivery_status.status": "delivered",
            "delivery_status.delivered_at": now,
            "delivery_status.provider_id": deliveryResult.provider_id
          }
        }
      );

      await logEmailEvent({
        email_id: emailRecord._id,
        user_id: emailRecord.user_id,
        event_type: "DELIVERED",
        event_data: {
          provider: deliveryResult.provider,
          provider_id: deliveryResult.provider_id
        }
      });
    } else {
      throw new Error(deliveryResult.error || "Delivery failed");
    }

  } catch (error) {
    await coreApp.odm.db.collection("email_notifications").updateOne(
      { _id: emailRecord._id },
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

// Helper function to send email via existing email service
async function sendEmailViaProvider(emailRecord: any): Promise<any> {
  try {
    const emailMessage: EmailMessage = {
      to: emailRecord.recipient_email,
      subject: emailRecord.subject,
      html: emailRecord.body_html,
      text: emailRecord.body_text,
      attachments: emailRecord.attachments?.map((att: any) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.mime_type
      }))
    };

    const response = await emailService.sendEmail(emailMessage);

    return {
      success: response.success,
      provider: "existing_service",
      provider_id: response.message_id,
      error: response.error
    };
  } catch (error) {
    return {
      success: false,
      provider: "existing_service",
      error: error.message
    };
  }
}

// Helper function to schedule email delivery
async function scheduleEmailDelivery(emailRecord: any) {
  await logEmailEvent({
    email_id: emailRecord._id,
    user_id: emailRecord.user_id,
    event_type: "SCHEDULED",
    event_data: {
      scheduled_for: emailRecord.scheduled_at
    }
  });
}

// Helper function to schedule email retry
async function scheduleEmailRetry(emailId: ObjectId, delayMinutes: number) {
  const retryAt = new Date(Date.now() + (delayMinutes * 60 * 1000));

  await coreApp.odm.db.collection("email_retry_queue").insertOne({
    email_id: emailId,
    retry_at: retryAt,
    created_at: new Date()
  });
}

// Helper function to log email events
async function logEmailEvent(eventData: any) {
  try {
    await coreApp.odm.db.collection("email_logs").insertOne({
      ...eventData,
      created_at: new Date()
    });
  } catch (error) {
    console.error("Failed to log email event:", error);
  }
}
