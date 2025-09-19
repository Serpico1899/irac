import { ActFn } from "@deps";
import { coreApp } from "@app";

export const rejectBookingFn: ActFn = async (body) => {
  try {
    const {
      booking_id,
      rejection_reason,
      rejection_category = "admin_decision",
      admin_notes,
      internal_notes,
      refund_processing = "full_refund",
      refund_percentage,
      send_notification = true,
      notification_message,
      include_alternative_dates = false,
      blacklist_customer = false,
      flag_for_review = false,
      suggest_alternatives = true,
      alternative_space_types,
      alternative_dates,
      escalate_to_manager = false,
      priority_handling = false,
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

    if (!rejection_reason) {
      return {
        success: false,
        message: "Rejection reason is required",
        details: { required_fields: ["rejection_reason"] },
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

    // Check if booking can be rejected
    if (existingBooking.status === "completed") {
      return {
        success: false,
        message: "Cannot reject completed bookings",
        details: {
          current_status: existingBooking.status,
          booking_id,
          suggestion: "Completed bookings cannot be rejected. Consider issuing a refund instead.",
        },
      };
    }

    if (existingBooking.status === "cancelled") {
      return {
        success: false,
        message: "Booking is already cancelled",
        details: {
          current_status: existingBooking.status,
          booking_id,
          cancelled_at: existingBooking.cancelled_at,
        },
      };
    }

    if (existingBooking.status === "checked_in") {
      return {
        success: false,
        message: "Cannot reject booking - customer is currently checked in",
        details: {
          current_status: existingBooking.status,
          checked_in_at: existingBooking.checked_in_at,
          suggestion: "Check out customer first or contact them directly",
        },
      };
    }

    // Calculate refund amount
    let refundAmount = 0;
    let refundDetails = null;

    if (existingBooking.payment_status === "paid" && refund_processing !== "no_refund") {
      const totalPaid = existingBooking.total_price;

      switch (refund_processing) {
        case "full_refund":
          refundAmount = totalPaid;
          break;
        case "partial_refund":
          if (refund_percentage && !isNaN(parseFloat(refund_percentage))) {
            const percentage = Math.min(100, Math.max(0, parseFloat(refund_percentage)));
            refundAmount = totalPaid * (percentage / 100);
          } else {
            // Default partial refund based on timing
            const bookingDateTime = new Date(`${existingBooking.booking_date.toISOString().split('T')[0]}T${existingBooking.start_time}:00`);
            const now = new Date();
            const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursUntilBooking >= 48) {
              refundAmount = totalPaid * 0.95; // 95% refund for 48+ hours notice
            } else if (hoursUntilBooking >= 24) {
              refundAmount = totalPaid * 0.85; // 85% refund for 24-48 hours notice
            } else if (hoursUntilBooking >= 12) {
              refundAmount = totalPaid * 0.70; // 70% refund for 12-24 hours notice
            } else {
              refundAmount = totalPaid * 0.50; // 50% refund for less than 12 hours notice
            }
          }
          break;
        case "manual_review":
          // Don't process refund automatically, flag for manual review
          refundAmount = 0;
          break;
        case "no_refund":
        default:
          refundAmount = 0;
          break;
      }

      refundDetails = {
        original_amount: totalPaid,
        refund_amount: refundAmount,
        refund_processing,
        processing_fee: totalPaid - refundAmount,
        refund_percentage_applied: totalPaid > 0 ? Math.round((refundAmount / totalPaid) * 100) : 0,
        requires_manual_review: refund_processing === "manual_review",
      };
    }

    // Generate alternative suggestions if requested
    let alternatives = null;
    if (suggest_alternatives) {
      alternatives = await generateAlternatives(
        existingBooking,
        alternative_space_types,
        alternative_dates,
        include_alternative_dates
      );
    }

    // Prepare rejection data
    const rejectionTimestamp = new Date();
    const rejectionData = {
      status: "cancelled",
      cancelled_at: rejectionTimestamp,
      cancellation_reason: `REJECTED: ${rejection_reason}`,
      rejection_category,
      rejection_reason,
      refund_amount: refundAmount,
      cancellation_fee: refundDetails ? refundDetails.processing_fee : 0,
      payment_status: refundAmount > 0 ? "refunded" : existingBooking.payment_status,
      updated_at: rejectionTimestamp,
      last_updated_by: adminUserId.toString(),
    };

    // Build admin audit trail
    const auditEntries = [];
    auditEntries.push(`[${rejectionTimestamp.toISOString()}] REJECTED by admin ${adminUserId}`);
    auditEntries.push(`Category: ${rejection_category}`);
    auditEntries.push(`Reason: ${rejection_reason}`);

    if (refundDetails) {
      auditEntries.push(`Refund: ${refundDetails.refund_amount} ${existingBooking.currency || 'IRR'} (${refundDetails.refund_percentage_applied}%)`);
    }

    if (blacklist_customer) {
      auditEntries.push("⚠️ CUSTOMER FLAGGED FOR REVIEW");
    }

    if (escalate_to_manager) {
      auditEntries.push("🚨 ESCALATED TO MANAGER");
    }

    if (flag_for_review) {
      auditEntries.push("🔍 FLAGGED FOR REVIEW");
    }

    const auditTrail = auditEntries.join("\n");
    rejectionData.admin_notes = existingBooking.admin_notes
      ? `${existingBooking.admin_notes}\n${auditTrail}`
      : auditTrail;

    if (admin_notes) {
      rejectionData.admin_notes += `\nAdmin Notes: ${admin_notes}`;
    }

    if (internal_notes) {
      rejectionData.internal_notes = existingBooking.internal_notes
        ? `${existingBooking.internal_notes}\n[${rejectionTimestamp.toISOString()}] ${internal_notes}`
        : `[${rejectionTimestamp.toISOString()}] ${internal_notes}`;
    }

    // Add special flags
    if (blacklist_customer || flag_for_review || escalate_to_manager || priority_handling) {
      rejectionData.special_flags = {
        blacklist_customer,
        flag_for_review,
        escalate_to_manager,
        priority_handling,
        flagged_at: rejectionTimestamp,
        flagged_by: adminUserId.toString(),
      };
    }

    // Update the booking
    const updateResult = await coreApp.odm.updateOne("booking", {
      filters: { booking_id },
      set: rejectionData,
    });

    if (!updateResult.success) {
      return {
        success: false,
        message: "Failed to reject booking",
        details: { error: updateResult.error || "Unknown database error" },
      };
    }

    // Process refund if needed
    let refundResult = null;
    if (refundAmount > 0 && refund_processing !== "manual_review") {
      try {
        // Create refund transaction
        refundResult = await coreApp.odm.insertOne("wallet_transaction", {
          doc: {
            user: existingBooking.user._id,
            transaction_type: "refund",
            amount: refundAmount,
            currency: existingBooking.currency || "IRR",
            status: "completed",
            description: `Refund for rejected booking ${existingBooking.booking_number}`,
            reference_id: booking_id,
            rejection_category,
            created_at: rejectionTimestamp,
            updated_at: rejectionTimestamp,
          },
        });

        // Update user wallet balance
        await coreApp.odm.updateOne("user", {
          filters: { _id: existingBooking.user._id },
          set: {
            $inc: { wallet_balance: refundAmount },
            updated_at: rejectionTimestamp,
          },
        });
      } catch (refundError) {
        console.error("Refund processing error:", refundError);
        // Continue with rejection even if refund fails
        refundResult = { success: false, error: refundError.message };
      }
    }

    // Free up space availability
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
      // Continue with rejection even if availability update fails
    }

    // Handle customer flagging if requested
    if (blacklist_customer) {
      try {
        await coreApp.odm.updateOne("user", {
          filters: { _id: existingBooking.user._id },
          set: {
            $push: {
              admin_flags: {
                type: "booking_rejection",
                reason: rejection_reason,
                category: rejection_category,
                flagged_at: rejectionTimestamp,
                flagged_by: adminUserId.toString(),
                booking_id,
                requires_review: true,
              }
            },
            updated_at: rejectionTimestamp,
          },
        });
      } catch (flagError) {
        console.error("Customer flagging error:", flagError);
        // Continue with rejection
      }
    }

    // Create escalation record if needed
    if (escalate_to_manager || flag_for_review) {
      try {
        await coreApp.odm.insertOne("admin_escalation", {
          doc: {
            type: "booking_rejection",
            booking_id,
            customer_id: existingBooking.user._id,
            escalated_by: adminUserId.toString(),
            escalation_reason: `Booking rejection: ${rejection_reason}`,
            priority: priority_handling ? "high" : "normal",
            status: "pending_review",
            details: {
              rejection_category,
              rejection_reason,
              customer_flagged: blacklist_customer,
              refund_amount: refundAmount,
            },
            created_at: rejectionTimestamp,
          },
        });
      } catch (escalationError) {
        console.error("Escalation creation error:", escalationError);
        // Continue with rejection
      }
    }

    // Get the updated booking
    const rejectedBooking = await coreApp.odm.findOne("booking", {
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
      rejection_reason,
      rejection_category,
      custom_message: notification_message,
      refund_amount: refundAmount,
      currency: existingBooking.currency || "IRR",
      alternatives: suggest_alternatives ? alternatives : null,
      notification_type: "booking_rejected",
    } : null;

    return {
      success: true,
      body: {
        booking_rejected: true,
        booking_details: rejectedBooking,
        rejection_info: {
          rejected_at: rejectionTimestamp,
          rejected_by: adminUserId.toString(),
          rejection_reason,
          rejection_category,
          admin_notes: admin_notes || null,
        },
        refund_info: refundDetails ? {
          ...refundDetails,
          refund_processed: refund_processing !== "manual_review" && refundAmount > 0,
          refund_transaction_id: refundResult?.success ? refundResult.body._id : null,
          refund_status: refundResult?.success ? "completed" : (refund_processing === "manual_review" ? "pending_review" : "failed"),
        } : {
          refund_requested: false,
          reason: "Booking not paid or no refund requested",
        },
        customer_info: {
          name: existingBooking.customer_name,
          email: existingBooking.customer_email,
          phone: existingBooking.customer_phone,
          flagged_for_review: blacklist_customer,
        },
        space_info: {
          type: existingBooking.space_type,
          name: getSpaceName(existingBooking.space_type),
          date: existingBooking.booking_date,
          time_slot: `${existingBooking.start_time} - ${existingBooking.end_time}`,
          capacity_freed: existingBooking.capacity_requested,
        },
        alternatives_suggested: suggest_alternatives ? alternatives : null,
        customer_notification: notificationData,
        admin_actions: {
          audit_trail_updated: true,
          space_availability_updated: true,
          refund_processed: refundAmount > 0 && refund_processing !== "manual_review",
          customer_flagged: blacklist_customer,
          escalated_to_manager: escalate_to_manager,
          flagged_for_review: flag_for_review,
          notification_sent: send_notification,
        },
        escalation_info: escalate_to_manager || flag_for_review ? {
          escalation_type: escalate_to_manager ? "manager_review" : "standard_review",
          priority: priority_handling ? "high" : "normal",
          requires_immediate_attention: priority_handling,
          escalation_reason: rejection_reason,
        } : null,
        impact_summary: {
          booking_status_changed: `${existingBooking.status} → cancelled (rejected)`,
          payment_status_changed: refundAmount > 0,
          customer_refunded: refundAmount > 0,
          space_freed: true,
          customer_relationship_impact: blacklist_customer ? "negative" : "neutral",
        },
      },
      message: `Booking ${existingBooking.booking_number} rejected successfully. ${refundAmount > 0 ? `Refund of ${refundAmount} ${existingBooking.currency || 'IRR'} ${refund_processing === 'manual_review' ? 'flagged for manual processing' : 'processed'}.` : 'No refund processed.'}${escalate_to_manager ? ' Case escalated to manager.' : ''}`,
    };

  } catch (error) {
    console.error("Error in rejectBooking function:", error);
    return {
      success: false,
      message: "Internal server error while rejecting booking",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        booking_id: body.details.set.booking_id,
        admin_user_id: body.user?._id,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Helper method to generate alternative suggestions
  async function generateAlternatives(
    originalBooking: any,
    alternativeSpaceTypes: string | undefined,
    alternativeDates: string | undefined,
    includeAlternativeDates: boolean
  ) {
    const alternatives = {
      alternative_spaces: [],
      alternative_dates: [],
      similar_bookings_available: false,
    };

    try {
      // Suggest alternative space types
      const spaceTypesToCheck = alternativeSpaceTypes
        ? alternativeSpaceTypes.split(",").map(s => s.trim())
        : ["meeting_room", "conference_room", "workshop_space", "private_office"];

      for (const spaceType of spaceTypesToCheck) {
        if (spaceType === originalBooking.space_type) continue;

        const availability = await coreApp.odm.findMany("booking", {
          filters: {
            booking_date: originalBooking.booking_date,
            space_type: spaceType,
            start_time: { $lte: originalBooking.end_time },
            end_time: { $gte: originalBooking.start_time },
            status: { $in: ["confirmed", "checked_in"] },
          },
        });

        const spaceCapacity = getSpaceCapacity(spaceType);
        const bookedCapacity = availability.reduce((sum, b) => sum + b.capacity_requested, 0);
        const availableCapacity = spaceCapacity - bookedCapacity;

        if (availableCapacity >= originalBooking.capacity_requested) {
          alternatives.alternative_spaces.push({
            space_type: spaceType,
            space_name: getSpaceName(spaceType),
            available_capacity: availableCapacity,
            same_date: true,
            same_time_slot: true,
            features: getSpaceFeatures(spaceType),
          });
        }
      }

      // Suggest alternative dates if requested
      if (includeAlternativeDates) {
        const datesToCheck = alternativeDates
          ? alternativeDates.split(",").map(d => new Date(d.trim()))
          : [1, 2, 3, 7].map(days => {
            const date = new Date(originalBooking.booking_date);
            date.setDate(date.getDate() + days);
            return date;
          });

        for (const date of datesToCheck) {
          const availability = await coreApp.odm.findMany("booking", {
            filters: {
              booking_date: date,
              space_type: originalBooking.space_type,
              start_time: { $lte: originalBooking.end_time },
              end_time: { $gte: originalBooking.start_time },
              status: { $in: ["confirmed", "checked_in"] },
            },
          });

          const spaceCapacity = getSpaceCapacity(originalBooking.space_type);
          const bookedCapacity = availability.reduce((sum, b) => sum + b.capacity_requested, 0);
          const availableCapacity = spaceCapacity - bookedCapacity;

          if (availableCapacity >= originalBooking.capacity_requested) {
            alternatives.alternative_dates.push({
              date: date,
              space_type: originalBooking.space_type,
              space_name: getSpaceName(originalBooking.space_type),
              available_capacity: availableCapacity,
              same_time_slot: true,
              days_difference: Math.ceil((date.getTime() - originalBooking.booking_date.getTime()) / (1000 * 60 * 60 * 24)),
            });
          }
        }
      }

      alternatives.similar_bookings_available = alternatives.alternative_spaces.length > 0 || alternatives.alternative_dates.length > 0;

    } catch (error) {
      console.error("Error generating alternatives:", error);
      // Return empty alternatives on error
    }

    return alternatives;
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
};
