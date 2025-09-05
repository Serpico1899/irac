"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@/context/WalletContext";
import {
  walletApi,
  default as WalletApiService,
} from "@/services/wallet/walletApi";
import { WalletTransaction, TransactionQuery } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Filter,
  Download,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface TransactionHistoryProps {
  showFilters?: boolean;
  showExport?: boolean;
  limit?: number;
  className?: string;
}

export function TransactionHistory({
  showFilters = true,
  showExport = false,
  limit = 20,
  className = "",
}: TransactionHistoryProps) {
  const t = useTranslations();
  const { state, fetchTransactionHistory, clearError } = useWallet();

  const [query, setQuery] = useState<TransactionQuery>({
    page: 1,
    limit,
  });

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    handleSearch();
  }, [query]);

  const handleSearch = async () => {
    setIsRefreshing(true);
    await fetchTransactionHistory(query);
    setIsRefreshing(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const newQuery: TransactionQuery = {
      ...query,
      page: 1,
      ...(filters.type && { type: filters.type as any }),
      ...(filters.status && { status: filters.status as any }),
    };
    setQuery(newQuery);
    setShowFiltersPanel(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });
    setQuery({ page: 1, limit });
  };

  const handlePageChange = (newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage }));
  };

  const getTransactionIcon = (type: string) => {
    const isDebit = [
      "withdrawal",
      "purchase",
      "transfer_out",
      "penalty",
    ].includes(type);
    return isDebit ? (
      <ArrowUpRight className="h-4 w-4 text-red-600" />
    ) : (
      <ArrowDownLeft className="h-4 w-4 text-green-600" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const isDebit = [
      "withdrawal",
      "purchase",
      "transfer_out",
      "penalty",
    ].includes(type);
    const sign = isDebit ? "-" : "+";
    const color = isDebit ? "text-red-600" : "text-green-600";
    return (
      <span className={`font-medium ${color}`}>
        {sign}
        {WalletApiService.formatCurrency(amount)}
      </span>
    );
  };

  const TransactionRow = ({
    transaction,
  }: {
    transaction: WalletTransaction;
  }) => (
    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-start xs:items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 mt-1 xs:mt-0">
          {getTransactionIcon(transaction.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-2 xs:mb-1">
            <h4 className="font-medium text-gray-900 text-sm xs:text-base leading-tight">
              {transaction.description ||
                WalletApiService.getTransactionTypeLabel(transaction.type)}
            </h4>
            <Badge
              className={`text-xs self-start xs:self-auto ${WalletApiService.getStatusColor(transaction.status)}`}
            >
              {WalletApiService.getTransactionStatusLabel(transaction.status)}
            </Badge>
          </div>

          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs xs:text-sm text-gray-600">
            <span className="leading-relaxed">
              {formatDate(transaction.created_at)}
            </span>
            {transaction.reference_id && (
              <span className="font-mono text-xs break-all">
                #{transaction.reference_id}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right xs:text-left flex-shrink-0 self-end xs:self-auto">
        <div className="mb-1 text-base xs:text-sm font-medium">
          {formatAmount(transaction.amount, transaction.type)}
        </div>
        <div className="text-xs text-gray-500 leading-relaxed">
          موجودی: {WalletApiService.formatCurrency(transaction.balance_after)}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-lg xs:text-xl">تاریخچه تراکنش‌ها</span>
          </div>

          <div className="flex items-center gap-2 self-end xs:self-auto">
            {showFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={showFiltersPanel ? "bg-gray-100" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}

            {showExport && (
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearch}
              disabled={state.isTransactionLoading || isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${state.isTransactionLoading || isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardTitle>

        {/* Filters Panel */}
        {showFiltersPanel && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg mt-4">
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="نوع تراکنش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه</SelectItem>
                <SelectItem value="deposit">واریز</SelectItem>
                <SelectItem value="withdrawal">برداشت</SelectItem>
                <SelectItem value="purchase">خرید</SelectItem>
                <SelectItem value="refund">بازگشت وجه</SelectItem>
                <SelectItem value="bonus">پاداش</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه</SelectItem>
                <SelectItem value="pending">در انتظار</SelectItem>
                <SelectItem value="completed">تکمیل شده</SelectItem>
                <SelectItem value="failed">ناموفق</SelectItem>
                <SelectItem value="cancelled">لغو شده</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
              <Button onClick={applyFilters} size="sm" className="flex-1">
                اعمال فیلتر
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="flex-1 xs:flex-none"
              >
                پاک کردن
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {state.error && (
          <div className="flex flex-col xs:flex-row xs:items-center gap-3 p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-start gap-2 flex-1">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700 leading-relaxed">
                {state.error}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="self-end xs:self-auto text-red-600 hover:text-red-700"
            >
              بستن
            </Button>
          </div>
        )}

        {state.isTransactionLoading && state.transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 px-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-gray-600 text-center">
              در حال بارگذاری...
            </span>
          </div>
        ) : state.transactions.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {state.transactions.map((transaction) => (
                <TransactionRow
                  key={transaction._id}
                  transaction={transaction}
                />
              ))}
            </div>

            {/* Pagination */}
            {state.transactionHistory &&
              state.transactionHistory.pagination.pages > 1 && (
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 p-4 border-t border-gray-100">
                  <div className="text-xs xs:text-sm text-gray-600 text-center xs:text-right leading-relaxed">
                    صفحه {state.transactionHistory.pagination.page} از{" "}
                    {state.transactionHistory.pagination.pages}
                    <span className="block xs:inline mt-1 xs:mt-0">
                      {" "}
                      ({state.transactionHistory.pagination.total} تراکنش)
                    </span>
                  </div>

                  <div className="flex items-center justify-center xs:justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(query.page! - 1)}
                      disabled={query.page === 1 || state.isTransactionLoading}
                      className="flex-1 xs:flex-none"
                    >
                      <ChevronRight className="h-4 w-4" />
                      قبلی
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(query.page! + 1)}
                      disabled={
                        query.page ===
                          state.transactionHistory.pagination.pages ||
                        state.isTransactionLoading
                      }
                      className="flex-1 xs:flex-none"
                    >
                      بعدی
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
          </>
        ) : (
          <div className="text-center py-16 px-4 text-gray-500">
            <Calendar className="h-16 w-16 mx-auto mb-6 text-gray-400" />
            <p className="text-sm mb-3 leading-relaxed">هیچ تراکنشی یافت نشد</p>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
              پس از انجام اولین تراکنش، تاریخچه در اینجا نمایش داده خواهد شد
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionHistory;
