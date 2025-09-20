import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Invoice, InvoiceGenerationOptions } from "@/types";
import { invoiceApi } from "./invoiceApi";

// Persian font data (you would need to include actual font files)
// This is a placeholder - you'd need to add actual Persian font data
const PERSIAN_FONT_BASE64 = ""; // Base64 encoded Persian font

export interface PDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  pdf_url?: string;
  file_path?: string;
  error?: string;
  size_bytes?: number;
  pdfUrl?: string;
  error?: string;
}

export interface EmailDeliveryData {
  to: string;
  subject: string;
  body: string;
  attachments: {
    filename: string;
    content: Blob;
    contentType: string;
  }[];
}

class InvoicePDFService {
  private static instance: InvoicePDFService;

  private constructor() {}

  public static getInstance(): InvoicePDFService {
    if (!InvoicePDFService.instance) {
      InvoicePDFService.instance = new InvoicePDFService();
    }
    return InvoicePDFService.instance;
  }

  /**
   * Generate PDF from invoice data using backend service
   */
  async generateInvoicePDF(
    invoice: Invoice,
    options: InvoiceGenerationOptions = {}
  ): Promise<PDFGenerationResult> {
    try {
      const {
        template = "default",
        language = invoice.locale || "fa",
        format = "pdf",
        include_logo = true,
        include_terms = true,
        include_notes = true,
      } = options;

      // Use backend API for PDF generation
      try {
        const pdfBlob = await invoiceApi.generatePDF(invoice._id, {
          template,
          language,
          include_logo,
          include_terms,
          include_notes,
        });

        return {
          success: true,
          pdfBlob,
          size_bytes: pdfBlob.size,
        };
      } catch (error) {
        console.error("PDF generation failed:", error);

        // Fallback to client-side HTML generation
        const htmlContent = this.generateInvoiceHTML(invoice, {
          ...options,
          language,
        include_logo,
        include_terms,
        include_notes,
      });

      // Generate PDF from HTML
        const pdfResult = await this.htmlToPDF(htmlContent, {
          filename: `invoice-${invoice.invoice_number}.pdf`,
          isRTL: language === "fa",
          pageSize: "A4",
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        });

        return pdfResult;
      }

      return pdfResult;
    } catch (error) {
      console.error("PDF generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "خطا در تولید فایل PDF",
      };
    }
  }

  /**
   * Generate HTML content for invoice
   */
  private generateInvoiceHTML(
    invoice: Invoice,
    options: InvoiceGenerationOptions
  ): string {
    const isRTL = options.language === "fa";
    const currency = isRTL ? "تومان" : "IRR";

    // Format number based on locale
    const formatNumber = (num: number): string => {
      if (isRTL) {
        return num.toLocaleString("fa-IR");
      }
      return num.toLocaleString("en-US");
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
      const formatted = formatNumber(Math.round(amount));
      return isRTL ? `${formatted} تومان` : `${formatted} IRR`;
    };

    // Format date
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      if (isRTL) {
        return date.toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Get status stamp
    const getStatusStamp = (): string => {
      const statusMap = {
        paid: isRTL ? "پرداخت شده" : "PAID",
        draft: isRTL ? "پیش‌نویس" : "DRAFT",
        cancelled: isRTL ? "لغو شده" : "CANCELLED",
        overdue: isRTL ? "سررسید گذشته" : "OVERDUE",
      };
      return statusMap[invoice.status as keyof typeof statusMap] || "";
    };

    const statusStamp = getStatusStamp();

    return `
      <!DOCTYPE html>
      <html dir="${isRTL ? "rtl" : "ltr"}" lang="${isRTL ? "fa" : "en"}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            ${this.getPersianFontCSS()}

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family: ${isRTL ? "'Vazirmatn', 'Tahoma'" : "'Inter', 'Arial'"}, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #1f2937;
              background: white;
            }

            .invoice-container {
              max-width: 210mm;
              margin: 0 auto;
              padding: 20mm;
              background: white;
              position: relative;
            }

            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
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
            }

            .invoice-title {
              font-size: 36px;
              font-weight: 700;
              color: #168c95;
              margin-bottom: 15px;
            }

            .invoice-details {
              font-size: 13px;
              line-height: 1.8;
            }

            .invoice-details strong {
              color: #1f2937;
            }

            .status-stamp {
              position: absolute;
              top: 80px;
              ${isRTL ? "left: 50px" : "right: 50px"};
              transform: rotate(15deg);
              font-size: 48px;
              font-weight: 900;
              color: #10b981;
              opacity: 0.15;
              pointer-events: none;
              z-index: 10;
            }

            .customer-section {
              margin-bottom: 30px;
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
            }

            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 12px;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .section-icon {
              width: 20px;
              height: 20px;
              color: #168c95;
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

            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }

            .items-table th {
              background: #f3f4f6;
              padding: 12px;
              text-align: ${isRTL ? "right" : "left"};
              font-weight: 600;
              font-size: 13px;
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
            }

            .items-table td {
              padding: 12px;
              text-align: ${isRTL ? "right" : "left"};
              border-bottom: 1px solid #f3f4f6;
              vertical-align: top;
            }

            .items-table tr:nth-child(even) {
              background: #fafafa;
            }

            .item-description {
              font-weight: 500;
              color: #1f2937;
              margin-bottom: 4px;
            }

            .item-type {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
            }

            .item-discount {
              font-size: 11px;
              color: #10b981;
              margin-top: 4px;
            }

            .quantity-col, .price-col {
              text-align: center !important;
              font-weight: 500;
            }

            .total-col {
              text-align: ${isRTL ? "left" : "right"} !important;
              font-weight: 600;
            }

            .summary-section {
              margin-left: auto;
              width: 350px;
              background: #f3f4f6;
              border-radius: 8px;
              padding: 20px;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              font-size: 14px;
            }

            .summary-row:last-child {
              margin-bottom: 0;
            }

            .summary-label {
              color: #6b7280;
            }

            .summary-value {
              font-weight: 500;
              color: #1f2937;
            }

            .discount-row {
              color: #10b981 !important;
            }

            .discount-row .summary-value {
              color: #10b981;
            }

            .total-row {
              border-top: 2px solid #e5e7eb;
              padding-top: 12px;
              margin-top: 12px;
            }

            .total-row .summary-label {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }

            .total-row .summary-value {
              font-size: 18px;
              font-weight: 700;
              color: #168c95;
            }

            .payment-section {
              margin-top: 20px;
              background: #f0f9ff;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #168c95;
            }

            .payment-title {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 8px;
            }

            .payment-details {
              font-size: 12px;
              color: #6b7280;
              line-height: 1.5;
            }

            .notes-section {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }

            .notes-title {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 10px;
            }

            .notes-content {
              font-size: 13px;
              color: #6b7280;
              line-height: 1.6;
              white-space: pre-wrap;
            }

            .footer-section {
              margin-top: 40px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #9ca3af;
              font-size: 12px;
            }

            .tax-breakdown {
              margin-bottom: 8px;
              font-size: 12px;
            }

            .tax-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              padding-left: 20px;
              color: #6b7280;
            }

            @media print {
              .invoice-container {
                margin: 0;
                padding: 15mm;
              }

              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .status-stamp {
                opacity: 0.2;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${statusStamp ? `<div class="status-stamp">${statusStamp}</div>` : ""}

            <!-- Header -->
            <div class="invoice-header">
              <div class="company-info">
                ${options.include_logo && invoice.company.logo_url ?
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
                </div>
              </div>

              <div class="invoice-info">
                <div class="invoice-title">${isRTL ? "فاکتور" : "INVOICE"}</div>
                <div class="invoice-details">
                  <div><strong>${isRTL ? "شماره فاکتور:" : "Invoice #:"}</strong> ${invoice.invoice_number}</div>
                  <div><strong>${isRTL ? "تاریخ صدور:" : "Issue Date:"}</strong> ${formatDate(invoice.issue_date)}</div>
                  ${invoice.due_date ? `<div><strong>${isRTL ? "سررسید:" : "Due Date:"}</strong> ${formatDate(invoice.due_date)}</div>` : ""}
                  ${invoice.order_id ? `<div><strong>${isRTL ? "شماره سفارش:" : "Order #:"}</strong> ${invoice.order_id}</div>` : ""}
                </div>
              </div>
            </div>

            <!-- Customer Info -->
            <div class="customer-section">
              <div class="section-title">
                <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                ${isRTL ? "اطلاعات مشتری" : "Customer Information"}
              </div>
              <div class="customer-name">${invoice.customer.name}</div>
              ${invoice.customer.company_name ? `<div style="font-weight: 500; margin-bottom: 8px;">${invoice.customer.company_name}</div>` : ""}
              <div class="customer-details">
                ${invoice.customer.email ? `<div>${isRTL ? "ایمیل:" : "Email:"} ${invoice.customer.email}</div>` : ""}
                ${invoice.customer.phone ? `<div>${isRTL ? "تلفن:" : "Phone:"} ${invoice.customer.phone}</div>` : ""}
                ${invoice.customer.national_id ? `<div>${isRTL ? "کد ملی:" : "National ID:"} ${invoice.customer.national_id}</div>` : ""}
                ${(invoice.customer.address || invoice.customer.city) ? `
                  <div style="margin-top: 8px;">
                    <strong>${isRTL ? "آدرس:" : "Address:"}</strong><br>
                    ${[invoice.customer.address, invoice.customer.city, invoice.customer.postal_code, invoice.customer.country].filter(Boolean).join(", ")}
                  </div>
                ` : ""}
              </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 50%;">${isRTL ? "شرح" : "Description"}</th>
                  <th style="width: 10%;">${isRTL ? "تعداد" : "Qty"}</th>
                  <th style="width: 20%;">${isRTL ? "قیمت واحد" : "Unit Price"}</th>
                  <th style="width: 20%;">${isRTL ? "جمع" : "Total"}</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.line_items.map((item, index) => `
                  <tr>
                    <td>
                      <div class="item-description">
                        ${isRTL ? item.description : (item.description_en || item.description)}
                      </div>
                      <div class="item-type">
                        ${item.item_type === "course" ? (isRTL ? "دوره" : "Course") :
                          item.item_type === "workshop" ? (isRTL ? "کارگاه" : "Workshop") :
                          item.item_type === "product" ? (isRTL ? "محصول" : "Product") :
                          isRTL ? "خدمات" : "Service"}
                      </div>
                      ${item.discount_amount && item.discount_amount > 0 ? `
                        <div class="item-discount">
                          ${isRTL ? "تخفیف:" : "Discount:"} ${formatCurrency(item.discount_amount)}
                        </div>
                      ` : ""}
                    </td>
                    <td class="quantity-col">${formatNumber(item.quantity)}</td>
                    <td class="price-col">${formatCurrency(item.unit_price)}</td>
                    <td class="total-col">${formatCurrency(item.total)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <!-- Summary -->
            <div class="summary-section">
              <div class="summary-row">
                <span class="summary-label">${isRTL ? "جمع جزء:" : "Subtotal:"}</span>
                <span class="summary-value">${formatCurrency(invoice.subtotal)}</span>
              </div>

              ${invoice.total_discount > 0 ? `
                <div class="summary-row discount-row">
                  <span class="summary-label">${isRTL ? "تخفیف:" : "Discount:"}</span>
                  <span class="summary-value">-${formatCurrency(invoice.total_discount)}</span>
                </div>

                ${(invoice.discounts && invoice.discounts.length > 0) ? `
                  <div class="tax-breakdown">
                    ${invoice.discounts.map(discount => `
                      <div class="tax-item">
                        <span>${discount.coupon_code ? `کد: ${discount.coupon_code}` : discount.description}</span>
                        <span>-${formatCurrency(discount.discount_amount)}</span>
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              ` : ""}

              ${invoice.total_tax > 0 ? `
                ${(invoice.taxes || []).map(tax => `
                  <div class="summary-row">
                    <span class="summary-label">
                      ${isRTL ? tax.name : (tax.name_en || tax.name)} (${formatNumber(tax.rate)}%):
                    </span>
                    <span class="summary-value">${formatCurrency(tax.amount)}</span>
                  </div>
                `).join("")}
              ` : ""}

              <div class="summary-row total-row">
                <span class="summary-label">${isRTL ? "مبلغ نهایی:" : "Total Amount:"}</span>
                <span class="summary-value">${formatCurrency(invoice.total_amount)}</span>
              </div>

              ${invoice.payment_info ? `
                <div class="payment-section">
                  <div class="payment-title">${isRTL ? "اطلاعات پرداخت" : "Payment Information"}</div>
                  <div class="payment-details">
                    <div><strong>${isRTL ? "روش پرداخت:" : "Payment Method:"}</strong>
                      ${invoice.payment_info.method === "zarinpal" ? "زرین‌پال" :
                        invoice.payment_info.method === "mellat" ? "بانک ملت" :
                        invoice.payment_info.method === "saman" ? "بانک سامان" :
                        invoice.payment_info.method === "wallet" ? "کیف پول" :
                        invoice.payment_info.method}
                    </div>
                    ${invoice.payment_info.transaction_id ? `
                      <div><strong>${isRTL ? "شناسه تراکنش:" : "Transaction ID:"}</strong> ${invoice.payment_info.transaction_id}</div>
                    ` : ""}
                    ${invoice.payment_info.reference_number ? `
                      <div><strong>${isRTL ? "شماره مرجع:" : "Reference:"}</strong> ${invoice.payment_info.reference_number}</div>
                    ` : ""}
                    ${invoice.payment_info.paid_at ? `
                      <div><strong>${isRTL ? "تاریخ پرداخت:" : "Paid Date:"}</strong> ${formatDate(invoice.payment_info.paid_at)}</div>
                    ` : ""}
                  </div>
                </div>
              ` : ""}
            </div>

            ${(options.include_notes && (invoice.notes || invoice.terms)) ? `
              <div class="notes-section">
                ${invoice.notes ? `
                  <div style="margin-bottom: 20px;">
                    <div class="notes-title">${isRTL ? "یادداشت‌ها" : "Notes"}</div>
                    <div class="notes-content">${invoice.notes}</div>
                  </div>
                ` : ""}

                ${options.include_terms && invoice.terms ? `
                  <div>
                    <div class="notes-title">${isRTL ? "قوانین و مقررات" : "Terms & Conditions"}</div>
                    <div class="notes-content">${invoice.terms}</div>
                  </div>
                ` : ""}
              </div>
            ` : ""}

            <!-- Footer -->
            <div class="footer-section">
              <div style="margin-bottom: 10px;">
                ${invoice.footer_text || (isRTL ? "از خرید شما متشکریم" : "Thank you for your business")}
              </div>
              ${invoice.company.tax_id ? `
                <div style="font-size: 11px; color: #d1d5db;">
                  ${isRTL ? "شناسه مالیاتی:" : "Tax ID:"} ${invoice.company.tax_id}
                </div>
              ` : ""}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get Persian font CSS
   */
  private getPersianFontCSS(): string {
    return `
      @font-face {
        font-family: 'Vazirmatn';
        src: url('data:font/woff2;base64,${PERSIAN_FONT_BASE64}') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
  }

  /**
   * Convert HTML to PDF
   */
  private async htmlToPDF(
    htmlContent: string,
    options: {
      filename: string;
      isRTL: boolean;
      pageSize: "A4" | "Letter";
      margins: { top: number; right: number; bottom: number; left: number };
    }
  ): Promise<PDFGenerationResult> {
    try {
      // Method 1: Using html2canvas + jsPDF (for complex layouts)
      return await this.generatePDFWithCanvas(htmlContent, options);
    } catch (error) {
      console.error("PDF generation failed:", error);

      // Method 2: Fallback to simple jsPDF (for simple layouts)
      try {
        return await this.generateSimplePDF(htmlContent, options);
      } catch (fallbackError) {
        console.error("Fallback PDF generation failed:", fallbackError);
        return {
          success: false,
          error: "خطا در تولید فایل PDF",
        };
      }
    }
  }

  /**
   * Generate PDF using html2canvas + jsPDF
   */
  private async generatePDFWithCanvas(
    htmlContent: string,
    options: any
  ): Promise<PDFGenerationResult> {
    // Create temporary element
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "0";
    tempDiv.style.width = "210mm";
    tempDiv.style.background = "white";

    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794, // A4 width in pixels at 96dpi
        height: 1123, // A4 height in pixels at 96dpi
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      return {
        success: true,
        pdfBlob,
        pdfUrl,
      };
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * Generate simple PDF using jsPDF text methods
   */
  private async generateSimplePDF(
    htmlContent: string,
    options: any
  ): Promise<PDFGenerationResult> {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add basic text content
    pdf.text("Invoice", 20, 20);
    pdf.text("This is a simplified PDF version.", 20, 30);
    pdf.text("Please use a modern browser for full PDF generation.", 20, 40);

    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return {
      success: true,
      pdfBlob,
      pdfUrl,
    };
  }

  /**
   * Download PDF file
   */
  downloadPDF(pdfBlob: Blob, filename: string): void {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Prepare email with PDF attachment
   */
  prepareEmailDelivery(
    invoice: Invoice,
    pdfBlob: Blob,
    options: InvoiceGenerationOptions["email_delivery"] = {}
  ): EmailDeliveryData {
    const isRTL = invoice.locale === "fa";
    const {
      to = invoice.customer.email || "",
      subject = isRTL
        ? `فاکتور ${invoice.invoice_number} - ${invoice.company.name}`
        : `Invoice ${invoice.invoice_number} - ${invoice.company.name}`,
      body = isRTL
        ? `سلام ${invoice.customer.name}،

فاکتور شما با شماره ${invoice.invoice_number} آماده است.

جز
