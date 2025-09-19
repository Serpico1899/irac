import { ActFn } from "@deps";
import { coreApp } from "@app";

export const checkInUserFn: ActFn = async (body) => {
  try {
    const {
      booking_id,
      check_in_time,
      verification_method = "booking_confirmation",
      verification_id,
      verified_by,
      checkin_status,
      verify_customer_identity = true,
      customer_present = true,
      group_size_confirmed = true,
      equipment_provided,
      space_condition_verified = true,
      special_requirements_met = true,
      admin_notes,
      checkin_notes,
      special_observations,
      override_time_restrictions = false,
      override_capacity_limits = false,
      override_payment_status = false,
      send_checkin_confirmation = true,
      notify_staff = false,
      additional_services_requested,
      catering_confirmed,
      emergency_contact,
      updated_phone_number,
      actual_group_size,
      duration_extension_requested = false,
      additional_equipment_needed,
      staff_member_checkin,
      checkin_location = "reception",
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

    // Check if booking is in a valid state for check-in
    const validStatusesForCheckin = ["confirmed"];
    if (!validStatusesForCheckin.includes(existingBooking.status)) {
      return {
        success: false,
        message: `Cannot check in booking with status: ${existingBooking.status}`,
        details: {
          current_status: existingBooking.status,
          booking_id,
          valid_statuses: validStatusesForCheckin,
          suggestion: "Only confirmed bookings can be checked in",
        },
      };
    }

    // Check if already checked in
    if (existingBooking.status === "checked_in") {
      return {
        success: false,
        message: "Customer is already checked in",
        details: {
          current_status: existingBooking.status,
          checked_in_at: existingBooking.checked_in_at,
          suggestion: "Use checkOutUser if customer needs to check out",
        },
      };
    }

    // Check payment status unless overridden
    if (!override_payment_status && existingBooking.payment_status !== "paid") {
      return {
        success: false,
        message: "Cannot check in - payment not confirmed",
        details: {
          current_payment_status: existingBooking.payment_status,
          required_payment_status: "paid",
          override_available: "Set override_payment_status: true to check in without payment confirmation",
        },
      };
    }

    // Determine check-in time and timing status
    const checkInTimestamp = check_in_time ? new Date(check_in_time) : new Date();
    const bookingDateTime = new Date(`${existingBooking.booking_date.toISOString().split('T')[0]}T${existingBooking.start_time}:00`);
    const timeDifferenceMinutes = (checkInTimestamp.getTime() - bookingDateTime.getTime()) / (1000 * 60);

    let calculatedCheckinStatus = checkin_status;
    if (!calculatedCheckinStatus) {
      if (timeDifferenceMinutes <= -15) {
        calculatedCheckinStatus = "early";
      } else if (timeDifferenceMinutes <= 15) {
        calculatedCheckinStatus = "on_time";
      } else if (timeDifferenceMinutes <= 60) {
        calculatedCheckinStatus = "late";
      } else {
        calculatedCheckinStatus = "very_late";
      }
    }

    // Check time restrictions unless overridden
    if (!override_time_restrictions && calculatedCheckinStatus === "very_late") {
      const maxLateMinutes = 120; // 2 hours
      if (timeDifferenceMinutes > maxLateMinutes) {
        return {
          success: false,
          message: `Check-in too late. Maximum allowed late check-in is ${maxLateMinutes} minutes`,
          details: {
            minutes_late: Math.round(timeDifferenceMinutes),
            max_late_minutes: maxLateMinutes,
            booking_start_time: bookingDateTime,
            current_time: checkInTimestamp,
            override_available: "Set override_time_restrictions: true to allow very late check-ins",
          },
        };
      }
    }

    // Validate group size if provided
    let actualCapacity = existingBooking.capacity_requested;
    if (actual_group_size && !isNaN(parseInt(actual_group_size))) {
      const newCapacity = parseInt(actual_group_size);
      if (newCapacity > existingBooking.capacity_requested && !override_capacity_limits) {
        const spaceCapacity = getSpaceCapacity(existingBooking.space_type);
        if (newCapacity > spaceCapacity) {
          return {
            success: false,
            message: "Actual group size exceeds space capacity",
            details: {
              actual_group_size: newCapacity,
              booked_capacity: existingBooking.capacity_requested,
              space_capacity: spaceCapacity,
              override_available: "Set override_capacity_limits: true to allow over-capacity",
            },
          };
        }
      }
      actualCapacity = newCapacity;
    }

    // Prepare check-in data
    const checkinData = {
      status: "checked_in",
      checked_in_at: checkInTimestamp,
      actual_attendee_count: actualCapacity,
      checkin_status: calculatedCheckinStatus,
      verification_method,
      verified_by: verified_by || adminUserId.toString(),
      updated_at: checkInTimestamp,
      last_updated_by: adminUserId.toString(),
    };

    // Add verification details if provided
    if (verification_id) {
      checkinData.verification_id = verification_id;
    }

    // Add check-in location and staff info
    if (staff_member_checkin) {
      checkinData.staff_member_checkin = staff_member_checkin;
    }
    checkinData.checkin_location = checkin_location;

    // Update contact information if provided
    if (updated_phone_number) {
      checkinData.customer_phone = updated_phone_number;
    }

    if (emergency_contact) {
      checkinData.emergency_contact = emergency_contact;
    }

    // Handle equipment and services
    if (equipment_provided) {
      checkinData.equipment_provided = equipment_provided;
    }

    if (additional_equipment_needed) {
      checkinData.additional_equipment_needed = additional_equipment_needed;
    }

    if (additional_services_requested) {
      checkinData.additional_services_requested = additional_services_requested;
    }

    if (catering_confirmed !== undefined) {
      checkinData.catering_confirmed = catering_confirmed;
    }

    // Build admin audit trail
    const auditEntries = [];
    auditEntries.push(`[${checkInTimestamp.toISOString()}] CHECKED IN by admin ${adminUserId}`);
    auditEntries.push(`Timing: ${calculatedCheckinStatus} (${Math.round(timeDifferenceMinutes)} minutes ${timeDifferenceMinutes >= 0 ? 'after' : 'before'} scheduled time)`);
    auditEntries.push(`Verification: ${verification_method}${verification_id ? ` (ID: ${verification_id})` : ''}`);
    auditEntries.push(`Location: ${checkin_location}`);

    if (actualCapacity !== existingBooking.capacity_requested) {
      auditEntries.push(`Group Size: ${actualCapacity} (originally ${existingBooking.capacity_requested})`);
    }

    const verificationChecks = [];
    if (verify_customer_identity) verificationChecks.push("Identity verified");
    if (customer_present) verificationChecks.push("Customer present");
    if (group_size_confirmed) verificationChecks.push("Group size confirmed");
    if (space_condition_verified) verificationChecks.push("Space condition OK");
    if (special_requirements_met) verificationChecks.push("Special requirements met");

    if (verificationChecks.length > 0) {
      auditEntries.push(`Verifications: ${verificationChecks.join(', ')}`);
    }

    // Add override notices
    const overrides = [];
    if (override_time_restrictions) overrides.push("Time restrictions");
    if (override_capacity_limits) overrides.push("Capacity limits");
    if (override_payment_status) overrides.push("Payment status");

    if (overrides.length > 0) {
      auditEntries.push(`⚠️ OVERRIDES: ${overrides.join(', ')}`);
    }

    if (duration_extension_requested) {
      auditEntries.push("🕒 Duration extension requested");
    }

    const auditTrail = auditEntries.join("\n");
    checkinData.admin_notes = existingBooking.admin_notes
      ? `${existingBooking.admin_notes}\n${auditTrail}`
      : auditTrail;

    if (admin_notes) {
      checkinData.admin_notes += `\nAdmin Notes: ${admin_notes}`;
    }

    if (checkin_notes) {
      checkinData.checkin_notes = checkin_notes;
    }

    if (special_observations) {
      checkinData.special_observations = special_observations;
    }

    // Update the booking
    const updateResult = await coreApp.odm.updateOne("booking", {
      filters: { booking_id },
      set: checkinData,
    });

    if (!updateResult.success) {
      return {
        success: false,
        message: "Failed to check in user",
        details: { error: updateResult.error || "Unknown database error" },
      };
    }

    // Get the updated booking
    const checkedInBooking = await coreApp.odm.findOne("booking", {
      filters: { booking_id },
      relations: {
        user: { get: { name: 1, email: 1, phone: 1 } },
        order: { get: { order_number: 1, total_amount: 1, status: 1 } },
        wallet_transaction: { get: { transaction_id: 1, amount: 1, status: 1 } },
      },
    });

    // Calculate expected check-out time
    const expectedCheckoutTime = new Date(bookingDateTime);
    expectedCheckoutTime.setHours(expectedCheckoutTime.getHours() + existingBooking.duration_hours);

    // Prepare notification data
    const notificationData = send_checkin_confirmation ? {
      customer_email: existingBooking.customer_email,
      customer_phone: checkedInBooking.customer_phone,
      customer_name: existingBooking.customer_name,
      booking_number: existingBooking.booking_number,
      space_name: getSpaceName(existingBooking.space_type),
      space_location: existingBooking.space_location || checkin_location,
      checked_in_at: checkInTimestamp,
      expected_checkout_time: expectedCheckoutTime,
      equipment_provided: equipment_provided || "Standard equipment",
      emergency_contact_updated: !!emergency_contact,
      notification_type: "checkin_confirmation",
    } : null;

    // Staff notification data
    const staffNotificationData = notify_staff ? {
      booking_number: existingBooking.booking_number,
      customer_name: existingBooking.customer_name,
      space_type: existingBooking.space_type,
      space_location: checkin_location,
      timing_status: calculatedCheckinStatus,
      actual_group_size: actualCapacity,
      special_requirements: existingBooking.special_requirements,
      duration_extension_requested,
      additional_equipment_needed,
      notification_type: "staff_checkin_alert",
    } : null;

    return {
      success: true,
      body: {
        user_checked_in: true,
        booking_details: checkedInBooking,
        checkin_info: {
          checked_in_at: checkInTimestamp,
          timing_status: calculatedCheckinStatus,
          minutes_difference: Math.round(timeDifferenceMinutes),
          verification_method,
          verification_id,
          verified_by: verified_by || adminUserId.toString(),
          checkin_location,
        },
        customer_info: {
          name: existingBooking.customer_name,
          email: existingBooking.customer_email,
          phone: checkedInBooking.customer_phone,
          group_size: actualCapacity,
          emergency_contact: emergency_contact || "Not provided",
        },
        space_info: {
          type: existingBooking.space_type,
          name: getSpaceName(existingBooking.space_type),
          location: checkin_location,
          capacity_used: actualCapacity,
          capacity_booked: existingBooking.capacity_requested,
          condition_verified: space_condition_verified,
        },
        schedule_info: {
          booking_date: existingBooking.booking_date,
          start_time: existingBooking.start_time,
          end_time: existingBooking.end_time,
          expected_checkout: expectedCheckoutTime,
          duration_hours: existingBooking.duration_hours,
          timezone: "Asia/Tehran",
        },
        services_info: {
          equipment_provided: equipment_provided || "Standard equipment only",
          additional_equipment_needed: additional_equipment_needed || "None",
          additional_services: additional_services_requested || "None",
          catering_status: catering_confirmed ? "confirmed" : (existingBooking.catering_required ? "requested" : "not_required"),
          special_requirements_met: special_requirements_met,
        },
        verification_summary: {
          customer_identity_verified: verify_customer_identity,
          customer_present_confirmed: customer_present,
          group_size_confirmed: group_size_confirmed,
          space_condition_verified: space_condition_verified,
          special_requirements_met: special_requirements_met,
          overall_verification_status: verify_customer_identity && customer_present && group_size_confirmed ? "passed" : "partial",
        },
        admin_actions: {
          overrides_used: {
            time_restrictions: override_time_restrictions,
            capacity_limits: override_capacity_limits,
            payment_status: override_payment_status,
          },
          notifications_sent: {
            customer_confirmation: send_checkin_confirmation,
            staff_alert: notify_staff,
          },
          audit_trail_updated: true,
          staff_member: staff_member_checkin || adminUserId.toString(),
        },
        checkout_instructions: {
          expected_checkout_time: expectedCheckoutTime,
          checkout_process: "Contact reception 15 minutes before checkout",
          duration_extension_available: duration_extension_requested,
          contact_info: {
            reception: "+98 21 1234 5678",
            emergency: "Press emergency button in space",
          },
        },
        customer_notifications: notificationData,
        staff_notifications: staffNotificationData,
        monitoring_info: {
          check_in_successful: true,
          timing_assessment: calculatedCheckinStatus,
          requires_follow_up: calculatedCheckinStatus === "very_late" || duration_extension_requested,
          space_occupancy_updated: true,
          next_milestone: "automatic_checkout_reminder",
        },
        tracking: {
          booking_id: existingBooking.booking_id,
          booking_number: existingBooking.booking_number,
          checkin_reference: `CI-${checkInTimestamp.getTime()}`,
          status_tracking_url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/admin/bookings/${existingBooking.booking_id}`,
        },
      },
      message: `Customer ${existingBooking.customer_name} checked in successfully for booking ${existingBooking.booking_number}. Status: ${calculatedCheckinStatus}${duration_extension_requested ? '. Duration extension requested.' : '.'}`,
    };

  } catch (error) {
    console.error("Error in checkInUser function:", error);
    return {
      success: false,
      message: "Internal server error while checking in user",
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
};
