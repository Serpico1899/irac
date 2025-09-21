"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Mail,
  Download,
  Edit,
  Plus,
  CreditCard,
  Calendar,
  User,
  Building,
  Phone,
  AtSign,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  Printer,
  Share,
} from "lucide-react";

interface Invoice {
  _id: string;
  invoice_number: string;
  invoice_type: string;
  status:
    | "draft"
    | "sent"
    | "viewed"
    | "paid"
    | "partially_paid"
    | "overdue"
    | "cancelled"
    | "refunded";
  issue_date: string;
  due_date?: string;
  payment_date?: string;

  company: {
    name: string;
    name_en?: string;
    logo_url?: string;
    address?: string;
    city?: string;
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
    payment_date: string;
    amount: number;
    payment_method: string;
    transaction_reference?: string;
    notes?: string;
  }>;

  paid_amount: number;
  balance_due: number;

  payment_terms?: string;
  notes?: string;
  locale: string;
}

interface PaymentFormData {
  amount: number;
  payment_method: string;
  transaction_reference: string;
  payment_date: string;
  notes: string;
}

const InvoiceDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    amount: 0,
    payment_method: "",
    transaction_reference: "",
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    viewed: "bg-indigo-100 text-indigo-800",
    paid: "bg-green-100 text-green-800",
    partially_paid: "bg-yellow-100 text-yellow-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-600",
    refunded: "bg-purple-100 text-purple-800",
  };

  const statusLabels = {
    draft: "پیش‌نویس",
    sent: "ارسال شده",
    viewed: "مشاهده شده",
    paid: "پرداخت شده",
    partially_paid: "نیمه پرداخت",
    overdue: "سررسید گذشته",
    cancelled: "لغو شده",
    refunded: "بازپرداخت شده",
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  useEffect(() => {
    if (invoice && invoice.balance_due > 0) {
      setPaymentForm((prev) => ({ ...prev, amount: invoice.balance_due }));
    }
  }, [invoice]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/invoices/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: invoiceId }),
      });

      const data = await response.json();
      if (data.success) {
        setInvoice(data.invoice);
      } else {
        setError(data.error || "خطا در دریافت فاکتور");
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setError("خطا در دریافت فاکتور");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "IRR") => {
    return (
      new Intl.NumberFormat("fa-IR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + " ریال"
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const handleSendEmail = async () => {
    try {
      const response = await fetch("/api/admin/invoices/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: invoiceId }),
      });

      const data = await response.json();
      if (data.success) {
        alert("ایمیل با موفقیت ارسال شد");
        fetchInvoice(); // Refresh to update status
      } else {
        alert("خطا در ارسال ایمیل");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("خطا در ارسال ایمیل");
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`/api/admin/invoices/pdf/${invoiceId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice?.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("خطا در تولید PDF");
    }
  };

  const handleAddPayment = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetch("/api/admin/invoices/add-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          ...paymentForm,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowPaymentModal(false);
        setPaymentForm({
          amount: 0,
          payment_method: "",
          transaction_reference: "",
          payment_date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        fetchInvoice(); // Refresh invoice data
        alert("پرداخت با موفقیت ثبت شد");
      } else {
        alert("خطا در ثبت پرداخت");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("خطا در ثبت پرداخت");
    } finally {
      setPaymentLoading(false);
    }
  };

  const getDaysUntilDue = () => {
    if (!invoice?.due_date) return null;
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">
            {error || "فاکتور یافت نشد"}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                فاکتور {invoice.invoice_number}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[invoice.status]}`}
              >
                {statusLabels[invoice.status]}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Mail className="w-4 h-4" />
                ارسال ایمیل
              </button>
              <button
                onClick={handleGeneratePDF}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                دانلود PDF
              </button>
              {invoice.balance_due > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  ثبت پرداخت
                </button>
              )}
            </div>
          </div>

          {/* Alert for overdue invoices */}
          {isOverdue && (
            <div className="bg-red-50 border-r-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 ml-2" />
                <div>
                  <p className="text-red-800 font-medium">
                    این فاکتور {Math.abs(daysUntilDue!).toLocaleString("fa-IR")}{" "}
                    روز سررسید گذشته است
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Invoice Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  {invoice.company.logo_url && (
                    <img
                      src={invoice.company.logo_url}
                      alt={invoice.company.name}
                      className="h-16 mb-4"
                    />
                  )}
                  <h2 className="text-xl font-bold text-primary mb-2">
                    {invoice.company.name}
                  </h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    {invoice.company.address && (
                      <div>{invoice.company.address}</div>
                    )}
                    {invoice.company.phone && (
                      <div>تلفن: {invoice.company.phone}</div>
                    )}
                    {invoice.company.email && (
                      <div>ایمیل: {invoice.company.email}</div>
                    )}
                    {invoice.company.website && (
                      <div>{invoice.company.website}</div>
                    )}
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    فاکتور
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>شماره:</strong> {invoice.invoice_number}
                    </div>
                    <div>
                      <strong>تاریخ صدور:</strong>{" "}
                      {formatDate(invoice.issue_date)}
                    </div>
                    {invoice.due_date && (
                      <div>
                        <strong>سررسید:</strong> {formatDate(invoice.due_date)}
                      </div>
                    )}
                    {invoice.payment_date && (
                      <div>
                        <strong>تاریخ پرداخت:</strong>{" "}
                        {formatDate(invoice.payment_date)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  اطلاعات مشتری
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {invoice.customer.name}
                    </div>
                    {invoice.customer.company_name && (
                      <div className="text-gray-600">
                        {invoice.customer.company_name}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {invoice.customer.email && (
                      <div className="flex items-center gap-2">
                        <AtSign className="w-4 h-4" />
                        {invoice.customer.email}
                      </div>
                    )}
                    {invoice.customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {invoice.customer.phone}
                      </div>
                    )}
                    {invoice.customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {invoice.customer.address}
                        {invoice.customer.city && `, ${invoice.customer.city}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800">
                  اقلام فاکتور
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        شرح
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        تعداد
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        قیمت واحد
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        تخفیف
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        مالیات
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        جمع
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.line_items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                          {item.quantity.toLocaleString("fa-IR")}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                          {item.discount_amount > 0
                            ? formatCurrency(item.discount_amount)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                          {item.tax_amount > 0
                            ? formatCurrency(item.tax_amount)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          {formatCurrency(item.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment History */}
            {invoice.payments.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800">
                    تاریخچه پرداخت‌ها
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          تاریخ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          روش پرداخت
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          مرجع
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          مبلغ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          یادداشت
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.payments.map((payment) => (
                        <tr key={payment.payment_id}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(payment.payment_date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.payment_method}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.transaction_reference || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-green-600">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {(invoice.payment_terms || invoice.notes) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  شرایط و یادداشت‌ها
                </h4>
                <div className="space-y-4">
                  {invoice.payment_terms && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">
                        شرایط پرداخت
                      </h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {invoice.payment_terms}
                      </p>
                    </div>
                  )}
                  {invoice.notes && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">
                        یادداشت‌ها
                      </h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {invoice.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invoice Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                خلاصه فاکتور
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">جمع جزء:</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.subtotal)}
                  </span>
                </div>
                {invoice.total_discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>تخفیف:</span>
                    <span>-{formatCurrency(invoice.total_discount)}</span>
                  </div>
                )}
                {invoice.total_tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">مالیات:</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.total_tax)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>مبلغ کل:</span>
                  <span className="text-primary">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                </div>
                {invoice.paid_amount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>پرداخت شده:</span>
                      <span className="font-medium">
                        {formatCurrency(invoice.paid_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>باقی‌مانده:</span>
                      <span
                        className={
                          invoice.balance_due > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {formatCurrency(invoice.balance_due)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                وضعیت فاکتور
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">وضعیت فعلی:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[invoice.status]}`}
                  >
                    {statusLabels[invoice.status]}
                  </span>
                </div>
                {invoice.due_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">سررسید:</span>
                    <span
                      className={isOverdue ? "text-red-600 font-medium" : ""}
                    >
                      {formatDate(invoice.due_date)}
                    </span>
                  </div>
                )}
                {daysUntilDue !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">زمان باقی‌مانده:</span>
                    <span
                      className={
                        daysUntilDue < 0
                          ? "text-red-600 font-medium"
                          : daysUntilDue <= 3
                            ? "text-yellow-600 font-medium"
                            : ""
                      }
                    >
                      {daysUntilDue < 0
                        ? `${Math.abs(daysUntilDue)} روز گذشته`
                        : daysUntilDue === 0
                          ? "امروز سررسید است"
                          : `${daysUntilDue} روز تا سررسید`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                عملیات سریع
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    router.push(`/admin/invoices/${invoiceId}/edit`)
                  }
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  ویرایش فاکتور
                </button>
                <button
                  onClick={handleSendEmail}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  ارسال مجدد ایمیل
                </button>
                <button
                  onClick={handleGeneratePDF}
                  className="w-full bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  چاپ فاکتور
                </button>
                <button className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Share className="w-4 h-4" />
                  اشتراک‌گذاری
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">ثبت پرداخت جدید</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    مبلغ پرداخت
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        amount: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="مبلغ را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    روش پرداخت
                  </label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        payment_method: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="bank_transfer">انتقال بانکی</option>
                    <option value="zarinpal">زرین‌پال</option>
                    <option value="wallet">کیف پول</option>
                    <option value="cash">نقدی</option>
                    <option value="check">چک</option>
                    <option value="other">سایر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    شماره تراکنش
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transaction_reference}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        transaction_reference: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="شماره تراکنش (اختیاری)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاریخ پرداخت
                  </label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        payment_date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    یادداشت
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="یادداشت (اختیاری)"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  لغو
                </button>
                <button
                  onClick={handleAddPayment}
                  disabled={
                    paymentLoading ||
                    !paymentForm.amount ||
                    !paymentForm.payment_method
                  }
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      در حال ثبت...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      ثبت پرداخت
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
