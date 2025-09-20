"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { InvoiceTax } from "@/types";
import {
  CalculatorIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export interface TaxCalculation {
  subtotal: number;
  taxes: InvoiceTax[];
  totalTax: number;
  totalAmount: number;
  breakdown: {
    taxType: string;
    rate: number;
    taxableAmount: number;
    taxAmount: number;
  }[];
}

export interface TaxConfig {
  vat: {
    enabled: boolean;
    rate: number; // 0.09 for 9%
    name: string;
    name_en?: string;
  };
  serviceCharges: {
    enabled: boolean;
    rate: number;
    name: string;
    name_en?: string;
  };
  customTaxes: Array<{
    id: string;
    enabled: boolean;
    rate: number;
    name: string;
    name_en?: string;
    type: "percentage" | "fixed";
    applyAfterVAT?: boolean;
  }>;
}

interface TaxCalculatorProps {
  subtotal: number;
  locale?: string;
  className?: string;
  initialConfig?: Partial<TaxConfig>;
  isInclusive?: boolean; // Whether prices include tax
  onCalculationChange?: (calculation: TaxCalculation) => void;
  showSettings?: boolean;
  readOnly?: boolean;
}

const DEFAULT_TAX_CONFIG: TaxConfig = {
  vat: {
    enabled: true,
    rate: 0.09, // 9% Iranian VAT
    name: "مالیات بر ارزش افزوده",
    name_en: "Value Added Tax (VAT)",
  },
  serviceCharges: {
    enabled: false,
    rate: 0.05, // 5% service charge
    name: "عوارض خدماتی",
    name_en: "Service Charges",
  },
  customTaxes: [],
};

export default function TaxCalculator({
  subtotal,
  locale = "fa",
  className = "",
  initialConfig,
  isInclusive = false,
  onCalculationChange,
  showSettings = false,
  readOnly = false,
}: TaxCalculatorProps) {
  const t = useTranslations("Invoice");
  const tCommon = useTranslations("Common");

  const isRTL = locale === "fa";
  const [taxConfig, setTaxConfig] = useState<TaxConfig>({
    ...DEFAULT_TAX_CONFIG,
    ...initialConfig,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inclusiveMode, setInclusiveMode] = useState(isInclusive);

  // Format numbers based on locale
  const formatNumber = useCallback((num: number): string => {
    if (isRTL) {
      return num.toLocaleString("fa-IR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }, [isRTL]);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    const formatted = formatNumber(Math.round(amount));
    return isRTL ? `${formatted} تومان` : `${formatted} IRR`;
  }, [formatNumber, isRTL]);

  // Format percentage
  const formatPercentage = useCallback((rate: number): string => {
    const percentage = rate * 100;
    return isRTL
      ? `${formatNumber(percentage)}%`
      : `${percentage.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
  }, [formatNumber, isRTL]);

  // Calculate taxes
  const calculation: TaxCalculation = useMemo(() => {
    let baseAmount = subtotal;
    let totalTaxAmount = 0;
    const taxes: InvoiceTax[] = [];
    const breakdown: TaxCalculation["breakdown"] = [];

    // If prices are inclusive, we need to extract the tax
    if (inclusiveMode) {
      // Calculate total tax rate first
      let totalTaxRate = 0;

      if (taxConfig.vat.enabled) {
        totalTaxRate += taxConfig.vat.rate;
      }

      if (taxConfig.serviceCharges.enabled) {
        totalTaxRate += taxConfig.serviceCharges.rate;
      }

      taxConfig.customTaxes.forEach(tax => {
        if (tax.enabled && tax.type === "percentage") {
          totalTaxRate += tax.rate;
        }
      });

      // Extract base amount from inclusive price
      baseAmount = subtotal / (1 + totalTaxRate);
    }

    // Calculate VAT
    if (taxConfig.vat.enabled) {
      const vatAmount = Math.floor(baseAmount * taxConfig.vat.rate);
      totalTaxAmount += vatAmount;

      taxes.push({
        name: taxConfig.vat.name,
        name_en: taxConfig.vat.name_en,
        rate: taxConfig.vat.rate,
        amount: vatAmount,
        tax_type: "vat",
      });

      breakdown.push({
        taxType: "VAT",
        rate: taxConfig.vat.rate,
        taxableAmount: baseAmount,
        taxAmount: vatAmount,
      });
    }

    // Calculate service charges
    if (taxConfig.serviceCharges.enabled) {
      const serviceAmount = Math.floor(baseAmount * taxConfig.serviceCharges.rate);
      totalTaxAmount += serviceAmount;

      taxes.push({
        name: taxConfig.serviceCharges.name,
        name_en: taxConfig.serviceCharges.name_en,
        rate: taxConfig.serviceCharges.rate,
        amount: serviceAmount,
        tax_type: "service",
      });

      breakdown.push({
        taxType: "Service",
        rate: taxConfig.serviceCharges.rate,
        taxableAmount: baseAmount,
        taxAmount: serviceAmount,
      });
    }

    // Calculate custom taxes
    let currentAmount = baseAmount;
    if (taxConfig.vat.enabled) {
      currentAmount += Math.floor(baseAmount * taxConfig.vat.rate);
    }

    taxConfig.customTaxes.forEach(tax => {
      if (tax.enabled) {
        let taxAmount = 0;
        let taxableAmount = tax.applyAfterVAT ? currentAmount : baseAmount;

        if (tax.type === "percentage") {
          taxAmount = Math.floor(taxableAmount * tax.rate);
        } else {
          taxAmount = tax.rate; // Fixed amount
          taxableAmount = tax.rate;
        }

        totalTaxAmount += taxAmount;

        taxes.push({
          name: tax.name,
          name_en: tax.name_en,
          rate: tax.type === "percentage" ? tax.rate : 0,
          amount: taxAmount,
          tax_type: "custom",
        });

        breakdown.push({
          taxType: tax.name,
          rate: tax.rate,
          taxableAmount,
          taxAmount,
        });
      }
    });

    const result: TaxCalculation = {
      subtotal: Math.round(baseAmount),
      taxes,
      totalTax: totalTaxAmount,
      totalAmount: inclusiveMode ? subtotal : Math.round(baseAmount + totalTaxAmount),
      breakdown,
    };

    return result;
  }, [subtotal, taxConfig, inclusiveMode]);

  // Notify parent of calculation changes
  React.useEffect(() => {
    onCalculationChange?.(calculation);
  }, [calculation, onCalculationChange]);

  // Handle tax config changes
  const updateTaxConfig = useCallback((updates: Partial<TaxConfig>) => {
    if (readOnly) return;
    setTaxConfig(prev => ({ ...prev, ...updates }));
  }, [readOnly]);

  // Toggle VAT
  const toggleVAT = useCallback(() => {
    updateTaxConfig({
      vat: { ...taxConfig.vat, enabled: !taxConfig.vat.enabled }
    });
  }, [taxConfig.vat, updateTaxConfig]);

  // Toggle service charges
  const toggleServiceCharges = useCallback(() => {
    updateTaxConfig({
      serviceCharges: { ...taxConfig.serviceCharges, enabled: !taxConfig.serviceCharges.enabled }
    });
  }, [taxConfig.serviceCharges, updateTaxConfig]);

  // Update VAT rate
  const updateVATRate = useCallback((rate: number) => {
    if (rate < 0 || rate > 1) return;
    updateTaxConfig({
      vat: { ...taxConfig.vat, rate }
    });
  }, [taxConfig.vat, updateTaxConfig]);

  return (
    <div className={`flex flex-col bg-background rounded-lg border border-background-darkest ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-background-secondary">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <CalculatorIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              {isRTL ? "محاسبه مالیات" : "Tax Calculator"}
            </h3>
            <p className="text-sm text-text-secondary">
              {isRTL ? "محاسبه مالیات بر ارزش افزوده" : "Calculate VAT and other taxes"}
            </p>
          </div>
        </div>

        {showSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            {isRTL ? "تنظیمات" : "Settings"}
          </Button>
        )}
      </div>

      {/* Tax Settings (Advanced) */}
      {showAdvanced && showSettings && !readOnly && (
        <div className="flex flex-col gap-4 p-4 bg-background-primary border-b border-background-secondary">
          {/* Inclusive/Exclusive Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-text-primary">
                {isRTL ? "نوع قیمت‌گذاری" : "Price Type"}
              </span>
              <span className="text-sm text-text-secondary">
                {isRTL
                  ? "قیمت‌ها شامل مالیات هستند یا خیر"
                  : "Whether prices include or exclude tax"}
              </span>
            </div>
            <Button
              variant={inclusiveMode ? "primary" : "ghost"}
              size="sm"
              onClick={() => setInclusiveMode(!inclusiveMode)}
            >
              {inclusiveMode
                ? (isRTL ? "شامل مالیات" : "Tax Inclusive")
                : (isRTL ? "بدون مالیات" : "Tax Exclusive")
              }
            </Button>
          </div>

          {/* VAT Settings */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vat-enabled"
                  checked={taxConfig.vat.enabled}
                  onChange={toggleVAT}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="vat-enabled" className="font-medium text-text-primary cursor-pointer">
                  {isRTL ? taxConfig.vat.name : (taxConfig.vat.name_en || taxConfig.vat.name)}
                </label>
                <span className="text-sm text-text-secondary">
                  {formatPercentage(taxConfig.vat.rate)}
                </span>
              </div>
            </div>

            {taxConfig.vat.enabled && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={(taxConfig.vat.rate * 100).toFixed(1)}
                  onChange={(e) => updateVATRate(parseFloat(e.target.value) / 100)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="text-sm text-text-secondary">%</span>
              </div>
            )}
          </div>

          {/* Service Charges Settings */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="service-enabled"
                  checked={taxConfig.serviceCharges.enabled}
                  onChange={toggleServiceCharges}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="service-enabled" className="font-medium text-text-primary cursor-pointer">
                  {isRTL ? taxConfig.serviceCharges.name : (taxConfig.serviceCharges.name_en || taxConfig.serviceCharges.name)}
                </label>
                <span className="text-sm text-text-secondary">
                  {formatPercentage(taxConfig.serviceCharges.rate)}
                </span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-blue-800 font-medium">
                {isRTL ? "توجه" : "Note"}
              </span>
              <span className="text-blue-700">
                {isRTL
                  ? "نرخ مالیات بر ارزش افزوده در ایران ۹% است. این نرخ بر روی مبلغ پس از تخفیف اعمال می‌شود."
                  : "The standard VAT rate in Iran is 9%. This rate applies to the amount after discounts."
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Display */}
      <div className="flex flex-col p-4">
        <div className="flex flex-col gap-3">
          {/* Original Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">
              {inclusiveMode
                ? (isRTL ? "مبلغ بدون مالیات:" : "Amount excl. tax:")
                : (isRTL ? "مبلغ اصلی:" : "Subtotal:")
              }
            </span>
            <span className="font-medium text-text-primary">
              {formatCurrency(calculation.subtotal)}
            </span>
          </div>

          {/* Tax Breakdown */}
          {calculation.taxes.length > 0 && (
            <div className="flex flex-col gap-2">
              {calculation.taxes.map((tax, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-text-secondary">
                      {isRTL ? tax.name : (tax.name_en || tax.name)}
                      {tax.rate > 0 && ` (${formatPercentage(tax.rate)})`}:
                    </span>
                  </div>
                  <span className="font-medium text-text-primary">
                    {formatCurrency(tax.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total Tax */}
          {calculation.totalTax > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-background-secondary">
              <span className="text-text-secondary font-medium">
                {isRTL ? "کل مالیات:" : "Total Tax:"}
              </span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(calculation.totalTax)}
              </span>
            </div>
          )}

          {/* Final Total */}
          <div className="flex justify-between items-center pt-2 border-t border-background-darkest">
            <span className="text-lg font-semibold text-text-primary">
              {isRTL ? "مبلغ نهایی:" : "Total Amount:"}
            </span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(calculation.totalAmount)}
            </span>
          </div>

          {/* Effective Tax Rate */}
          {calculation.totalTax > 0 && calculation.subtotal > 0 && (
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-text-light">
                {isRTL ? "نرخ مؤثر مالیات:" : "Effective tax rate:"}
              </span>
              <span className="text-text-secondary">
                {formatPercentage(calculation.totalTax / calculation.subtotal)}
              </span>
            </div>
          )}
        </div>

        {/* Warning for zero tax */}
        {calculation.totalTax === 0 && (
          <div className="flex items-start gap-3 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-yellow-800 font-medium">
                {isRTL ? "هشدار" : "Warning"}
              </span>
              <span className="text-yellow-700">
                {isRTL
                  ? "هیچ مالیاتی محاسبه نشده است. لطفاً تنظیمات مالیات را بررسی کنید."
                  : "No taxes have been calculated. Please check your tax settings."
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Breakdown (Optional) */}
      {showAdvanced && calculation.breakdown.length > 0 && (
        <div className="flex flex-col p-4 border-t border-background-secondary bg-background-primary">
          <h4 className="font-medium text-text-primary mb-3">
            {isRTL ? "جزئیات محاسبه" : "Calculation Details"}
          </h4>

          <div className="flex flex-col gap-2 text-sm">
            {calculation.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">{item.taxType}</span>
                  <span className="text-text-light">
                    {formatCurrency(item.taxableAmount)} × {formatPercentage(item.rate)}
                  </span>
                </div>
                <span className="font-medium text-text-primary">
                  {formatCurrency(item.taxAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
