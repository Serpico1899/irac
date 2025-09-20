"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Invoice, InvoiceGenerationOptions } from "@/types";
import {
  DocumentArrowDownIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface InvoiceDownloadProps {
  invoice: Invoice;
  locale?: string;
  className?: string;
  onDownloadComplete?: (success: boolean) => void;
  onEmailSent?: (success: boolean) => void;
  showEmailOption?: boolean;
  downloadOptions?: Partial<InvoiceGenerationOptions>;
}

export default function InvoiceDownload({
  invoice,
  locale = "fa",
  className = "",
  onDownloadComplete,
  onEmailSent,
  showEmailOption = true,
  downloadOptions = {},
}: InvoiceDownloadProps) {
  const t = useTranslations("Invoice");
  const tCommon = useTranslations("Common");

  const isRTL = locale === "fa";
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    to: invoice.customer.email || "",
    subject: isRTL
      ? `فاکتور ${invoice.invoice_number} - ${invoice.company.name}`
      : `Invoice ${invoice.invoice_number} - ${invoice.company.name}`,
    body: isRTL
      ? `سلام ${invoice.customer.name}،\n\nفاکتور شما با شماره ${invoice.invoice_number} در پیوست ارسال می‌شود.\n\nبا تشکر`
      : `Dear ${invoice.customer.name},\n\nPlease find your invoice #${invoice.invoice_number} attached.\n\nBest regards`,
  });

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    const formatted = amount.toLocaleString(isRTL ? "fa-IR" : "en-US");
    return isRTL ? `${formatted} تومان` : `${formatted} IRR`;
  }, [isRTL]);

  // Mock PDF generation (replace with actual service)
  const generatePDF = useCallback(async (): Promise<{ success: boolean; blob?: Blob; url?: string; error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // This would use the actual InvoicePDFService
      // const pdfService = InvoicePDFService.getInstance();
      // const result = await pdfService.generateInvoicePDF(invoice, downloadOptions);

      // Mock successful PDF generation
      const mockPDFContent = `Mock PDF content for invoice ${invoice.invoice_number}`;
      const blob = new Blob([mockPDFContent], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      return {
        success: true,
        blob,
        url,
      };
    } catch (error) {
      console.error("PDF generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "خطا در تولید فایل PDF",
      };
    }
  }, [invoice, downloadOptions]);

  // Handle PDF download
  const handleDownload = useCallback(async () => {
    setIsDownloading(true);

    try {
      const result = await generatePDF();

      if (result.success && result.blob) {
        // Create download link
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${invoice.invoice_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(t("download") + " " + tCommon("success"));
        onDownloadComplete?.(true);
      } else {
        toast.error(result.error || "خطا در دانلود فاکتور");
        onDownloadComplete?.(false);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("خطا در دانلود فاکتور");
      onDownloadComplete?.(false);
    } finally {
      setIsDownloading(false);
    }
  }, [generatePDF, invoice.invoice_number, t, tCommon, onDownloadComplete]);

  // Handle email sending
  const handleSendEmail = useCallback(async () => {
    if (!emailData.to.trim()) {
      toast.error(isRTL ? "آدرس ایمیل را وارد کنید" : "Please enter email address");
      return;
    }

    setIsSendingEmail(true);

    try {
      // Generate PDF first
      const pdfResult = await generatePDF();

      if (!pdfResult.success || !pdfResult.blob) {
        toast.error("خطا در تولید فایل PDF");
        setIsSendingEmail(false);
        return;
      }

      // Mock email sending
      await new Promise(resolve => setTimeout(resolve, 1500));

      // This would integrate with actual email service
      // const emailResult = await emailService.sendInvoice({
      //   to: emailData.to,
      //   subject: emailData.subject,
      //   body: emailData.body,
      //   attachment: pdfResult.blob,
      //   attachmentName: `invoice-${invoice.invoice_number}.pdf`
      // });

      toast.success(t("sent"));
      setShowEmailForm(false);
      onEmailSent?.(true);
    } catch (error) {
      console.error("Email sending error:", error);
      toast.error("خطا در ارسال ایمیل");
      onEmailSent?.(false);
    } finally {
      setIsSendingEmail(false);
    }
  }, [emailData, generatePDF, invoice.invoice_number, t, isRTL, onEmailSent]);

  return (
    <div className={`flex flex-col bg-background rounded-lg border border-background-darkest ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-background-secondary">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <DocumentArrowDownIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              {t("download")}
            </h3>
            <p className="text-sm text-text-secondary">
              {isRTL ? "دانلود یا ارسال فاکتور" : "Download or send invoice"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>{formatCurrency(invoice.total_amount)}</span>
          <div className={`
            px-2 py-1 rounded text-xs font-medium
            ${invoice.status === "paid" ? "bg-green-100 text-green-800" :
              invoice.status === "sent" ? "bg-blue-100 text-blue-800" :
              invoice.status === "draft" ? "bg-gray-100 text-gray-800" :
              "bg-yellow-100 text-yellow-800"
            }
          `}>
            {invoice.status === "paid" ? (isRTL ? "پرداخت شده" : "Paid") :
             invoice.status === "sent" ? (isRTL ? "ارسال شده" : "Sent") :
             invoice.status === "draft" ? (isRTL ? "پیش‌نویس" : "Draft") :
             invoice.status}
          </div>
        </div>
      </div>

      {/* Download Options */}
      <div className="flex flex-col gap-4 p-4">
        {/* Quick Actions */}
        <div className="flex flex-col gap-3">
          {/* PDF Download */}
          <div className="flex items-center justify-between p-4 bg-background-primary rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded">
                <DocumentArrowDownIcon className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">
                  {isRTL ? "دانلود PDF" : "Download PDF"}
                </span>
                <span className="text-sm text-text-secondary">
                  {isRTL ? "فاکتور به صورت PDF" : "Invoice as PDF file"}
                </span>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark"
            >
              {isDownloading ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  {tCommon("loading")}
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  {t("download")}
                </>
              )}
            </Button>
          </div>

          {/* Email Option */}
          {showEmailOption && (
            <div className="flex items-center justify-between p-4 bg-background-primary rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded">
                  <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">
                    {isRTL ? "ارسال ایمیل" : "Email Invoice"}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {invoice.customer.email || (isRTL ? "ایمیل مشخص نشده" : "No email address")}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowEmailForm(!showEmailForm)}
                disabled={!invoice.customer.email && !showEmailForm}
                variant="ghost"
                className="flex items-center gap-2 text-blue-600 hover:bg-blue-50"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {t("send")}
              </Button>
            </div>
          )}
        </div>

        {/* Email Form */}
        {showEmailForm && (
          <div className="flex flex-col gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-text-primary">
                {isRTL ? "ارسال ایمیل فاکتور" : "Email Invoice"}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmailForm(false)}
                className="w-6 h-6 p-0 text-text-light hover:text-text-primary"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Email Address */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-primary">
                  {isRTL ? "آدرس ایمیل:" : "Email Address:"}
                </label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder={isRTL ? "example@email.com" : "example@email.com"}
                  className="px-3 py-2 border border-background-darkest rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  dir="ltr"
                />
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-primary">
                  {isRTL ? "موضوع:" : "Subject:"}
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="px-3 py-2 border border-background-darkest rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              {/* Message Body */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-primary">
                  {isRTL ? "متن پیام:" : "Message:"}
                </label>
                <textarea
                  value={emailData.body}
                  onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  rows={4}
                  className="px-3 py-2 border border-background-darkest rounded focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              {/* Send Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !emailData.to.trim()}
                  className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isSendingEmail ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      {tCommon("loading")}
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4" />
                      {t("send")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Summary */}
        <div className="flex flex-col gap-2 p-4 bg-background-secondary rounded-lg border-l-4 border-primary">
          <h4 className="font-medium text-text-primary">
            {isRTL ? "خلاصه فاکتور" : "Invoice Summary"}
          </h4>

          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">{t("invoiceNumber")}:</span>
              <span className="font-mono text-text-primary">{invoice.invoice_number}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">{t("invoiceDate")}:</span>
              <span className="text-text-primary">
                {new Date(invoice.issue_date).toLocaleDateString(isRTL ? "fa-IR" : "en-US")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">{isRTL ? "مشتری:" : "Customer:"}:</span>
              <span className="text-text-primary">{invoice.customer.name}</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-background-darkest">
              <span className="font-medium text-text-primary">{t("summary.total")}:</span>
              <span className="font-bold text-primary">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {invoice.status === "paid" && (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-green-800 font-medium">
                {isRTL ? "پرداخت تأیید شده" : "Payment Confirmed"}
              </span>
              <span className="text-green-600 text-sm">
                {invoice.payment_info?.paid_at && (
                  isRTL
                    ? `پرداخت شده در ${new Date(invoice.payment_info.paid_at).toLocaleDateString("fa-IR")}`
                    : `Paid on ${new Date(invoice.payment_info.paid_at).toLocaleDateString("en-US")}`
                )}
              </span>
            </div>
          </div>
        )}

        {invoice.status === "overdue" && (
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-red-800 font-medium">
                {isRTL ? "سررسید گذشته" : "Payment Overdue"}
              </span>
              <span className="text-red-600 text-sm">
                {invoice.due_date && (
                  isRTL
                    ? `سررسید: ${new Date(invoice.due_date).toLocaleDateString("fa-IR")}`
                    : `Due date: ${new Date(invoice.due_date).toLocaleDateString("en-US")}`
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
