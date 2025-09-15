import { ActFn } from "@deps";
import { bookingService } from "../bookingService.ts";

export const getUserBookingsFn: ActFn = async (body) => {
  try {
    const {
      user_id,
      status,
      limit = 20,
      skip = 0,
      include_history = true,
      date_from,
      date_to,
      space_type,
    } = body.details.set;

    const userId = user_id || body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
        details: { auth_required: true },
      };
    }

    // Validate pagination parameters
    if (limit > 100 || limit < 1 || skip < 0) {
      return {
        success: false,
        message: "Invalid pagination parameters",
        details: {
          limit,
          skip,
          max_limit: 100,
          min_limit: 1,
          min_skip: 0,
        },
      };
    }

    // Validate date range if provided
    let dateFromObj = null;
    let dateToObj = null;

    if (date_from) {
      dateFromObj = new Date(date_from);
      if (isNaN(dateFromObj.getTime())) {
        return {
          success: false,
          message: "Invalid date_from format",
          details: {
            provided_date: date_from,
            expected_format: "YYYY-MM-DD",
          },
        };
      }
    }

    if (date_to) {
      dateToObj = new Date(date_to);
      if (isNaN(dateToObj.getTime())) {
        return {
          success: false,
          message: "Invalid date_to format",
          details: {
            provided_date: date_to,
            expected_format: "YYYY-MM-DD",
          },
        };
      }
    }

    if (dateFromObj && dateToObj && dateFromObj > dateToObj) {
      return {
        success: false,
        message: "date_from must be before or equal to date_to",
        details: {
          date_from,
          date_to,
        },
      };
    }

    // Get user bookings from booking service
    const bookingsResult = await bookingService.getUserBookings({
      userId: userId.toString(),
      status,
      limit,
      skip,
      includeHistory: include_history,
    });

    if (!bookingsResult.success) {
      return {
        success: false,
        message: bookingsResult.message || "Failed to get user bookings",
        details: { error: bookingsResult.error },
      };
    }

    let bookings = bookingsResult.data.bookings;
    const originalSummary = bookingsResult.data.summary;

    // Apply additional filters if specified
    if (date_from || date_to || space_type) {
      bookings = bookings.filter(booking => {
        // Date range filter
        if (date_from && new Date(booking.schedule.date) < dateFromObj) {
          return false;
        }
        if (date_to && new Date(booking.schedule.date) > dateToObj) {
          return false;
        }
        // Space type filter
        if (space_type && booking.space.type !== space_type) {
          return false;
        }
        return true;
      });
    }

    // Enhance booking data with additional UI-friendly information
    const enhancedBookings = bookings.map(booking => ({
      ...booking,
      display_info: {
        status_display: this.getStatusDisplay(booking.status),
        payment_status_display: this.getPaymentStatusDisplay(booking.payment_status),
        date_display: new Date(booking.schedule.date).toLocaleDateString('fa-IR'),
        time_display: `${booking.schedule.start_time} - ${booking.schedule.end_time}`,
        duration_display: `${booking.schedule.duration_hours} ساعت`,
        price_display: `${booking.pricing.total_price.toLocaleString()} تومان`,
      },
      actions_available: {
        can_cancel: booking.can_cancel,
        can_reschedule: booking.can_reschedule,
        can_check_in: this.canCheckIn(booking),
        can_rate: this.canRate(booking),
        can_view_receipt: booking.payment_status === "paid",
        can_download_certificate: booking.status === "completed",
      },
      time_info: {
        is_upcoming: new Date(booking.schedule.date) > new Date(),
        is_today: new Date(booking.schedule.date).toDateString() === new Date().toDateString(),
        is_past: new Date(booking.schedule.date) < new Date(),
        days_until_booking: Math.ceil((new Date(booking.schedule.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        booking_in_hours: Math.ceil((new Date(booking.schedule.date).getTime() - new Date().getTime()) / (1000 * 60 * 60)),
      },
      support_info: {
        booking_url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/user/bookings/${booking.booking_id}`,
        contact_support: booking.status === "pending" || booking.status === "confirmed",
        modification_deadline: this.getModificationDeadline(booking),
      },
    }));

    // Calculate filtered summary statistics
    const filteredSummary = {
      total_bookings: enhancedBookings.length,
      upcoming_bookings: enhancedBookings.filter(b => b.time_info.is_upcoming && ["confirmed", "checked_in"].includes(b.status)).length,
      today_bookings: enhancedBookings.filter(b => b.time_info.is_today && ["confirmed", "checked_in"].includes(b.status)).length,
      pending_payment: enhancedBookings.filter(b => b.payment_status === "pending").length,
      completed_bookings: enhancedBookings.filter(b => b.status === "completed").length,
      cancelled_bookings: enhancedBookings.filter(b => b.status === "cancelled").length,
      total_spent: enhancedBookings.filter(b => b.payment_status === "paid").reduce((sum, b) => sum + b.pricing.total_price, 0),
    };

    // Group bookings by status for better organization
    const groupedBookings = {
      upcoming: enhancedBookings.filter(b => b.time_info.is_upcoming && ["confirmed", "checked_in"].includes(b.status)),
      pending: enhancedBookings.filter(b => b.status === "pending"),
      today: enhancedBookings.filter(b => b.time_info.is_today && ["confirmed", "checked_in"].includes(b.status)),
      completed: enhancedBookings.filter(b => b.status === "completed"),
      cancelled: enhancedBookings.filter(b => b.status === "cancelled"),
    };

    // Generate insights and recommendations
    const insights = this.generateInsights(enhancedBookings);

    return {
      success: true,
      body: {
        user_bookings: {
          user_id: userId,
          filters_applied: {
            status: status || "all",
            date_range: {
              from: date_from,
              to: date_to,
            },
            space_type: space_type || "all",
            include_history,
          },
          generated_at: new Date().toISOString(),
        },
        bookings: {
          list: enhancedBookings,
          grouped: groupedBookings,
          count: enhancedBookings.length,
        },
        pagination: {
          current_page: Math.floor(skip / limit) + 1,
          total_pages: Math.ceil(bookingsResult.data.pagination.total_count / limit),
          limit,
          skip,
          total_count: bookingsResult.data.pagination.total_count,
          filtered_count: enhancedBookings.length,
          has_next_page: skip + limit < bookingsResult.data.pagination.total_count,
          has_prev_page: skip > 0,
        },
        summary: {
          original: originalSummary,
          filtered: filteredSummary,
          comparison: {
            showing_filtered: !!(date_from || date_to || space_type),
            filter_impact: originalSummary.total_bookings - filteredSummary.total_bookings,
          },
        },
        insights: insights,
        quick_actions: {
          create_new_booking: {
            available: true,
            url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/workshops/reserve`,
            description: "Book a new workspace",
          },
          check_availability: {
            available: true,
            url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/workshops`,
            description: "Check space availability",
          },
          contact_support: {
            available: filteredSummary.pending_payment > 0 || groupedBookings.pending.length > 0,
            phone: "+98 21 1234 5678",
            email: "support@irac.ir",
            description: "Get help with your bookings",
          },
        },
        space_preferences: {
          most_booked_type: this.getMostBookedSpaceType(enhancedBookings),
          preferred_times: this.getPreferredTimes(enhancedBookings),
          booking_patterns: this.getBookingPatterns(enhancedBookings),
        },
      },
      message: enhancedBookings.length > 0
        ? `Found ${enhancedBookings.length} bookings${status ? ` with status: ${status}` : ''}${filteredSummary.upcoming_bookings > 0 ? ` (${filteredSummary.upcoming_bookings} upcoming)` : ''}`
        : "No bookings found matching the specified criteria",
    };
  } catch (error) {
    console.error("Error in getUserBookings function:", error);
    return {
      success: false,
      message: "Internal server error while getting user bookings",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        requested_user_id: body.details.set.user_id,
        filters: {
          status: body.details.set.status,
          date_from: body.details.set.date_from,
          date_to: body.details.set.date_to,
          space_type: body.details.set.space_type,
        },
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Helper methods
  function getStatusDisplay(status: string): { text: string; color: string; icon: string } {
    const statusMap = {
      pending: { text: "در انتظار تأیید", color: "orange", icon: "⏳" },
      confirmed: { text: "تأیید شده", color: "green", icon: "✅" },
      checked_in: { text: "حضور", color: "blue", icon: "🏢" },
      completed: { text: "تکمیل شده", color: "gray", icon: "✓" },
      cancelled: { text: "لغو شده", color: "red", icon: "❌" },
      no_show: { text: "عدم حضور", color: "red", icon: "⚠️" },
    };
    return statusMap[status] || { text: status, color: "gray", icon: "❓" };
  }

  function getPaymentStatusDisplay(paymentStatus: string): { text: string; color: string; icon: string } {
    const statusMap = {
      pending: { text: "در انتظار پرداخت", color: "orange", icon: "💳" },
      paid: { text: "پرداخت شده", color: "green", icon: "💚" },
      refunded: { text: "بازگشت وجه", color: "blue", icon: "💙" },
      failed: { text: "پرداخت ناموفق", color: "red", icon: "❌" },
      partial_refund: { text: "بازگشت جزئی", color: "orange", icon: "🟡" },
    };
    return statusMap[paymentStatus] || { text: paymentStatus, color: "gray", icon: "❓" };
  }

  function canCheckIn(booking: any): boolean {
    const bookingDateTime = new Date(booking.schedule.date);
    const [hour, minute] = booking.schedule.start_time.split(':').map(Number);
    bookingDateTime.setHours(hour, minute);

    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    return booking.status === "confirmed" &&
      bookingDateTime <= fifteenMinutesFromNow &&
      bookingDateTime > new Date(now.getTime() - 60 * 60 * 1000); // Within 1 hour of start time
  }

  function canRate(booking: any): boolean {
    return booking.status === "completed" && !booking.rating;
  }

  function getModificationDeadline(booking: any): string | null {
    if (!["pending", "confirmed"].includes(booking.status)) {
      return null;
    }

    const bookingDateTime = new Date(booking.schedule.date);
    const [hour, minute] = booking.schedule.start_time.split(':').map(Number);
    bookingDateTime.setHours(hour, minute);

    const deadline = new Date(bookingDateTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
    return deadline.toISOString();
  }

  function generateInsights(bookings: any[]) {
    if (bookings.length === 0) {
      return {
        recommendations: ["Create your first booking to start using our spaces!"],
        patterns: {},
        stats: {},
      };
    }

    const recommendations = [];

    if (bookings.filter(b => b.payment_status === "pending").length > 0) {
      recommendations.push("Complete pending payments to secure your bookings");
    }

    if (bookings.filter(b => b.time_info.is_upcoming).length === 0) {
      recommendations.push("Book your next workspace session to maintain productivity");
    }

    const cancelledCount = bookings.filter(b => b.status === "cancelled").length;
    if (cancelledCount > bookings.length * 0.2) {
      recommendations.push("Consider booking with more certainty to avoid frequent cancellations");
    }

    return {
      recommendations,
      patterns: {
        most_active_month: "Analysis pending",
        preferred_duration: "Analysis pending",
        booking_frequency: bookings.length > 10 ? "frequent" : bookings.length > 3 ? "regular" : "occasional",
      },
      stats: {
        total_hours_booked: bookings.reduce((sum, b) => sum + (b.schedule.duration_hours || 0), 0),
        average_booking_value: bookings.length > 0 ? Math.round(bookings.reduce((sum, b) => sum + (b.pricing.total_price || 0), 0) / bookings.length) : 0,
        completion_rate: bookings.length > 0 ? Math.round((bookings.filter(b => b.status === "completed").length / bookings.length) * 100) : 0,
      },
    };
  }

  function getMostBookedSpaceType(bookings: any[]): string | null {
    if (bookings.length === 0) return null;

    const typeCount = {};
    bookings.forEach(booking => {
      const type = booking.space.type;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return Object.keys(typeCount).reduce((a, b) => typeCount[a] > typeCount[b] ? a : b);
  }

  function getPreferredTimes(bookings: any[]): { morning: number; afternoon: number; evening: number } {
    const timeCounts = { morning: 0, afternoon: 0, evening: 0 };

    bookings.forEach(booking => {
      const hour = parseInt(booking.schedule.start_time.split(':')[0]);
      if (hour < 12) timeCounts.morning++;
      else if (hour < 17) timeCounts.afternoon++;
      else timeCounts.evening++;
    });

    return timeCounts;
  }

  function getBookingPatterns(bookings: any[]): any {
    // This would analyze booking patterns over time
    return {
      weekly_pattern: "Analysis pending",
      seasonal_trends: "Analysis pending",
      advance_booking_days: "Analysis pending",
    };
  }
};
