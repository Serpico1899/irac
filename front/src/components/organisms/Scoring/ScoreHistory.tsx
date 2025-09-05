'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useScoring } from '@/context/ScoringContext';
import {
  ScoreTransaction,
  ScoreTransactionType,
  ScoreTransactionStatus,
  ScoreQuery,
  ScoreHistoryResponse
} from '@/types';

interface ScoreHistoryProps {
  className?: string;
  pageSize?: number;
  showFilters?: boolean;
  compact?: boolean;
}

interface FilterState {
  type?: ScoreTransactionType;
  status?: ScoreTransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({
  className = '',
  pageSize = 10,
  showFilters = true,
  compact = false
}) => {
  const { getScoreHistory, isLoading, error } = useScoring();

  // State management
  const [historyData, setHistoryData] = useState<ScoreHistoryResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  // Transaction type configuration
  const transactionTypeConfig = {
    earn_purchase: {
      label: 'خرید محصول',
      label_en: 'Purchase',
      icon: '🛒',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    earn_review: {
      label: 'نظر دادن',
      label_en: 'Review',
      icon: '⭐',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    earn_referral: {
      label: 'معرفی دوستان',
      label_en: 'Referral',
      icon: '👥',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    earn_activity: {
      label: 'فعالیت روزانه',
      label_en: 'Activity',
      icon: '🎯',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    earn_bonus: {
      label: 'جایزه ویژه',
      label_en: 'Bonus',
      icon: '🎁',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    spend_discount: {
      label: 'استفاده از تخفیف',
      label_en: 'Discount',
      icon: '🏷️',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    spend_reward: {
      label: 'دریافت جایزه',
      label_en: 'Reward',
      icon: '🏆',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    expire: {
      label: 'انقضای امتیاز',
      label_en: 'Expired',
      icon: '⏰',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    adjustment: {
      label: 'تعدیل امتیاز',
      label_en: 'Adjustment',
      icon: '⚖️',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  };

  const statusConfig = {
    pending: { label: 'در انتظار', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    completed: { label: 'تکمیل شده', color: 'text-green-600', bgColor: 'bg-green-100' },
    cancelled: { label: 'لغو شده', color: 'text-red-600', bgColor: 'bg-red-100' },
    expired: { label: 'منقضی شده', color: 'text-gray-600', bgColor: 'bg-gray-100' }
  };

  // Format number with Persian separators
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fa-IR').format(Math.abs(num));
  };

  // Format date to Persian
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load history data
  const loadHistory = useCallback(async (page: number = 1) => {
    setIsLoadingHistory(true);

    const query: ScoreQuery = {
      page,
      limit: pageSize,
      ...filters
    };

    try {
      const data = await getScoreHistory(query);
      if (data) {
        setHistoryData(data);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error loading score history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [getScoreHistory, pageSize, filters]);

  // Handle filter change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      loadHistory(page);
    }
  };

  // Load initial data
  useEffect(() => {
    loadHistory(1);
  }, [loadHistory]);

  // Get transaction config
  const getTransactionConfig = (type: ScoreTransactionType) => {
    return transactionTypeConfig[type] || transactionTypeConfig.earn_activity;
  };

  // Get status config
  const getStatusConfig = (status: ScoreTransactionStatus) => {
    return statusConfig[status] || statusConfig.completed;
  };

  // Loading state
  if (isLoading || isLoadingHistory) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 ${className}`}>
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            {showFilters && (
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            )}
          </div>

          {/* Transaction items skeleton */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !historyData) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-700">
          <span className="text-xl">❌</span>
          <div>
            <p className="font-medium">خطا در بارگذاری تاریخچه</p>
            <p className="text-sm opacity-75">{error}</p>
            <button
              onClick={() => loadHistory(1)}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              تاریخچه امتیازات
            </h3>
            {historyData?.stats && (
              <p className="text-sm text-gray-600">
                کل کسب شده: {formatNumber(historyData.stats.total_earned)} •
                استفاده شده: {formatNumber(historyData.stats.total_spent)}
              </p>
            )}
          </div>

          {showFilters && (
            <div className="flex gap-2">
              {/* Type Filter */}
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange({
                  ...filters,
                  type: e.target.value as ScoreTransactionType || undefined
                })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">همه نوع‌ها</option>
                {Object.entries(transactionTypeConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({
                  ...filters,
                  status: e.target.value as ScoreTransactionStatus || undefined
                })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">همه وضعیت‌ها</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="p-4 sm:p-6">
        {!historyData?.transactions?.length ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600 mb-2">هنوز تراکنش امتیازی ندارید</p>
            <p className="text-sm text-gray-500">
              با خرید محصولات و فعالیت در سایت امتیاز کسب کنید
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {historyData.transactions.map((transaction) => {
              const config = getTransactionConfig(transaction.type);
              const statusConf = getStatusConfig(transaction.status);
              const isExpanded = expandedTransaction === transaction._id;
              const isPositive = transaction.points > 0;

              return (
                <div key={transaction._id} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div
                    className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors ${config.bgColor} ${config.borderColor} border-r-4`}
                    onClick={() => setExpandedTransaction(isExpanded ? null : transaction._id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-lg">{config.icon}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`font-medium ${config.color} text-sm sm:text-base`}>
                              {transaction.description}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatDate(transaction.created_at)}
                              </p>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConf.color} ${statusConf.bgColor}`}>
                                {statusConf.label}
                              </div>
                            </div>
                          </div>

                          {/* Points */}
                          <div className="text-left">
                            <p className={`font-bold text-sm sm:text-base ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {isPositive ? '+' : '-'}{formatNumber(transaction.points)}
                            </p>
                            {transaction.multiplier_applied && transaction.multiplier_applied > 1 && (
                              <p className="text-xs text-green-600">
                                ×{transaction.multiplier_applied}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expand icon */}
                      <div className="flex-shrink-0 text-gray-400">
                        <svg
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">شناسه تراکنش:</span>
                            <span className="mr-2 font-mono">{transaction.transaction_id}</span>
                          </div>

                          {transaction.reference_id && (
                            <div>
                              <span className="text-gray-500">مرجع:</span>
                              <span className="mr-2 font-mono">{transaction.reference_id}</span>
                            </div>
                          )}

                          {transaction.base_points && (
                            <div>
                              <span className="text-gray-500">امتیاز پایه:</span>
                              <span className="mr-2">{formatNumber(transaction.base_points)}</span>
                            </div>
                          )}

                          {transaction.expires_at && (
                            <div>
                              <span className="text-gray-500">انقضا:</span>
                              <span className="mr-2">{formatDate(transaction.expires_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {historyData?.pagination && historyData.pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              صفحه {historyData.pagination.page} از {historyData.pagination.pages}
              ({formatNumber(historyData.pagination.total)} تراکنش)
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                قبلی
              </button>

              {/* Page numbers (show max 5) */}
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, historyData.pagination.pages) }).map((_, i) => {
                  const page = Math.max(1, currentPage - 2) + i;
                  if (page > historyData.pagination.pages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= historyData.pagination.pages}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreHistory;
