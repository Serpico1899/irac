import { ActFn } from "@deps";
import { coreApp } from "@app";

export const cancelBookingFn: ActFn = async (body) => {
  try {
    const {
      booking_id,
      cancellation_reason,
      cancellation_category = "customer_request",
      cancelled_by = "admin",
      cancellation_requested_at,
      effective_cancellation_date,
      refund_method = "automatic",
      refund_percentage,
      custom_refund_amount,
      waive_cancellation_fee = false,
      respect_cancellation_policy = true,
      policy_override_reason,
      emergency_cancellation = false,
      immediate_cancellation = true,
      notify_customer = true,
      notification_method = "email",
      custom_message_to_customer,
      offer_rescheduling = false,
      suggest_alternative_spaces = false,
      provide_future_discount = false,
      admin_notes,
      internal_notes,
      customer_satisfaction_priority = false,
      process_refund_immediately = true,
      refund_to_wallet = true,
      release_space_immediately = true,
      schedule_follow_up_call = false,
      send_feedback_survey = false,
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

    if (!cancellation_reason) {
      return {
        success: false,
        message: "Cancellation reason is required",
        details: { required_fields: ["cancellation_reason"] },
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

    // Check if booking can be cancelled
    if (existingBooking.status === "cancelled") {
      return {
        success: false,
        message: "Booking is already cancelled",
        details: {
          current_status: existingBooking.status,
          cancelled_at: existingBooking.cancelled_at,
        },
      };
    }

    if (existingBooking.status === "completed") {
      return {
        success: false,
        message: "Cannot cancel completed booking",
        details: {
          current_status: existingBooking.status,
          completed_at: existingBooking.checked_out_at,
          suggestion: "Completed bookings cannot be cancelled. Consider issuing a refund instead.",
        },
      };
    }

    // Determine effective cancellation timestamp
    const cancellationTimestamp = effective_cancellation_date
      ? new Date(effective_cancellation_date)
      : (cancellation_requested_at ? new Date(cancellation_requested_at) : new Date());

    // Calculate refund based on method and policy
    let refundAmount = 0;
    let cancellationFee = 0;
    let refundDetails = null;

    if (existingBooking.payment_status === "paid" && refund_method !== "no_refund") {
      const totalPaid = existingBooking.total_price;
      const bookingDateTime = new Date(`${existingBooking.booking_date.toISOString().split('T')[0]}T${existingBooking.start_time}:00`);
      const hoursUntilBooking = (bookingDateTime.getTime() - cancellationTimestamp.getTime()) / (1000 * 60 * 60);

      switch (refund_method) {
        case "full_refund":
          refundAmount = totalPaid;
          break;

        case "custom_amount":
          if (custom_refund_amount && !isNaN(parseFloat(custom_refund_amount))) {
            refundAmount = Math.min(totalPaid, parseFloat(custom_refund_amount));
          }
          break;

        case "partial_refund":
          if (refund_percentage && !isNaN(parseFloat(refund_percentage))) {
            refundAmount = totalPaid * (parseFloat(refund_percentage) / 100);
          }
          break;

        case "automatic":
        default:
          // Apply automatic refund policy based on timing
          if (respect_cancellation_policy && !policy_override_reason) {
            if (hoursUntilBooking >= 48) {
              refundAmount = totalPaid * 0.95; // 95% refund for 48+ hours
              cancellationFee = totalPaid * 0.05;
            } else if (hoursUntilBooking >= 24) {
              refundAmount = totalPaid * 0.85; // 85% refund for 24-48 hours
              cancellationFee = totalPaid * 0.15;
            } else if (hoursUntilBooking >= 12) {
              refundAmount = totalPaid * 0.70; // 70% refund for 12-24 hours
              cancellationFee = totalPaid * 0.30;
            } else if (hoursUntilBooking >= 2) {
              refundAmount = totalPaid * 0.50; // 50% refund for 2-12 hours
              cancellationFee = totalPaid * 0.50;
            } else {
              refundAmount = 0; // No refund for less than 2 hours
              cancellationFee = totalPaid;
            }
          } else {
            // Override policy - full refund
            refundAmount = totalPaid;
          }
          break;
      }

      // Apply fee waiver if requested
      if (waive_cancellation_fee) {
        refundAmount = totalPaid;
        cancellationFee = 0;
      }

      // Emergency cancellation gets full refund
      if (emergency_cancellation) {
        refundAmount = totalPaid;
        cancellationFee = 0;
      }

      refundDetails = {
        original_amount: totalPaid,
        refund_amount: refundAmount,
        cancellation_fee: cancellationFee,
        refund_method,
        hours_notice: Math.max(0, hoursUntilBooking),
        policy_applied: respect_cancellation_policy,
        emergency_override: emergency_cancellation,
        fee_waived: waive_cancellation_fee,
      };
    }

    // Prepare cancellation data
    const cancellationData = {
      status: "cancelled",
      cancelled_at: cancellationTimestamp,
      cancellation_reason,
      cancellation_category,
      cancelled_by,
      cancellation_fee: cancellationFee,
      refund_amount: refundAmount,
      payment_status: refundAmount > 0 ? "refunded" : existingBooking.payment_status,
      updated_at: cancellationTimestamp,
      last_updated_by: adminUserId.toString(),
    };

    // Build admin audit trail
    const auditEntries = [];
    auditEntries.push(`[${cancellationTimestamp.toISOString()}] CANCELLED by ${cancelled_by} (${adminUserId})`);
    auditEntries.push(`Category: ${cancellation_category}`);
    auditEntries.push(`Reason: ${cancellation_reason}`);

    if (refundDetails) {
      auditEntries.push(`Refund: ${refundDetails.refund_amount} ${existingBooking.currency || 'IRR'} (Fee: ${refundDetails.cancellation_fee})`);
    }

    if (emergency_cancellation) {
      auditEntries.push("🚨 EMERGENCY CANCELLATION");
    }

    if (policy_override_reason) {
      auditEntries.push(`Policy Override: ${policy_override_reason}`);
    }

    if (customer_satisfaction_priority) {
      auditEntries.push("⭐ Customer satisfaction priority");
    }

    const auditTrail = auditEntries.join("\n");
    cancellationData.admin_notes = existingBooking.admin_notes
      ? `${existingBooking.admin_notes}\n${auditTrail}`
      : auditTrail;

    if (admin_notes) {
      cancellationData.admin_notes += `\nAdmin Notes: ${admin_notes}`;
    }

    if (internal_notes) {
      cancellationData.internal_notes = existingBooking.internal_notes
        ? `${existingBooking.internal_notes}\n[${cancellationTimestamp.toISOString()}] ${internal_notes}`
        : `[${cancellationTimestamp.toISOString()}] ${internal_notes}`;
    }

    // Update the booking
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
    if (refundAmount > 0 && process_refund_immediately) {
      try {
        if (refund_to_wallet) {
          // Create wallet refund transaction
          refundResult = await coreApp.odm.insertOne("wallet_transaction", {
            doc: {
              user: existingBooking.user._id,
              transaction_type: "refund",
              amount: refundAmount,
              currency: existingBooking.currency || "IRR",
              status: "completed",
              description: `Refund for cancelled booking ${existingBooking.booking_number}`,
              reference_id: booking_id,
              cancellation_category,
              created_at: cancellationTimestamp,
              updated_at: cancellationTimestamp,
            },
          });

          // Update user wallet balance
          await coreApp.odm.updateOne("user", {
            filters: { _id: existingBooking.user._id },
            set: {
              $inc: { wallet_balance: refundAmount },
              updated_at: cancellationTimestamp,
            },
          });
        } else {
          // Create refund request for original payment method
          refundResult = await coreApp.odm.insertOne("refund_request", {
            doc: {
              booking_id,
              user: existingBooking.user._id,
              amount: refundAmount,
              currency: existingBooking.currency || "IRR",
              refund_method: "original_payment",
              status: "pending",
              requested_at: cancellationTimestamp,
              reason: cancellation_reason,
            },
          });
        }
      } catch (refundError) {
        console.error("Refund processing error:", refundError);
        // Continue with cancellation even if refund fails
      }
    }

    // Release space availability if requested
    if (release_space_immediately) {
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
        // Continue with cancellation
      }
    }

    // Generate alternative suggestions if requested
    let alternatives = null;
    if (suggest_alternative_spaces || offer_rescheduling) {
      alternatives = await generateAlternatives(existingBooking, suggest_alternative_spaces, offer_rescheduling);
    }

    // Create follow-up tasks if requested
    const followUpTasks = [];
    if (schedule_follow_up_call) {
      followUpTasks.push({
        type: "follow_up_call",
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        description: "Follow up call regarding booking cancellation",
      });
    }

    if (send_feedback_survey) {
      followUpTasks.push({
        type: "feedback_survey",
        due_date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        description: "Send cancellation feedback survey",
      });
    }

    // Get the updated booking
    const cancelledBooking = await coreApp.odm.findOne("booking", {
      filters: { booking_id },
      relations: {
        user: { get: { name: 1, email: 1, phone: 1 } },
      },
    });

    // Prepare customer notification data
    const customerNotificationData = notify_customer ? {
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
      cancellation_fee: cancellationFee,
      currency: existingBooking.currency || "IRR",
      notification_method,
      custom_message: custom_message_to_customer,
      alternatives_offered: alternatives,
      future_discount_offered: provide_future_discount,
      notification_type: "booking_cancelled",
    } : null;

    return {
      success: true,
      body: {
        booking_cancelled: true,
        booking_details: cancelledBooking,
        cancellation_info: {
          cancelled_at: cancellationTimestamp,
          cancelled_by,
          cancellation_category,
          cancellation_reason,
          emergency_cancellation,
          immediate_processing: immediate_cancellation,
        },
        refund_info: refundDetails || {
          refund_requested: false,
          reason: "No refund applicable or booking not paid",
        },
        financial_impact: {
          original_amount: existingBooking.total_price,
          refund_amount: refundAmount,
          cancellation_fee: cancellationFee,
          net_revenue_loss: existingBooking.total_price - cancellationFee,
          currency: existingBooking.currency || "IRR",
          refund_processed: refundAmount > 0 && process_refund_immediately,
          refund_method: refund_to_wallet ? "wallet" : "original_payment",
          refund_transaction_id: refundResult?.success ? refundResult.body._id : null,
        },
        customer_info: {
          name: existingBooking.customer_name,
          email: existingBooking.customer_email,
          phone: existingBooking.customer_phone,
          satisfaction_priority: customer_satisfaction_priority,
        },
        space_info: {
          type: existingBooking.space_type,
          name: getSpaceName(existingBooking.space_type),
          date: existingBooking.booking_date,
          time_slot: `${existingBooking.start_time} - ${existingBooking.end_time}`,
          capacity_freed: existingBooking.capacity_requested,
          immediately_available: release_space_immediately,
        },
        customer_service: {
          alternatives_suggested: alternatives,
          rescheduling_offered: offer_rescheduling,
          future_discount_offered: provide_future_discount,
          follow_up_scheduled: schedule_follow_up_call,
          feedback_survey_planned: send_feedback_survey,
        },
        admin_actions: {
          policy_override_applied: !!policy_override_reason,
          emergency_processing: emergency_cancellation,
          fee_waived: waive_cancellation_fee,
          notification_sent: notify_customer,
          space_released: release_space_immediately,
          follow_up_tasks: followUpTasks,
        },
        business_impact: {
          status_changed: `${existingBooking.status} → cancelled`,
          revenue_impact: -cancellationFee, // Negative impact
          customer_relationship: customer_satisfaction_priority ? "prioritized" : "standard",
          space_utilization_freed: true,
          refund_liability: refundAmount,
        },
        customer_notifications: customerNotificationData,
        tracking: {
          booking_id: existingBooking.booking_id,
          booking_number: existingBooking.booking_number,
          cancellation_reference: `CANC-${cancellationTimestamp.getTime()}`,
          processing_timestamp: cancellationTimestamp.toISOString(),
        },
      },
      message: `Booking ${existingBooking.booking_number} cancelled successfully. ${refundAmount > 0 ? `Refund of ${refundAmount} ${existingBooking.currency || 'IRR'} ${process_refund_immediately ? 'processed' : 'scheduled'}.` : 'No refund processed.'}${emergency_cancellation ? ' Emergency cancellation completed.' : ''}`,
    };

  } catch (error) {
    console.error("Error in cancelBooking function:", error);
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

  // Helper method to generate alternatives
  async function generateAlternatives(originalBooking: any, includeSpaces: boolean, includeRescheduling: boolean) {
    const alternatives = {
      alternative_spaces: [],
      rescheduling_options: [],
      discount_offers: [],
    };

    try {
      // Suggest alternative spaces for same date/time
      if (includeSpaces) {
        const spaceTypes = ["meeting_room", "conference_room", "workshop_space", "private_office"];
        for (const spaceType of spaceTypes) {
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

          if (spaceCapacity - bookedCapacity >= originalBooking.capacity_requested) {
            alternatives.alternative_spaces.push({
              space_type: spaceType,
              space_name: getSpaceName(spaceType),
              same_date_time: true,
              available_capacity: spaceCapacity - bookedCapacity,
            });
          }
        }
      }

      // Suggest rescheduling options
      if (includeRescheduling) {
        const futureDates = [1, 2, 3, 7].map(days => {
          const date = new Date(originalBooking.booking_date);
          date.setDate(date.getDate() + days);
          return date;
        });

        for (const date of futureDates) {
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

          if (spaceCapacity - bookedCapacity >= originalBooking.capacity_requested) {
            alternatives.rescheduling_options.push({
              new_date: date,
              same_time_slot: true,
              space_type: originalBooking.space_type,
              available: true,
              days_difference: Math.ceil((date.getTime() - originalBooking.booking_date.getTime()) / (1000 * 60 * 60 * 24)),
            });
          }
        }
      }

    } catch (error) {
      console.error("Error generating alternatives:", error);
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

  // Helper method to update space availability
  async function updateSpaceAvailability(
    spaceType: string,
    date: Date,
    startTime: string,
    endTime: string,
    capacityChange: number
  ) {
    // This would integrate with a space availability tracking system
    console.log(`Space availability updated: ${spaceType} on ${date} from ${startTime} to ${endTime}, capacity change: ${capacityChange}`);
  }
};
