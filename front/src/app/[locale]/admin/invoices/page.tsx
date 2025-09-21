"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Mail,
  Download,
  Edit,
  MoreVertical,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface Invoice {
  _id: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'refunded';
  customer: {
    name: string;
    email?: string;
    company_name?: string;
  };
  issue_date: string;
  due_date?: string;
  payment_date?: string;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  currency: string;
  locale: string;
}

interface InvoiceStats {
  total_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  draft_invoices: number;
  total_revenue: number;
  pending_revenue: number;
  payment_rate: number;
}

const InvoiceManagementPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    viewed: 'bg-indigo-100 text-indigo-800',
    paid: 'bg-green-100 text-green-800',
    partially_paid: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
    refunded: 'bg-purple-100 text-purple-800'
  };

  const statusLabels = {
    draft: 'پیش‌نویس',
    sent: 'ارسال شده',
    viewed: 'مشاهده شده',
    paid: 'پرداخت شده',
    partially_paid: 'نیمه پرداخت',
    overdue: 'سررسید گذشته',
    cancelled: 'لغو شده',
    refunded: 'بازپرداخت شده'
  };

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [currentPage, statusFilter, searchQuery]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Simulated API call - replace with actual API
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: currentPage,
          limit: 20,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchQuery || undefined,
        }),
      });

      const data = await response.json();
      setInvoices(data.invoices || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Simulated API call - replace with actual API
      const response = await fetch('/api/admin/invoices/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'IRR') => {
    return new Intl.NumberFormat('fa-IR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' ریال';
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(dateString));
  };

  const handleSendEmail = async (invoiceId: string) => {
    try {
      await fetch('/api/admin/invoices/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: invoiceId }),
      });
      // Show success message
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleGeneratePDF = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/pdf/${invoiceId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const StatsCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> =
    ({ title, value, icon, color }) => (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            {icon}
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">مدیریت فاکتورها</h1>
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              فاکتور جدید
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="کل فاکتورها"
                value={stats.total_invoices.toLocaleString('fa-IR')}
                icon={<FileText className="w-6 h-6" />}
                color="text-blue-600"
              />
              <StatsCard
                title="پرداخت شده"
                value={stats.paid_invoices.toLocaleString('fa-IR')}
                icon={<CheckCircle className="w-6 h-6" />}
                color="text-green-600"
              />
              <StatsCard
                title="سررسید گذشته"
                value={stats.overdue_invoices.toLocaleString('fa-IR')}
                icon={<AlertCircle className="w-6 h-6" />}
                color="text-red-600"
              />
              <StatsCard
                title="کل درآمد"
                value={formatCurrency(stats.total_revenue)}
                icon={<DollarSign className="w-6 h-6" />}
                color="text-primary"
              />
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در فاکتورها..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="draft">پیش‌نویس</option>
              <option value="sent">ارسال شده</option>
              <option value="paid">پرداخت شده</option>
              <option value="overdue">سررسید گذشته</option>
              <option value="cancelled">لغو شده</option>
            </select>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              فیلترها
            </button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">از تاریخ</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تا تاریخ</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ از</label>
                  <input
                    type="number"
                    placeholder="حداقل مبلغ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedInvoices.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedInvoices.length.toLocaleString('fa-IR')} فاکتور انتخاب شده
              </span>
              <div className="flex gap-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Mail className="w-4 h-4" />
                  ارسال ایمیل
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" />
                  دانلود PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices(invoices.map(i => i._id));
                        } else {
                          setSelectedInvoices([]);
                        }
                      }}
                      checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                    />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شماره فاکتور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ صدور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    سررسید
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      در حال بارگذاری...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      فاکتوری یافت نشد
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          checked={selectedInvoices.includes(invoice._id)}
                          onChange={() => toggleInvoiceSelection(invoice._id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customer.name}
                        </div>
                        {invoice.customer.company_name && (
                          <div className="text-sm text-gray-500">
                            {invoice.customer.company_name}
                          </div>
                        )}
                        {invoice.customer.email && (
                          <div className="text-sm text-gray-500">
                            {invoice.customer.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[invoice.status]}`}>
                          {statusLabels[invoice.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.issue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.due_date ? (
                          <div className={`${new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' ? 'text-red-600 font-medium' : ''}`}>
                            {formatDate(invoice.due_date)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.total_amount, invoice.currency)}
                        </div>
                        {invoice.paid_amount > 0 && (
                          <div className="text-xs text-green-600">
                            پرداخت شده: {formatCurrency(invoice.paid_amount, invoice.currency)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            title="مشاهده"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="ارسال ایمیل"
                            onClick={() => handleSendEmail(invoice._id)}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="دانلود PDF"
                            onClick={() => handleGeneratePDF(invoice._id)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => setActionDropdown(actionDropdown === invoice._id ? null : invoice._id)}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {actionDropdown === invoice._id && (
                              <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                                <button className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                  ویرایش
                                </button>
                                <button className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                  کپی
                                </button>
                                <button className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                                  حذف
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    قبلی
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagementPage;
