"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/useUser";
import { Loader } from "@/components/organisms/Loader";

interface Certificate {
  id: string;
  certificate_number: string;
  issue_date: string;
  status: 'active' | 'revoked';
  template_id: string;
  verification_hash: string;
  final_grade?: number;
  student: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    name: string;
    type: string;
    instructor_name: string;
  };
  revocation?: {
    date: string;
    reason: string;
    revoked_by: string;
  };
}

interface CertificateStats {
  total_certificates: number;
  active_certificates: number;
  revoked_certificates: number;
  certificates_this_period: number;
  pending_generation: number;
  revocation_rate: string;
}

const AdminCertificatesPage: React.FC = () => {
  const t = useTranslations("admin");
  const { user } = useUser();

  // State management
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificates, setSelectedCertificates] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<'overview' | 'certificates' | 'pending' | 'config'>('overview');

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [courseTypeFilter, setCourseTypeFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);

  // Processing states
  const [processingBulk, setProcessingBulk] = useState(false);
  const [processingPending, setProcessingPending] = useState(false);

  // Check admin authorization
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      setError('Access denied. Admin privileges required.');
      return;
    }

    if (user) {
      loadInitialData();
    }
  }, [user]);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCertificateStats(),
        loadCertificates()
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load certificate statistics
  const loadCertificateStats = async () => {
    try {
      const response = await fetch('/api/getCertificateStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          set: { period: 'month' }
        })
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data.overview);
      } else {
        throw new Error(data.error || 'Failed to load statistics');
      }
    } catch (err: any) {
      console.error('Failed to load certificate stats:', err);
    }
  };

  // Load certificates
  const loadCertificates = async () => {
    try {
      const filters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        template_id: templateFilter === 'all' ? undefined : templateFilter,
        search_term: searchTerm || undefined
      };

      const response = await fetch('/api/getAdminCertificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          set: {
            filters,
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
            sort_by: 'certificate_issue_date',
            sort_order: 'desc'
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setCertificates(data.data.certificates);
        setTotalPages(Math.ceil(data.data.pagination.total / itemsPerPage));
      } else {
        throw new Error(data.error || 'Failed to load certificates');
      }
    } catch (err: any) {
      console.error('Failed to load certificates:', err);
      setError(err.message);
    }
  };

  // Process pending certificates
  const processPendingCertificates = async () => {
    if (!confirm('Process all pending certificate generations?')) return;

    try {
      setProcessingPending(true);

      const response = await fetch('/api/processPendingCertificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          set: { limit: 50 }
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Processed ${data.data.processed} certificates. ${data.data.successful} successful, ${data.data.failed} failed.`);
        await loadInitialData();
      } else {
        throw new Error(data.error || 'Failed to process pending certificates');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingPending(false);
    }
  };

  // Bulk operations
  const handleBulkOperation = async (operation: 'generate' | 'revoke' | 'reactivate') => {
    if (selectedCertificates.size === 0) {
      alert('Please select certificates first');
      return;
    }

    let reason = '';
    if (operation === 'revoke') {
      reason = prompt('Enter revocation reason:') || '';
      if (!reason) return;
    }

    if (!confirm(`${operation} ${selectedCertificates.size} selected certificates?`)) return;

    try {
      setProcessingBulk(true);

      const response = await fetch('/api/bulkCertificateOperations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          set: {
            operation,
            enrollment_ids: Array.from(selectedCertificates),
            reason: reason || undefined
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Operation completed. ${data.data.successful} successful, ${data.data.failed} failed.`);
        setSelectedCertificates(new Set());
        await loadCertificates();
      } else {
        throw new Error(data.error || 'Bulk operation failed');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingBulk(false);
    }
  };

  // Toggle certificate selection
  const toggleCertificateSelection = (id: string) => {
    const newSelection = new Set(selectedCertificates);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedCertificates(newSelection);
  };

  // Select all certificates
  const toggleSelectAll = () => {
    if (selectedCertificates.size === certificates.length) {
      setSelectedCertificates(new Set());
    } else {
      setSelectedCertificates(new Set(certificates.map(cert => cert.id)));
    }
  };

  // Apply filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadCertificates();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, templateFilter, courseTypeFilter]);

  // Load certificates when page changes
  useEffect(() => {
    if (user) {
      loadCertificates();
    }
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">خطا در دسترسی</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          مدیریت گواهی‌نامه‌ها
        </h1>

        {/* View Navigation */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-1">
          {[
            { key: 'overview', label: 'نمای کلی' },
            { key: 'certificates', label: 'گواهی‌نامه‌ها' },
            { key: 'pending', label: 'در انتظار' },
            { key: 'config', label: 'تنظیمات' }
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => setCurrentView(view.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === view.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview View */}
      {currentView === 'overview' && stats && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">📜</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">کل گواهی‌نامه‌ها</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_certificates.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">فعال</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_certificates.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-xl">❌</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">ابطال شده</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.revoked_certificates.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">⏳</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">در انتظار تولید</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending_generation.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">اقدامات سریع</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={processPendingCertificates}
                disabled={processingPending || stats.pending_generation === 0}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processingPending && <Loader />}
                <span className="mr-2">پردازش گواهی‌نامه‌های در انتظار ({stats.pending_generation})</span>
              </button>

              <button
                onClick={() => setCurrentView('certificates')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                مشاهده همه گواهی‌نامه‌ها
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificates View */}
      {currentView === 'certificates' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="جستجو در گواهی‌نامه‌ها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="revoked">ابطال شده</option>
              </select>

              <select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">همه قالب‌ها</option>
                <option value="standard">استاندارد</option>
                <option value="premium">ویژه</option>
                <option value="workshop">کارگاه</option>
                <option value="multilingual">دوزبانه</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedCertificates.size > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedCertificates.size} گواهی‌نامه انتخاب شده
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkOperation('revoke')}
                    disabled={processingBulk}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    ابطال
                  </button>
                  <button
                    onClick={() => handleBulkOperation('reactivate')}
                    disabled={processingBulk}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    فعال‌سازی
                  </button>
                  <button
                    onClick={() => setSelectedCertificates(new Set())}
                    className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                  >
                    لغو انتخاب
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Certificates Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="flex bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-4">
                  <div className="w-12 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedCertificates.size === certificates.length && certificates.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1 text-right text-sm font-medium text-gray-700 dark:text-gray-300">شماره گواهی‌نامه</div>
                  <div className="flex-1 text-right text-sm font-medium text-gray-700 dark:text-gray-300">دانشجو</div>
                  <div className="flex-1 text-right text-sm font-medium text-gray-700 dark:text-gray-300">دوره</div>
                  <div className="w-24 text-center text-sm font-medium text-gray-700 dark:text-gray-300">وضعیت</div>
                  <div className="w-24 text-center text-sm font-medium text-gray-700 dark:text-gray-300">قالب</div>
                  <div className="w-32 text-center text-sm font-medium text-gray-700 dark:text-gray-300">تاریخ صدور</div>
                  <div className="w-32 text-center text-sm font-medium text-gray-700 dark:text-gray-300">عملیات</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {certificates.map((certificate) => (
                    <div key={certificate.id} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="w-12 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedCertificates.has(certificate.id)}
                          onChange={() => toggleCertificateSelection(certificate.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex-1 text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {certificate.certificate_number}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {certificate.final_grade && `نمره: ${certificate.final_grade}`}
                        </div>
                      </div>

                      <div className="flex-1 text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {certificate.student.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {certificate.student.email}
                        </div>
                      </div>

                      <div className="flex-1 text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {certificate.course.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {certificate.course.type} • {certificate.course.instructor_name}
                        </div>
                      </div>

                      <div className="w-24 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          certificate.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {certificate.status === 'active' ? 'فعال' : 'ابطال شده'}
                        </span>
                      </div>

                      <div className="w-24 text-center text-sm text-gray-600 dark:text-gray-400">
                        {certificate.template_id}
                      </div>

                      <div className="w-32 text-center text-sm text-gray-600 dark:text-gray-400">
                        {new Date(certificate.issue_date).toLocaleDateString('fa-IR')}
                      </div>

                      <div className="w-32 flex justify-center">
                        <div className="flex gap-1">
                          <button
                            onClick={() => window.open(`/verify-certificate?id=${certificate.certificate_number}`, '_blank')}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="تایید گواهی‌نامه"
                          >
                            🔍
                          </button>
                          <button
                            onClick={() => window.open(`/api/certificate/download/${certificate.certificate_number}`, '_blank')}
                            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="دانلود"
                          >
                            📥
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  صفحه {currentPage} از {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    قبلی
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other views placeholder */}
      {(currentView === 'pending' || currentView === 'config') && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400">
            {currentView === 'pending' ? 'مدیریت گواهی‌نامه‌های در انتظار' : 'تنظیمات سیستم گواهی‌نامه'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            این بخش در حال توسعه است
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificatesPage;
