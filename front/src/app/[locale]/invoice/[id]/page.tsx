"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Download,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Share2,
  Building,
} from "lucide-react";
import { invoiceApi } from "@/services/invoice/invoiceApi";
import { Invoice } from "@/types";

const PublicInvoicePage: React.FC = () => {
  const params = useParams();
  const invoiceId = params.id as string;
  const locale = params.locale as string;
  const isRTL = locale === "fa";

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const statusColors = {
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    sent: "bg-blue-100 text-blue-800 border-blue-200",
    viewed: "bg-indigo-100 text-indigo-800 border-indigo-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    partially_paid: "bg-yellow-100 text-yellow-800 border-yellow-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
    refunded: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const statusLabels = {
    draft: isRTL ? "پیش‌نویس" : "Draft",
    sent: isRTL ? "ارسال شده" : "Sent",
    viewed: isRTL ? "مشاهده شده" : "Viewed",
    paid: isRTL ? "پرداخت شده" : "Paid",
    partially_paid: isRTL ? "نیمه پرداخت" : "Partially Paid",
    overdue: isRTL ? "سررسید گذشته" : "Overdue",
    cancelled: isRTL ? "لغو شده" : "Cancelled",
    refunded: isRTL ? "بازپرداخت شده" : "Refunded",
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const invoiceData = await invoiceApi.getInvoice(invoiceId);
      setInvoice(invoiceData);

      // Mark as viewed if not already
      if (invoiceData.status === "sent") {
        try {
          await invoiceApi.updateInvoice({
            _id: invoiceId,
            status: "viewed",
          });
          setInvoice((prev) => (prev ? { ...prev, status: "viewed" } : null));
        } catch (viewError) {
          console.error("Failed to update view status:", viewError);
        }
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setError(
        isRTL ? "خطا در دریافت فاکتور" : "Error loading invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "IRR") => {
    if (isRTL) {
      return (
        new Intl.NumberFormat("fa-IR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount) + " ریال"
      );
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isRTL) {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } else {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    setDownloadLoading(true);
    try {
      await invoiceApi.downloadInvoicePDF(invoice);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(
        isRTL
          ? "خطا در دانلود فایل PDF"
          : "Error downloading PDF"
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${isRTL ? "فاکتور" : "Invoice"} ${invoice?.invoice_number}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(
        isRTL
          ? "لینک در کلیپ‌بورد کپی شد"
          : "Link copied to clipboard"
      );
    }
  };

  const getDaysUntilDue = () => {
    if (!invoice?.due_date) return null;
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = () => {
    const days = getDaysUntilDue();
    return days !== null && days < 0 && invoice?.status !== "paid";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary text-lg">
            {isRTL ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {isRTL ? "فاکتور یافت نشد" : "Invoice Not Found"}
          </h1>
          <p className="text-text-secondary mb-6">
            {error ||
              (isRTL
                ? "متأسفانه فاکتور مورد نظر یافت نشد یا ممکن است حذف شده باشد."
                : "Sorry, the requested invoice was not found or may have been deleted.")}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
          >
            {isRTL ? "بازگشت" : "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue();
  const overdueStatus = isOverdue();

  return (
    <div className={`min-h-screen bg-background-primary py-8 ${isRTL ? "rtl" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {isRTL ? "فاکتور" : "Invoice"} {invoice.invoice_number}
            </h1>
            <p className="text-text-secondary">
              {isRTL ? "شرکت آکادمی آیراک" : "IRAC Academy"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={isRTL ? "اشتراک‌گذاری" : "Share"}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={isRTL ? "چاپ" : "Print"}
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadLoading}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {downloadLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isRTL ? "دانلود PDF" : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Status Alert */}
        {overdueStatus && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 print:hidden">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <div>
                <p className="text-red-800 font-medium">
                  {isRTL
                    ? `این فاکتور ${Math.abs(daysUntilDue!)} روز سررسید گذشته است`
                    : `This invoice is ${Math.abs(daysUntilDue!)} days overdue`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                {invoice.company.logo_url && (
                  <img
                    src={invoice.company.logo_url}
                    alt={invoice.company.name}
                    className="h-16 mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {isRTL ? invoice.company.name : (invoice.company.name_en || invoice.company.name)}
                </h2>
                <div className="text-sm text-text-secondary space-y-1">
                  {invoice.company.address && <div>{invoice.company.address}</div>}
                  {invoice.company.phone && <div>{isRTL ? "تلفن:" : "Phone:"} {invoice.company.phone}</div>}
                  {invoice.company.email && <div>{isRTL ? "ایمیل:" : "Email:"} {invoice.company.email}</div>}
                  {invoice.company.website && <div>{invoice.company.website}</div>}
                </div>
              </div>

              <div className="text-right">
                <div className="text-4xl font-bold text-primary mb-4">
                  {isRTL ? "فاکتور" : "INVOICE"}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>{isRTL ? "شماره:" : "Number:"}</strong> {invoice.invoice_number}
                  </div>
                  <div>
                    <strong>{isRTL ? "تاریخ صدور:" : "Issue Date:"}</strong> {formatDate(invoice.issue_date)}
                  </div>
                  {invoice.due_date && (
                    <div>
                      <strong>{isRTL ? "سررسید:" : "Due Date:"}</strong> {formatDate(invoice.due_date)}
                    </div>
                  )}
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[invoice.status]}`}
                    >
                      {statusLabels[invoice.status]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              {isRTL ? "صادر شده برای:" : "Bill To:"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-semibold text-text-primary text-lg mb-2">
                  {invoice.customer.name}
                </div>
                {invoice.customer.company_name && (
                  <div className="text-text-secondary mb-2">
                    {invoice.customer.company_name}
                  </div>
                )}
                {invoice.customer.national_id && (
                  <div className="text-sm text-text-secondary">
                    {isRTL ? "کد ملی:" : "National ID:"} {invoice.customer.national_id}
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                {invoice.customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-text-secondary" />
                    <span>{invoice.customer.email}</span>
                  </div>
                )}
                {invoice.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text-secondary" />
                    <span>{invoice.customer.phone}</span>
                  </div>
                )}
                {(invoice.customer.address || invoice.customer.city) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-text-secondary mt-0.5" />
                    <span>
                      {[
                        invoice.customer.address,
                        invoice.customer.city,
                        invoice.customer.postal_code,
                        invoice.customer.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-semibold text-text-primary">
                      {isRTL ? "شرح" : "Description"}
                    </th>
                    <th className="text-center py-3 font-semibold text-text-primary">
                      {isRTL ? "تعداد" : "Qty"}
                    </th>
                    <th className="text-right py-3 font-semibold text-text-primary">
                      {isRTL ? "قیمت واحد" : "Unit Price"}
                    </th>
                    {invoice.total_discount > 0 && (
                      <th className="text-right py-3 font-semibold text-text-primary">
                        {isRTL ? "تخفیف" : "Discount"}
                      </th>
                    )}
                    {invoice.total_tax > 0 && (
                      <th className="text-right py-3 font-semibold text-text-primary">
                        {isRTL ? "مالیات" : "Tax"}
                      </th>
                    )}
                    <th className="text-right py-3 font-semibold text-text-primary">
                      {isRTL ? "جمع" : "Total"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4">
                        <div className="font-medium text-text-primary">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-text-secondary mt-1">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="text-center py-4 text-text-primary">
                        {item.quantity.toLocaleString(isRTL ? "fa-IR" : "en-US")}
                      </td>
                      <td className="text-right py-4 text-text-primary">
                        {formatCurrency(item.unit_price, invoice.currency)}
                      </td>
                      {invoice.total_discount > 0 && (
                        <td className="text-right py-4 text-red-600">
                          {item.discount_amount > 0
                            ? `-${formatCurrency(item.discount_amount, invoice.currency)}`
                            : "-"}
                        </td>
                      )}
                      {invoice.total_tax > 0 && (
                        <td className="text-right py-4 text-text-primary">
                          {item.tax_amount > 0
                            ? formatCurrency(item.tax_amount, invoice.currency)
                            : "-"}
                        </td>
                      )}
                      <td className="text-right py-4 font-medium text-text-primary">
                        {formatCurrency(item.line_total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="px-8 py-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">{isRTL ? "جمع جزء:" : "Subtotal:"}</span>
                  <span className="font-medium text-text-primary">
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </span>
                </div>

                {invoice.total_discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">{isRTL ? "تخفیف:" : "Discount:"}</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(invoice.total_discount, invoice.currency)}
                    </span>
                  </div>
                )}

                {invoice.total_tax > 0 && (
                  <>
                    {(invoice.taxes || []).map((tax, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-text-secondary">
                          {isRTL ? tax.name : (tax.name_en || tax.name)} ({tax.rate}%):
                        </span>
                        <span className="font-medium text-text-primary">
                          {formatCurrency(tax.amount, invoice.currency)}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span className="text-text-primary">{isRTL ? "مبلغ کل:" : "Total:"}</span>
                  <span className="text-primary">
                    {formatCurrency(invoice.total_amount, invoice.currency)}
                  </span>
                </div>

                {invoice.paid_amount > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">{isRTL ? "پرداخت شده:" : "Paid:"}</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(invoice.paid_amount, invoice.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-text-primary">{isRTL ? "باقی‌مانده:" : "Balance Due:"}</span>
                      <span className={invoice.balance_due > 0 ? "text-red-600" : "text-green-600"}>
                        {formatCurrency(invoice.balance_due, invoice.currency)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment History */}
          {(invoice.payments || []).length > 0 && (
            <div className="px-8 py-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {isRTL ? "تاریخچه پرداخت‌ها" : "Payment History"}
              </h3>
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.payment_id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">
                        {formatDate(payment.payment_date)}
                      </div>
                      <div className="text-sm text-green-600">
                        {payment.payment_method}
                        {payment.transaction_reference && ` • ${payment.transaction_reference}`}
                      </div>
                    </div>
                    <div className="font-bold text-green-800">
                      {formatCurrency(payment.amount, invoice.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Button */}
          {invoice.balance_due > 0 && invoice.status !== "cancelled" && (
            <div className="px-8 py-6 border-t border-gray-200 text-center print:hidden">
              <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center gap-2 mx-auto">
                <CreditCard className="w-5 h-5" />
                {isRTL ? "پرداخت آنلاین" : "Pay Now"}
              </button>
              <p className="text-sm text-text-secondary mt-2">
                {isRTL
                  ? "با کلیک روی دکمه بالا، به درگاه پرداخت منتقل خواهید شد"
                  : "Click the button above to proceed to secure payment"}
              </p>
            </div>
          )}

          {/* Notes */}
          {(invoice.payment_terms || invoice.notes) && (
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
              {invoice.payment_terms && (
                <div className="mb-4">
                  <h4 className="font-semibold text-text-primary mb-2">
                    {isRTL ? "شرایط پرداخت" : "Payment Terms"}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {isRTL ? invoice.payment_terms : (invoice.payment_terms_en || invoice.payment_terms)}
                  </p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">
                    {isRTL ? "یادداشت‌ها" : "Notes"}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {isRTL ? invoice.notes : (invoice.notes_en || invoice.notes)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-100 text-center text-xs text-text-secondary">
            {isRTL
              ? "این فاکتور به صورت الکترونیکی تولید شده و نیازی به امضا ندارد"
              : "This invoice was generated electronically and does not require a signature"}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PublicInvoicePage;
