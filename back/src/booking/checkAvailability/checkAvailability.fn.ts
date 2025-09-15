import { ActFn } from "@deps";
import { bookingService } from "../bookingService.ts";

export const checkAvailabilityFn: ActFn = async (body) => {
  try {
    const {
      space_type,
      date,
      start_time,
      end_time,
      capacity_needed = 1,
    } = body.details.set;

    // Basic input validation
    if (!space_type || !date || !start_time || !end_time) {
      return {
        success: false,
        message: "Missing required parameters: space_type, date, start_time, end_time",
        details: {
          space_type_provided: !!space_type,
          date_provided: !!date,
          start_time_provided: !!start_time,
          end_time_provided: !!end_time,
        },
      };
    }

    // Validate capacity
    if (capacity_needed < 1 || capacity_needed > 50) {
      return {
        success: false,
        message: "Capacity needed must be between 1 and 50",
        details: {
          capacity_needed,
          min_capacity: 1,
          max_capacity: 50,
        },
      };
    }

    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return {
        success: false,
        message: "Invalid date format",
        details: {
          provided_date: date,
          expected_format: "YYYY-MM-DD",
        },
      };
    }

    // Validate time order
    if (start_time >= end_time) {
      return {
        success: false,
        message: "Start time must be before end time",
        details: {
          start_time,
          end_time,
        },
      };
    }

    // Check availability using booking service
    const availabilityResult = await bookingService.checkAvailability({
      spaceType: space_type,
      date,
      startTime: start_time,
      endTime: end_time,
      capacityNeeded: capacity_needed,
    });

    if (!availabilityResult.success) {
      return {
        success: false,
        message: availabilityResult.message || "Failed to check availability",
        details: availabilityResult.data || { error: availabilityResult.error },
      };
    }

    const availability = availabilityResult.data;

    // Prepare comprehensive response
    return {
      success: true,
      body: {
        availability_check: {
          space_type,
          date,
          time_slot: {
            start_time,
            end_time,
            duration_hours: availability.duration_hours,
          },
          requested_capacity: capacity_needed,
        },
        availability: {
          is_available: availability.available,
          status: availability.available ? "available" : "unavailable",
          capacity_info: availability.capacity,
          existing_bookings: availability.existing_bookings,
        },
        pricing: availability.pricing,
        space_info: {
          type: space_type,
          max_capacity: availability.capacity.max_capacity,
          operating_hours: availability.operating_hours,
          features: this.getSpaceFeatures(space_type),
        },
        booking_rules: {
          restrictions: availability.restrictions,
          cancellation_policy: {
            free_cancellation_hours: 24,
            partial_refund_hours: 12,
            partial_refund_percentage: 50,
          },
          operating_days: availability.operating_hours.operating_days,
        },
        recommendations: availability.available ? {
          can_proceed: true,
          message: "Space is available for booking",
          next_step: "Create booking with these parameters",
        } : {
          can_proceed: false,
          message: "Space is not available for the requested time slot",
          alternatives: this.generateAlternatives(space_type, date, start_time, end_time),
        },
        booking_estimate: availability.available ? {
          estimated_total: availability.pricing.total_price,
          currency: "IRR",
          includes_services: false,
          payment_methods: ["zarinpal", "wallet", "bank_transfer"],
          estimated_points_reward: bookingService.BOOKING_CONFIG.POINTS_REWARD,
        } : null,
        metadata: {
          checked_at: new Date().toISOString(),
          check_duration: "real_time",
          data_source: "live_booking_system",
        },
      },
      message: availability.available
        ? `Space is available! ${availability.capacity.available} spots available.`
        : `Space is not available. ${availability.capacity.currently_booked}/${availability.capacity.max_capacity} spots booked.`,
    };
  } catch (error) {
    console.error("Error in checkAvailability function:", error);
    return {
      success: false,
      message: "Internal server error while checking availability",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        space_type: body.details.set.space_type,
        date: body.details.set.date,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Helper method to get space features
  function getSpaceFeatures(spaceType: string) {
    const features = {
      private_office: ["WiFi", "Desk", "Chair", "Privacy", "Natural Light"],
      shared_desk: ["WiFi", "Hot Desk", "Shared Amenities", "Networking"],
      meeting_room: ["WiFi", "Projector", "Whiteboard", "Conference Table", "Privacy"],
      workshop_space: ["WiFi", "Projector", "Flexible Seating", "Workshop Tools", "Presentation Area"],
      conference_room: ["WiFi", "AV Equipment", "Large Table", "Presentation Screen", "Professional Setting"],
      studio: ["WiFi", "Creative Tools", "Flexible Layout", "Natural Light", "Quiet Environment"],
    };
    return features[spaceType] || ["WiFi", "Basic Amenities"];
  }

  // Helper method to generate alternative suggestions
  function generateAlternatives(spaceType: string, date: string, startTime: string, endTime: string) {
    // This would be more sophisticated in a real implementation
    return [
      {
        suggestion_type: "different_time",
        message: "Try a different time slot on the same day",
        action: "Check availability for other time slots",
      },
      {
        suggestion_type: "different_date",
        message: "Consider booking for another date",
        action: "Check availability for nearby dates",
      },
      {
        suggestion_type: "different_space",
        message: "Consider a different space type",
        action: "Check availability for similar spaces",
      },
      {
        suggestion_type: "split_booking",
        message: "Consider splitting into multiple smaller bookings",
        action: "Reduce capacity or duration requirements",
      },
    ];
  }
};
