"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import type { WorkshopReservation, ReservationStatus } from "@/types";

interface FilterState {
  status: ReservationStatus | "all";
  search: string;
  dateFrom: string;
  dateTo: string;
}

const MyReservations: React.FC = () => {
  const t = useTranslations("workshop");
  const {
    myReservations,
    isLoading,
    error,
    getMyReservations,
    cancelReservation,
  } = useWorkshop();

  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    getMyReservations();
  }, [getMyReservations]);

  // Filter reservations based on current filters
  const filteredReservations = myReservations.filter((reservation) => {
    // Status filter
    if (filters.status !== "all" && reservation.status !== filters.status) {
      return false;
    }

    // Search filter (workshop title, instructor, reservation number)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesTitle =
        reservation.workshop.title.toLowerCase().includes(searchTerm) ||
        reservation.workshop.title_en?.toLowerCase().includes(searchTerm);
      const matchesInstructor =
        reservation.workshop.instructor?.name
          .toLowerCase()
          .includes(searchTerm) ||
        reservation.workshop.instructor?.name_en
          ?.toLowerCase()
          .includes(searchTerm);
      const matchesReservationNumber = reservation.reservation_number
        .toLowerCase()
        .includes(searchTerm);

      if (!matchesTitle && !matchesInstructor && !matchesReservationNumber) {
        return false;
      }
    }

    // Date range filter
    if (
      filters.dateFrom &&
      new Date(
        `${reservation.schedule.start_date}T${reservation.schedule.start_time}`,
      ) < new Date(filters.dateFrom)
    ) {
      return false;
    }
    if (
      filters.dateTo &&
      new Date(
        `${reservation.schedule.start_date}T${reservation.schedule.start_time}`,
      ) > new Date(filters.dateTo)
    ) {
      return false;
    }

    return true;
  });

  const getStatusConfig = (status: ReservationStatus) => {
    switch (status) {
      case "confirmed":
        return {
          icon: CheckCircleIconSolid,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          label: t("reservations.status.confirmed"),
        };
      case "pending":
        return {
          icon: ExclamationTriangleIcon,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          label: t("reservations.status.pending"),
        };
      case "cancelled":
        return {
          icon: XCircleIcon,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: t("reservations.status.cancelled"),
        };
      case "completed":
        return {
          icon: CheckCircleIcon,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          label: t("reservations.status.completed"),
        };
      case "no_show":
        return {
          icon: XCircleIcon,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          label: t("reservations.status.no_show"),
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          label: status,
        };
    }
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

  const handleCancelReservation = async (reservationId: string) => {
    if (confirm(t("reservations.cancel.confirm"))) {
      await cancelReservation(reservationId, {
        reason: "user_request",
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12">
        <XCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t("reservations.error.title")}
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("reservations.search.placeholder")}
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            {t("reservations.filters.toggle")}
          </button>
        </div>

        {/* Expanded Filters */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("reservations.filters.status")}
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as ReservationStatus | "all",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">
                  {t("reservations.filters.allStatus")}
                </option>
                <option value="confirmed">
                  {t("reservations.status.confirmed")}
                </option>
                <option value="pending">
                  {t("reservations.status.pending")}
                </option>
                <option value="completed">
                  {t("reservations.status.completed")}
                </option>
                <option value="cancelled">
                  {t("reservations.status.cancelled")}
                </option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("reservations.filters.dateFrom")}
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("reservations.filters.dateTo")}
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {t("reservations.results", { count: filteredReservations.length })}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservations List */}
      {!isLoading && filteredReservations.length > 0 && (
        <div className="grid gap-4 sm:gap-6">
          {filteredReservations.map((reservation) => {
            const statusConfig = getStatusConfig(reservation.status);
            const { date, time } = formatDateTime(
              `${reservation.schedule.start_date}T${reservation.schedule.start_time}`,
            );
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={reservation._id}
                className={`bg-white rounded-lg shadow-sm border p-4 sm:p-6 ${statusConfig.borderColor}`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${statusConfig.bgColor}`}
                      >
                        <StatusIcon
                          className={`h-5 w-5 ${statusConfig.color}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {reservation.workshop.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t("reservations.reservationNumber")}:{" "}
                          {reservation.reservation_number}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Date & Time */}
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {date}
                      </p>
                      <p className="text-sm text-gray-600">{time}</p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(reservation.schedule.duration_minutes / 60)}{" "}
                        {t("common.hours")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("reservations.duration")}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reservation.schedule.location?.address ||
                          t("reservations.location.tbd")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("reservations.location.label")}
                      </p>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reservation.workshop.instructor.name ||
                          t("reservations.instructor.tbd")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("reservations.instructor.label")}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reservation.participant_info.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("reservations.contact")}
                      </p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="flex items-start gap-3">
                    <CreditCardIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reservation.payment_info.amount_paid.toLocaleString(
                          "fa-IR",
                        )}{" "}
                        {t("common.currency")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("reservations.payment")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {reservation.status === "confirmed" && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleCancelReservation(reservation._id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      {t("reservations.actions.cancel")}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <CalendarIcon className="h-4 w-4" />
                      {t("reservations.actions.reschedule")}
                    </button>
                  </div>
                )}

                {/* Booking Notes */}
                {reservation.booking_notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        {t("reservations.notes")}:
                      </span>{" "}
                      {reservation.booking_notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredReservations.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("reservations.empty.title")}
          </h3>
          <p className="text-gray-600 mb-6">
            {t("reservations.empty.description")}
          </p>
          <a
            href="/workshops"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CalendarIcon className="h-5 w-5" />
            {t("reservations.empty.browseWorkshops")}
          </a>
        </div>
      )}
    </div>
  );
};

export default MyReservations;
