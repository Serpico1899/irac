import { type ActFn } from "@deps";
import { smsService } from "../smsService.ts";

// Certificate notification SMS templates
const CERTIFICATE_SMS_TEMPLATES = {
  certificate_issued: (data: CertificateNotificationData) => {
    const { studentName, courseName, certificateNumber, certificateUrl, verificationUrl } = data;
    return `${studentName} عزیز

🎉 تبریک! گواهینامه شما آماده است

📚 دوره: ${courseName}
📜 شماره گواهینامه: ${certificateNumber}
${certificateUrl ? `📥 دانلود: ${certificateUrl}` : ''}
${verificationUrl ? `🔍 تایید: ${verificationUrl}` : ''}

گواهینامه معتبر و قابل تایید است.
مرکز معماری ایرانی - IRAC`;
  },

  certificate_ready: (data: CertificateNotificationData) => {
    const { studentName, courseName, certificateNumber } = data;
    return `${studentName} عزیز

✅ دوره "${courseName}" با موفقیت تکمیل شد

📜 گواهینامه شماره ${certificateNumber} صادر گردید
🏆 از حساب کاربری خود دانلود کنید

از شرکت شما متشکریم
مرکز معماری ایرانی`;
  },

  certificate_reminder: (data: CertificateNotificationData) => {
    const { studentName, courseName } = data;
    return `${studentName} عزیز

یادآوری: گواهینامه دوره "${courseName}" در انتظار دانلود شماست

🔗 وارد حساب کاربری شوید
📱 بخش گواهینامه‌ها > دانلود

مرکز معماری ایرانی`;
  }
};

interface CertificateNotificationData {
  phoneNumber: string;
  userId: string;
  certificateNumber: string;
  courseName: string;
  courseNameEn?: string;
  studentName: string;
  studentNameEn?: string;
  certificateUrl?: string;
  verificationUrl?: string;
  completionDate?: string;
  notificationType?: string;
  customMessage?: string;
  includeDownloadLink?: string;
  includeVerificationLink?: string;
}

export const sendCertificateNotificationAct: ActFn = async (body) => {
  try {
    const {
      phone_number,
      user_id,
      certificate_number,
      course_name,
      course_name_en,
      student_name,
      student_name_en,
      certificate_url,
      verification_url,
      completion_date,
      notification_type = "certificate_issued",
      custom_message,
      include_download_link,
      include_verification_link
    } = body.details.set;

    // Validate phone number format
    if (!phone_number || typeof phone_number !== 'string') {
      return {
        success: false,
        message: "Valid phone number is required",
        details: { field: "phone_number", provided: phone_number }
      };
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhoneNumber = phone_number.replace(/[\s\-\(\)]/g, '');

    // Validate Iranian phone number format
    if (!cleanPhoneNumber.match(/^(\+98|0098|98|0)?9\d{9}$/)) {
      return {
        success: false,
        message: "Invalid Iranian phone number format",
        details: { phone_number: cleanPhoneNumber }
      };
    }

    // Normalize phone number to Iranian format
    let normalizedPhone = cleanPhoneNumber;
    if (normalizedPhone.startsWith('+98')) {
      normalizedPhone = '0' + normalizedPhone.slice(3);
    } else if (normalizedPhone.startsWith('0098')) {
      normalizedPhone = '0' + normalizedPhone.slice(4);
    } else if (normalizedPhone.startsWith('98')) {
      normalizedPhone = '0' + normalizedPhone.slice(2);
    } else if (!normalizedPhone.startsWith('0')) {
      normalizedPhone = '0' + normalizedPhone;
    }

    // Prepare notification data
    const notificationData: CertificateNotificationData = {
      phoneNumber: normalizedPhone,
      userId: user_id,
      certificateNumber: certificate_number,
      courseName: course_name,
      courseNameEn: course_name_en,
      studentName: student_name,
      studentNameEn: student_name_en,
      certificateUrl: certificate_url,
      verificationUrl: verification_url,
      completionDate: completion_date,
      notificationType: notification_type,
      customMessage: custom_message,
      includeDownloadLink: include_download_link,
      includeVerificationLink: include_verification_link
    };

    // Generate SMS message
    let smsMessage: string;

    if (custom_message) {
      // Use custom message if provided
      smsMessage = custom_message;
    } else {
      // Use template based on notification type
      const template = CERTIFICATE_SMS_TEMPLATES[notification_type as keyof typeof CERTIFICATE_SMS_TEMPLATES];
      if (!template) {
        return {
          success: false,
          message: `Invalid notification type: ${notification_type}`,
          details: { notification_type, available_types: Object.keys(CERTIFICATE_SMS_TEMPLATES) }
        };
      }
      smsMessage = template(notificationData);
    }

    // Send SMS using SMS service
    const smsResult = await smsService.sendSMS({
      to: normalizedPhone,
      message: smsMessage
    });

    if (!smsResult.success) {
      console.error('Failed to send certificate notification SMS:', smsResult);
      return {
        success: false,
        message: "Failed to send SMS notification",
        details: {
          sms_error: smsResult.error || "Unknown SMS service error",
          phone_number: normalizedPhone,
          certificate_number
        }
      };
    }

    // Log successful notification
    console.log(`Certificate notification SMS sent successfully:`, {
      phone_number: normalizedPhone,
      user_id,
      certificate_number,
      course_name,
      notification_type,
      message_id: smsResult.messageId,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      body: {
        notification_sent: true,
        phone_number: normalizedPhone,
        certificate_number,
        message_id: smsResult.message_id,
        notification_type,
        sent_at: new Date().toISOString(),
        message_preview: smsMessage.substring(0, 100) + (smsMessage.length > 100 ? '...' : ''),
        delivery_status: smsResult.status || 'sent'
      },
      message: `Certificate notification sent successfully to ${normalizedPhone}`
    };

  } catch (error) {
    console.error('Error in sendCertificateNotification:', error);

    return {
      success: false,
      message: "Internal server error while sending certificate notification",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.details.set.user_id,
        certificate_number: body.details.set.certificate_number,
        phone_number: body.details.set.phone_number
      }
    };
  }
};
