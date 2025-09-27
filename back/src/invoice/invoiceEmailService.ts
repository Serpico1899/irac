import {  coreApp  } from "@app";
import { ObjectId } from "@deps";

// Email template types
export type InvoiceEmailType =
  | "new_invoice"
  | "payment_reminder"
  | "overdue_notice"
  | "payment_received"
  | "invoice_cancelled"
  | "invoice_refunded";

export interface InvoiceEmailData {
  _id: string;
  invoice_number: string;
  customer: {
    name: string;
    email?: string;
    company_name?: string;
  };
  total_amount: number;
  currency: string;
  due_date?: Date;
  issue_date: Date;
  payment_date?: Date;
  status: string;
  locale: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailSendResult {
  success: boolean;
  message_id?: string;
  error?: string;
}

// Email template generator
class InvoiceEmailTemplateGenerator {
  private formatCurrency(amount: number, currency: string = "IRR", locale: string = "fa"): string {
    if (locale === "fa") {
      return new Intl.NumberFormat('fa-IR', {
        style: 'currency',
        currency: 'IRR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount).replace('IRR', 'ریال');
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  }

  private formatDate(date: Date, locale: string = "fa"): string {
    if (locale === "fa") {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    }
  }

  private getCompanyInfo(locale: string = "fa") {
    return {
      name: locale === "fa" ? "آکادمی آیراک" : "IRAC Academy",
      address: locale === "fa" ? "تهران، ایران" : "Tehran, Iran",
      phone: "+98 21 1234 5678",
      email: "info@irac.ir",
      website: "https://irac.ir",
    };
  }

  private getBaseStyles(): string {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #334155;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }

        .rtl {
          direction: rtl;
          font-family: 'Vazirmatn', 'Tahoma', sans-serif;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #168c95 0%, #0f7882 100%);
          color: white;
          padding: 32px 24px;
          text-align: center;
        }

        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }

        .header .company {
          margin-top: 8px;
          opacity: 0.9;
          font-size: 16px;
        }

        .content {
          padding: 32px 24px;
        }

        .invoice-summary {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .invoice-number {
          font-size: 20px;
          font-weight: 600;
          color: #168c95;
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .detail-label {
          font-weight: 500;
          color: #64748b;
        }

        .detail-value {
          font-weight: 600;
          color: #1e293b;
        }

        .amount {
          font-size: 24px;
          font-weight: 700;
          color: #168c95;
        }

        .button {
          display: inline-block;
          background: linear-gradient(135deg, #168c95 0%, #0f7882 100%);
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          margin: 20px 0;
        }

        .footer {
          background: #f8fafc;
          padding: 24px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-paid { background: #d1fae5; color: #059669; }
        .status-overdue { background: #fee2e2; color: #dc2626; }
        .status-cancelled { background: #f3f4f6; color: #6b7280; }

        @media only screen and (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 20px 16px; }
          .header { padding: 24px 16px; }
          .detail-row { flex-direction: column; gap: 4px; }
        }
      </style>
    `;
  }

  generateNewInvoiceTemplate(invoice: InvoiceEmailData): EmailTemplate {
    const isRTL = invoice.locale === "fa";
    const company = this.getCompanyInfo(invoice.locale);

    const subject = isRTL
      ? `فاکتور جدید - ${invoice.invoice_number}`
      : `New Invoice - ${invoice.invoice_number}`;

    const customerName = invoice.customer.company_name
      ? `${invoice.customer.name} (${invoice.customer.company_name})`
      : invoice.customer.name;

    const html = `
      <!DOCTYPE html>
      <html ${isRTL ? 'dir="rtl" lang="fa"' : 'lang="en"'}>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          ${this.getBaseStyles()}
        </head>
        <body${isRTL ? ' class="rtl"' : ''}>
          <div class="container">
            <div class="header">
              <h1>${isRTL ? 'فاکتور جدید' : 'New Invoice'}</h1>
              <div class="company">${company.name}</div>
            </div>

            <div class="content">
              <h2>${isRTL ? `سلام ${customerName}` : `Hello ${customerName}`}</h2>

              <p>
                ${isRTL
        ? 'فاکتور جدیدی برای شما صادر شده است. جزئیات فاکتور در ادامه آمده است:'
        : 'A new invoice has been issued for you. Please find the invoice details below:'
      }
              </p>

              <div class="invoice-summary">
                <div class="invoice-number">${isRTL ? 'شماره فاکتور:' : 'Invoice Number:'} ${invoice.invoice_number}</div>

                <div class="detail-row">
                  <span class="detail-label">${isRTL ? 'تاریخ صدور:' : 'Issue Date:'}</span>
                  <span class="detail-value">${this.formatDate(invoice.issue_date, invoice.locale)}</span>
                </div>

                ${invoice.due_date ? `
                  <div class="detail-row">
                    <span class="detail-label">${isRTL ? 'سررسید:' : 'Due Date:'}</span>
                    <span class="detail-value">${this.formatDate(invoice.due_date, invoice.locale)}</span>
                  </div>
                ` : ''}

                <div class="detail-row">
                  <span class="detail-label">${isRTL ? 'مبلغ کل:' : 'Total Amount:'}</span>
                  <span class="detail-value amount">${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">${isRTL ? 'وضعیت:' : 'Status:'}</span>
                  <span class="status-badge status-pending">${isRTL ? 'در انتظار پرداخت' : 'Pending Payment'}</span>
                </div>
              </div>

              <p>
                ${isRTL
        ? 'برای مشاهده جزئیات کامل فاکتور و پرداخت، روی دکمه زیر کلیک کنید:'
        : 'Click the button below to view the full invoice details and make payment:'
      }
              </p>

              <a href="${company.website}/invoice/${invoice._id}" class="button">
                ${isRTL ? 'مشاهده و پرداخت فاکتور' : 'View & Pay Invoice'}
              </a>

              <p>
                ${isRTL
        ? 'اگر سوالی دارید، لطفاً با ما تماس بگیرید.'
        : 'If you have any questions, please don\'t hesitate to contact us.'
      }
              </p>
            </div>

            <div class="footer">
              <p><strong>${company.name}</strong></p>
              <p>${company.address}</p>
              <p>${isRTL ? 'تلفن:' : 'Phone:'} ${company.phone} | ${isRTL ? 'ایمیل:' : 'Email:'} ${company.email}</p>
              <p>${company.website}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = isRTL ? `
فاکتور جدید - ${invoice.invoice_number}

سلام ${customerName}،

فاکتور جدیدی برای شما صادر شده است:

شماره فاکتور: ${invoice.invoice_number}
تاریخ صدور: ${this.formatDate(invoice.issue_date, invoice.locale)}
${invoice.due_date ? `سررسید: ${this.formatDate(invoice.due_date, invoice.locale)}` : ''}
مبلغ کل: ${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}

برای مشاهده و پرداخت فاکتور به لینک زیر مراجعه کنید:
${company.website}/invoice/${invoice._id}

${company.name}
${company.address}
تلفن: ${company.phone}
ایمیل: ${company.email}
    ` : `
New Invoice - ${invoice.invoice_number}

Hello ${customerName},

A new invoice has been issued for you:

Invoice Number: ${invoice.invoice_number}
Issue Date: ${this.formatDate(invoice.issue_date, invoice.locale)}
${invoice.due_date ? `Due Date: ${this.formatDate(invoice.due_date, invoice.locale)}` : ''}
Total Amount: ${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}

Please visit the following link to view and pay your invoice:
${company.website}/invoice/${invoice._id}

${company.name}
${company.address}
Phone: ${company.phone}
Email: ${company.email}
    `;

    return { subject, html, text };
  }

  generatePaymentReminderTemplate(invoice: InvoiceEmailData): EmailTemplate {
    const isRTL = invoice.locale === "fa";
    const company = this.getCompanyInfo(invoice.locale);

    const subject = isRTL
      ? `یادآوری پرداخت فاکتور - ${invoice.invoice_number}`
      : `Payment Reminder - ${invoice.invoice_number}`;

    const customerName = invoice.customer.company_name
      ? `${invoice.customer.name} (${invoice.customer.company_name})`
      : invoice.customer.name;

    const html = `
      <!DOCTYPE html>
      <html ${isRTL ? 'dir="rtl" lang="fa"' : 'lang="en"'}>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          ${this.getBaseStyles()}
        </head>
        <body${isRTL ? ' class="rtl"' : ''}>
          <div class="container">
            <div class="header">
              <h1>${isRTL ? 'یادآوری پرداخت' : 'Payment Reminder'}</h1>
              <div class="company">${company.name}</div>
            </div>

            <div class="content">
              <h2>${isRTL ? `سلام ${customerName}` : `Hello ${customerName}`}</h2>

              <p>
                ${isRTL
        ? 'این یادآوری دوستانه است که فاکتور زیر هنوز پرداخت نشده است:'
        : 'This is a friendly reminder that the following invoice remains unpaid:'
      }
              </p>

              <div class="invoice-summary">
                <div class="invoice-number">${isRTL ? 'شماره فاکتور:' : 'Invoice Number:'} ${invoice.invoice_number}</div>

                <div class="detail-row">
                  <span class="detail-label">${isRTL ? 'تاریخ صدور:' : 'Issue Date:'}</span>
                  <span class="detail-value">${this.formatDate(invoice.issue_date, invoice.locale)}</span>
                </div>

                ${invoice.due_date ? `
                  <div class="detail-row">
                    <span class="detail-label">${isRTL ? 'سررسید:' : 'Due Date:'}</span>
                    <span class="detail-value">${this.formatDate(invoice.due_date, invoice.locale)}</span>
                  </div>
                ` : ''}

                <div class="detail-row">
                  <span class="detail-label">${isRTL ? 'مبلغ:' : 'Amount:'}</span>
                  <span class="detail-value amount">${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}</span>
                </div>
              </div>

              <a href="${company.website}/invoice/${invoice._id}" class="button">
                ${isRTL ? 'پرداخت فاکتور' : 'Pay Invoice'}
              </a>

              <p>
                ${isRTL
        ? 'اگر قبلاً پرداخت کرده‌اید، لطفاً این پیام را نادیده بگیرید. در غیر این صورت، لطفاً در اولین فرصت نسبت به پرداخت اقدام کنید.'
        : 'If you have already made the payment, please ignore this message. Otherwise, please arrange payment at your earliest convenience.'
      }
              </p>
            </div>

            <div class="footer">
              <p><strong>${company.name}</strong></p>
              <p>${company.address}</p>
              <p>${isRTL ? 'تلفن:' : 'Phone:'} ${company.phone} | ${isRTL ? 'ایمیل:' : 'Email:'} ${company.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = isRTL ? `
یادآوری پرداخت - ${invoice.invoice_number}

سلام ${customerName}،

این یادآوری دوستانه است که فاکتور زیر هنوز پرداخت نشده است:

شماره فاکتور: ${invoice.invoice_number}
تاریخ صدور: ${this.formatDate(invoice.issue_date, invoice.locale)}
${invoice.due_date ? `سررسید: ${this.formatDate(invoice.due_date, invoice.locale)}` : ''}
مبلغ: ${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}

برای پرداخت به لینک زیر مراجعه کنید:
${company.website}/invoice/${invoice._id}

${company.name}
    ` : `
Payment Reminder - ${invoice.invoice_number}

Hello ${customerName},

This is a friendly reminder that the following invoice remains unpaid:

Invoice Number: ${invoice.invoice_number}
Issue Date: ${this.formatDate(invoice.issue_date, invoice.locale)}
${invoice.due_date ? `Due Date: ${this.formatDate(invoice.due_date, invoice.locale)}` : ''}
Amount: ${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}

Please visit the following link to make payment:
${company.website}/invoice/${invoice._id}

${company.name}
    `;

    return { subject, html, text };
  }

  generatePaymentReceivedTemplate(invoice: InvoiceEmailData): EmailTemplate {
    const isRTL = invoice.locale === "fa";
    const company = this.getCompanyInfo(invoice.locale);

    const subject = isRTL
      ? `تأیید پرداخت فاکتور - ${invoice.invoice_number}`
      : `Payment Received - ${invoice.invoice_number}`;

    const customerName = invoice.customer.company_name
      ? `${invoice.customer.name} (${invoice.customer.company_name})`
      : invoice.customer.name;

    const html = `
      <!DOCTYPE html>
      <html ${isRTL ? 'dir="rtl" lang="fa"' : 'lang="en"'}>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          ${this.getBaseStyles()}
        </head>
        <body${isRTL ? ' class="rtl"' : ''}>
          <div class="container">
            <div class="header">
              <h1>${isRTL ? 'تأیید پرداخت' : 'Payment Confirmed'}</h1>
              <div class="company">${company.name}</div>
            </div>

            <div class="content">
              <h2>${isRTL ? `سلام ${customerName}` : `Hello ${customerName}`}</h2>

              <p>
                ${isRTL
        ? 'با تشکر! پرداخت شما با موفقیت دریافت شد:'
        : 'Thank you! Your payment has been successfully received:'
      }
              </p>

              <div class="invoice-summary">
                <div class="invoice-number">${isRTL ? 'شماره فاکتور:' : 'Invoice Number:'} ${invoice.invoice_number}</div>

                <div class="detail-row">
                  <span class="detail-label">${isRTL ? 'مبلغ پرداخت‌شده:' : 'Amount Paid:'}</span>
                  <span class="detail-value amount">${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}</span>
                </div>

                ${invoice.payment_date ? `
                  <div class="detail-row">
                    <span class="detail-label">${isRTL ? 'تاریخ پرداخت:' : 'Payment Date:'}</span>
                    <span class="detail-value">${this.formatDate(invoice.payment_date, invoice.locale)}</span>
                  </div>
                ` : ''}

                <div class="detail-row">
                  <span class="detail-label">${isRTL ? 'وضعیت:' : 'Status:'}</span>
                  <span class="status-badge status-paid">${isRTL ? 'پرداخت شده' : 'Paid'}</span>
                </div>
              </div>

              <p>
                ${isRTL
        ? 'فاکتور شما با موفقیت پرداخت شد. اگر به کپی از رسید نیاز دارید، می‌توانید از لینک زیر استفاده کنید:'
        : 'Your invoice has been paid successfully. If you need a copy of the receipt, you can use the link below:'
      }
              </p>

              <a href="${company.website}/invoice/${invoice._id}" class="button">
                ${isRTL ? 'مشاهده رسید' : 'View Receipt'}
              </a>

              <p>
                ${isRTL
        ? 'از اینکه با ما همکاری می‌کنید، متشکریم!'
        : 'Thank you for your business!'
      }
              </p>
            </div>

            <div class="footer">
              <p><strong>${company.name}</strong></p>
              <p>${company.address}</p>
              <p>${isRTL ? 'تلفن:' : 'Phone:'} ${company.phone} | ${isRTL ? 'ایمیل:' : 'Email:'} ${company.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = isRTL ? `
تأیید پرداخت - ${invoice.invoice_number}

سلام ${customerName}،

با تشکر! پرداخت شما با موفقیت دریافت شد:

شماره فاکتور: ${invoice.invoice_number}
مبلغ پرداخت‌شده: ${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}
${invoice.payment_date ? `تاریخ پرداخت: ${this.formatDate(invoice.payment_date, invoice.locale)}` : ''}

برای مشاهده رسید:
${company.website}/invoice/${invoice._id}

از اینکه با ما همکاری می‌کنید، متشکریم!

${company.name}
    ` : `
Payment Confirmed - ${invoice.invoice_number}

Hello ${customerName},

Thank you! Your payment has been successfully received:

Invoice Number: ${invoice.invoice_number}
Amount Paid: ${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}
${invoice.payment_date ? `Payment Date: ${this.formatDate(invoice.payment_date, invoice.locale)}` : ''}

View receipt:
${company.website}/invoice/${invoice._id}

Thank you for your business!

${company.name}
    `;

    return { subject, html, text };
  }

  generateTemplate(type: InvoiceEmailType, invoice: InvoiceEmailData): EmailTemplate {
    switch (type) {
      case "new_invoice":
        return this.generateNewInvoiceTemplate(invoice);
      case "payment_reminder":
        return this.generatePaymentReminderTemplate(invoice);
      case "payment_received":
        return this.generatePaymentReceivedTemplate(invoice);
      case "overdue_notice":
        // Similar to payment reminder but more urgent tone
        const reminderTemplate = this.generatePaymentReminderTemplate(invoice);
        const isRTL = invoice.locale === "fa";
        return {
          ...reminderTemplate,
          subject: isRTL
            ? `فاکتور سررسید گذشته - ${invoice.invoice_number}`
            : `Overdue Invoice - ${invoice.invoice_number}`,
        };
      case "invoice_cancelled":
      case "invoice_refunded":
        // These would need similar implementations
        return this.generateNewInvoiceTemplate(invoice);
      default:
        return this.generateNewInvoiceTemplate(invoice);
    }
  }
}

// Main email service
export class InvoiceEmailService {
  private templateGenerator = new InvoiceEmailTemplateGenerator();

  async sendInvoiceEmail(
    invoice: InvoiceEmailData,
    type: InvoiceEmailType = "new_invoice",
    attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
  ): Promise<EmailSendResult> {
    try {
      if (!invoice.customer.email) {
        return {
          success: false,
          error: "Customer email not provided",
        };
      }

      const template = this.templateGenerator.generateTemplate(type, invoice);

      // Here we would integrate with the existing email service
      // For now, this is a placeholder that logs the email
      console.log("Sending invoice email:", {
        to: invoice.customer.email,
        subject: template.subject,
        type,
        invoice_id: invoice._id,
      });

      // Simulate successful email send
      // In real implementation, this would call the actual email service
      const messageId = `invoice-${invoice._id}-${Date.now()}`;

      return {
        success: true,
        message_id: messageId,
      };
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Service instance
const invoiceEmailService = new InvoiceEmailService();

// Export convenience functions
export const sendInvoiceEmail = async (
  invoice: InvoiceEmailData,
  type: InvoiceEmailType = "new_invoice"
): Promise<EmailSendResult> => {
  return invoiceEmailService.sendInvoiceEmail(invoice, type);
};

export const sendNewInvoiceEmail = async (invoice: InvoiceEmailData): Promise<EmailSendResult> => {
  return sendInvoiceEmail(invoice, "new_invoice");
};

export const sendPaymentReminderEmail = async (invoice: InvoiceEmailData): Promise<EmailSendResult> => {
  return sendInvoiceEmail(invoice, "payment_reminder");
};

export const sendPaymentReceivedEmail = async (invoice: InvoiceEmailData): Promise<EmailSendResult> => {
  return sendInvoiceEmail(invoice, "payment_received");
};

export const sendOverdueNoticeEmail = async (invoice: InvoiceEmailData): Promise<EmailSendResult> => {
  return sendInvoiceEmail(invoice, "overdue_notice");
};

// Bulk email functions
export const sendBulkPaymentReminders = async (invoices: InvoiceEmailData[]): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: EmailSendResult[];
}> => {
  const results = await Promise.all(
    invoices.map(invoice => sendPaymentReminderEmail(invoice))
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    total: invoices.length,
    successful,
    failed,
    results,
  };
};
