import { ActFn } from "@deps";
import { coreApp } from "@app";

export const updateBookingFn: ActFn = async (body) => {
  try {
    const updateData = body.details.set;
    const { booking_id, update_reason, ...fieldsToUpdate } = updateData;
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

    // Get the existing booking
    const existingBooking = await coreApp.odm.findOne("booking", {
      filters: { booking_id },
      relations: {
        user: { get: { name: 1, email: 1, phone: 1 } },
        order: { get: { order_number: 1, total_amount: 1, status: 1 } },
        wallet_transaction: { get: { transaction_id: 1, amount: 1, status: 1 } },
      },
    });

    if (!existingBooking) {
      return {
        success: false,
        message: "Booking not found",
        details: { booking_id },
      };
    }

    // Validate time slot changes
    if (fieldsToUpdate.start_time && fieldsToUpdate.end_time) {
      if (fieldsToUpdate.start_time >= fieldsToUpdate.end_time) {
        return {
          success: false,
          message: "Start time must be before end time",
          details: {
            start_time: fieldsToUpdate.start_time,
            end_time: fieldsToUpdate.end_time,
          },
        };
      }

      // Calculate new duration
      const startHour = parseInt(fieldsToUpdate.start_time.split(":")[0]);
      const endHour = parseInt(fieldsToUpdate.end_time.split(":")[0]);
      fieldsToUpdate.duration_hours = endHour - startHour;
      fieldsToUpdate.total_hours = fieldsToUpdate.duration_hours;
    }

    // Validate status transitions
    if (fieldsToUpdate.status) {
      const validTransitions = {
        "pending": ["confirmed", "cancelled", "rejected"],
        "confirmed": ["checked_in", "cancelled", "no_show"],
        "checked_in": ["completed", "cancelled"],
        "completed": [], // No transitions from completed
        "cancelled": [], // No transitions from cancelled
        "no_show": [], // No transitions from no_show
      };

      const currentStatus = existingBooking.status;
      const newStatus = fieldsToUpdate.status;

      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        return {
          success: false,
          message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
          details: {
            current_status: currentStatus,
            requested_status: newStatus,
            valid_transitions: validTransitions[currentStatus] || [],
          },
        };
      }

      // Auto-set timestamps based on status changes
      if (newStatus === "checked_in" && !fieldsToUpdate.checked_in_at) {
        fieldsToUpdate.checked_in_at = new Date();
      }

      if (newStatus === "completed" && !fieldsToUpdate.checked_out_at) {
        fieldsToUpdate.checked_out_at = new Date();

        // Calculate actual duration if check-in time exists
        const checkInTime = fieldsToUpdate.checked_in_at || existingBooking.checked_in_at;
        if (checkInTime) {
          const durationMs = fieldsToUpdate.checked_out_at.getTime() - new Date(checkInTime).getTime();
          fieldsToUpdate.actual_duration = Math.round(durationMs / (1000 * 60 * 60) * 100) / 100; // Round to 2 decimal places
        }
      }

      if (newStatus === "cancelled" && !fieldsToUpdate.cancelled_at) {
        fieldsToUpdate.cancelled_at = new Date();
      }

      // Set approved_by for confirmations
      if (newStatus === "confirmed" && !fieldsToUpdate.approved_by) {
        fieldsToUpdate.approved_by = adminUserId.toString();
      }
    }

    // Validate and recalculate pricing if relevant fields are updated
    if (fieldsToUpdate.hourly_rate || fieldsToUpdate.duration_hours || fieldsToUpdate.additional_services_cost || fieldsToUpdate.discount_amount) {
      const hourlyRate = fieldsToUpdate.hourly_rate || existingBooking.hourly_rate;
      const totalHours = fieldsToUpdate.duration_hours || existingBooking.total_hours;
      const additionalServices = fieldsToUpdate.additional_services_cost || existingBooking.additional_services_cost || 0;
      const discount = fieldsToUpdate.discount_amount || existingBooking.discount_amount || 0;

      fieldsToUpdate.base_price = hourlyRate * totalHours;
      fieldsToUpdate.total_price = fieldsToUpdate.base_price + additionalServices - discount;

      if (fieldsToUpdate.total_price < 0) {
        return {
          success: false,
          message: "Total price cannot be negative",
          details: {
            base_price: fieldsToUpdate.base_price,
            additional_services: additionalServices,
            discount: discount,
            calculated_total: fieldsToUpdate.total_price,
          },
        };
      }
    }

    // Check space availability for time/date changes
    if (fieldsToUpdate.booking_date || fieldsToUpdate.start_time || fieldsToUpdate.end_time || fieldsToUpdate.space_type) {
      const checkDate = fieldsToUpdate.booking_date || existingBooking.booking_date;
      const checkStartTime = fieldsToUpdate.start_time || existingBooking.start_time;
      const checkEndTime = fieldsToUpdate.end_time || existingBooking.end_time;
      const checkSpaceType = fieldsToUpdate.space_type || existingBooking.space_type;
      const checkCapacity = fieldsToUpdate.capacity_requested || existingBooking.capacity_requested;

      // Skip availability check for the current booking
      const availabilityCheck = await coreApp.odm.findMany("booking", {
        filters: {
          booking_date: checkDate,
          space_type: checkSpaceType,
          start_time: { $lte: checkEndTime },
          end_time: { $gte: checkStartTime },
          status: { $in: ["confirmed", "checked_in", "pending"] },
          booking_id: { $ne: booking_id }, // Exclude current booking
        },
      });

      const totalBookedCapacity = availabilityCheck.reduce((sum, booking) => sum + booking.capacity_requested, 0);
      const spaceCapacity = getSpaceCapacity(checkSpaceType);

      if (totalBookedCapacity + checkCapacity > spaceCapacity) {
        return {
          success: false,
          message: "Insufficient space capacity for the requested time slot",
          details: {
            requested_capacity: checkCapacity,
            available_capacity: spaceCapacity - totalBookedCapacity,
            total_space_capacity: spaceCapacity,
            conflicting_bookings: availabilityCheck.length,
          },
        };
      }
    }

    // Prepare update object with audit trail
    const updateObject = {
      ...fieldsToUpdate,
      updated_at: new Date(),
      last_updated_by: adminUserId.toString(),
    };

    // Add to admin notes for audit trail
    if (update_reason) {
      const auditEntry = `[${new Date().toISOString()}] Updated by admin ${adminUserId}: ${update_reason}`;
      updateObject.admin_notes = existingBooking.admin_notes
        ? `${existingBooking.admin_notes}\n${auditEntry}`
        : auditEntry;
    }

    // Update the booking
    const updateResult = await coreApp.odm.updateOne("booking", {
      filters: { booking_id },
      set: updateObject,
    });

    if (!updateResult.success) {
      return {
        success: false,
        message: "Failed to update booking",
        details: { error: updateResult.error || "Unknown database error" },
      };
    }

    // Get updated booking with relations
    const updatedBooking = await coreApp.odm.findOne("booking", {
      filters: { booking_id },
      relations: {
        user: { get: { name: 1, email: 1, phone: 1 } },
        order: { get: { order_number: 1, total_amount: 1, status: 1 } },
        wallet_transaction: { get: { transaction_id: 1, amount: 1, status: 1 } },
      },
    });

    // Prepare change summary for response
    const changedFields = Object.keys(fieldsToUpdate).filter(key =>
      JSON.stringify(fieldsToUpdate[key]) !== JSON.stringify(existingBooking[key])
    );

    const changesSummary = changedFields.reduce((summary, field) => {
      summary[field] = {
        from: existingBooking[field],
        to: fieldsToUpdate[field],
      };
      return summary;
    }, {});

    return {
      success: true,
      body: {
        booking_updated: true,
        booking_details: updatedBooking,
        changes_summary: changesSummary,
        updated_fields: changedFields,
        admin_info: {
          updated_by: adminUserId.toString(),
          update_timestamp: new Date().toISOString(),
          update_reason: update_reason || "No reason provided",
        },
        customer_notification: {
          required: changedFields.some(field =>
            ['booking_date', 'start_time', 'end_time', 'space_type', 'status'].includes(field)
          ),
          notification_type: fieldsToUpdate.status ? 'status_change' : 'booking_modification',
          customer_email: updatedBooking.customer_email,
          customer_phone: updatedBooking.customer_phone,
        },
        space_info: {
          type: updatedBooking.space_type,
          space_name: getSpaceName(updatedBooking.space_type),
          capacity_booked: updatedBooking.capacity_requested,
        },
        schedule_info: {
          date: updatedBooking.booking_date,
          start_time: updatedBooking.start_time,
          end_time: updatedBooking.end_time,
          duration_hours: updatedBooking.duration_hours,
        },
        pricing_info: {
          base_price: updatedBooking.base_price,
          additional_services: updatedBooking.additional_services_cost,
          discount: updatedBooking.discount_amount,
          total_price: updatedBooking.total_price,
          currency: updatedBooking.currency,
        },
        status_info: {
          current_status: updatedBooking.status,
          payment_status: updatedBooking.payment_status,
          checked_in_at: updatedBooking.checked_in_at,
          checked_out_at: updatedBooking.checked_out_at,
          actual_duration: updatedBooking.actual_duration,
        },
      },
      message: `Booking ${booking_id} updated successfully. ${changedFields.length} field(s) modified.`,
    };

  } catch (error) {
    console.error("Error in updateBooking function:", error);
    return {
      success: false,
      message: "Internal server error while updating booking",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        booking_id: body.details.set.booking_id,
        admin_user_id: body.user?._id,
        timestamp: new Date().toISOString(),
      },
    };
  }

};

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
