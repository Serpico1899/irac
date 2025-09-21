import { type ActFn } from "@deps";
import { emailService, type CertificateEmailData } from "../emailService.ts";

export const sendCertificateEmailNotificationAct: ActFn = async (body) => {
  try {
    const {
      email,
      user_id,
      certificate_number,
      course_name,
      course_name_en,
      student_name,
      student_name_en,
      certificate_url,
      verification_url,
      completion_date,
      certificate_issue_date,
      notification_type = "certificate_issued",
      instructor_name,
      instructor_name_en,
      final_grade,
      locale = "fa",
      custom_subject,
      custom_html,
      custom_text,
      include_download_link,
      include_verification_link,
      cc_emails,
      bcc_emails,
      reply_to
    } = body.details.set;

    // Validate email address format
    if (!email || typeof email !== 'string') {
      return {
        success: false,
        message: "Valid email address is required",
        details: { field: "email", provided: email }
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Invalid email address format",
        details: { email }
      };
    }

    // Validate required certificate information
    if (!certificate_number || !course_name || !student_name) {
      return {
        success: false,
        message: "Certificate number, course name, and student name are required",
        details: {
          certificate_number: !!certificate_number,
          course_name: !!course_name,
          student_name: !!student_name
        }
      };
    }

    // Prepare certificate email data
    const certificateEmailData: CertificateEmailData = {
      student_name,
      student_name_en,
      student_email: email,
      course_name,
      course_name_en,
      certificate_number,
      certificate_issue_date: certificate_issue_date || new Date().toISOString(),
      download_url: certificate_url || `${(globalThis as any).Deno?.env?.get("FRONTEND_URL") || "https://irac.ir"}/user/certificates/download/${certificate_number}`,
      verification_url: verification_url || `${(globalThis as any).Deno?.env?.get("FRONTEND_URL") || "https://irac.ir"}/verify-certificate?id=${certificate_number}`,
      instructor_name,
      instructor_name_en,
      completion_date,
      final_grade: final_grade ? parseFloat(final_grade) : undefined,
      locale
    };

    // Send email using email service
    let emailResult;

    if (custom_html || custom_text || custom_subject) {
      // Send custom email
      const emailMessage = {
        to: email,
        cc: cc_emails ? cc_emails.split(',').map(e => e.trim()) : undefined,
        bcc: bcc_emails ? bcc_emails.split(',').map(e => e.trim()) : undefined,
        subject: custom_subject || (locale === 'fa'
          ? `🎉 گواهینامه شما آماده است - ${course_name}`
          : `🎉 Your Certificate is Ready - ${course_name_en || course_name}`),
        html: custom_html,
        text: custom_text
      };

      emailResult = await emailService.sendEmail(emailMessage);
    } else {
      // Send using certificate notification template
      emailResult = await emailService.sendCertificateNotification(certificateEmailData);
    }

    if (!emailResult.success) {
      console.error('Failed to send certificate notification email:', emailResult);
      return {
        success: false,
        message: "Failed to send email notification",
        details: {
          email_error: emailResult.error || "Unknown email service error",
          email_address: email,
          certificate_number
        }
      };
    }

    // Log successful notification
    console.log(`Certificate notification email sent successfully:`, {
      email,
      user_id,
      certificate_number,
      course_name,
      notification_type,
      message_id: emailResult.message_id,
      timestamp: new Date().toISOString()
    });

    // Prepare success response
    const responseData = {
      notification_sent: true,
      email_address: email,
      certificate_number,
      message_id: emailResult.message_id,
      notification_type,
      sent_at: new Date().toISOString(),
      delivery_status: emailResult.status || 'sent',
      locale,
      download_url: certificateEmailData.download_url,
      verification_url: certificateEmailData.verification_url
    };

    // Add additional information if available
    if (cc_emails) responseData['cc_recipients'] = cc_emails.split(',').length;
    if (bcc_emails) responseData['bcc_recipients'] = bcc_emails.split(',').length;
    if (custom_subject || custom_html || custom_text) responseData['custom_template'] = true;

    return {
      success: true,
      body: responseData,
      message: `Certificate notification email sent successfully to ${email}`
    };

  } catch (error) {
    console.error('Error in sendCertificateEmailNotification:', error);

    return {
      success: false,
      message: "Internal server error while sending certificate email notification",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.details.set.user_id,
        certificate_number: body.details.set.certificate_number,
        email: body.details.set.email
      }
    };
  }
};
