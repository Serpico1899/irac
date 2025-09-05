"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useWorkshop } from "@/context/WorkshopContext";
import { useWallet } from "@/context/WalletContext";
import { useScoring } from "@/context/ScoringContext";
import { useAuth } from "@/context/AuthContext";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CreditCardIcon,
  WalletIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  GiftIcon,
  ShieldCheckIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import type {
  CreateReservationRequest,
  PaymentMethod,
  Workshop,
  WorkshopSchedule,
} from "@/types";

interface ReservationFormProps {
  workshopSlug: string;
}

interface FormData {
  participantInfo: {
    name: string;
    email: string;
    phone: string;
    dietaryRestrictions: string;
    accessibilityNeeds: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  selectedScheduleId: string;
  paymentMethod: PaymentMethod;
  couponCode: string;
  useWalletBalance: boolean;
  useScoreDiscount: boolean;
  scorePointsToUse: number;
  bookingNotes: string;
  agreeToTerms: boolean;
}

interface PricingCalculation {
  basePrice: number;
  couponDiscount: number;
  scoreDiscount: number;
  walletUsage: number;
  finalPrice: number;
  remainingAmount: number;
  pointsUsed: number;
  totalSavings: number;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ workshopSlug }) => {
  const t = useTranslations("workshop");
  const { user } = useAuth();
  const {
    createReservation,
    getWorkshopBySlug,
    getWorkshopSchedules,
    isLoading,
    error,
  } = useWorkshop();
  const { state: walletState, walletBalance, walletStats } = useWallet();
  const { userScore, availableRewards } = useScoring();

  const [currentStep, setCurrentStep] = useState(1);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [availableSchedules, setAvailableSchedules] = useState<
    WorkshopSchedule[]
  >([]);
  const [formData, setFormData] = useState<FormData>({
    participantInfo: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      dietaryRestrictions: "",
      accessibilityNeeds: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    },
    selectedScheduleId: "",
    paymentMethod: "zarinpal",
    couponCode: "",
    useWalletBalance: false,
    useScoreDiscount: false,
    scorePointsToUse: 0,
    bookingNotes: "",
    agreeToTerms: false,
  });

  const [pricing, setPricing] = useState<PricingCalculation>({
    basePrice: 2500000,
    couponDiscount: 0,
    scoreDiscount: 0,
    walletUsage: 0,
    finalPrice: 2500000,
    remainingAmount: 2500000,
    pointsUsed: 0,
    totalSavings: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load workshop data and available schedules
    const loadWorkshopData = async () => {
      try {
        const workshopData = await getWorkshopBySlug(workshopSlug);
        if (workshopData) {
          setWorkshop(workshopData);
          const schedulesData = await getWorkshopSchedules(
            workshopData._id,
            new Date().toISOString(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          );
          setAvailableSchedules(schedulesData || []);
        }
      } catch (error) {
        console.error("Failed to load workshop data:", error);
      }
    };

    loadWorkshopData();
  }, [workshopSlug]);

  useEffect(() => {
    calculatePricing();
  }, [formData, walletBalance, userScore]);

  const calculatePricing = () => {
    let basePrice = workshop?.base_price || 2500000;
    let couponDiscount = 0;
    let scoreDiscount = 0;
    let walletUsage = 0;
    let pointsUsed = 0;

    // Coupon discount calculation
    if (formData.couponCode && formData.couponCode === "WELCOME20") {
      couponDiscount = basePrice * 0.2;
    }

    // Score discount calculation
    if (formData.useScoreDiscount && userScore) {
      pointsUsed = Math.min(
        formData.scorePointsToUse,
        userScore.available_points,
      );
      scoreDiscount = pointsUsed * 100; // 100 IRR per point
    }

    // Wallet balance usage
    if (formData.useWalletBalance && walletBalance) {
      const discountedPrice = basePrice - couponDiscount - scoreDiscount;
      walletUsage = Math.min(walletBalance.balance, discountedPrice);
    }

    const totalDiscount = couponDiscount + scoreDiscount;
    const afterDiscountPrice = Math.max(0, basePrice - totalDiscount);
    const finalPrice = Math.max(0, afterDiscountPrice - walletUsage);

    setPricing({
      basePrice,
      couponDiscount,
      scoreDiscount,
      walletUsage,
      finalPrice,
      remainingAmount: finalPrice,
      pointsUsed,
      totalSavings: couponDiscount + scoreDiscount + walletUsage,
    });
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.participantInfo.name) {
        errors.name = t("reservation.validation.nameRequired");
      }
      if (!formData.participantInfo.email) {
        errors.email = t("reservation.validation.emailRequired");
      }
      if (!formData.participantInfo.phone) {
        errors.phone = t("reservation.validation.phoneRequired");
      }
      if (!formData.selectedScheduleId) {
        errors.schedule = t("reservation.validation.scheduleRequired");
      }
    }

    if (step === 2) {
      if (!formData.agreeToTerms) {
        errors.terms = t("reservation.validation.termsRequired");
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    const selectedSchedule = availableSchedules.find(
      (s) => s._id === formData.selectedScheduleId,
    );
    if (!selectedSchedule) return;

    const reservationRequest: CreateReservationRequest = {
      schedule_id: formData.selectedScheduleId,
      participant_info: formData.participantInfo,
      payment_method: formData.paymentMethod,
      amount: pricing.finalPrice,
      coupon_code: formData.couponCode || undefined,
      use_wallet_balance: formData.useWalletBalance,
      wallet_amount_used: formData.useWalletBalance ? pricing.walletUsage : 0,
      use_score_discount: formData.useScoreDiscount,
      score_points_used: formData.useScoreDiscount ? pricing.pointsUsed : 0,
      booking_notes: formData.bookingNotes || undefined,
    };

    try {
      const reservation = await createReservation(reservationRequest);
      if (reservation) {
        setCurrentStep(3); // Success step
      }
    } catch (error) {
      console.error("Reservation failed:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("fa-IR") + " " + t("common.currency");
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("fa-IR"),
      time: date.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reservation.step1.title")}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {t("reservation.step1.description")}
        </p>
      </div>

      {/* Schedule Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t("reservation.schedule.label")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {availableSchedules.map((schedule) => {
            const { date, time } = formatDateTime(
              `${schedule.start_date}T${schedule.start_time}`,
            );
            const isSelected = formData.selectedScheduleId === schedule._id;
            const spotsLeft =
              schedule.max_participants - schedule.current_reservations;

            return (
              <div
                key={schedule._id}
                onClick={() =>
                  setFormData({ ...formData, selectedScheduleId: schedule._id })
                }
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{date}</span>
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4" />
                      <span>
                        {schedule.location?.address ||
                          t("reservation.location.tbd")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {spotsLeft} {t("reservation.spotsLeft")}
                    </div>
                    {isSelected && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-1" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {formErrors.schedule && (
          <p className="mt-1 text-sm text-red-600">{formErrors.schedule}</p>
        )}
      </div>

      {/* Participant Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("reservation.participant.name")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.participantInfo.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  participantInfo: {
                    ...formData.participantInfo,
                    name: e.target.value,
                  },
                })
              }
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("reservation.participant.namePlaceholder")}
            />
          </div>
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("reservation.participant.email")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={formData.participantInfo.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  participantInfo: {
                    ...formData.participantInfo,
                    email: e.target.value,
                  },
                })
              }
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("reservation.participant.emailPlaceholder")}
            />
          </div>
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("reservation.participant.phone")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <PhoneIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              value={formData.participantInfo.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  participantInfo: {
                    ...formData.participantInfo,
                    phone: e.target.value,
                  },
                })
              }
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("reservation.participant.phonePlaceholder")}
            />
          </div>
          {formErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("reservation.participant.emergencyName")}
          </label>
          <input
            type="text"
            value={formData.participantInfo.emergencyContact.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                participantInfo: {
                  ...formData.participantInfo,
                  emergencyContact: {
                    ...formData.participantInfo.emergencyContact,
                    name: e.target.value,
                  },
                },
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("reservation.participant.emergencyNamePlaceholder")}
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("reservation.participant.dietary")}
          </label>
          <textarea
            value={formData.participantInfo.dietaryRestrictions}
            onChange={(e) =>
              setFormData({
                ...formData,
                participantInfo: {
                  ...formData.participantInfo,
                  dietaryRestrictions: e.target.value,
                },
              })
            }
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("reservation.participant.dietaryPlaceholder")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("reservation.participant.notes")}
          </label>
          <textarea
            value={formData.bookingNotes}
            onChange={(e) =>
              setFormData({ ...formData, bookingNotes: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("reservation.participant.notesPlaceholder")}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reservation.step2.title")}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {t("reservation.step2.description")}
        </p>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">
            {t("reservation.pricing.basePrice")}
          </span>
          <span className="font-medium">
            {formatCurrency(pricing.basePrice)}
          </span>
        </div>

        {pricing.couponDiscount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span>{t("reservation.pricing.couponDiscount")}</span>
            <span>-{formatCurrency(pricing.couponDiscount)}</span>
          </div>
        )}

        {pricing.scoreDiscount > 0 && (
          <div className="flex justify-between items-center text-blue-600">
            <span>
              {t("reservation.pricing.scoreDiscount")} ({pricing.pointsUsed}{" "}
              {t("common.points")})
            </span>
            <span>-{formatCurrency(pricing.scoreDiscount)}</span>
          </div>
        )}

        {pricing.walletUsage > 0 && (
          <div className="flex justify-between items-center text-purple-600">
            <span>{t("reservation.pricing.walletUsage")}</span>
            <span>-{formatCurrency(pricing.walletUsage)}</span>
          </div>
        )}

        <hr className="border-gray-300" />

        <div className="flex justify-between items-center text-lg font-semibold">
          <span>{t("reservation.pricing.finalPrice")}</span>
          <span>{formatCurrency(pricing.finalPrice)}</span>
        </div>

        {pricing.totalSavings > 0 && (
          <div className="text-center text-sm text-green-600 font-medium">
            {t("reservation.pricing.totalSavings", {
              amount: formatCurrency(pricing.totalSavings),
            })}
          </div>
        )}
      </div>

      {/* Coupon Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("reservation.coupon.label")}
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={formData.couponCode}
              onChange={(e) =>
                setFormData({ ...formData, couponCode: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("reservation.coupon.placeholder")}
            />
          </div>
          <button
            type="button"
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            {t("reservation.coupon.apply")}
          </button>
        </div>
      </div>

      {/* Wallet Balance Usage */}
      {walletBalance && walletBalance.balance > 0 && (
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-3">
            <WalletIcon className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                {t("reservation.wallet.available")}:{" "}
                {formatCurrency(walletBalance.balance)}
              </p>
              <p className="text-xs text-purple-600">
                {t("reservation.wallet.description")}
              </p>
            </div>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.useWalletBalance}
              onChange={(e) =>
                setFormData({ ...formData, useWalletBalance: e.target.checked })
              }
              className="sr-only"
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                formData.useWalletBalance ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 mx-1 ${
                  formData.useWalletBalance ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      )}

      {/* Score Discount */}
      {userScore && userScore.available_points > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <StarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t("reservation.score.available")}:{" "}
                  {userScore.available_points} {t("common.points")}
                </p>
                <p className="text-xs text-blue-600">
                  {t("reservation.score.description")}
                </p>
              </div>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useScoreDiscount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    useScoreDiscount: e.target.checked,
                  })
                }
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  formData.useScoreDiscount ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 mx-1 ${
                    formData.useScoreDiscount
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
          {formData.useScoreDiscount && (
            <div>
              <label className="block text-sm text-blue-800 mb-2">
                {t("reservation.score.pointsToUse")}
              </label>
              <input
                type="range"
                min="0"
                max={userScore.available_points}
                value={formData.scorePointsToUse}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scorePointsToUse: Number(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-blue-600 mt-1">
                <span>0</span>
                <span>
                  {formData.scorePointsToUse} {t("common.points")}
                </span>
                <span>{userScore.available_points}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t("reservation.payment.method")}
        </label>
        <div className="space-y-2">
          {[
            {
              value: "zarinpal",
              label: t("reservation.payment.zarinpal"),
              icon: CreditCardIcon,
            },
            {
              value: "bank_transfer",
              label: t("reservation.payment.bankTransfer"),
              icon: CreditCardIcon,
            },
          ].map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.value}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === method.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={formData.paymentMethod === method.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="sr-only"
                />
                <Icon className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {method.label}
                </span>
                {formData.paymentMethod === method.value && (
                  <CheckIcon className="h-5 w-5 text-blue-600 ml-auto" />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={(e) =>
            setFormData({ ...formData, agreeToTerms: e.target.checked })
          }
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
          {t("reservation.terms.agree")}{" "}
          <a
            href="/terms"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            {t("reservation.terms.link")}
          </a>
        </label>
      </div>
      {formErrors.terms && (
        <p className="text-sm text-red-600">{formErrors.terms}</p>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircleIcon className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t("reservation.success.title")}
        </h3>
        <p className="text-gray-600">{t("reservation.success.description")}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/user/reservations"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("reservation.success.viewReservations")}
        </a>
        <a
          href="/workshops"
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t("reservation.success.browseMore")}
        </a>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Form Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("reservation.title")}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{currentStep}</span>
            <span>/</span>
            <span>3</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < currentStep ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">
                {t("reservation.error.title")}
              </p>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Form Actions */}
      {currentStep < 3 && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col-reverse sm:flex-row gap-3 justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center justify-center gap-2 px-6 py-3 border font-medium rounded-lg transition-colors ${
              currentStep === 1
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t("reservation.actions.previous")}
          </button>

          <button
            type="button"
            onClick={currentStep === 2 ? handleSubmit : handleNext}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t("reservation.actions.processing")}
              </>
            ) : currentStep === 2 ? (
              <>
                <CheckIcon className="h-4 w-4" />
                {t("reservation.actions.confirm")}
              </>
            ) : (
              <>
                {t("reservation.actions.next")}
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
