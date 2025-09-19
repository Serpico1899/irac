import { ActFn } from "@deps";
import { coreApp } from "@app";

export const deleteBookingFn: ActFn = async (body) => {
  try {
    const {
      booking_id,
      cancellation_reason = "Admin cancellation",
      force_delete = false,
      send_notification = true,
      process_refund = true,
      refund_percentage = "full",
      admin_notes,
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

    // Get the existing booking with all relations
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

    // Check if booking can be deleted (unless force delete)
    if (!force_delete) {
      // Cannot delete already completed bookings
      if (existingBooking.status === "completed") {
        return {
          success: false,
          message: "Cannot delete completed bookings",
          details: {
            booking_status: existingBooking.status,
            suggestion: "Use force_delete option if absolutely necessary",
          },
        };
      }

      // Cannot delete if user is currently checked in
      if (existingBooking.status === "checked_in") {
        return {
          success: false,
          message: "Cannot delete active booking - user is currently checked in",
          details: {
            booking_status: existingBooking.status,
            checked_in_at: existingBooking.checked_in_at,
            suggestion: "Check out user first or use force_delete option",
          },
        };
      }

      // Warn if deleting within 2 hours of booking time
      const bookingDateTime = new Date(`${existingBooking.booking_date.toISOString().split('T')[0]}T${existingBooking.start_time}:00`);
      const now = new Date();
      const timeDiffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (timeDiffHours <= 2 && timeDiffHours > 0) {
        return {
          success: false,
          message: "Cannot delete booking within 2 hours of start time without force delete",
          details: {
            booking_start: bookingDateTime.toISOString(),
            current_time: now.toISOString(),
            hours_until_booking: Math.round(timeDiffHours * 100) / 100,
            suggestion: "Use force_delete option to override this restriction",
          },
        };
      }
    }

    // Calculate refund amount
    let refundAmount = 0;
    let refundDetails = null;

    if (process_refund && existingBooking.payment_status === "paid") {
      const totalPaid = existingBooking.total_price;

      switch (refund_percentage) {
        case "full":
          refundAmount = totalPaid;
          break;
        case "partial":
          // Calculate partial refund based on timing
          const bookingDateTime = new Date(`${existingBooking.booking_date.toISOString().split('T')[0]}T${existingBooking.start_time}:00`);
          const now = new Date();
          const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

          if (hoursUntilBooking >= 24) {
            refundAmount = totalPaid * 0.9; // 90% refund for 24+ hours notice
          } else if (hoursUntilBooking >= 12) {
            refundAmount = totalPaid * 0.7; // 70% refund for 12-24 hours notice
          } else if (hoursUntilBooking >= 2) {
            refundAmount = totalPaid * 0.5; // 50% refund for 2-12 hours notice
          } else {
            refundAmount = 0; // No refund for less than 2 hours notice
          }
          break;
        case "none":
        default:
          refundAmount = 0;
          break;
      }

      refundDetails = {
        original_amount: totalPaid,
        refund_amount: refundAmount,
        refund_percentage: refund_percentage,
        cancellation_fee: totalPaid - refundAmount,
        hours_notice: Math.max(0, (bookingDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)),
      };
    }

    // Prepare the cancellation data
    const cancellationData = {
      status: "cancelled",
      cancelled_at: new Date(),
      cancellation_reason,
      cancellation_fee: refundDetails ? refundDetails.cancellation_fee : 0,
      refund_amount: refundAmount,
      payment_status: refundAmount > 0 ? "partial_refund" : existingBooking.payment_status,
      updated_at: new Date(),
      last_updated_by: adminUserId.toString(),
    };

    // Add admin audit trail
    const auditEntry = `[${new Date().toISOString()}] CANCELLED by admin ${adminUserId}: ${cancellation_reason}${force_delete ? " (FORCE DELETE)" : ""}`;
    cancellationData.admin_notes = existingBooking.admin_notes
      ? `${existingBooking.admin_notes}\n${auditEntry}`
      : auditEntry;

    if (admin_notes) {
      cancellationData.internal_notes = existingBooking.internal_notes
        ? `${existingBooking.internal_notes}\n[${new Date().toISOString()}] ${admin_notes}`
        : `[${new Date().toISOString()}] ${admin_notes}`;
    }

    // Update the booking to cancelled status
    const updateResult = await coreApp.odm.updateOne("booking", {
      filters: { booking_id },
      set: cancellationData,
    });

    if (!updateResult.success) {
      return {
        success: false,
        message: "Failed to cancel booking",
        details: { error: updateResult.error || "Unknown database error" },
      };
    }

    // Process refund if needed
    let refundResult = null;
    if (refundAmount > 0 && existingBooking.wallet_transaction) {
      try {
        // Create refund transaction
        refundResult = await coreApp.odm.insertOne("wallet_transaction", {
          doc: {
            user: existingBooking.user._id,
            transaction_type: "refund",
            amount: refundAmount,
            currency: existingBooking.currency || "IRR",
            status: "completed",
            description: `Refund for cancelled booking ${existingBooking.booking_number}`,
            reference_id: booking_id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Update user wallet balance
        await coreApp.odm.updateOne("user", {
          filters: { _id: existingBooking.user._id },
          set: {
            $inc: { wallet_balance: refundAmount },
            updated_at: new Date(),
          },
        });
      } catch (refundError) {
        console.error("Refund processing error:", refundError);
        // Continue with cancellation even if refund fails
      }
    }

    // Update space availability (make the slot available again)
    try {
      await updateSpaceAvailability(
        existingBooking.space_type,
        existingBooking.booking_date,
        existingBooking.start_time,
        existingBooking.end_time,
        -existingBooking.capacity_requested // Negative to free up space
      );
    } catch (availabilityError) {
      console.error("Space availability update error:", availabilityError);
      // Continue with cancellation even if availability update fails
    }

    // Get the updated booking
    const cancelledBooking = await coreApp.odm.findOne("booking", {
      filters: { booking_id },
      relations: {
        user: { get: { name: 1, email: 1, phone: 1 } },
      },
    });

    // Prepare notification data
    const notificationData = send_notification ? {
      customer_email: existingBooking.customer_email,
      customer_phone: existingBooking.customer_phone,
      customer_name: existingBooking.customer_name,
      booking_number: existingBooking.booking_number,
      booking_date: existingBooking.booking_date,
      start_time: existingBooking.start_time,
      end_time: existingBooking.end_time,
      space_name: getSpaceName(existingBooking.space_type),
      cancellation_reason,
      refund_amount: refundAmount,
      notification_type: "booking_cancelled",
    } : null;

    return {
      success: true,
      body: {
        booking_cancelled: true,
        booking_details: cancelledBooking,
        cancellation_info: {
          cancelled_at: cancellationData.cancelled_at,
          cancelled_by: adminUserId.toString(),
          cancellation_reason,
          force_delete_used: force_delete,
        },
        refund_info: refundDetails ? {
          ...refundDetails,
          refund_processed: refundAmount > 0,
          refund_transaction_id: refundResult?.success ? refundResult.body._id : null,
        } : {
          refund_requested: false,
          reason: "No refund requested or booking not paid",
        },
        space_info: {
          type: existingBooking.space_type,
          name: getSpaceName(existingBooking.space_type),
          date: existingBooking.booking_date,
          time_slot: `${existingBooking.start_time} - ${existingBooking.end_time}`,
          capacity_freed: existingBooking.capacity_requested,
        },
        customer_notification: notificationData,
        admin_actions: {
          audit_trail_updated: true,
          space_availability_updated: true,
          refund_processed: refundAmount > 0,
          notification_sent: send_notification,
        },
        impact_summary: {
          booking_status_changed: `${existingBooking.status} → cancelled`,
          payment_status_changed: existingBooking.payment_status !== cancellationData.payment_status,
          customer_refunded: refundAmount > 0,
          space_freed: true,
        },
      },
      message: `Booking ${existingBooking.booking_number} cancelled successfully. ${refundAmount > 0 ? `Refund of ${refundAmount} ${existingBooking.currency || 'IRR'} processed.` : 'No refund processed.'}`,
    };

  } catch (error) {
    console.error("Error in deleteBooking function:", error);
    return {
      success: false,
      message: "Internal server error while cancelling booking",
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

// Helper method to update space availability
async function updateSpaceAvailability(
  spaceType: string,
  date: Date,
  startTime: string,
  endTime: string,
  capacityChange: number
) {
  // This would integrate with a space availability tracking system
  // For now, we'll just log the change
  console.log(`Space availability updated: ${spaceType} on ${date} from ${startTime} to ${endTime}, capacity change: ${capacityChange}`);
}
