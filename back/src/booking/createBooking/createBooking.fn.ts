import { ActFn } from "@deps";
import { bookingService } from "../bookingService.ts";

export const createBookingFn: ActFn = async (body) => {
  try {
    const {
      space_type,
      date,
      start_time,
      end_time,
      capacity_needed,
      customer_name,
      customer_email,
      customer_phone,
      company_name,
      purpose,
      special_requirements,
      equipment_needed,
      catering_required = false,
      workshop_session_id,
      metadata = {},
    } = body.details.set;

    const userId = body.user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
        details: { auth_required: true },
      };
    }

    // Validate required fields
    if (!space_type || !date || !start_time || !end_time || !capacity_needed || !customer_name) {
      return {
        success: false,
        message: "Missing required fields",
        details: {
          required_fields: ["space_type", "date", "start_time", "end_time", "capacity_needed", "customer_name"],
          provided: {
            space_type: !!space_type,
            date: !!date,
            start_time: !!start_time,
            end_time: !!end_time,
            capacity_needed: !!capacity_needed,
            customer_name: !!customer_name,
          },
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

    // Validate email format if provided
    if (customer_email && !this.isValidEmail(customer_email)) {
      return {
        success: false,
        message: "Invalid email format",
        details: {
          provided_email: customer_email,
        },
      };
    }

    // Validate phone format if provided (basic validation)
    if (customer_phone && customer_phone.length < 10) {
      return {
        success: false,
        message: "Invalid phone number format",
        details: {
          provided_phone: customer_phone,
          min_length: 10,
        },
      };
    }

    // Create booking using the booking service
    const bookingResult = await bookingService.createBooking({
      userId: userId.toString(),
      spaceType: space_type,
      date,
      startTime: start_time,
      endTime: end_time,
      capacityNeeded: capacity_needed,
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone,
      purpose,
      specialRequirements: special_requirements,
      cateringRequired: catering_required,
      workshopSessionId: workshop_session_id,
      metadata: {
        ...metadata,
        company_name,
        equipment_needed,
        created_via: "api",
        user_agent: body.headers?.["user-agent"],
        ip_address: body.headers?.["x-forwarded-for"] || body.headers?.["x-real-ip"],
      },
    });

    if (!bookingResult.success) {
      return {
        success: false,
        message: bookingResult.message || "Failed to create booking",
        details: bookingResult.data || { error: bookingResult.error },
      };
    }

    const booking = bookingResult.data;

    // Prepare comprehensive response
    return {
      success: true,
      body: {
        booking_created: true,
        booking_details: booking.booking,
        pricing: booking.pricing_breakdown,
        customer_info: {
          name: customer_name,
          email: customer_email,
          phone: customer_phone,
          company: company_name,
        },
        space_info: {
          type: space_type,
          name: this.getSpaceName(space_type),
          features: this.getSpaceFeatures(space_type),
          capacity_booked: capacity_needed,
        },
        schedule_details: {
          date: date,
          start_time: start_time,
          end_time: end_time,
          duration_hours: booking.booking.duration_hours,
          timezone: "Asia/Tehran",
        },
        additional_services: {
          catering_requested: catering_required,
          special_requirements: special_requirements,
          equipment_needed: equipment_needed,
        },
        payment_info: {
          total_amount: booking.booking.total_price,
          currency: booking.booking.currency,
          payment_status: booking.booking.payment_status,
          payment_deadline: booking.next_steps.payment_deadline,
          accepted_methods: ["zarinpal", "wallet", "bank_transfer"],
        },
        next_steps: {
          step_1: {
            action: "complete_payment",
            description: "Complete payment to confirm your booking",
            deadline: booking.next_steps.payment_deadline,
            required: true,
          },
          step_2: {
            action: "await_confirmation",
            description: "Wait for booking confirmation after payment",
            estimated_time: "5-10 minutes",
            required: false,
          },
          step_3: {
            action: "receive_details",
            description: "You'll receive booking details and access information",
            delivery_method: customer_email ? "email" : "dashboard",
            required: false,
          },
        },
        terms_and_conditions: {
          cancellation_policy: {
            free_cancellation_until: "24 hours before booking",
            partial_refund_until: "12 hours before booking",
            partial_refund_percentage: 50,
            no_refund_period: "Less than 12 hours before booking",
          },
          check_in: {
            earliest: "15 minutes before start time",
            required_id: true,
            contact_info: "Reception will assist with check-in",
          },
          policies: [
            "No smoking allowed in any spaces",
            "Food and drinks allowed in designated areas only",
            "Respect other users and maintain quiet hours",
            "Report any issues to management immediately",
          ],
        },
        contact_support: {
          phone: "+98 21 1234 5678",
          email: "support@irac.ir",
          hours: "8:00 AM - 8:00 PM, Monday to Saturday",
          emergency: "Contact reception during operating hours",
        },
        tracking: {
          booking_id: booking.booking.booking_id,
          booking_number: booking.booking.booking_number,
          reference_code: booking.booking.booking_number,
          status_check_url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/user/bookings/${booking.booking.booking_id}`,
        },
      },
      message: `Booking created successfully! Booking number: ${booking.booking.booking_number}. Please complete payment within 30 minutes to confirm your reservation.`,
    };
  } catch (error) {
    console.error("Error in createBooking function:", error);
    return {
      success: false,
      message: "Internal server error while creating booking",
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

  // Helper method for email validation
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper method to get space name
  function getSpaceName(spaceType: string): string {
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

  // Helper method to get space features
  function getSpaceFeatures(spaceType: string): string[] {
    const features = {
      private_office: ["WiFi", "Desk", "Chair", "Privacy", "Natural Light", "Phone"],
      shared_desk: ["WiFi", "Hot Desk", "Shared Amenities", "Networking Area", "Printing"],
      meeting_room: ["WiFi", "Projector", "Whiteboard", "Conference Table", "Privacy", "Video Conferencing"],
      workshop_space: ["WiFi", "Projector", "Flexible Seating", "Workshop Tools", "Presentation Area", "Sound System"],
      conference_room: ["WiFi", "AV Equipment", "Large Table", "Presentation Screen", "Professional Setting", "Catering Setup"],
      studio: ["WiFi", "Creative Tools", "Flexible Layout", "Natural Light", "Quiet Environment", "Equipment Storage"],
    };
    return features[spaceType] || ["WiFi", "Basic Amenities"];
  }
};
