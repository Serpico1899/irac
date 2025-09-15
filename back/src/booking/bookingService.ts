import { coreApp } from "../../mod.ts";
import { ActFn } from "@deps";

export class BookingService {
  // Booking configuration
  static readonly BOOKING_CONFIG = {
    SPACE_CAPACITY: {
      private_office: 1,
      shared_desk: 10,
      meeting_room: 8,
      workshop_space: 25,
      conference_room: 15,
      studio: 4,
    },
    PRICING: {
      private_office: 50000, // IRR per day
      shared_desk: 20000, // IRR per day
      meeting_room: 30000, // IRR per hour
      workshop_space: 100000, // IRR per day
      conference_room: 80000, // IRR per day
      studio: 60000, // IRR per day
    },
    OPERATING_HOURS: {
      start: "08:00",
      end: "20:00",
      operating_days: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    },
    CANCELLATION: {
      free_cancellation_hours: 24,
      partial_refund_hours: 12,
      partial_refund_percentage: 50,
    },
    BOOKING_LIMITS: {
      advance_booking_days: 90,
      max_duration_hours: 12,
      min_duration_hours: 1,
    },
    POINTS_REWARD: 25, // Points for booking
  };

  /**
   * Check availability for a specific space type and time slot
   */
  static async checkAvailability(params: {
    spaceType: string;
    date: string;
    startTime: string;
    endTime: string;
    capacityNeeded?: number;
  }) {
    try {
      const { spaceType, date, startTime, endTime, capacityNeeded = 1 } = params;

      const spaceAvailabilityModel = coreApp.odm.db.collection("space_availability");
      const bookingModel = coreApp.odm.db.collection("booking");

      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Validate date is not in the past
      if (bookingDate < today) {
        return {
          success: false,
          message: "Cannot book for past dates",
          data: { date_invalid: true },
        };
      }

      // Validate advance booking limit
      const maxAdvanceDate = new Date();
      maxAdvanceDate.setDate(maxAdvanceDate.getDate() + this.BOOKING_CONFIG.BOOKING_LIMITS.advance_booking_days);
      if (bookingDate > maxAdvanceDate) {
        return {
          success: false,
          message: `Bookings can only be made up to ${this.BOOKING_CONFIG.BOOKING_LIMITS.advance_booking_days} days in advance`,
          data: { date_too_far: true },
        };
      }

      // Check if it's an operating day
      const dayOfWeek = bookingDate.getDay();
      if (!this.BOOKING_CONFIG.OPERATING_HOURS.operating_days.includes(dayOfWeek)) {
        return {
          success: false,
          message: "Space is not available on this day of the week",
          data: { non_operating_day: true },
        };
      }

      // Validate time slots
      if (!this.isValidTimeSlot(startTime) || !this.isValidTimeSlot(endTime)) {
        return {
          success: false,
          message: "Invalid time slot format",
          data: { invalid_time_format: true },
        };
      }

      // Calculate duration
      const duration = this.calculateDuration(startTime, endTime);
      if (duration < this.BOOKING_CONFIG.BOOKING_LIMITS.min_duration_hours ||
        duration > this.BOOKING_CONFIG.BOOKING_LIMITS.max_duration_hours) {
        return {
          success: false,
          message: `Booking duration must be between ${this.BOOKING_CONFIG.BOOKING_LIMITS.min_duration_hours} and ${this.BOOKING_CONFIG.BOOKING_LIMITS.max_duration_hours} hours`,
          data: { invalid_duration: duration },
        };
      }

      // Check capacity limits
      const maxCapacity = this.BOOKING_CONFIG.SPACE_CAPACITY[spaceType] || 1;
      if (capacityNeeded > maxCapacity) {
        return {
          success: false,
          message: `Requested capacity exceeds maximum capacity of ${maxCapacity} for ${spaceType}`,
          data: { capacity_exceeded: true, max_capacity: maxCapacity },
        };
      }

      // Get existing bookings for the time slot
      const existingBookings = await bookingModel.find({
        space_type: spaceType,
        booking_date: bookingDate,
        status: { $in: ["confirmed", "pending", "checked_in"] },
        $or: [
          {
            $and: [
              { start_time: { $lte: startTime } },
              { end_time: { $gt: startTime } }
            ]
          },
          {
            $and: [
              { start_time: { $lt: endTime } },
              { end_time: { $gte: endTime } }
            ]
          },
          {
            $and: [
              { start_time: { $gte: startTime } },
              { end_time: { $lte: endTime } }
            ]
          }
        ]
      }).toArray();

      // Calculate total booked capacity for overlapping slots
      const totalBookedCapacity = existingBookings.reduce((total, booking) => {
        return total + (booking.capacity_requested || 1);
      }, 0);

      const availableCapacity = maxCapacity - totalBookedCapacity;
      const isAvailable = availableCapacity >= capacityNeeded;

      // Calculate pricing
      const pricing = this.calculatePricing({
        spaceType,
        date: bookingDate,
        startTime,
        endTime,
        duration,
      });

      return {
        success: true,
        data: {
          available: isAvailable,
          space_type: spaceType,
          date: date,
          time_slot: { start_time: startTime, end_time: endTime },
          capacity: {
            requested: capacityNeeded,
            available: availableCapacity,
            max_capacity: maxCapacity,
            currently_booked: totalBookedCapacity,
          },
          pricing: pricing,
          duration_hours: duration,
          existing_bookings: existingBookings.length,
          operating_hours: this.BOOKING_CONFIG.OPERATING_HOURS,
          restrictions: {
            advance_booking_days: this.BOOKING_CONFIG.BOOKING_LIMITS.advance_booking_days,
            max_duration: this.BOOKING_CONFIG.BOOKING_LIMITS.max_duration_hours,
            min_duration: this.BOOKING_CONFIG.BOOKING_LIMITS.min_duration_hours,
          },
        },
      };
    } catch (error) {
      console.error("Error checking availability:", error);
      return {
        success: false,
        message: "Failed to check availability",
        error: error.message,
      };
    }
  }

  /**
   * Create a new booking
   */
  static async createBooking(params: {
    userId: string;
    spaceType: string;
    date: string;
    startTime: string;
    endTime: string;
    capacityNeeded: number;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    purpose?: string;
    specialRequirements?: string;
    cateringRequired?: boolean;
    workshopSessionId?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const {
        userId,
        spaceType,
        date,
        startTime,
        endTime,
        capacityNeeded,
        customerName,
        customerEmail,
        customerPhone,
        purpose,
        specialRequirements,
        cateringRequired = false,
        workshopSessionId,
        metadata = {},
      } = params;

      const bookingModel = coreApp.odm.db.collection("booking");

      // Check availability first
      const availabilityResult = await this.checkAvailability({
        spaceType,
        date,
        startTime,
        endTime,
        capacityNeeded,
      });

      if (!availabilityResult.success) {
        return availabilityResult;
      }

      if (!availabilityResult.data.available) {
        return {
          success: false,
          message: "Space is not available for the requested time slot",
          data: availabilityResult.data,
        };
      }

      // Calculate duration and pricing
      const duration = this.calculateDuration(startTime, endTime);
      const pricing = this.calculatePricing({
        spaceType,
        date: new Date(date),
        startTime,
        endTime,
        duration,
      });

      // Generate booking number and ID
      const bookingNumber = `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const bookingId = coreApp.odm.ObjectId().toString();

      // Create booking data
      const bookingData = {
        _id: coreApp.odm.ObjectId(bookingId),
        user: { _id: coreApp.odm.ObjectId(userId) },
        booking_number: bookingNumber,
        booking_id: bookingId,
        space_type: spaceType,
        space_name: this.getSpaceName(spaceType),
        booking_date: new Date(date),
        start_time: startTime,
        end_time: endTime,
        duration_hours: duration,
        capacity_requested: capacityNeeded,
        attendee_count: capacityNeeded,
        status: "pending",
        payment_status: "pending",
        hourly_rate: pricing.hourly_rate,
        total_hours: duration,
        base_price: pricing.base_price,
        additional_services_cost: cateringRequired ? 20000 : 0, // 20k for catering
        discount_amount: pricing.discount_amount || 0,
        total_price: pricing.total_price + (cateringRequired ? 20000 : 0),
        currency: "IRR",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        purpose,
        special_requirements: specialRequirements,
        catering_required: cateringRequired,
        workshop_session_id: workshopSessionId,
        is_workshop_booking: !!workshopSessionId,
        reminder_sent: false,
        confirmation_sent: false,
        is_recurring: false,
        admin_notes: JSON.stringify({
          ...metadata,
          created_via: "api",
          availability_check: availabilityResult.data,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Add workshop relation if specified
      if (workshopSessionId) {
        bookingData.workshop = { _id: coreApp.odm.ObjectId(workshopSessionId) };
      }

      // Insert booking
      const insertResult = await bookingModel.insertOne(bookingData);

      if (!insertResult.insertedId) {
        return {
          success: false,
          message: "Failed to create booking",
        };
      }

      // Update space availability cache
      try {
        await this.updateSpaceAvailability(spaceType, date);
      } catch (error) {
        console.error("Error updating space availability:", error);
        // Continue even if cache update fails
      }

      // Award points for booking
      try {
        const scoringService = await import("../scoring/scoringService.ts");
        await scoringService.scoringService.awardPoints({
          userId,
          action: "workshop_booking",
          points: this.BOOKING_CONFIG.POINTS_REWARD,
          description: `Workshop booking reward: ${spaceType}`,
          metadata: {
            booking_id: bookingId,
            booking_number: bookingNumber,
            space_type: spaceType,
            booking_date: date,
            duration: duration,
            total_price: bookingData.total_price,
          },
          referenceId: bookingId,
          referenceType: "booking",
        });
      } catch (error) {
        console.error("Error awarding booking points:", error);
        // Continue even if scoring fails
      }

      return {
        success: true,
        data: {
          booking: {
            booking_id: bookingId,
            booking_number: bookingNumber,
            status: "pending",
            payment_status: "pending",
            space_type: spaceType,
            date: date,
            time_slot: { start_time: startTime, end_time: endTime },
            duration_hours: duration,
            capacity: capacityNeeded,
            total_price: bookingData.total_price,
            currency: "IRR",
          },
          pricing_breakdown: {
            base_price: pricing.base_price,
            hourly_rate: pricing.hourly_rate,
            total_hours: duration,
            additional_services: cateringRequired ? 20000 : 0,
            discount: pricing.discount_amount || 0,
            total: bookingData.total_price,
          },
          next_steps: {
            payment_required: true,
            confirmation_pending: true,
            payment_deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          },
        },
      };
    } catch (error) {
      console.error("Error creating booking:", error);
      return {
        success: false,
        message: "Failed to create booking",
        error: error.message,
      };
    }
  }

  /**
   * Confirm a booking after payment
   */
  static async confirmBooking(params: {
    bookingId: string;
    paymentReference?: string;
    orderId?: string;
  }) {
    try {
      const { bookingId, paymentReference, orderId } = params;

      const bookingModel = coreApp.odm.db.collection("booking");

      const booking = await bookingModel.findOne({
        _id: coreApp.odm.ObjectId(bookingId),
      });

      if (!booking) {
        return {
          success: false,
          message: "Booking not found",
        };
      }

      if (booking.status !== "pending") {
        return {
          success: false,
          message: "Booking is not in pending status",
          data: { current_status: booking.status },
        };
      }

      // Update booking status
      const updateData = {
        status: "confirmed",
        payment_status: "paid",
        payment_reference: paymentReference,
        confirmation_sent: true,
        updated_at: new Date(),
      };

      if (orderId) {
        updateData.order = { _id: coreApp.odm.ObjectId(orderId) };
      }

      await bookingModel.updateOne(
        { _id: coreApp.odm.ObjectId(bookingId) },
        { $set: updateData }
      );

      // Update space availability
      try {
        await this.updateSpaceAvailability(
          booking.space_type,
          booking.booking_date.toISOString().split('T')[0]
        );
      } catch (error) {
        console.error("Error updating space availability:", error);
      }

      return {
        success: true,
        data: {
          booking_id: bookingId,
          status: "confirmed",
          payment_status: "paid",
          confirmation: {
            booking_number: booking.booking_number,
            space_type: booking.space_type,
            date: booking.booking_date,
            time: `${booking.start_time} - ${booking.end_time}`,
            customer_name: booking.customer_name,
          },
        },
      };
    } catch (error) {
      console.error("Error confirming booking:", error);
      return {
        success: false,
        message: "Failed to confirm booking",
        error: error.message,
      };
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(params: {
    bookingId: string;
    userId: string;
    reason?: string;
    isAdminCancellation?: boolean;
  }) {
    try {
      const { bookingId, userId, reason, isAdminCancellation = false } = params;

      const bookingModel = coreApp.odm.db.collection("booking");

      const booking = await bookingModel.findOne({
        _id: coreApp.odm.ObjectId(bookingId),
      });

      if (!booking) {
        return {
          success: false,
          message: "Booking not found",
        };
      }

      // Check if user owns the booking or is admin
      if (!isAdminCancellation && booking.user._id.toString() !== userId.toString()) {
        return {
          success: false,
          message: "Not authorized to cancel this booking",
        };
      }

      if (booking.status === "cancelled") {
        return {
          success: false,
          message: "Booking is already cancelled",
        };
      }

      if (booking.status === "completed") {
        return {
          success: false,
          message: "Cannot cancel completed booking",
        };
      }

      // Calculate refund based on cancellation policy
      const refundCalculation = this.calculateRefund(booking);

      // Update booking
      await bookingModel.updateOne(
        { _id: coreApp.odm.ObjectId(bookingId) },
        {
          $set: {
            status: "cancelled",
            cancelled_at: new Date(),
            cancellation_reason: reason,
            cancellation_fee: refundCalculation.cancellation_fee,
            refund_amount: refundCalculation.refund_amount,
            updated_at: new Date(),
          },
        }
      );

      // Update space availability
      try {
        await this.updateSpaceAvailability(
          booking.space_type,
          booking.booking_date.toISOString().split('T')[0]
        );
      } catch (error) {
        console.error("Error updating space availability:", error);
      }

      return {
        success: true,
        data: {
          booking_id: bookingId,
          status: "cancelled",
          refund_details: refundCalculation,
          cancellation: {
            cancelled_at: new Date().toISOString(),
            reason: reason,
            cancelled_by: isAdminCancellation ? "admin" : "user",
          },
        },
      };
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return {
        success: false,
        message: "Failed to cancel booking",
        error: error.message,
      };
    }
  }

  /**
   * Get user bookings with filtering and pagination
   */
  static async getUserBookings(params: {
    userId: string;
    status?: string;
    limit?: number;
    skip?: number;
    includeHistory?: boolean;
  }) {
    try {
      const { userId, status, limit = 20, skip = 0, includeHistory = true } = params;

      const bookingModel = coreApp.odm.db.collection("booking");

      // Build query
      const query: any = { "user._id": coreApp.odm.ObjectId(userId) };

      if (status) {
        query.status = status;
      } else if (!includeHistory) {
        query.status = { $in: ["pending", "confirmed", "checked_in"] };
      }

      const bookings = await bookingModel
        .find(query)
        .sort({ booking_date: -1, start_time: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await bookingModel.countDocuments(query);

      const enrichedBookings = bookings.map(booking => ({
        booking_id: booking._id,
        booking_number: booking.booking_number,
        status: booking.status,
        payment_status: booking.payment_status,
        space: {
          type: booking.space_type,
          name: booking.space_name,
        },
        schedule: {
          date: booking.booking_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          duration_hours: booking.duration_hours,
        },
        pricing: {
          total_price: booking.total_price,
          currency: booking.currency,
        },
        details: {
          capacity: booking.capacity_requested,
          purpose: booking.purpose,
          catering_required: booking.catering_required,
          is_workshop_booking: booking.is_workshop_booking,
        },
        timestamps: {
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          cancelled_at: booking.cancelled_at,
          checked_in_at: booking.checked_in_at,
        },
        can_cancel: this.canCancelBooking(booking),
        can_reschedule: this.canRescheduleBooking(booking),
      }));

      return {
        success: true,
        data: {
          bookings: enrichedBookings,
          pagination: {
            total_count: totalCount,
            current_page: Math.floor(skip / limit) + 1,
            total_pages: Math.ceil(totalCount / limit),
            limit,
            skip,
          },
          summary: {
            total_bookings: totalCount,
            active_bookings: bookings.filter(b => ["confirmed", "checked_in"].includes(b.status)).length,
            pending_bookings: bookings.filter(b => b.status === "pending").length,
            cancelled_bookings: bookings.filter(b => b.status === "cancelled").length,
          },
        },
      };
    } catch (error) {
      console.error("Error getting user bookings:", error);
      return {
        success: false,
        message: "Failed to get user bookings",
        error: error.message,
      };
    }
  }

  /**
   * Get space calendar for availability view
   */
  static async getSpaceCalendar(params: {
    spaceType: string;
    startDate: string;
    endDate: string;
  }) {
    try {
      const { spaceType, startDate, endDate } = params;

      const bookingModel = coreApp.odm.db.collection("booking");

      const start = new Date(startDate);
      const end = new Date(endDate);

      const bookings = await bookingModel
        .find({
          space_type: spaceType,
          booking_date: { $gte: start, $lte: end },
          status: { $in: ["confirmed", "pending", "checked_in"] },
        })
        .sort({ booking_date: 1, start_time: 1 })
        .toArray();

      // Group bookings by date
      const calendar: Record<string, any> = {};

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = bookings.filter(b =>
          b.booking_date.toISOString().split('T')[0] === dateStr
        );

        const maxCapacity = this.BOOKING_CONFIG.SPACE_CAPACITY[spaceType] || 1;
        const totalBooked = dayBookings.reduce((sum, b) => sum + (b.capacity_requested || 1), 0);

        calendar[dateStr] = {
          date: dateStr,
          day_of_week: date.getDay(),
          is_operating_day: this.BOOKING_CONFIG.OPERATING_HOURS.operating_days.includes(date.getDay()),
          bookings: dayBookings.map(b => ({
            booking_id: b._id,
            booking_number: b.booking_number,
            start_time: b.start_time,
            end_time: b.end_time,
            capacity_used: b.capacity_requested,
            status: b.status,
            customer_name: b.customer_name,
          })),
          capacity: {
            total: maxCapacity,
            booked: totalBooked,
            available: maxCapacity - totalBooked,
          },
          availability_status: totalBooked >= maxCapacity ? "fully_booked" :
            totalBooked > 0 ? "partially_booked" : "available",
        };
      }

      return {
        success: true,
        data: {
          space_type: spaceType,
          date_range: { start_date: startDate, end_date: endDate },
          calendar,
          summary: {
            total_days: Object.keys(calendar).length,
            operating_days: Object.values(calendar).filter((day: any) => day.is_operating_day).length,
            fully_booked_days: Object.values(calendar).filter((day: any) => day.availability_status === "fully_booked").length,
            available_days: Object.values(calendar).filter((day: any) => day.availability_status === "available").length,
            total_bookings: bookings.length,
          },
        },
      };
    } catch (error) {
      console.error("Error getting space calendar:", error);
      return {
        success: false,
        message: "Failed to get space calendar",
        error: error.message,
      };
    }
  }

  // Helper methods
  private static isValidTimeSlot(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private static calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return (endMinutes - startMinutes) / 60;
  }

  private static calculatePricing(params: {
    spaceType: string;
    date: Date;
    startTime: string;
    endTime: string;
    duration: number;
  }) {
    const { spaceType, date, duration } = params;

    const baseRate = this.BOOKING_CONFIG.PRICING[spaceType] || 0;
    let hourlyRate = baseRate;

    // For daily rates, convert to hourly
    if (["private_office", "shared_desk", "workshop_space", "conference_room", "studio"].includes(spaceType)) {
      hourlyRate = Math.ceil(baseRate / 8); // 8-hour day
    }

    const basePrice = Math.ceil(hourlyRate * duration);
    let discountAmount = 0;

    // Weekend discount (if applicable)
    if ([0, 6].includes(date.getDay())) {
      discountAmount = Math.ceil(basePrice * 0.1); // 10% weekend discount
    }

    return {
      hourly_rate: hourlyRate,
      base_price: basePrice,
      discount_amount: discountAmount,
      total_price: basePrice - discountAmount,
    };
  }

  private static calculateRefund(booking: any) {
    const now = new Date();
    const bookingDateTime = new Date(booking.booking_date);
    const [hour, minute] = booking.start_time.split(':').map(Number);
    bookingDateTime.setHours(hour, minute);

    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let cancellationFee = 0;

    if (hoursUntilBooking >= this.BOOKING_CONFIG.CANCELLATION.free_cancellation_hours) {
      refundPercentage = 100;
    } else if (hoursUntilBooking >= this.BOOKING_CONFIG.CANCELLATION.partial_refund_hours) {
      refundPercentage = this.BOOKING_CONFIG.CANCELLATION.partial_refund_percentage;
    } else {
      refundPercentage = 0;
      cancellationFee = booking.total_price;
    }

    const refundAmount = Math.floor((booking.total_price * refundPercentage) / 100);

    return {
      refund_percentage: refundPercentage,
      refund_amount: refundAmount,
      cancellation_fee: cancellationFee,
      hours_until_booking: Math.round(hoursUntilBooking * 100) / 100,
    };
  }

  private static canCancelBooking(booking: any): boolean {
    return ["pending", "confirmed"].includes(booking.status) &&
      new Date(booking.booking_date) > new Date();
  }

  private static canRescheduleBooking(booking: any): boolean {
    return booking.status === "confirmed" &&
      new Date(booking.booking_date) > new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h notice
  }

  private static getSpaceName(spaceType: string): string {
    const names = {
      private_office: "Private Office",
      shared_desk: "Shared Workspace",
      meeting_room: "Meeting Room",
      workshop_space: "Workshop Space",
      conference_room: "Conference Room",
      studio: "Creative Studio",
    };
    return names[spaceType] || spaceType;
  }

  private static async updateSpaceAvailability(spaceType: string, date: string) {
    // This would update the space availability cache
    // Implementation would calculate and cache availability for the day
    console.log(`Updating availability for ${spaceType} on ${date}`);
  }
}

export const bookingService = BookingService;
