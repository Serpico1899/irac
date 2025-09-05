"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard,
  Wallet,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Banknote,
} from "lucide-react";

interface ChargeWalletProps {
  onSuccess?: (amount: number) => void;
  onCancel?: () => void;
  className?: string;
}

export function ChargeWallet({
  onSuccess,
  onCancel,
  className = "",
}: ChargeWalletProps) {
  const t = useTranslations();
  const { state, initiateCharge, clearError } = useWallet();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("zarinpal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Predefined amount options (in Toman)
  const amountOptions = [
    { value: 50000, label: "۵۰,۰۰۰ تومان" },
    { value: 100000, label: "۱۰۰,۰۰۰ تومان" },
    { value: 200000, label: "۲۰۰,۰۰۰ تومان" },
    { value: 500000, label: "۵۰۰,۰۰۰ تومان" },
    { value: 1000000, label: "۱,۰۰۰,۰۰۰ تومان" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount <= 0) {
      newErrors.amount = "لطفاً مبلغ معتبری انتخاب کنید";
    } else if (amount < 10000) {
      newErrors.amount = "حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است";
    } else if (amount > 50000000) {
      newErrors.amount = "حداکثر مبلغ شارژ ۵۰,۰۰۰,۰۰۰ تومان است";
    }

    // Payment method validation
    if (!paymentMethod) {
      newErrors.paymentMethod = "لطفاً روش پرداخت را انتخاب کنید";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers and Persian digits
    const cleanValue = value.replace(/[^\d۰-۹]/g, "");
    const englishValue = cleanValue.replace(/[۰-۹]/g, (d) =>
      "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString(),
    );

    setCustomAmount(englishValue);
    setSelectedAmount(null);
    setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("fa-IR");
  };

  const getCurrentAmount = () => {
    return selectedAmount || parseInt(customAmount) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const amount = getCurrentAmount();
    const chargeDescription =
      description || `شارژ کیف پول به مبلغ ${formatNumber(amount)} تومان`;

    setIsProcessing(true);
    clearError();

    try {
      const paymentUrl = await initiateCharge(amount, chargeDescription);

      if (paymentUrl) {
        // Redirect to payment gateway
        window.location.href = paymentUrl;
        onSuccess?.(amount);
      } else {
        throw new Error("خطا در ایجاد درخواست پرداخت");
      }
    } catch (error: any) {
      setErrors({ general: error.message || "خطا در پردازش درخواست" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="text-lg xs:text-xl">شارژ کیف پول</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Balance Display */}
          {state.balance && (
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                <span className="text-sm text-gray-600">موجودی فعلی:</span>
                <span className="font-bold text-primary text-lg xs:text-xl break-all">
                  {formatNumber(state.balance.balance)} تومان
                </span>
              </div>
            </div>
          )}

          {/* General Error */}
          {(state.error || errors.general) && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700 leading-relaxed">
                {state.error || errors.general}
              </span>
            </div>
          )}

          {/* Amount Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">انتخاب مبلغ شارژ</Label>

            {/* Predefined Amounts */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
              {amountOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleAmountSelect(option.value)}
                  className={`p-4 text-center border-2 rounded-lg transition-all touch-manipulation ${
                    selectedAmount === option.value
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <Banknote className="h-5 w-5 mx-auto mb-2" />
                  <div className="text-sm xs:text-base font-medium">
                    {option.label}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="custom-amount" className="text-sm xs:text-base">
                یا مبلغ دلخواه (تومان)
              </Label>
              <Input
                id="custom-amount"
                type="text"
                placeholder="مثال: ۱۵۰,۰۰۰"
                value={customAmount ? formatNumber(parseInt(customAmount)) : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCustomAmountChange(e.target.value)
                }
                className={`h-12 text-base ${errors.amount ? "border-red-500" : ""}`}
                dir="rtl"
              />
            </div>

            {errors.amount && (
              <p className="text-sm text-red-600 leading-relaxed px-1">
                {errors.amount}
              </p>
            )}

            {/* Amount Preview */}
            {getCurrentAmount() > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                  <span className="text-sm text-green-700">
                    مبلغ قابل پرداخت:
                  </span>
                  <span className="font-bold text-green-800 text-lg break-all">
                    {formatNumber(getCurrentAmount())} تومان
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                  <span className="text-sm text-green-700">
                    موجودی پس از شارژ:
                  </span>
                  <span className="font-medium text-green-800 break-all">
                    {formatNumber(
                      (state.balance?.balance || 0) + getCurrentAmount(),
                    )}{" "}
                    تومان
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <Label className="text-base font-medium">روش پرداخت</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg touch-manipulation">
                <RadioGroupItem value="zarinpal" id="zarinpal" />
                <Label htmlFor="zarinpal" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">Z</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-base">زرین‌پال</div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        پرداخت آنلاین با کارت‌های بانکی
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg opacity-50">
                <RadioGroupItem
                  value="bank_transfer"
                  id="bank_transfer"
                  disabled
                />
                <Label htmlFor="bank_transfer" className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-400 rounded flex items-center justify-center flex-shrink-0">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-base text-gray-500">
                        انتقال بانکی
                      </div>
                      <div className="text-sm text-gray-400 leading-relaxed">
                        به‌زودی فعال می‌شود
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {errors.paymentMethod && (
              <p className="text-sm text-red-600 leading-relaxed px-1">
                {errors.paymentMethod}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm xs:text-base">
              توضیحات (اختیاری)
            </Label>
            <Textarea
              id="description"
              placeholder="توضیحات درخواست شارژ..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              rows={3}
              className="resize-none min-h-[80px] text-base"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-3 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="xs:w-auto h-12 text-base"
                disabled={isProcessing}
              >
                انصراف
              </Button>
            )}

            <Button
              type="submit"
              className="flex-1 h-12 text-base"
              disabled={isProcessing || getCurrentAmount() <= 0}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                  در حال پردازش...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 ml-2" />
                  پرداخت{" "}
                  {getCurrentAmount() > 0
                    ? formatNumber(getCurrentAmount()) + " تومان"
                    : ""}
                </>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-blue-700">
              <div className="font-medium mb-2 text-base">امنیت تراکنش</div>
              <div className="text-blue-600 leading-relaxed">
                تمامی تراکنش‌ها از طریق درگاه امن زرین‌پال انجام می‌شود و
                اطلاعات شما محفوظ است.
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ChargeWallet;
