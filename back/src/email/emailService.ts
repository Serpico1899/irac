import { crypto } from "@deps";

export interface EmailConfig {
  provider: "smtp" | "sendgrid" | "mailgun" | "ses" | "mock";
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  smtp_user?: string;
  smtp_password?: string;
  api_key?: string;
  from_email: string;
  from_name?: string;
  base_url?: string;
}

export interface EmailMessage {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template_id?: string;
  template_data?: Record<string, any>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Uint8Array;
  contentType?: string;
  encoding?: string;
  cid?: string; // Content-ID for inline images
}

export interface EmailResponse {
  success: boolean;
  message_id?: string;
  status?: string;
  error?: string;
  provider_response?: any;
}

export interface CertificateEmailData {
  student_name: string;
  student_name_en?: string;
  student_email: string;
  course_name: string;
  course_name_en?: string;
  certificate_number: string;
  certificate_issue_date: string;
  download_url: string;
  verification_url: string;
  instructor_name?: string;
  instructor_name_en?: string;
  completion_date?: string;
  final_grade?: number;
  locale?: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Send email message
   */
  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    try {
      // Validate email addresses
      const toEmails = Array.isArray(message.to) ? message.to : [message.to];
      for (const email of toEmails) {
        if (!this.validateEmail(email)) {
          return {
            success: false,
            error: `Invalid email address: ${email}`
          };
        }
      }

      // Validate required fields
      if (!message.subject || message.subject.trim() === '') {
        return {
          success: false,
          error: "Subject is required"
        };
      }

      if (!message.html && !message.text) {
        return {
          success: false,
          error: "Either HTML or text content is required"
        };
      }

      // Send based on provider
      switch (this.config.provider) {
        case "smtp":
          return await this.sendViaSMTP(message);
        case "sendgrid":
          return await this.sendViaSendGrid(message);
        case "mailgun":
          return await this.sendViaMailgun(message);
        case "ses":
          return await this.sendViaSES(message);
        case "mock":
          return await this.sendViaMock(message);
        default:
          return {
            success: false,
            error: `Unsupported email provider: ${this.config.provider}`
          };
      }
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        error: error.message || "Unknown email service error"
      };
    }
  }

  /**
   * Send certificate notification email
   */
  async sendCertificateNotification(data: CertificateEmailData): Promise<EmailResponse> {
    const {
      student_name,
      student_name_en,
      student_email,
      course_name,
      course_name_en,
      certificate_number,
      certificate_issue_date,
      download_url,
      verification_url,
      instructor_name,
      instructor_name_en,
      completion_date,
      final_grade,
      locale = 'fa'
    } = data;

    // Generate email content
    const emailContent = this.generateCertificateEmailContent(data);

    const message: EmailMessage = {
      to: student_email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    return await this.sendEmail(message);
  }

  /**
   * Generate certificate email content in Persian and English
   */
  private generateCertificateEmailContent(data: CertificateEmailData) {
    const {
      student_name,
      student_name_en,
      course_name,
      course_name_en,
      certificate_number,
      certificate_issue_date,
      download_url,
      verification_url,
      instructor_name,
      completion_date,
      final_grade,
      locale = 'fa'
    } = data;

    const isPersian = locale === 'fa';
    const displayName = isPersian ? student_name : (student_name_en || student_name);
    const displayCourseName = isPersian ? course_name : (course_name_en || course_name);

    // Subject
    const subject = isPersian
      ? `🎉 گواهینامه شما آماده است - ${displayCourseName}`
      : `🎉 Your Certificate is Ready - ${displayCourseName}`;

    // HTML Content
    const html = `
<!DOCTYPE html>
<html dir="${isPersian ? 'rtl' : 'ltr'}" lang="${isPersian ? 'fa' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: ${isPersian ? 'Tahoma, Arial, sans-serif' : 'Arial, sans-serif'};
            direction: ${isPersian ? 'rtl' : 'ltr'};
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 20px;
        }
        .certificate-info {
            background-color: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .certificate-info h3 {
            color: #2b6cb0;
            margin: 0 0 15px 0;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #4a5568;
            min-width: 130px;
        }
        .info-value {
            color: #2d3748;
            text-align: ${isPersian ? 'left' : 'right'};
        }
        .buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .btn-primary {
            background-color: #3182ce;
            color: white;
        }
        .btn-primary:hover {
            background-color: #2c5aa0;
        }
        .btn-secondary {
            background-color: transparent;
            color: #3182ce;
            border: 2px solid #3182ce;
        }
        .btn-secondary:hover {
            background-color: #3182ce;
            color: white;
        }
        .achievement {
            background-color: #f0fff4;
            border-left: 4px solid #38a169;
            padding: 20px;
            margin: 25px 0;
        }
        .achievement h4 {
            color: #2f855a;
            margin: 0 0 10px 0;
        }
        .footer {
            background-color: #edf2f7;
            padding: 30px;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }
        .footer a {
            color: #3182ce;
            text-decoration: none;
        }
        .logo {
            font-size: 32px;
            margin-bottom: 10px;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .content {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
                align-items: flex-start;
                text-align: ${isPersian ? 'right' : 'left'};
            }
            .info-value {
                margin-top: 5px;
                text-align: ${isPersian ? 'right' : 'left'};
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏛️</div>
            <h1>${isPersian ? 'مرکز معماری ایرانی' : 'Iranian Architecture Center'}</h1>
            <p>IRAC</p>
        </div>

        <div class="content">
            <div class="greeting">
                ${isPersian
        ? `${displayName} عزیز،`
        : `Dear ${displayName},`
      }
            </div>

            <p>
                ${isPersian
        ? `🎉 تبریک! گواهینامه شما برای دوره "${displayCourseName}" آماده است و می‌توانید آن را دانلود کنید.`
        : `🎉 Congratulations! Your certificate for the course "${displayCourseName}" is ready and available for download.`
      }
            </p>

            <div class="certificate-info">
                <h3>
                    ${isPersian ? '📜 اطلاعات گواهینامه' : '📜 Certificate Information'}
                </h3>

                <div class="info-row">
                    <span class="info-label">${isPersian ? 'شماره گواهینامه:' : 'Certificate Number:'}</span>
                    <span class="info-value"><strong>${certificate_number}</strong></span>
                </div>

                <div class="info-row">
                    <span class="info-label">${isPersian ? 'نام دوره:' : 'Course Name:'}</span>
                    <span class="info-value">${displayCourseName}</span>
                </div>

                <div class="info-row">
                    <span class="info-label">${isPersian ? 'تاریخ صدور:' : 'Issue Date:'}</span>
                    <span class="info-value">${new Date(certificate_issue_date).toLocaleDateString(isPersian ? 'fa-IR' : 'en-US')}</span>
                </div>

                ${completion_date ? `
                <div class="info-row">
                    <span class="info-label">${isPersian ? 'تاریخ تکمیل:' : 'Completion Date:'}</span>
                    <span class="info-value">${new Date(completion_date).toLocaleDateString(isPersian ? 'fa-IR' : 'en-US')}</span>
                </div>
                ` : ''}

                ${final_grade ? `
                <div class="info-row">
                    <span class="info-label">${isPersian ? 'نمره نهایی:' : 'Final Grade:'}</span>
                    <span class="info-value"><strong>${final_grade}%</strong></span>
                </div>
                ` : ''}

                ${instructor_name ? `
                <div class="info-row">
                    <span class="info-label">${isPersian ? 'مدرس:' : 'Instructor:'}</span>
                    <span class="info-value">${instructor_name}</span>
                </div>
                ` : ''}
            </div>

            <div class="achievement">
                <h4>${isPersian ? '🏆 دستاورد شما' : '🏆 Your Achievement'}</h4>
                <p>
                    ${isPersian
        ? 'شما با موفقیت این دوره را تکمیل کرده و مهارت‌های جدیدی کسب کرده‌اید. این گواهینامه نشان‌دهنده تعهد و تلاش شما در یادگیری است.'
        : 'You have successfully completed this course and gained new skills. This certificate represents your commitment and effort in learning.'
      }
                </p>
            </div>

            <div class="buttons">
                <a href="${download_url}" class="btn btn-primary">
                    ${isPersian ? '📥 دانلود گواهینامه' : '📥 Download Certificate'}
                </a>
                <a href="${verification_url}" class="btn btn-secondary">
                    ${isPersian ? '🔍 تایید گواهینامه' : '🔍 Verify Certificate'}
                </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #718096;">
                ${isPersian
        ? 'این گواهینامه دارای کد تایید منحصر به فرد بوده و از طریق سایت ما قابل بررسی است. می‌توانید آن را در شبکه‌های اجتماعی و رزومه خود به اشتراک بگذارید.'
        : 'This certificate has a unique verification code and can be verified through our website. You can share it on social media and include it in your resume.'
      }
            </p>
        </div>

        <div class="footer">
            <p>
                <strong>${isPersian ? 'مرکز معماری ایرانی (IRAC)' : 'Iranian Architecture Center (IRAC)'}</strong>
            </p>
            <p>
                ${isPersian
        ? 'اگر سوالی دارید، با ما تماس بگیرید:'
        : 'If you have any questions, contact us:'
      }
                <a href="mailto:info@irac.ir">info@irac.ir</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px;">
                ${isPersian
        ? 'این ایمیل به صورت خودکار ارسال شده است. لطفاً پاسخ ندهید.'
        : 'This email was sent automatically. Please do not reply.'
      }
            </p>
        </div>
    </div>
</body>
</html>`;

    // Text Content (fallback)
    const text = isPersian ? `
${displayName} عزیز،

🎉 تبریک! گواهینامه شما آماده است.

📜 اطلاعات گواهینامه:
• شماره گواهینامه: ${certificate_number}
• نام دوره: ${displayCourseName}
• تاریخ صدور: ${new Date(certificate_issue_date).toLocaleDateString('fa-IR')}
${completion_date ? `• تاریخ تکمیل: ${new Date(completion_date).toLocaleDateString('fa-IR')}` : ''}
${final_grade ? `• نمره نهایی: ${final_grade}%` : ''}
${instructor_name ? `• مدرس: ${instructor_name}` : ''}

🔗 لینک‌های مفید:
• دانلود گواهینامه: ${download_url}
• تایید گواهینامه: ${verification_url}

🏆 دستاورد شما:
شما با موفقیت این دوره را تکمیل کرده و مهارت‌های جدیدی کسب کرده‌اید. این گواهینامه نشان‌دهنده تعهد و تلاش شما در یادگیری است.

---
مرکز معماری ایرانی (IRAC)
info@irac.ir

این ایمیل به صورت خودکار ارسال شده است.
    ` : `
Dear ${displayName},

🎉 Congratulations! Your certificate is ready.

📜 Certificate Information:
• Certificate Number: ${certificate_number}
• Course Name: ${displayCourseName}
• Issue Date: ${new Date(certificate_issue_date).toLocaleDateString('en-US')}
${completion_date ? `• Completion Date: ${new Date(completion_date).toLocaleDateString('en-US')}` : ''}
${final_grade ? `• Final Grade: ${final_grade}%` : ''}
${instructor_name ? `• Instructor: ${instructor_name}` : ''}

🔗 Useful Links:
• Download Certificate: ${download_url}
• Verify Certificate: ${verification_url}

🏆 Your Achievement:
You have successfully completed this course and gained new skills. This certificate represents your commitment and effort in learning.

---
Iranian Architecture Center (IRAC)
info@irac.ir

This email was sent automatically.
    `;

    return { subject, html, text };
  }

  /**
   * Validate email address
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Send via SMTP
   */
  private async sendViaSMTP(message: EmailMessage): Promise<EmailResponse> {
    try {
      // In a real implementation, you would use an SMTP library
      // For now, we'll simulate SMTP sending
      console.log("Sending email via SMTP:", {
        host: this.config.smtp_host,
        port: this.config.smtp_port,
        to: message.to,
        subject: message.subject
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        success: true,
        message_id: `smtp_${crypto.randomUUID()}`,
        status: "sent"
      };
    } catch (error) {
      return {
        success: false,
        error: `SMTP Error: ${error.message}`
      };
    }
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(message: EmailMessage): Promise<EmailResponse> {
    try {
      if (!this.config.api_key) {
        throw new Error("SendGrid API key is required");
      }

      const payload = {
        personalizations: [{
          to: Array.isArray(message.to)
            ? message.to.map(email => ({ email }))
            : [{ email: message.to }],
          ...(message.cc && {
            cc: Array.isArray(message.cc)
              ? message.cc.map(email => ({ email }))
              : [{ email: message.cc }]
          }),
          ...(message.bcc && {
            bcc: Array.isArray(message.bcc)
              ? message.bcc.map(email => ({ email }))
              : [{ email: message.bcc }]
          }),
          subject: message.subject
        }],
        from: {
          email: this.config.from_email,
          name: this.config.from_name || "IRAC System"
        },
        content: [
          ...(message.text ? [{ type: "text/plain", value: message.text }] : []),
          ...(message.html ? [{ type: "text/html", value: message.html }] : [])
        ]
      };

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config.api_key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return {
          success: true,
          message_id: response.headers.get("X-Message-Id") || `sendgrid_${crypto.randomUUID()}`,
          status: "sent"
        };
      } else {
        const errorData = await response.text();
        return {
          success: false,
          error: `SendGrid Error: ${response.status} - ${errorData}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `SendGrid Error: ${error.message}`
      };
    }
  }

  /**
   * Send via Mailgun
   */
  private async sendViaMailgun(message: EmailMessage): Promise<EmailResponse> {
    try {
      if (!this.config.api_key || !this.config.base_url) {
        throw new Error("Mailgun API key and domain are required");
      }

      const formData = new FormData();
      formData.append("from", `${this.config.from_name || "IRAC System"} <${this.config.from_email}>`);
      formData.append("to", Array.isArray(message.to) ? message.to.join(",") : message.to);
      if (message.cc) formData.append("cc", Array.isArray(message.cc) ? message.cc.join(",") : message.cc);
      if (message.bcc) formData.append("bcc", Array.isArray(message.bcc) ? message.bcc.join(",") : message.bcc);
      formData.append("subject", message.subject);
      if (message.text) formData.append("text", message.text);
      if (message.html) formData.append("html", message.html);

      const response = await fetch(`${this.config.base_url}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`api:${this.config.api_key}`)}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message_id: result.id || `mailgun_${crypto.randomUUID()}`,
          status: "sent"
        };
      } else {
        const errorData = await response.text();
        return {
          success: false,
          error: `Mailgun Error: ${response.status} - ${errorData}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Mailgun Error: ${error.message}`
      };
    }
  }

  /**
   * Send via Amazon SES
   */
  private async sendViaSES(message: EmailMessage): Promise<EmailResponse> {
    try {
      // This would require AWS SDK implementation
      // For now, we'll simulate SES sending
      console.log("Sending email via Amazon SES:", {
        to: message.to,
        subject: message.subject
      });

      return {
        success: true,
        message_id: `ses_${crypto.randomUUID()}`,
        status: "sent"
      };
    } catch (error) {
      return {
        success: false,
        error: `SES Error: ${error.message}`
      };
    }
  }

  /**
   * Mock email sending for development/testing
   */
  private async sendViaMock(message: EmailMessage): Promise<EmailResponse> {
    console.log("📧 MOCK EMAIL SENT:");
    console.log("From:", `${this.config.from_name || "IRAC System"} <${this.config.from_email}>`);
    console.log("To:", message.to);
    if (message.cc) console.log("CC:", message.cc);
    if (message.bcc) console.log("BCC:", message.bcc);
    console.log("Subject:", message.subject);
    console.log("Text:", message.text ? message.text.substring(0, 200) + "..." : "None");
    console.log("HTML:", message.html ? "Present" : "None");
    console.log("---");

    return {
      success: true,
      message_id: `mock_${crypto.randomUUID()}`,
      status: "sent"
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration (excluding sensitive data)
   */
  getConfig(): Partial<EmailConfig> {
    const { smtp_password, api_key, ...safeConfig } = this.config;
    return safeConfig;
  }
}

// Create default email service instance
const defaultEmailConfig: EmailConfig = {
  provider: (globalThis as any).Deno?.env?.get("EMAIL_PROVIDER") as any || "mock",
  smtp_host: (globalThis as any).Deno?.env?.get("SMTP_HOST") || "localhost",
  smtp_port: parseInt((globalThis as any).Deno?.env?.get("SMTP_PORT") || "587"),
  smtp_secure: (globalThis as any).Deno?.env?.get("SMTP_SECURE") === "true",
  smtp_user: (globalThis as any).Deno?.env?.get("SMTP_USER") || "",
  smtp_password: (globalThis as any).Deno?.env?.get("SMTP_PASSWORD") || "",
  api_key: (globalThis as any).Deno?.env?.get("EMAIL_API_KEY") || "",
  from_email: (globalThis as any).Deno?.env?.get("FROM_EMAIL") || "noreply@irac.ir",
  from_name: (globalThis as any).Deno?.env?.get("FROM_NAME") || "مرکز معماری ایرانی - IRAC",
  base_url: (globalThis as any).Deno?.env?.get("EMAIL_BASE_URL") || ""
};

export const emailService = new EmailService(defaultEmailConfig);
