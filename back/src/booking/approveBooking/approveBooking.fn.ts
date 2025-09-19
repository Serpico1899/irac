import { ActFn } from "@deps";
import { coreApp } from "@app";

export const approveBookingFn: ActFn = async (body) => {
  try {
    const {
      booking_id,
      approval_notes,
      admin_notes,
      send_confirmation = true,
      send_sms_notification = false,
      payment_confirmed = false,
      payment_method,
      payment_reference,
      approved_at,
      confirm_space_availability = true,
      special_arrangements,
      priority_booking = false,
      override_payment_check = false,
      override_capacity_check = false,
    } = body.details.set;

    const adminUserId = body.user?._id;

    if (!adminUserId) {
      return {
        success: false,
        message: "Admin authentication required",
        details: { auth_required: true },
      };
    }

    if (!booking_id) {
      return {
        success: false,
        message: "Booking ID is required",
        details: { required_fields: ["booking_id"] },
      };
    }

    // Get the existing booking with relations
    const existingBooking = await coreApp.odm.findOne("booking", {
      filters: { booking_id },
      relations: {
        user: { get: { name: 1, email: 1, phone: 1, _id: 1 } },
        order: { get: { order_number: 1, total_amount: 1, status: 1, _id: 1 } },
        wallet_transaction: { get: { transaction_id: 1, amount: 1, status: 1, _id: 1 } },
      },
    });

    if (!existingBooking) {
      return {
        success: false,
        message: "Booking not found",
        details: { booking_id },
      };
    }

    // Check if booking is in a state that can be approved
    if (existingBooking.status !== "pending") {
      return {
        success: false,
        message: `Booking cannot be approved. Current status: ${existingBooking.status}`,
        details: {
          current_status: existingBooking.status,
          booking_id,
          valid_statuses_for_approval: ["pending"],
          suggestion: "Only pending bookings can be approved",
        },
      };
    }

    // Check payment status unless overridden
    if (!override_payment_check && !payment_confirmed) {
      if (existingBooking.payment_status !== "paid") {
        return {
          success: false,
          message: "Cannot approve booking - payment not confirmed",
          details: {
            current_payment_status: existingBooking.payment_status,
            required_payment_status: "paid",
            suggestion: "Confirm payment first or use override_payment_check option",
            override_option: "Set override_payment_check: true to approve without payment confirmation",
          },
        };
      }
    }

    // Check space availability if requested
    if (confirm_space_availability && !override_capacity_check) {
      const conflictingBookings = await coreApp.odm.findMany("booking", {
        filters: {
          booking_date: existingBooking.booking_date,
          space_type: existingBooking.space_type,
          start_time: { $lte: existingBooking.end_time },
          end_time: { $gte: existingBooking.start_time },
          status: { $in: ["confirmed", "checked_in"] },
          booking_id: { $ne: booking_id }, // Exclude current booking
        },
      });

      const totalBookedCapacity = conflictingBookings.reduce(
        (sum, booking) => sum + booking.capacity_requested, 0
      );
      const spaceCapacity = getSpaceCapacity(existingBooking.space_type);
      const remainingCapacity = spaceCapacity - totalBookedCapacity;

      if (existingBooking.capacity_requested > remainingCapacity) {
        return {
          success: false,
          message: "Cannot approve booking - insufficient space capacity",
          details: {
            requested_capacity: existingBooking.capacity_requested,
            available_capacity: remainingCapacity,
            total_space_capacity: spaceCapacity,
            conflicting_bookings_count: conflictingBookings.length,
            conflicting_bookings: conflictingBookings.map(b => ({
              booking_number: b.booking_number,
              customer_name: b.customer_name,
              capacity_requested: b.capacity_requested,
              time_slot: `${b.start_time} - ${b.end_time}`,
            })),
            override_option: "Set override_capacity_check: true to approve despite capacity concerns",
          },
        };
      }
    }

    // Prepare approval data
    const approvalTimestamp = approved_at ? new Date(approved_at) : new Date();
    const approvalData = {
      status: "confirmed",
      approved_by: adminUserId.toString(),
      approved_at: approvalTimestamp,
      updated_at: new Date(),
      last_updated_by: adminUserId.toString(),
      confirmation_sent: send_confirmation,
    };

    // Update payment information if provided
    if (payment_confirmed || payment_method || payment_reference) {
      if (payment_confirmed) {
        approvalData.payment_status = "paid";
      }
      if (payment_method) {
        approvalData.payment_method = payment_method;
      }
      if (payment_reference) {
        approvalData.payment_reference = payment_reference;
      }
    }

    // Add priority flag if set
    if (priority_booking) {
      approvalData.priority_booking = priority_booking;
    }

    // Add admin audit trail
    const auditEntries = [];
    auditEntries.push(`[${approvalTimestamp.toISOString()}] APPROVED by admin ${adminUserId}`);

    if (approval_notes) {
      auditEntries.push(`Approval Notes: ${approval_notes}`);
    }

    if (special_arrangements) {
      auditEntries.push(`Special Arrangements: ${special_arrangements}`);
    }

    if (override_payment_check) {
      auditEntries.push("⚠️ PAYMENT CHECK OVERRIDDEN");
    }

    if (override_capacity_check) {
      auditEntries.push("⚠️ CAPACITY CHECK OVERRIDDEN");
    }

    const auditTrail = auditEntries.join("\n");
    approvalData.admin_notes = existingBooking.admin_notes
      ? `${existingBooking.admin_notes}\n${auditTrail}`
      : auditTrail;

    if (admin_notes) {
      approvalData.internal_notes = existingBooking.internal_notes
        ? `${existingBooking.internal_notes}\n[${approvalTimestamp.toISOString()}] ${admin_notes}`
        : `[${approvalTimestamp.toISOString()}] ${admin_notes}`;
    }

    // Update the booking
    const updateResult = await coreApp.odm.updateOne("booking", {
      filters: { booking_id },
      set: approvalData,
    });

    if (!updateResult.success) {
      return {
        success: false,
        message: "Failed to approve booking",
        details: { error: updateResult.error || "Unknown database error" },
      };
    }

    // Get the updated booking
    const approvedBooking = await coreApp.odm.findOne("booking", {
      filters: { booking_id },
      relations: {
        user: { get: { name: 1, email: 1, phone: 1 } },
        order: { get: { order_number: 1, total_amount: 1, status: 1 } },
        wallet_transaction: { get: { transaction_id: 1, amount: 1, status: 1 } },
      },
    });

    // Prepare notification data
    const notificationData = {
      customer_email: existingBooking.customer_email,
      customer_phone: existingBooking.customer_phone,
      customer_name: existingBooking.customer_name,
      booking_number: existingBooking.booking_number,
      booking_date: existingBooking.booking_date,
      start_time: existingBooking.start_time,
      end_time: existingBooking.end_time,
      space_name: getSpaceName(existingBooking.space_type),
      space_location: existingBooking.space_location,
      total_price: existingBooking.total_price,
      currency: existingBooking.currency || "IRR",
      special_arrangements,
      priority_booking,
      send_confirmation,
      send_sms_notification,
      notification_type: "booking_approved",
    };

    // Calculate check-in details
    const bookingDateTime = new Date(`${existingBooking.booking_date.toISOString().split('T')[0]}T${existingBooking.start_time}:00`);
    const checkInWindow = {
      earliest_checkin: new Date(bookingDateTime.getTime() - 15 * 60 * 1000), // 15 minutes before
      latest_checkin: new Date(bookingDateTime.getTime() + 30 * 60 * 1000), // 30 minutes after start
    };

    return {
      success: true,
      body: {
        booking_approved: true,
        booking_details: approvedBooking,
        approval_info: {
          approved_at: approvalTimestamp,
          approved_by: adminUserId.toString(),
          approval_notes,
          special_arrangements,
          priority_booking,
          overrides_used: {
            payment_check_overridden: override_payment_check,
            capacity_check_overridden: override_capacity_check,
          },
        },
        customer_info: {
          name: existingBooking.customer_name,
          email: existingBooking.customer_email,
          phone: existingBooking.customer_phone,
          company: existingBooking.company_name,
        },
        space_info: {
          type: existingBooking.space_type,
          name: getSpaceName(existingBooking.space_type),
          location: existingBooking.space_location,
          capacity_confirmed: existingBooking.capacity_requested,
          features: getSpaceFeatures(existingBooking.space_type),
        },
        schedule_info: {
          date: existingBooking.booking_date,
          start_time: existingBooking.start_time,
          end_time: existingBooking.end_time,
          duration_hours: existingBooking.duration_hours,
          timezone: "Asia/Tehran",
        },
        payment_info: {
          status: approvedBooking.payment_status,
          total_amount: existingBooking.total_price,
          currency: existingBooking.currency || "IRR",
          payment_method: approvalData.payment_method || existingBooking.payment_method,
          payment_reference: approvalData.payment_reference || existingBooking.payment_reference,
          payment_confirmed: payment_confirmed || existingBooking.payment_status === "paid",
        },
        check_in_instructions: {
          check_in_window: checkInWindow,
          location: existingBooking.space_location || "Reception will provide directions",
          requirements: [
            "Bring valid ID for verification",
            "Arrive within the check-in window",
            "Contact reception if you need assistance",
          ],
          contact_info: {
            phone: "+98 21 1234 5678",
            extension: "Reception",
          },
        },
        customer_notifications: notificationData,
        admin_summary: {
          status_changed: `pending → confirmed`,
          approval_method: override_payment_check || override_capacity_check ? "manual_override" : "standard",
          notifications_scheduled: {
            email_confirmation: send_confirmation,
            sms_notification: send_sms_notification,
          },
          space_capacity_impact: confirm_space_availability ? "verified_and_reserved" : "not_checked",
        },
        next_steps: {
          for_customer: [
            "Check email for confirmation details",
            "Save booking reference number",
            "Arrive 15 minutes early for check-in",
            "Bring valid ID",
          ],
          for_admin: [
            priority_booking ? "Monitor priority booking closely" : "Standard monitoring applies",
            "Check-in status will be updated automatically",
            "Customer feedback will be collected post-booking",
          ],
        },
        tracking: {
          booking_id: existingBooking.booking_id,
          booking_number: existingBooking.booking_number,
          status_tracking_url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/admin/bookings/${existingBooking.booking_id}`,
        },
      },
      message: `Booking ${existingBooking.booking_number} approved successfully! Customer will be notified${priority_booking ? ' (Priority Booking)' : ''}.`,
    };

  } catch (error) {
    console.error("Error in approveBooking function:", error);
    return {
      success: false,
      message: "Internal server error while approving booking",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        booking_id: body.details.set.booking_id,
        admin_user_id: body.user?._id,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Helper method to get space capacity
  function getSpaceCapacity(spaceType: string): number {
    const capacities = {
      private_office: 4,
      shared_desk: 20,
      meeting_room: 12,
      workshop_space: 30,
      conference_room: 50,
      studio: 15,
    };
    return capacities[spaceType] || 10;
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
