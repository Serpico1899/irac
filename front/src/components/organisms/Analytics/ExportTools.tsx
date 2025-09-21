"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
} from "@heroicons/react/24/outline";

interface ExportRequest {
  reportType:
    | "revenue_dashboard"
    | "user_engagement"
    | "course_performance"
    | "booking_analytics"
    | "top_performers"
    | "comprehensive"
    | "custom";
  exportFormat: "pdf" | "excel" | "csv" | "json";
  dateFrom?: string;
  dateTo?: string;
  period: "7d" | "30d" | "90d" | "1y" | "all";
  includeCharts: boolean;
  includeRawData: boolean;
  language: "fa" | "en";
  emailReport: boolean;
  emailRecipients: string[];
  scheduledReport: boolean;
  scheduleFrequency?: "daily" | "weekly" | "monthly" | "quarterly";
  customFilters: {
    categoryId?: string;
    instructorId?: string;
    userId?: string;
    spaceId?: string;
    status?: string;
    minRevenue?: string;
    maxRevenue?: string;
  };
  reportSections: string[];
  companyLogo: boolean;
  customTitle?: string;
  customDescription?: string;
  confidential: boolean;
}

interface ExportResponse {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
  reportMetadata?: any;
  emailStatus?: any;
  scheduleId?: string;
  expiresAt?: string;
  generatedAt?: string;
  reportSummary?: any;
  errorMessage?: string;
}

interface RecentExport {
  id: string;
  fileName: string;
  format: string;
  reportType: string;
  downloadUrl: string;
  fileSize: number;
  generatedAt: string;
  expiresAt: string;
  status: "ready" | "generating" | "expired" | "error";
}

const ExportTools: React.FC = () => {
  const t = useTranslations("analytics");

  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportRequest, setExportRequest] = useState<ExportRequest>({
    reportType: "comprehensive",
    exportFormat: "pdf",
    period: "30d",
    includeCharts: true,
    includeRawData: false,
    language: "fa",
    emailReport: false,
    emailRecipients: [],
    scheduledReport: false,
    customFilters: {},
    reportSections: ["overview", "metrics", "trends"],
    companyLogo: true,
    confidential: false,
  });
  const [recentExports, setRecentExports] = useState<RecentExport[]>([]);
  const [exportResult, setExportResult] = useState<ExportResponse | null>(null);
  const [emailInput, setEmailInput] = useState("");

  // Load recent exports on component mount
  useEffect(() => {
    loadRecentExports();
  }, []);

  const loadRecentExports = async () => {
    try {
      // This would call an API to get recent exports
      // For now, using mock data
      const mockExports: RecentExport[] = [
        {
          id: "exp_001",
          fileName: "revenue_report_2024-01-20.pdf",
          format: "PDF",
          reportType: "revenue_dashboard",
          downloadUrl: "/downloads/revenue_report_2024-01-20.pdf",
          fileSize: 2400,
          generatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "ready",
        },
        {
          id: "exp_002",
          fileName: "user_analytics_2024-01-20.xlsx",
          format: "Excel",
          reportType: "user_engagement",
          downloadUrl: "/downloads/user_analytics_2024-01-20.xlsx",
          fileSize: 1800,
          generatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
          status: "ready",
        },
      ];
      setRecentExports(mockExports);
    } catch (error) {
      console.error("Error loading recent exports:", error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const response = await fetch("/api/analytics/exportReports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          details: exportRequest,
        }),
      });

      const result: ExportResponse = await response.json();
      setExportResult(result);

      if (result.success) {
        // Reload recent exports to show the new one
        await loadRecentExports();

        // Show success message
        setTimeout(() => {
          setExportResult(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Export error:", error);
      setExportResult({
        success: false,
        errorMessage: "خطا در تولید گزارش",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const addEmailRecipient = () => {
    if (
      emailInput.trim() &&
      !exportRequest.emailRecipients.includes(emailInput.trim())
    ) {
      setExportRequest((prev) => ({
        ...prev,
        emailRecipients: [...prev.emailRecipients, emailInput.trim()],
      }));
      setEmailInput("");
    }
  };

  const removeEmailRecipient = (email: string) => {
    setExportRequest((prev) => ({
      ...prev,
      emailRecipients: prev.emailRecipients.filter((e) => e !== email),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " بایت";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " کیلوبایت";
    return Math.round(bytes / (1024 * 1024)) + " مگابایت";
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} دقیقه پیش`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ساعت پیش`;
    }

    return date.toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      revenue_dashboard: "گزارش درآمد",
      user_engagement: "مشارکت کاربران",
      course_performance: "عملکرد دوره‌ها",
      booking_analytics: "آمار رزروها",
      top_performers: "بهترین عملکردها",
      comprehensive: "گزارش جامع",
      custom: "گزارش سفارشی",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-green-600 bg-green-50";
      case "generating":
        return "text-yellow-600 bg-yellow-50";
      case "expired":
        return "text-gray-600 bg-gray-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ready: "آماده",
      generating: "در حال تولید",
      expired: "منقضی شده",
      error: "خطا",
    };
    return labels[status] || status;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Export Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ArrowDownTrayIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">
              صادرات گزارش جدید
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CogIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Report Type Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">
              نوع گزارش
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "revenue_dashboard", label: "درآمد" },
                { value: "user_engagement", label: "کاربران" },
                { value: "course_performance", label: "دوره‌ها" },
                { value: "booking_analytics", label: "رزروها" },
                { value: "top_performers", label: "برترین‌ها" },
                { value: "comprehensive", label: "جامع" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setExportRequest((prev) => ({
                      ...prev,
                      reportType: option.value as any,
                    }))
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    exportRequest.reportType === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">
              فرمت خروجی
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "pdf", label: "PDF", icon: "📄" },
                { value: "excel", label: "Excel", icon: "📊" },
                { value: "csv", label: "CSV", icon: "📋" },
                { value: "json", label: "JSON", icon: "💾" },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() =>
                    setExportRequest((prev) => ({
                      ...prev,
                      exportFormat: format.value as any,
                    }))
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    exportRequest.exportFormat === format.value
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{format.icon}</span>
                  {format.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">
              بازه زمانی
            </label>
            <select
              value={exportRequest.period}
              onChange={(e) =>
                setExportRequest((prev) => ({
                  ...prev,
                  period: e.target.value as any,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">۷ روز گذشته</option>
              <option value="30d">۳۰ روز گذشته</option>
              <option value="90d">۳ ماه گذشته</option>
              <option value="1y">یک سال گذشته</option>
              <option value="all">همه زمان‌ها</option>
            </select>
          </div>

          {/* Advanced Options (Collapsible) */}
          {isOpen && (
            <div className="flex flex-col gap-6 p-4 bg-gray-50 rounded-lg">
              {/* Include Options */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700">
                  گزینه‌های اضافی
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportRequest.includeCharts}
                      onChange={(e) =>
                        setExportRequest((prev) => ({
                          ...prev,
                          includeCharts: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">شامل نمودارها</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportRequest.includeRawData}
                      onChange={(e) =>
                        setExportRequest((prev) => ({
                          ...prev,
                          includeRawData: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      شامل داده‌های خام
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportRequest.confidential}
                      onChange={(e) =>
                        setExportRequest((prev) => ({
                          ...prev,
                          confidential: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">محرمانه</span>
                  </label>
                </div>
              </div>

              {/* Email Options */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportRequest.emailReport}
                    onChange={(e) =>
                      setExportRequest((prev) => ({
                        ...prev,
                        emailReport: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    ارسال گزارش از طریق ایمیل
                  </span>
                </label>

                {exportRequest.emailReport && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="example@domain.com"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) =>
                          e.key === "Enter" && addEmailRecipient()
                        }
                      />
                      <button
                        onClick={addEmailRecipient}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        افزودن
                      </button>
                    </div>
                    {exportRequest.emailRecipients.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exportRequest.emailRecipients.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                          >
                            <span>{email}</span>
                            <button
                              onClick={() => removeEmailRecipient(email)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Scheduled Reports */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportRequest.scheduledReport}
                    onChange={(e) =>
                      setExportRequest((prev) => ({
                        ...prev,
                        scheduledReport: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    برنامه‌ریزی گزارش دوره‌ای
                  </span>
                </label>

                {exportRequest.scheduledReport && (
                  <select
                    value={exportRequest.scheduleFrequency}
                    onChange={(e) =>
                      setExportRequest((prev) => ({
                        ...prev,
                        scheduleFrequency: e.target.value as any,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="daily">روزانه</option>
                    <option value="weekly">هفتگی</option>
                    <option value="monthly">ماهانه</option>
                    <option value="quarterly">فصلی</option>
                  </select>
                )}
              </div>

              {/* Custom Title */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  عنوان سفارشی (اختیاری)
                </label>
                <input
                  type="text"
                  value={exportRequest.customTitle || ""}
                  onChange={(e) =>
                    setExportRequest((prev) => ({
                      ...prev,
                      customTitle: e.target.value,
                    }))
                  }
                  placeholder="عنوان گزارش..."
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isExporting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isExporting ? (
              <RefreshIcon className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="w-5 h-5" />
            )}
            {isExporting ? "در حال تولید گزارش..." : "تولید و دانلود گزارش"}
          </button>

          {/* Export Result */}
          {exportResult && (
            <div
              className={`p-4 rounded-lg ${
                exportResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {exportResult.success ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  {exportResult.success ? (
                    <>
                      <p className="font-medium text-green-800">
                        گزارش با موفقیت تولید شد!
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        فایل: {exportResult.fileName}
                        {exportResult.fileSize &&
                          ` (${formatFileSize(exportResult.fileSize)})`}
                      </p>
                      {exportResult.downloadUrl && (
                        <a
                          href={exportResult.downloadUrl}
                          download
                          className="inline-flex items-center gap-1 mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4" />
                          دانلود فایل
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-red-800">
                      {exportResult.errorMessage || "خطا در تولید گزارش"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Exports */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            آخرین گزارش‌های تولید شده
          </h3>
          <button
            onClick={loadRecentExports}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="به‌روزرسانی لیست"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>

        {recentExports.length === 0 ? (
          <div className="text-center py-8">
            <DocumentArrowDownIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">هنوز گزارشی تولید نشده است</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentExports.map((exportItem) => (
              <div
                key={exportItem.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DocumentArrowDownIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-medium text-gray-900">
                      {getReportTypeLabel(exportItem.reportType)}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{exportItem.format}</span>
                      <span>•</span>
                      <span>{formatFileSize(exportItem.fileSize)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(exportItem.generatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      exportItem.status,
                    )}`}
                  >
                    {getStatusLabel(exportItem.status)}
                  </span>
                  {exportItem.status === "ready" && (
                    <a
                      href={exportItem.downloadUrl}
                      download
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      دانلود
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Tips */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h4 className="font-semibold text-blue-900 mb-3">نکات مهم:</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            گزارش‌های تولید شده به مدت ۲۴ ساعت قابل دانلود هستند
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            فرمت PDF شامل نمودارها و طراحی مناسب برای چاپ است
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            فرمت Excel برای تحلیل‌های پیشرفته و محاسبات مناسب است
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            گزارش‌های برنامه‌ریزی شده در ساعات تعریف شده ارسال می‌شوند
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ExportTools;
