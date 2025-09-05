"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: "pdf" | "excel" | "csv" | "json";
  icon: string;
  dataTypes: string[];
}

interface ExportRequest {
  format: "pdf" | "excel" | "csv" | "json";
  dataTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  includeDetails: boolean;
  schedule?: {
    frequency: "once" | "daily" | "weekly" | "monthly";
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
}

const ExportTools: React.FC = () => {
  const t = useTranslations("analytics");

  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv" | "json">("pdf");
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(["revenue"]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [scheduleExport, setScheduleExport] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<"once" | "daily" | "weekly" | "monthly">("once");

  const exportOptions: ExportOption[] = [
    {
      id: "pdf",
      name: t("export.formats.pdf.name"),
      description: t("export.formats.pdf.description"),
      format: "pdf",
      icon: "📄",
      dataTypes: ["revenue", "users", "transactions", "analytics"],
    },
    {
      id: "excel",
      name: t("export.formats.excel.name"),
      description: t("export.formats.excel.description"),
      format: "excel",
      icon: "📊",
      dataTypes: ["revenue", "users", "transactions", "analytics", "detailed"],
    },
    {
      id: "csv",
      name: t("export.formats.csv.name"),
      description: t("export.formats.csv.description"),
      format: "csv",
      icon: "📋",
      dataTypes: ["revenue", "users", "transactions"],
    },
    {
      id: "json",
      name: t("export.formats.json.name"),
      description: t("export.formats.json.description"),
      format: "json",
      icon: "🔧",
      dataTypes: ["revenue", "users", "transactions", "analytics", "detailed", "raw"],
    },
  ];

  const dataTypeOptions = [
    { id: "revenue", name: t("export.dataTypes.revenue"), icon: "💰" },
    { id: "users", name: t("export.dataTypes.users"), icon: "👥" },
    { id: "transactions", name: t("export.dataTypes.transactions"), icon: "💳" },
    { id: "analytics", name: t("export.dataTypes.analytics"), icon: "📈" },
    { id: "detailed", name: t("export.dataTypes.detailed"), icon: "🔍" },
    { id: "raw", name: t("export.dataTypes.raw"), icon: "🗃️" },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportRequest: ExportRequest = {
        format: selectedFormat,
        dataTypes: selectedDataTypes,
        dateRange,
        includeCharts,
        includeDetails,
        ...(scheduleExport && {
          schedule: {
            frequency: scheduleFrequency,
            ...(scheduleFrequency === "weekly" && { dayOfWeek: 1 }),
            ...(scheduleFrequency === "monthly" && { dayOfMonth: 1 }),
          },
        }),
      };

      // Mock export API call - in real app, this would call the export API
      console.log("Export request:", exportRequest);

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock file download
      const fileName = `analytics-export-${Date.now()}.${selectedFormat}`;
      console.log(`Exporting: ${fileName}`);

      // Close the modal
      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedDataTypes(prev =>
      prev.includes(dataType)
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const getAvailableDataTypes = () => {
    const selectedOption = exportOptions.find(opt => opt.format === selectedFormat);
    return dataTypeOptions.filter(dataType =>
      selectedOption?.dataTypes.includes(dataType.id)
    );
  };

  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <span className="text-sm">📥</span>
        <span className="hidden sm:inline">{t("export.button")}</span>
      </button>

      {/* Export Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("export.modal.title")}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t("export.modal.subtitle")}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Export Format Selection */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  {t("export.formatSelection")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exportOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedFormat === option.format
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="exportFormat"
                        value={option.format}
                        checked={selectedFormat === option.format}
                        onChange={(e) => setSelectedFormat(e.target.value as any)}
                        className="sr-only"
                      />
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">{option.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {option.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data Type Selection */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  {t("export.dataSelection")}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getAvailableDataTypes().map((dataType) => (
                    <label
                      key={dataType.id}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedDataTypes.includes(dataType.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDataTypes.includes(dataType.id)}
                        onChange={() => handleDataTypeToggle(dataType.id)}
                        className="sr-only"
                      />
                      <span className="text-sm">{dataType.icon}</span>
                      <span className="text-xs font-medium text-gray-900">
                        {dataType.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Selection */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  {t("export.dateRange")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("export.startDate")}
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("export.endDate")}
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  {t("export.options")}
                </h4>
                <div className="space-y-3">
                  {(selectedFormat === "pdf" || selectedFormat === "excel") && (
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={includeCharts}
                        onChange={(e) => setIncludeCharts(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {t("export.includeCharts")}
                      </span>
                    </label>
                  )}

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={includeDetails}
                      onChange={(e) => setIncludeDetails(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {t("export.includeDetails")}
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={scheduleExport}
                      onChange={(e) => setScheduleExport(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {t("export.scheduleExport")}
                    </span>
                  </label>
                </div>

                {/* Schedule Options */}
                {scheduleExport && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("export.frequency")}
                    </label>
                    <select
                      value={scheduleFrequency}
                      onChange={(e) => setScheduleFrequency(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="once">{t("export.frequencies.once")}</option>
                      <option value="daily">{t("export.frequencies.daily")}</option>
                      <option value="weekly">{t("export.frequencies.weekly")}</option>
                      <option value="monthly">{t("export.frequencies.monthly")}</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Quick Presets */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  {t("export.quickPresets")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: t("export.presets.last7days"), days: 7 },
                    { label: t("export.presets.last30days"), days: 30 },
                    { label: t("export.presets.last90days"), days: 90 },
                    { label: t("export.presets.thisYear"), days: 365 },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      onClick={() => {
                        const end = new Date().toISOString().split("T")[0];
                        const start = new Date(Date.now() - preset.days * 24 * 60 * 60 * 1000)
                          .toISOString().split("T")[0];
                        setDateRange({ start, end });
                      }}
                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t("export.cancel")}
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || selectedDataTypes.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t("export.exporting")}
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    {scheduleExport ? t("export.schedule") : t("export.download")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportTools;
