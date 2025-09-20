"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Invoice, InvoiceLineItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface InvoiceViewerProps {
  invoice: Invoice;
  locale?: string;
  className?: string;
  showActions?: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
  onSend?: () => void;
  isLoading?: boolean;
}

export default function InvoiceViewer({
  invoice,
  locale = "fa",
  className = "",
  showActions = true,
  onDownload,
  onPrint,
  onSend,
  isLoading = false,
}: InvoiceViewerProps) {
  const t = useTranslations("Invoice");
  const tCommon = useTranslations("Common");
  const tPayment = useTranslations("Payment");

  const isRTL = locale === "fa";
  const [isSending, setIsSending] = useState(false);

  // Format numbers based on locale
  const formatNumber = useCallback((num: number): string => {
    if (isRTL) {
      return num.toLocaleString("fa-IR");
    }
    return num.toLocaleString("en-US");
  }, [isRTL]);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    const formatted = formatNumber(amount);
    return isRTL ? `${formatted} تومان` : `${formatted} IRR`;
  }, [formatNumber, isRTL]);

  // Format date
  const formatDate = useCallback((dateString: string): string => {
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
  }, [isRTL]);

  // Get status color and icon
  const getStatusDisplay = useCallback((status: Invoice["status"]) => {
    const statusMap = {
      draft: {
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: <ClockIcon className="w-4 h-4" />,
        text: isRTL ? "پیش‌نویس" : "Draft",
        stamp: t("draftStamp"),
      },
      sent: {
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: <PaperAirplaneIcon className="w-4 h-4" />,
        text: isRTL ? "ارسال شده" : "Sent",
        stamp: isRTL ? "ارسال شده" : "SENT",
      },
      paid: {
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: <CheckCircleIcon className="w-4 h-4" />,
        text: isRTL ? "پرداخت شده" : "Paid",
        stamp: t("paidStamp"),
      },
      overdue: {
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: <ExclamationTriangleIcon className="w-4 h-4" />,
        text: isRTL ? "سررسید گذشته" : "Overdue",
        stamp: isRTL ? "سررسید گذشته" : "OVERDUE",
      },
      cancelled: {
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: <XCircleIcon className="w-4 h-4" />,
        text: isRTL ? "لغو شده" : "Cancelled",
        stamp: t("cancelledStamp"),
      },
      refunded: {
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        icon: <ReceiptPercentIcon className="w-4 h-4" />,
        text: isRTL ? "استرداد شده" : "Refunded",
        stamp: isRTL ? "استرداد شده" : "REFUNDED",
      },
    };

    return statusMap[status] || statusMap.draft;
  }, [isRTL, t]);

  // Handle print
  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  }, [onPrint]);

  // Handle send
  const handleSend = useCallback(async () => {
    if (!onSend) return;

    setIsSending(true);
    try {
      await onSend();
      toast.success(t("sent"));
    } catch (error) {
      toast.error("خطا در ارسال فاکتور");
    } finally {
      setIsSending(false);
    }
  }, [onSend, t]);

  const statusDisplay = getStatusDisplay(invoice.status);

  return (
    <div className={`flex flex-col bg-white ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Action Bar */}
      {showActions && (
        <div className="flex items-center justify-between p-4 bg-background-primary border-b print:hidden">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${statusDisplay.bgColor}`}>
              {statusDisplay.icon}
              <span className={`font-medium ${statusDisplay.color}`}>
                {statusDisplay.text}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownload}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                {t("download")}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <PrinterIcon className="w-4 h-4" />
              {t("print")}
            </Button>

            {onSend && invoice.status === "draft" && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {isSending ? tCommon("loading") : t("send")}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Invoice Content */}
      <div className="flex flex-col p-8 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-background-secondary">
          {/* Company Logo & Info */}
          <div className="flex flex-col">
            {invoice.company.logo_url && (
              <div className="mb-4">
                <Image
                  src={invoice.company.logo_url}
                  alt={invoice.company.name}
                  width={120}
                  height={60}
                  className="h-12 w-auto"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-text-primary">
                {isRTL ? invoice.company.name : (invoice.company.name_en || invoice.company.name)}
              </h1>

              {invoice.company.address && (
                <p className="text-sm text-text-secondary">
                  {invoice.company.address}
                </p>
              )}

              <div className="flex flex-col gap-0.5 text-sm text-text-secondary">
                {invoice.company.phone && (
                  <span>{isRTL ? "تلفن:" : "Phone:"} {invoice.company.phone}</span>
                )}
                {invoice.company.email && (
                  <span>{isRTL ? "ایمیل:" : "Email:"} {invoice.company.email}</span>
                )}
                {invoice.company.website && (
                  <span>{isRTL ? "وب‌سایت:" : "Website:"} {invoice.company.website}</span>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="flex flex-col items-end text-right">
            <h2 className="text-3xl font-bold text-primary mb-2">
              {t("title")}
            </h2>

            {invoice.status === "paid" && (
              <div className="absolute top-4 right-4 transform rotate-12 text-6xl font-bold text-green-600/20 pointer-events-none select-none">
                {statusDisplay.stamp}
              </div>
            )}

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">{t("invoiceNumber")}:</span>
                <span className="font-mono font-semibold text-text-primary">
                  {invoice.invoice_number}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-text-light" />
                <span className="text-text-secondary">{t("invoiceDate")}:</span>
                <span className="text-text-primary">{formatDate(invoice.issue_date)}</span>
              </div>

              {invoice.due_date && (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">{t("dueDate")}:</span>
                  <span className="text-text-primary">{formatDate(invoice.due_date)}</span>
                </div>
              )}

              {invoice.order_id && (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">{t("orderNumber")}:</span>
                  <span className="font-mono text-text-primary">{invoice.order_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="flex flex-col mb-8">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">{t("customerInfo")}</h3>
          </div>

          <div className="flex flex-col gap-2 bg-background-primary p-4 rounded-lg">
            <div className="text-lg font-medium text-text-primary">
              {invoice.customer.name}
            </div>

            {invoice.customer.company_name && (
              <div className="text-text-secondary">
                {invoice.customer.company_name}
              </div>
            )}

            <div className="flex flex-col gap-1 text-sm text-text-secondary">
              {invoice.customer.email && (
                <div>{isRTL ? "ایمیل:" : "Email:"} {invoice.customer.email}</div>
              )}
              {invoice.customer.phone && (
                <div>{isRTL ? "تلفن:" : "Phone:"} {invoice.customer.phone}</div>
              )}
              {invoice.customer.national_id && (
                <div>{isRTL ? "کد ملی:" : "National ID:"} {invoice.customer.national_id}</div>
              )}
            </div>

            {(invoice.customer.address || invoice.customer.city) && (
              <div className="text-sm text-text-secondary mt-2">
                <div>{isRTL ? "آدرس:" : "Address:"}</div>
                <div className="text-text-primary">
                  {[
                    invoice.customer.address,
                    invoice.customer.city,
                    invoice.customer.postal_code,
                    invoice.customer.country,
                  ].filter(Boolean).join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="flex flex-col mb-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-background-secondary">
                  <th className="text-right p-3 text-sm font-semibold text-text-primary border-b">
                    {t("itemsTable.description")}
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-text-primary border-b w-24">
                    {t("itemsTable.quantity")}
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-text-primary border-b w-32">
                    {t("itemsTable.unitPrice")}
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-text-primary border-b w-32">
                    {t("itemsTable.total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item: InvoiceLineItem, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-background-primary"}>
                    <td className="p-3 border-b">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">
                          {isRTL ? item.description : (item.description_en || item.description)}
                        </span>
                        <span className="text-xs text-text-light capitalize">
                          {item.item_type === "course" ? (isRTL ? "دوره" : "Course") :
                           item.item_type === "workshop" ? (isRTL ? "کارگاه" : "Workshop") :
                           item.item_type === "product" ? (isRTL ? "محصول" : "Product") :
                           isRTL ? "خدمات" : "Service"}
                        </span>
                        {item.discount_amount && item.discount_amount > 0 && (
                          <span className="text-xs text-green-600">
                            {isRTL ? "تخفیف:" : "Discount:"} {formatCurrency(item.discount_amount)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center border-b">
                      <span className="font-medium text-text-primary">
                        {formatNumber(item.quantity)}
                      </span>
                    </td>
                    <td className="p-3 text-right border-b">
                      <span className="font-medium text-text-primary">
                        {formatCurrency(item.unit_price)}
                      </span>
                    </td>
                    <td className="p-3 text-right border-b">
                      <span className="font-bold text-text-primary">
                        {formatCurrency(item.total)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="flex flex-col ml-auto w-full max-w-sm">
          <div className="flex flex-col gap-3 p-4 bg-background-secondary rounded-lg">
            <h4 className="font-semibold text-text-primary border-b border-background-darkest pb-2">
              {t("summary.subtotal")}
            </h4>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">{t("summary.subtotal")}:</span>
                <span className="font-medium text-text-primary">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>

              {invoice.total_discount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>{t("summary.discount")}:</span>
                    <span className="font-medium">
                      -{formatCurrency(invoice.total_discount)}
                    </span>
                  </div>

                  {invoice.discounts.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs text-text-light ml-4">
                      {invoice.discounts.map((discount, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            {discount.coupon_code ? `کد: ${discount.coupon_code}` : discount.description}
                          </span>
                          <span>-{formatCurrency(discount.discount_amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {invoice.total_tax > 0 && (
                <>
                  {invoice.taxes.map((tax, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-text-secondary">
                        {isRTL ? tax.name : (tax.name_en || tax.name)} ({formatNumber(tax.rate * 100)}%):
                      </span>
                      <span className="font-medium text-text-primary">
                        {formatCurrency(tax.amount)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              <div className="flex justify-between pt-2 border-t border-background-darkest">
                <span className="font-bold text-text-primary text-lg">{t("summary.total")}:</span>
                <span className="font-bold text-primary text-lg">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {invoice.payment_info && (
            <div className="flex flex-col gap-2 mt-4 p-4 bg-background-primary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCardIcon className="w-4 h-4 text-primary" />
                <span className="font-medium text-text-primary">{tPayment("title")}</span>
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">{tPayment("paymentMethod")}:</span>
                  <span className="text-text-primary">
                    {invoice.payment_info.method === "zarinpal" ? "زرین‌پال" :
                     invoice.payment_info.method === "mellat" ? "بانک ملت" :
                     invoice.payment_info.method === "saman" ? "بانک سامان" :
                     invoice.payment_info.method === "wallet" ? "کیف پول" :
                     invoice.payment_info.method}
                  </span>
                </div>

                {invoice.payment_info.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{tPayment("transactionId")}:</span>
                    <span className="font-mono text-text-primary text-xs">
                      {invoice.payment_info.transaction_id}
                    </span>
                  </div>
                )}

                {invoice.payment_info.reference_number && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{tPayment("refNumber")}:</span>
                    <span className="font-mono text-text-primary text-xs">
                      {invoice.payment_info.reference_number}
                    </span>
                  </div>
                )}

                {invoice.payment_info.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{tPayment("paymentDate")}:</span>
                    <span className="text-text-primary">
                      {formatDate(invoice.payment_info.paid_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        {(invoice.notes || invoice.terms) && (
          <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-background-secondary">
            {invoice.notes && (
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold text-text-primary">{t("notes")}</h4>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            )}

            {invoice.terms && (
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold text-text-primary">
                  {isRTL ? "قوانین و مقررات" : "Terms & Conditions"}
                </h4>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {invoice.terms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col items-center justify-center mt-8 pt-6 border-t border-background-secondary">
          <p className="text-sm text-text-light text-center">
            {invoice.footer_text || t("footer")}
          </p>

          {invoice.company.tax_id && (
            <p className="text-xs text-text-lighter mt-2">
              {isRTL ? "شناسه مالیاتی:" : "Tax ID:"} {invoice.company.tax_id}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
