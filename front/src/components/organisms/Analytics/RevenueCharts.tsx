"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface ChartData {
  label: string;
  value: number;
  date: string;
}

interface RevenueData {
  daily: ChartData[];
  weekly: ChartData[];
  monthly: ChartData[];
  yearly: ChartData[];
}

const RevenueCharts: React.FC = () => {
  const t = useTranslations("analytics");

  const [activeChart, setActiveChart] = useState<"line" | "bar" | "pie">("line");
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData>({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  });

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real app, this would call APIs
      const mockData: RevenueData = {
        daily: [
          { label: "شنبه", value: 4200000, date: "2024-01-20" },
          { label: "یکشنبه", value: 3800000, date: "2024-01-21" },
          { label: "دوشنبه", value: 5100000, date: "2024-01-22" },
          { label: "سه‌شنبه", value: 4600000, date: "2024-01-23" },
          { label: "چهارشنبه", value: 5800000, date: "2024-01-24" },
          { label: "پنج‌شنبه", value: 6200000, date: "2024-01-25" },
          { label: "جمعه", value: 3900000, date: "2024-01-26" }
        ],
        weekly: [
          { label: "هفته 1", value: 28500000, date: "2024-01-01" },
          { label: "هفته 2", value: 32200000, date: "2024-01-08" },
          { label: "هفته 3", value: 29800000, date: "2024-01-15" },
          { label: "هفته 4", value: 35100000, date: "2024-01-22" }
        ],
        monthly: [
          { label: "مهر", value: 98500000, date: "2023-10-01" },
          { label: "آبان", value: 112300000, date: "2023-11-01" },
          { label: "آذر", value: 125800000, date: "2023-12-01" },
          { label: "دی", value: 108900000, date: "2024-01-01" },
          { label: "بهمن", value: 134500000, date: "2024-02-01" },
          { label: "اسفند", value: 142100000, date: "2024-03-01" }
        ],
        yearly: [
          { label: "1400", value: 985000000, date: "2021-01-01" },
          { label: "1401", value: 1245000000, date: "2022-01-01" },
          { label: "1402", value: 1587000000, date: "2023-01-01" },
          { label: "1403", value: 1823000000, date: "2024-01-01" }
        ]
      };

      setRevenueData(mockData);
    } catch (error) {
      console.error("Failed to load revenue data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const getCurrentData = () => {
    return revenueData[selectedPeriod] || [];
  };

  const getMaxValue = () => {
    const data = getCurrentData();
    return Math.max(...data.map(item => item.value));
  };

  const getGrowthRate = () => {
    const data = getCurrentData();
    if (data.length < 2) return 0;

    const current = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    return ((current - previous) / previous) * 100;
  };

  const renderLineChart = () => {
    const data = getCurrentData();
    const maxValue = getMaxValue();

    return (
      <div className="relative">
        <svg className="w-full h-64" viewBox="0 0 800 300">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((index) => (
            <g key={index}>
              <line
                x1="60"
                y1={50 + (index * 50)}
                x2="740"
                y2={50 + (index * 50)}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x="50"
                y={55 + (index * 50)}
                className="text-xs fill-gray-500"
                textAnchor="end"
              >
                {formatCurrency(maxValue - (maxValue / 4) * index)}
              </text>
            </g>
          ))}

          {/* Chart line */}
          <polyline
            points={data.map((item, index) => {
              const x = 60 + (index * (680 / (data.length - 1)));
              const y = 250 - ((item.value / maxValue) * 200);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
          />

          {/* Data points */}
          {data.map((item, index) => {
            const x = 60 + (index * (680 / (data.length - 1)));
            const y = 250 - ((item.value / maxValue) * 200);

            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y="285"
                  className="text-xs fill-gray-600"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderBarChart = () => {
    const data = getCurrentData();
    const maxValue = getMaxValue();

    return (
      <div className="relative">
        <svg className="w-full h-64" viewBox="0 0 800 300">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((index) => (
            <g key={index}>
              <line
                x1="60"
                y1={50 + (index * 50)}
                x2="740"
                y2={50 + (index * 50)}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x="50"
                y={55 + (index * 50)}
                className="text-xs fill-gray-500"
                textAnchor="end"
              >
                {formatCurrency(maxValue - (maxValue / 4) * index)}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((item, index) => {
            const barWidth = 680 / data.length * 0.6;
            const x = 60 + (index * (680 / data.length)) + ((680 / data.length) - barWidth) / 2;
            const height = (item.value / maxValue) * 200;
            const y = 250 - height;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height}
                  fill="#3b82f6"
                  rx="4"
                />
                <text
                  x={x + barWidth / 2}
                  y="285"
                  className="text-xs fill-gray-600"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderPieChart = () => {
    const data = getCurrentData();
    const total = data.reduce((sum, item) => sum + item.value, 0);

    let cumulativeAngle = 0;
    const centerX = 150;
    const centerY = 150;
    const radius = 80;

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

    return (
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <svg className="w-80 h-80" viewBox="0 0 300 300">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + angle;

            const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              "M", centerX, centerY,
              "L", x1, y1,
              "A", radius, radius, 0, largeArcFlag, 1, x2, y2,
              "Z"
            ].join(" ");

            cumulativeAngle += angle;

            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.value)} ({percentage}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const growthRate = getGrowthRate();
  const data = getCurrentData();

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t("charts.revenue.title")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("charts.revenue.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${
              growthRate >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {growthRate >= 0 ? "+" : ""}{growthRate.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">
              {t("charts.growth")}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["line", "bar", "pie"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveChart(type)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeChart === type
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t(`charts.types.${type}`)}
              </button>
            ))}
          </div>

          {/* Period Selection */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t(`dashboard.periods.${period}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4 sm:p-6">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("charts.noData.title")}
            </h3>
            <p className="text-gray-600">
              {t("charts.noData.description")}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            {activeChart === "line" && renderLineChart()}
            {activeChart === "bar" && renderBarChart()}
            {activeChart === "pie" && renderPieChart()}
          </div>
        )}
      </div>

      {/* Chart Summary */}
      {data.length > 0 && (
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">{t("charts.summary.highest")}</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(Math.max(...data.map(item => item.value)))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("charts.summary.lowest")}</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(Math.min(...data.map(item => item.value)))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("charts.summary.average")}</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(data.reduce((sum, item) => sum + item.value, 0) / data.length)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("charts.summary.total")}</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueCharts;
