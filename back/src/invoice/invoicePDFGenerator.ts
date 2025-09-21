import { ObjectId } from "@deps";

// PDF generation interfaces
export interface InvoicePDFOptions {
  template?: "standard" | "minimal" | "detailed";
  format?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  watermark?: string;
  logo_url?: string;
  include_footer?: boolean;
  include_terms?: boolean;
}

export interface PDFGenerationResult {
  success: boolean;
  pdf_buffer?: Buffer;
  pdf_url?: string;
  file_path?: string;
  error?: string;
  size_bytes?: number;
}

export interface InvoicePDFData {
  _id: string;
  invoice_number: string;
  invoice_type: string;
  status: string;
  issue_date: Date;
  due_date?: Date;
  payment_date?: Date;

  company: {
    name: string;
    name_en?: string;
    logo_url?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country: string;
    phone?: string;
    email?: string;
    website?: string;
    tax_id?: string;
  };

  customer: {
    name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    national_id?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country: string;
  };

  line_items: Array<{
    item_id: string;
    item_type: string;
    name: string;
    name_en?: string;
    description?: string;
    unit_price: number;
    quantity: number;
    discount_amount: number;
    tax_rate: number;
    tax_amount: number;
    line_total: number;
  }>;

  subtotal: number;
  total_discount: number;
  total_tax: number;
  total_amount: number;
  currency: string;

  taxes: Array<{
    tax_id: string;
    name: string;
    name_en?: string;
    rate: number;
    amount: number;
    tax_type: string;
  }>;

  discounts: Array<{
    discount_id?: string;
    description: string;
    coupon_code?: string;
    discount_amount: number;
  }>;

  payments: Array<{
    payment_id: string;
    payment_date: Date;
    amount: number;
    payment_method: string;
    transaction_reference?: string;
  }>;

  paid_amount: number;
  balance_due: number;

  payment_terms?: string;
  payment_terms_en?: string;
  notes?: string;
  notes_en?: string;
  terms_and_conditions?: string;
  terms_and_conditions_en?: string;

  locale: string;
  timezone: string;
}

// HTML template generator for PDF
class InvoicePDFTemplateGenerator {
  private formatCurrency(amount: number, currency: string = "IRR", locale: string = "fa"): string {
    if (locale === "fa") {
      return new Intl.NumberFormat('fa-IR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' ریال';
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
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    }
  }

  private formatNumber(num: number, locale: string = "fa"): string {
    if (locale === "fa") {
      return new Intl.NumberFormat('fa-IR').format(num);
    } else {
      return new Intl.NumberFormat('en-US').format(num);
    }
  }

  private getStatusLabel(status: string, locale: string = "fa"): string {
    const statusMap = {
      draft: { fa: "پیش‌نویس", en: "Draft" },
      sent: { fa: "ارسال شده", en: "Sent" },
      viewed: { fa: "مشاهده شده", en: "Viewed" },
      paid: { fa: "پرداخت شده", en: "Paid" },
      partially_paid: { fa: "نیمه پرداخت", en: "Partially Paid" },
      overdue: { fa: "سررسید گذشته", en: "Overdue" },
      cancelled: { fa: "لغو شده", en: "Cancelled" },
      refunded: { fa: "بازپرداخت شده", en: "Refunded" },
    };

    return statusMap[status as keyof typeof statusMap]?.[locale as 'fa' | 'en'] || status;
  }

  private getBaseStyles(isRTL: boolean): string {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: ${isRTL ? "'Vazirmatn', 'Tahoma'" : "'Inter', 'Arial'"}, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1f2937;
          background: white;
          direction: ${isRTL ? 'rtl' : 'ltr'};
        }

        .invoice-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
          min-height: 297mm;
          position: relative;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }

        .company-info {
          flex: 1;
        }

        .company-logo {
          max-height: 60px;
          max-width: 200px;
          margin-bottom: 15px;
        }

        .company-name {
          font-size: 24px;
          font-weight: 700;
          color: #168c95;
          margin-bottom: 8px;
        }

        .company-details {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }

        .invoice-info {
          text-align: ${isRTL ? "left" : "right"};
          flex-shrink: 0;
        }

        .invoice-title {
          font-size: 36px;
          font-weight: 700;
          color: #168c95;
          margin-bottom: 15px;
        }

        .invoice-details {
          font-size: 14px;
          line-height: 1.8;
        }

        .invoice-details strong {
          color: #1f2937;
          font-weight: 600;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 8px;
        }

        .status-draft { background: #f3f4f6; color: #6b7280; }
        .status-sent { background: #dbeafe; color: #1d4ed8; }
        .status-paid { background: #d1fae5; color: #059669; }
        .status-overdue { background: #fee2e2; color: #dc2626; }
        .status-cancelled { background: #f3f4f6; color: #6b7280; }

        .billing-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 40px;
        }

        .customer-info {
          flex: 1;
        }

        .info-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
        }

        .customer-name {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .customer-details {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        .invoice-table th,
        .invoice-table td {
          padding: 12px 8px;
          text-align: ${isRTL ? "right" : "left"};
          border-bottom: 1px solid #e5e7eb;
        }

        .invoice-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .invoice-table td {
          font-size: 14px;
        }

        .invoice-table .item-description {
          color: #6b7280;
          font-size: 12px;
          margin-top: 4px;
        }

        .invoice-table .text-right {
          text-align: ${isRTL ? "left" : "right"};
        }

        .invoice-table .amount {
          font-weight: 600;
          color: #1f2937;
        }

        .invoice-summary {
          margin-left: auto;
          width: 300px;
          margin-bottom: 40px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .summary-row:last-child {
          border-bottom: 2px solid #168c95;
          font-weight: 700;
          font-size: 16px;
          padding-top: 12px;
          margin-top: 8px;
        }

        .summary-label {
          color: #6b7280;
        }

        .summary-value {
          font-weight: 600;
          color: #1f2937;
        }

        .discount-row .summary-value {
          color: #dc2626;
        }

        .tax-breakdown {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
          padding-left: ${isRTL ? "0" : "20px"};
          padding-right: ${isRTL ? "20px" : "0"};
        }

        .tax-item {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
        }

        .payment-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .payment-history {
          margin-bottom: 20px;
        }

        .payment-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .payment-table th,
        .payment-table td {
          padding: 8px;
          text-align: ${isRTL ? "right" : "left"};
          border-bottom: 1px solid #f3f4f6;
        }

        .payment-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
        }

        .notes-section {
          margin-top: 40px;
        }

        .notes-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .notes-content {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
        }

        .invoice-footer {
          position: absolute;
          bottom: 20mm;
          left: 20mm;
          right: 20mm;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 72px;
          font-weight: 700;
          color: rgba(22, 140, 149, 0.1);
          z-index: 1;
          pointer-events: none;
        }

        @media print {
          .invoice-container {
            margin: 0;
            padding: 15mm;
            box-shadow: none;
          }

          .invoice-footer {
            bottom: 15mm;
            left: 15mm;
            right: 15mm;
          }
        }
      </style>
    `;
  }

  generateHTML(invoice: InvoicePDFData, options: InvoicePDFOptions = {}): string {
    const isRTL = invoice.locale === "fa";
    const {
      watermark,
      include_footer = true,
      include_terms = true,
    } = options;

    return `
      <!DOCTYPE html>
      <html dir="${isRTL ? "rtl" : "ltr"}" lang="${invoice.locale}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoice_number}</title>
          ${this.getBaseStyles(isRTL)}
        </head>
        <body>
          <div class="invoice-container">
            ${watermark ? `<div class="watermark">${watermark}</div>` : ""}

            <!-- Header -->
            <div class="invoice-header">
              <div class="company-info">
                ${invoice.company.logo_url ?
        `<img src="${invoice.company.logo_url}" alt="${invoice.company.name}" class="company-logo">` :
        ""
      }
                <div class="company-name">
                  ${isRTL ? invoice.company.name : (invoice.company.name_en || invoice.company.name)}
                </div>
                <div class="company-details">
                  ${invoice.company.address ? `<div>${invoice.company.address}</div>` : ""}
                  ${invoice.company.phone ? `<div>${isRTL ? "تلفن:" : "Phone:"} ${invoice.company.phone}</div>` : ""}
                  ${invoice.company.email ? `<div>${isRTL ? "ایمیل:" : "Email:"} ${invoice.company.email}</div>` : ""}
                  ${invoice.company.website ? `<div>${isRTL ? "وب‌سایت:" : "Website:"} ${invoice.company.website}</div>` : ""}
                  ${invoice.company.tax_id ? `<div>${isRTL ? "شناسه مالیاتی:" : "Tax ID:"} ${invoice.company.tax_id}</div>` : ""}
                </div>
              </div>

              <div class="invoice-info">
                <div class="invoice-title">${isRTL ? "فاکتور" : "INVOICE"}</div>
                <div class="invoice-details">
                  <div><strong>${isRTL ? "شماره فاکتور:" : "Invoice #:"}</strong> ${invoice.invoice_number}</div>
                  <div><strong>${isRTL ? "تاریخ صدور:" : "Issue Date:"}</strong> ${this.formatDate(invoice.issue_date, invoice.locale)}</div>
                  ${invoice.due_date ? `<div><strong>${isRTL ? "سررسید:" : "Due Date:"}</strong> ${this.formatDate(invoice.due_date, invoice.locale)}</div>` : ""}
                  ${invoice.payment_date ? `<div><strong>${isRTL ? "تاریخ پرداخت:" : "Payment Date:"}</strong> ${this.formatDate(invoice.payment_date, invoice.locale)}</div>` : ""}
                </div>
                <div class="status-badge status-${invoice.status}">
                  ${this.getStatusLabel(invoice.status, invoice.locale)}
                </div>
              </div>
            </div>

            <!-- Billing Information -->
            <div class="billing-info">
              <div class="customer-info">
                <div class="info-section-title">
                  ${isRTL ? "اطلاعات مشتری" : "Customer Information"}
                </div>
                <div class="customer-name">${invoice.customer.name}</div>
                ${invoice.customer.company_name ? `<div style="font-weight: 500; margin-bottom: 8px;">${invoice.customer.company_name}</div>` : ""}
                <div class="customer-details">
                  ${invoice.customer.email ? `<div>${isRTL ? "ایمیل:" : "Email:"} ${invoice.customer.email}</div>` : ""}
                  ${invoice.customer.phone ? `<div>${isRTL ? "تلفن:" : "Phone:"} ${invoice.customer.phone}</div>` : ""}
                  ${invoice.customer.national_id ? `<div>${isRTL ? "کد ملی:" : "National ID:"} ${invoice.customer.national_id}</div>` : ""}
                  ${invoice.customer.address || invoice.customer.city ? `
                    <div style="margin-top: 8px;">
                      <strong>${isRTL ? "آدرس:" : "Address:"}</strong><br>
                      ${[invoice.customer.address, invoice.customer.city, invoice.customer.postal_code, invoice.customer.country].filter(Boolean).join(", ")}
                    </div>
                  ` : ""}
                </div>
              </div>
            </div>

            <!-- Invoice Items -->
            <table class="invoice-table">
              <thead>
                <tr>
                  <th style="width: 40%">${isRTL ? "شرح کالا/خدمات" : "Description"}</th>
                  <th style="width: 10%" class="text-right">${isRTL ? "تعداد" : "Qty"}</th>
                  <th style="width: 15%" class="text-right">${isRTL ? "قیمت واحد" : "Unit Price"}</th>
                  <th style="width: 10%" class="text-right">${isRTL ? "تخفیف" : "Discount"}</th>
                  <th style="width: 10%" class="text-right">${isRTL ? "مالیات" : "Tax"}</th>
                  <th style="width: 15%" class="text-right">${isRTL ? "مبلغ کل" : "Total"}</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.line_items.map((item, index) => `
                  <tr>
                    <td>
                      <div style="font-weight: 500;">${item.name}</div>
                      ${item.description ? `<div class="item-description">${item.description}</div>` : ""}
                    </td>
                    <td class="text-right">${this.formatNumber(item.quantity, invoice.locale)}</td>
                    <td class="text-right amount">${this.formatCurrency(item.unit_price, invoice.currency, invoice.locale)}</td>
                    <td class="text-right">${item.discount_amount > 0 ? this.formatCurrency(item.discount_amount, invoice.currency, invoice.locale) : "-"}</td>
                    <td class="text-right">${item.tax_amount > 0 ? this.formatCurrency(item.tax_amount, invoice.currency, invoice.locale) : "-"}</td>
                    <td class="text-right amount">${this.formatCurrency(item.line_total, invoice.currency, invoice.locale)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <!-- Invoice Summary -->
            <div class="invoice-summary">
              <div class="summary-row">
                <span class="summary-label">${isRTL ? "جمع جزء:" : "Subtotal:"}</span>
                <span class="summary-value">${this.formatCurrency(invoice.subtotal, invoice.currency, invoice.locale)}</span>
              </div>

              ${invoice.total_discount > 0 ? `
                <div class="summary-row discount-row">
                  <span class="summary-label">${isRTL ? "تخفیف:" : "Discount:"}</span>
                  <span class="summary-value">-${this.formatCurrency(invoice.total_discount, invoice.currency, invoice.locale)}</span>
                </div>

                ${invoice.discounts.length > 0 ? `
                  <div class="tax-breakdown">
                    ${invoice.discounts.map(discount => `
                      <div class="tax-item">
                        <span>${discount.coupon_code ? `کد: ${discount.coupon_code}` : discount.description}</span>
                        <span>-${this.formatCurrency(discount.discount_amount, invoice.currency, invoice.locale)}</span>
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              ` : ""}

              ${invoice.total_tax > 0 ? `
                ${invoice.taxes.map(tax => `
                  <div class="summary-row">
                    <span class="summary-label">
                      ${isRTL ? tax.name : (tax.name_en || tax.name)} (${this.formatNumber(tax.rate, invoice.locale)}%):
                    </span>
                    <span class="summary-value">${this.formatCurrency(tax.amount, invoice.currency, invoice.locale)}</span>
                  </div>
                `).join("")}
              ` : ""}

              <div class="summary-row">
                <span class="summary-label">${isRTL ? "مبلغ کل:" : "Total Amount:"}</span>
                <span class="summary-value">${this.formatCurrency(invoice.total_amount, invoice.currency, invoice.locale)}</span>
              </div>

              ${invoice.paid_amount > 0 ? `
                <div class="summary-row">
                  <span class="summary-label">${isRTL ? "مبلغ پرداخت شده:" : "Amount Paid:"}</span>
                  <span class="summary-value">${this.formatCurrency(invoice.paid_amount, invoice.currency, invoice.locale)}</span>
                </div>

                <div class="summary-row">
                  <span class="summary-label">${isRTL ? "باقی‌مانده:" : "Balance Due:"}</span>
                  <span class="summary-value">${this.formatCurrency(invoice.balance_due, invoice.currency, invoice.locale)}</span>
                </div>
              ` : ""}
            </div>

            <!-- Payment History -->
            ${invoice.payments.length > 0 ? `
              <div class="payment-section">
                <div class="payment-history">
                  <div class="info-section-title">${isRTL ? "تاریخچه پرداخت‌ها" : "Payment History"}</div>
                  <table class="payment-table">
                    <thead>
                      <tr>
                        <th>${isRTL ? "تاریخ" : "Date"}</th>
                        <th>${isRTL ? "روش پرداخت" : "Payment Method"}</th>
                        <th>${isRTL ? "شماره تراکنش" : "Reference"}</th>
                        <th class="text-right">${isRTL ? "مبلغ" : "Amount"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${invoice.payments.map(payment => `
                        <tr>
                          <td>${this.formatDate(payment.payment_date, invoice.locale)}</td>
                          <td>${payment.payment_method}</td>
                          <td>${payment.transaction_reference || "-"}</td>
                          <td class="text-right amount">${this.formatCurrency(payment.amount, invoice.currency, invoice.locale)}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ""}

            <!-- Notes and Terms -->
            ${(invoice.notes || invoice.payment_terms || (include_terms && invoice.terms_and_conditions)) ? `
              <div class="notes-section">
                ${invoice.payment_terms ? `
                  <div style="margin-bottom: 20px;">
                    <div class="notes-title">${isRTL ? "شرایط پرداخت" : "Payment Terms"}</div>
                    <div class="notes-content">${isRTL ? invoice.payment_terms : (invoice.payment_terms_en || invoice.payment_terms)}</div>
                  </div>
                ` : ""}

                ${invoice.notes ? `
                  <div style="margin-bottom: 20px;">
                    <div class="notes-title">${isRTL ? "یادداشت‌ها" : "Notes"}</div>
                    <div class="notes-content">${isRTL ? invoice.notes : (invoice.notes_en || invoice.notes)}</div>
                  </div>
                ` : ""}

                ${include_terms && invoice.terms_and_conditions ? `
                  <div>
                    <div class="notes-title">${isRTL ? "شرایط و ضوابط" : "Terms & Conditions"}</div>
                    <div class="notes-content">${isRTL ? invoice.terms_and_conditions : (invoice.terms_and_conditions_en || invoice.terms_and_conditions)}</div>
                  </div>
                ` : ""}
              </div>
            ` : ""}

            <!-- Footer -->
            ${include_footer ? `
              <div class="invoice-footer">
                <div>${isRTL ? "این فاکتور به صورت الکترونیکی تولید شده و نیازی به امضا ندارد" : "This invoice was generated electronically and does not require a signature"}</div>
                <div style="margin-top: 8px;">${invoice.company.name} - ${invoice.company.website || invoice.company.email}</div>
              </div>
            ` : ""}
          </div>
        </body>
      </html>
    `;
  }
}

// Main PDF generator class
export class InvoicePDFGenerator {
  private templateGenerator = new InvoicePDFTemplateGenerator();

  async generatePDF(
    invoice: InvoicePDFData,
    options: InvoicePDFOptions = {}
  ): Promise<PDFGenerationResult> {
    try {
      const {
        format = "A4",
        orientation = "portrait",
        margins = { top: 20, right: 20, bottom: 20, left: 20 }
      } = options;

      // Generate HTML content
      const htmlContent = this.templateGenerator.generateHTML(invoice, options);

      // For now, we'll simulate PDF generation
      // In a real implementation, this would use Puppeteer, wkhtmltopdf, or similar
      console.log("Generating PDF for invoice:", invoice.invoice_number);

      // Simulate PDF buffer creation
      const pdfBuffer = Buffer.from(htmlContent, 'utf8');

      return {
        success: true,
        pdf_buffer: pdfBuffer,
        size_bytes: pdfBuffer.length,
      };
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async generateAndSavePDF(
    invoice: InvoicePDFData,
    filePath: string,
    options: InvoicePDFOptions = {}
  ): Promise<PDFGenerationResult> {
    try {
      const result = await this.generatePDF(invoice, options);

      if (!result.success || !result.pdf_buffer) {
        return result;
      }

      // In a real implementation, save to file system
      console.log(`PDF would be saved to: ${filePath}`);

      return {
        ...result,
        file_path: filePath,
        pdf_url: `/invoices/pdf/${invoice.invoice_number}.pdf`,
      };
    } catch (error) {
      console.error("Failed to save PDF:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save PDF",
      };
    }
  }

  // Generate PDF with watermark for draft/preview
  async generateDraftPDF(
    invoice: InvoicePDFData,
    options: Omit<InvoicePDFOptions, 'watermark'> = {}
  ): Promise<PDFGenerationResult> {
    const watermark = invoice.locale === "fa" ? "پیش‌نویس
