"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import type { WorkshopSchedule, Workshop } from "@/types";

interface WorkshopCalendarProps {
  workshopSlug: string;
  selectedScheduleId?: string;
  onScheduleSelect?: (scheduleId: string) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  schedules: WorkshopSchedule[];
}

interface CalendarFilters {
  timeOfDay: "all" | "morning" | "afternoon" | "evening";
  location: "all" | "online" | "physical";
  availability: "all" | "available" | "limited";
}

const WorkshopCalendar: React.FC<WorkshopCalendarProps> = ({
  workshopSlug,
  selectedScheduleId,
  onScheduleSelect,
}) => {
  const t = useTranslations("workshop");
  const { getWorkshopBySlug, getWorkshopSchedules, isLoading, error } =
    useWorkshop();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [availableSchedules, setAvailableSchedules] = useState<
    WorkshopSchedule[]
  >([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [filters, setFilters] = useState<CalendarFilters>({
    timeOfDay: "all",
    location: "all",
    availability: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadWorkshopData();
  }, [workshopSlug]);

  const loadWorkshopData = async () => {
    try {
      const workshopData = await getWorkshopBySlug(workshopSlug);
      if (workshopData) {
        setWorkshop(workshopData);
        const schedulesData = await getWorkshopSchedules(
          workshopData._id,
          new Date().toISOString(),
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Next 90 days
        );
        setAvailableSchedules(schedulesData || []);
      }
    } catch (error) {
      console.error("Failed to load workshop data:", error);
    }
  };

  // Filter schedules based on current filters
  const filteredSchedules = availableSchedules.filter((schedule) => {
    // Time of day filter
    if (filters.timeOfDay !== "all") {
      const [hours] = schedule.start_time.split(":").map(Number);
      if (filters.timeOfDay === "morning" && (hours < 6 || hours >= 12))
        return false;
      if (filters.timeOfDay === "afternoon" && (hours < 12 || hours >= 18))
        return false;
      if (filters.timeOfDay === "evening" && (hours < 18 || hours >= 24))
        return false;
    }

    // Location filter
    if (filters.location !== "all") {
      if (filters.location === "online" && schedule.location?.type !== "online")
        return false;
      if (
        filters.location === "physical" &&
        schedule.location?.type !== "physical"
      )
        return false;
    }

    // Availability filter
    if (filters.availability !== "all") {
      const spotsLeft =
        schedule.max_participants - schedule.current_reservations;
      if (filters.availability === "available" && spotsLeft <= 0) return false;
      if (filters.availability === "limited" && spotsLeft > 3) return false;
    }

    return true;
  });

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateStr = date.toISOString().split("T")[0];
      const daySchedules = filteredSchedules.filter((schedule) =>
        schedule.start_date.startsWith(dateStr),
      );

      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        schedules: daySchedules,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const formatTime = (schedule: WorkshopSchedule) => {
    return schedule.start_time;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fa-IR", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeOfDayLabel = (dateTime: string) => {
    const hour = new Date(dateTime).getHours();
    if (hour < 12) return t("calendar.morning");
    if (hour < 18) return t("calendar.afternoon");
    return t("calendar.evening");
  };

  const getAvailabilityColor = (schedule: WorkshopSchedule) => {
    const spotsLeft = schedule.max_participants - schedule.current_reservations;
    if (spotsLeft <= 0) return "bg-red-100 text-red-600 border-red-200";
    if (spotsLeft <= 3)
      return "bg-yellow-100 text-yellow-600 border-yellow-200";
    return "bg-green-100 text-green-600 border-green-200";
  };

  const getAvailabilityText = (schedule: WorkshopSchedule) => {
    const spotsLeft = schedule.max_participants - schedule.current_reservations;
    if (spotsLeft <= 0) return t("calendar.full");
    if (spotsLeft <= 3) return t("calendar.limited", { count: spotsLeft });
    return t("calendar.available", { count: spotsLeft });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t("calendar.error.title")}
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {currentMonth.toLocaleDateString("fa-IR", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === "calendar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("calendar.viewMode.calendar")}
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("calendar.viewMode.list")}
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{t("calendar.filters")}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Time of Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("calendar.filters.timeOfDay")}
              </label>
              <select
                value={filters.timeOfDay}
                onChange={(e) =>
                  setFilters({ ...filters, timeOfDay: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t("calendar.filters.all")}</option>
                <option value="morning">{t("calendar.morning")}</option>
                <option value="afternoon">{t("calendar.afternoon")}</option>
                <option value="evening">{t("calendar.evening")}</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("calendar.filters.location")}
              </label>
              <select
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t("calendar.filters.all")}</option>
                <option value="online">{t("calendar.location.online")}</option>
                <option value="physical">
                  {t("calendar.location.physical")}
                </option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("calendar.filters.availability")}
              </label>
              <select
                value={filters.availability}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    availability: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t("calendar.filters.all")}</option>
                <option value="available">
                  {t("calendar.filters.availableOnly")}
                </option>
                <option value="limited">
                  {t("calendar.filters.limitedOnly")}
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Content */}
      {viewMode === "calendar" ? (
        <div className="bg-white rounded-lg border">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0">
            {/* Header Row */}
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day, index) => (
              <div
                key={index}
                className="p-2 sm:p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 border-b"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r border-gray-200 ${
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50"
                } ${day.isToday ? "bg-blue-50" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    day.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                  } ${day.isToday ? "text-blue-600" : ""}`}
                >
                  {day.date.getDate()}
                </div>

                <div className="space-y-1">
                  {day.schedules.slice(0, 2).map((schedule) => {
                    const spotsLeft =
                      schedule.max_participants - schedule.current_reservations;
                    const isSelected = selectedScheduleId === schedule._id;

                    return (
                      <button
                        key={schedule._id}
                        onClick={() => onScheduleSelect?.(schedule._id)}
                        className={`w-full p-1 rounded text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white ring-2 ring-blue-200"
                            : spotsLeft <= 0
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                        disabled={spotsLeft <= 0}
                      >
                        <div className="truncate">{formatTime(schedule)}</div>
                        {isSelected && (
                          <CheckCircleIconSolid className="h-3 w-3 mx-auto mt-0.5" />
                        )}
                      </button>
                    );
                  })}

                  {day.schedules.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.schedules.length - 2} {t("calendar.more")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {isLoading && (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredSchedules.length === 0 && (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("calendar.noSchedules.title")}
              </h3>
              <p className="text-gray-600">
                {t("calendar.noSchedules.description")}
              </p>
            </div>
          )}

          {!isLoading &&
            filteredSchedules.map((schedule) => {
              const spotsLeft =
                schedule.max_participants - schedule.current_reservations;
              const isSelected = selectedScheduleId === schedule._id;
              const { date, time } = {
                date: formatDate(new Date(schedule.start_date)),
                time: formatTime(schedule),
              };

              return (
                <button
                  key={schedule._id}
                  onClick={() => onScheduleSelect?.(schedule._id)}
                  disabled={spotsLeft <= 0}
                  className={`w-full p-4 sm:p-6 border rounded-lg text-right transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : spotsLeft <= 0
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 text-right space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {date}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircleIconSolid className="h-5 w-5 text-blue-600" />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            {time} -{" "}
                            {getTimeOfDayLabel(
                              `${schedule.start_date}T${schedule.start_time}`,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>
                            {schedule.location?.address ||
                              t("calendar.location.tbd")}{" "}
                            (
                            {schedule.location?.type === "online"
                              ? t("calendar.location.online")
                              : t("calendar.location.physical")}
                            )
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>
                            {schedule.current_reservations}/
                            {schedule.max_participants}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(schedule)}`}
                      >
                        {getAvailabilityText(schedule)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default WorkshopCalendar;
