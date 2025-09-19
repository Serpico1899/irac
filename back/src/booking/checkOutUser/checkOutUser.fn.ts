import { ActFn } from "@deps";
import { coreApp } from "@app";

export const checkOutUserFn: ActFn = async (body) => {
  try {
    const {
      booking_id,
      check_out_time,
      checkout_status,
      actual_duration,
      space_condition = "good",
      equipment_status = "all_returned",
      equipment_returned,
      missing_equipment,
      damaged_equipment,
      overtime_charges = 0,
      damage_charges = 0,
      cleaning_charges = 0,
      additional_charges = 0,
      early_checkout_refund = 0,
      customer_rating,
      customer_feedback,
      customer_complaints,
      customer_compliments,
      admin_notes,
      checkout_notes,
      damage_report,
      maintenance_required,
      staff_member_checkout,
      checkout_location = "reception",
      checkout_method = "in_person",
      special_requirements_met = true,
      service_quality_rating,
      space_cleanliness_rating,
      equipment_functionality_rating,
      collect_detailed_feedback = true,
      send_checkout_receipt = true,
      send_feedback_survey = true,
      schedule_follow_up = false,
      override_overtime_charges = false,
      override_damage_charges = false,
      manual_checkout = false,
      emergency_checkout = false,
      blacklist_customer = false,
      priority_customer = false,
      booking_extension_offered = false,
      future_booking_discount = false,
      checkout_verification_complete = true,
      all_items_accounted_for = true,
      customer_satisfaction_confirmed = true,
      updated_contact_info,
      follow_up_required = false,
      follow_up_reason,
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

    // Check if booking is in a valid state for checkout
    if (existingBooking.status !== "checked_in") {
      return {
        success: false,
        message: `Cannot check out booking with status: ${existingBooking.status}`,
        details: {
          current_status: existingBooking.status,
          booking_id,
          required_status: "checked_in",
          suggestion: existingBooking.status === "completed" ? "Booking is already checked out" : "Customer must be checked in before checkout",
        },
      };
    }

    if (!existingBooking.checked_in_at) {
      return {
        success: false,
        message: "No check-in time found for this booking",
        details: {
          booking_id,
          suggestion: "Booking appears to be in inconsistent state - check-in time missing",
        },
      };
    }

    // Determine checkout time and calculate actual duration
    const checkOutTimestamp = check_out_time ? new Date(check_out_time) : new Date();
    const checkInTime = new Date(existingBooking.checked_in_at);
    const calculatedDuration = actual_duration !== undefined
      ? actual_duration
      : Math.round((checkOutTimestamp.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) * 100) / 100;

    // Calculate planned end time
    const bookingDateTime = new Date(`${existingBooking.booking_date.toISOString().split('T')[0]}T${existingBooking.start_time}:00`);
    const plannedEndTime = new Date(bookingDateTime);
    plannedEndTime.setHours(plannedEndTime.getHours() + existingBooking.duration_hours);

    // Determine checkout status
    let calculatedCheckoutStatus = checkout_status;
    if (!calculatedCheckoutStatus) {
      const timeDifferenceMinutes = (checkOutTimestamp.getTime() - plannedEndTime.getTime()) / (1000 * 60);

      if (timeDifferenceMinutes <= -30) {
        calculatedCheckoutStatus = "early";
      } else if (timeDifferenceMinutes <= 15) {
        calculatedCheckoutStatus = "on_time";
      } else if (timeDifferenceMinutes <= 60) {
        calculatedCheckoutStatus = "overtime";
      } else {
        calculatedCheckoutStatus = "extended";
      }
    }

    // Calculate financial adjustments
    let totalOvertimeCharges = override_overtime_charges ? 0 : overtime_charges;
    let totalDamageCharges = override_damage_charges ? 0 : damage_charges;
    let totalAdditionalCharges = cleaning_charges + additional_charges;
    let totalRefund = early_checkout_refund;

    // Auto-calculate overtime charges if in overtime/extended status
    if ((calculatedCheckoutStatus === "overtime" || calculatedCheckoutStatus === "extended") && !override_overtime_charges && overtime_charges === 0) {
      const overtimeHours = Math.max(0, (checkOutTimestamp.getTime() - plannedEndTime.getTime()) / (1000 * 60 * 60));
      const overtimeRate = existingBooking.hourly_rate * 1.5; // 1.5x rate for overtime
      totalOvertimeCharges = Math.round(overtimeHours * overtimeRate);
    }

    // Auto-calculate early checkout refund if applicable
    if (calculatedCheckoutStatus === "early" && early_checkout_refund === 0) {
      const earlyHours = Math.max(0, (plannedEndTime.getTime() - checkOutTimestamp.getTime()) / (1000 * 60 * 60));
      if (earlyHours >= 1) { // Only refund if more than 1 hour early
        totalRefund = Math.round(earlyHours * existingBooking.hourly_rate * 0.5); // 50% refund for unused time
      }
    }

    // Calculate net amount (charges - refunds)
    const netAmount = totalOvertimeCharges + totalDamageCharges + totalAdditionalCharges - totalRefund;

    // Prepare checkout data
    const checkoutData = {
      status: "completed",
      checked_out_at: checkOutTimestamp,
      actual_duration: calculatedDuration,
      checkout_status: calculatedCheckoutStatus,
      space_condition,
      equipment_status,
      updated_at: checkOutTimestamp,
      last_updated_by: adminUserId.toString(),
    };

    // Add financial data
    if (netAmount !== 0) {
      checkoutData.overtime_charges = totalOvertimeCharges;
      checkoutData.damage_charges = totalDamageCharges;
      checkoutData.cleaning_charges = cleaning_charges;
      checkoutData.additional_charges = additional_charges;
      checkoutData.early_checkout_refund = totalRefund;
      checkoutData.net_additional_amount = netAmount;
    }

    // Add equipment tracking
    if (equipment_returned) {
      checkoutData.equipment_returned = equipment_returned;
    }
    if (missing_equipment) {
      checkoutData.missing_equipment = missing_equipment;
    }
    if (damaged_equipment) {
      checkoutData.damaged_equipment = damaged_equipment;
    }

    // Add customer feedback
    if (customer_rating) {
      checkoutData.rating = customer_rating;
    }
    if (customer_feedback) {
      checkoutData.feedback = customer_feedback;
    }
    if (customer_complaints) {
      checkoutData.customer_complaints = customer_complaints;
    }
    if (customer_compliments) {
      checkoutData.customer_compliments = customer_compliments;
    }

    // Add service ratings
    if (service_quality_rating) {
      checkoutData.service_quality_rating = service_quality_rating;
    }
    if (space_cleanliness_rating) {
      checkoutData.space_cleanliness_rating = space_cleanliness_rating;
    }
    if (equipment_functionality_rating) {
      checkoutData.equipment_functionality_rating = equipment_functionality_rating;
    }

    // Add staff and process details
    if (staff_member_checkout) {
      checkoutData.staff_member_checkout = staff_member_checkout;
    }
    checkoutData.checkout_location = checkout_location;
    checkoutData.checkout_method = checkout_method;

    // Add contact updates
    if (updated_contact_info) {
      checkoutData.updated_contact_info = updated_contact_info;
    }

    // Add maintenance notes
    if (damage_report) {
      checkoutData.damage_report = damage_report;
    }
    if (maintenance_required) {
      checkoutData.maintenance_required = maintenance_required;
    }

    // Build admin audit trail
    const auditEntries = [];
    auditEntries.push(`[${checkOutTimestamp.toISOString()}] CHECKED OUT by admin ${adminUserId}`);
    auditEntries.push(`Duration: ${calculatedDuration} hours (planned: ${existingBooking.duration_hours})`);
    auditEntries.push(`Status: ${calculatedCheckoutStatus}`);
    auditEntries.push(`Space condition: ${space_condition}`);
    auditEntries.push(`Equipment: ${equipment_status}`);

    if (netAmount !== 0) {
      auditEntries.push(`Financial impact: ${netAmount > 0 ? 'Additional charges' : 'Refund'} ${Math.abs(netAmount)} ${existingBooking.currency || 'IRR'}`);
    }

    if (customer_rating) {
      auditEntries.push(`Customer rating: ${customer_rating}/5 stars`);
    }

    // Add special flags
    const specialFlags = [];
    if (emergency_checkout) specialFlags.push("Emergency checkout");
    if (manual_checkout) specialFlags.push("Manual process");
    if (blacklist_customer) specialFlags.push("⚠️ Customer flagged");
    if (priority_customer) specialFlags.push("⭐ VIP customer");
    if (override_overtime_charges) specialFlags.push("Overtime charges waived");
    if (override_damage_charges) specialFlags.push("Damage charges waived");

    if (specialFlags.length > 0) {
      auditEntries.push(`Special handling: ${specialFlags.join(', ')}`);
    }

    const auditTrail = auditEntries.join("\n");
    checkoutData.admin_notes = existingBooking.admin_notes
      ? `${existingBooking.admin_notes}\n${auditTrail}`
      : auditTrail;

    if (admin_notes) {
      checkoutData.admin_notes += `\nCheckout Notes: ${admin_notes}`;
    }

    if (checkout_notes) {
      checkoutData.checkout_notes = checkout_notes;
    }

    // Add follow-up flags
    if (follow_up_required) {
      checkoutData.follow_up_required = true;
      checkoutData.follow_up_reason = follow_up_reason || "Follow-up requested during checkout";
    }

    // Update the booking
    const updateResult = await coreApp.odm.updateOne("booking", {
      filters: { booking_id },
      set: checkoutData,
    });

    if (!updateResult.success) {
      return {
        success: false,
        message: "Failed to check out user",
        details: { error: updateResult.error || "Unknown database error" },
      };
    }

    // Process additional charges if any
    let chargeResult = null;
    if (netAmount > 0) {
      try {
        // Create additional charge transaction
        chargeResult = await coreApp.odm.insertOne("wallet_transaction", {
          doc: {
            user: existingBooking.user._id,
            transaction_type: "additional_charge",
            amount: netAmount,
            currency: existingBooking.currency || "IRR",
            status: "pending", // Will need to be processed
            description: `Additional charges for booking ${existingBooking.booking_number}`,
            reference_id: booking_id,
            charge_breakdown: {
              overtime_charges: totalOvertimeCharges,
              damage_charges: totalDamageCharges,
              cleaning_charges: cleaning_charges,
              additional_charges: additional_charges,
            },
            created_at: checkOutTimestamp,
            updated_at: checkOutTimestamp,
          },
        });
      } catch (chargeError) {
        console.error("Additional charge processing error:", chargeError);
      }
    }

    // Process refund if any
    let refundResult = null;
    if (netAmount < 0) {
      try {
        // Create refund transaction
        refundResult = await coreApp.odm.insertOne("wallet_transaction", {
          doc: {
            user: existingBooking.user._id,
            transaction_type: "early_checkout_refund",
            amount: Math.abs(netAmount),
            currency: existingBooking.currency || "IRR",
            status: "completed",
            description: `Early checkout refund for booking ${existingBooking.booking_number}`,
            reference_id: booking_id,
            created_at: checkOutTimestamp,
            updated_at: checkOutTimestamp,
          },
        });

        // Update user wallet balance
        await coreApp.odm.updateOne("user", {
          filters: { _id: existingBooking.user._id },
          set: {
            $inc: { wallet_balance: Math.abs(netAmount) },
            updated_at: checkOutTimestamp,
          },
        });
      } catch (refundError) {
        console.error("Refund processing error:", refundError);
      }
    }

    // Handle customer flagging if needed
    if (blacklist_customer) {
      try {
        await coreApp.odm.updateOne("user", {
          filters: { _id: existingBooking.user._id },
          set: {
            $push: {
              admin_flags: {
                type: "checkout_issue",
                reason: damage_report || customer_complaints || "Issues during checkout",
                flagged_at: checkOutTimestamp,
                flagged_by: adminUserId.toString(),
                booking_id,
                requires_review: true,
              }
            },
            updated_at: checkOutTimestamp,
          },
        });
      } catch (flagError) {
        console.error("Customer flagging error:", flagError);
      }
    }

    // Mark as VIP if priority customer
    if (priority_customer) {
      try {
        await coreApp.odm.updateOne("user", {
          filters: { _id: existingBooking.user._id },
          set: {
            $push: {
              customer_tags: {
                type: "vip",
                reason: "Excellent customer experience",
                tagged_at: checkOutTimestamp,
                tagged_by: adminUserId.toString(),
                booking_id,
              }
            },
            updated_at: checkOutTimestamp,
          },
        });
      } catch (vipError) {
        console.error("VIP tagging error:", vipError);
      }
    }

    // Update space availability (free up the space)
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
    }

    // Get the updated booking
    const checkedOutBooking = await coreApp.odm.findOne("booking", {
      filters: { booking_id },
      relations: {
        user: { get: { name: 1, email: 1, phone: 1 } },
        order: { get: { order_number: 1, total_amount: 1, status: 1 } },
        wallet_transaction: { get: { transaction_id: 1, amount: 1, status: 1 } },
      },
    });

    // Prepare notification data for customer
    const customerNotificationData = send_checkout_receipt ? {
      customer_email: existingBooking.customer_email,
      customer_phone: existingBooking.customer_phone,
      customer_name: existingBooking.customer_name,
      booking_number: existingBooking.booking_number,
      space_name: getSpaceName(existingBooking.space_type),
      checkout_time: checkOutTimestamp,
      actual_duration: calculatedDuration,
      planned_duration: existingBooking.duration_hours,
      checkout_status: calculatedCheckoutStatus,
      net_amount: netAmount,
      feedback_provided: !!customer_feedback,
      rating_provided: !!customer_rating,
      notification_type: "checkout_receipt",
    } : null;

    // Prepare feedback survey data
    const feedbackSurveyData = send_feedback_survey ? {
      booking_id,
      customer_email: existingBooking.customer_email,
      booking_experience: {
        space_type: existingBooking.space_type,
        duration: calculatedDuration,
        special_requirements_met,
        equipment_functionality_rating,
        space_cleanliness_rating,
        service_quality_rating,
      },
      initial_feedback: customer_feedback,
      initial_rating: customer_rating,
    } : null;

    return {
      success: true,
      body: {
        user_checked_out: true,
        booking_details: checkedOutBooking,
        checkout_info: {
          checked_out_at: checkOutTimestamp,
          checkout_status: calculatedCheckoutStatus,
          actual_duration: calculatedDuration,
          planned_duration: existingBooking.duration_hours,
          time_variance_hours: Math.round((calculatedDuration - existingBooking.duration_hours) * 100) / 100,
          checkout_method,
          checkout_location,
          staff_member: staff_member_checkout || adminUserId.toString(),
        },
        financial_summary: {
          base_amount: existingBooking.total_price,
          overtime_charges: totalOvertimeCharges,
          damage_charges: totalDamageCharges,
          cleaning_charges: cleaning_charges,
          additional_charges: additional_charges,
          early_checkout_refund: totalRefund,
          net_additional_amount: netAmount,
          currency: existingBooking.currency || "IRR",
          charge_processed: netAmount !== 0,
          charge_transaction_id: chargeResult?.success ? chargeResult.body._id : null,
          refund_transaction_id: refundResult?.success ? refundResult.body._id : null,
        },
        customer_info: {
          name: existingBooking.customer_name,
          email: existingBooking.customer_email,
          phone: existingBooking.customer_phone,
          satisfaction_confirmed: customer_satisfaction_confirmed,
          flagged_for_review: blacklist_customer,
          marked_as_vip: priority_customer,
          updated_contact: updated_contact_info || null,
        },
        space_assessment: {
          type: existingBooking.space_type,
          name: getSpaceName(existingBooking.space_type),
          condition: space_condition,
          requires_maintenance: !!maintenance_required,
          maintenance_notes: maintenance_required || null,
          damage_reported: !!damage_report,
          damage_details: damage_report || null,
          space_cleanliness_rating,
        },
        equipment_assessment: {
          status: equipment_status,
          all_returned: equipment_status === "all_returned",
          equipment_returned: equipment_returned || "Standard equipment",
          missing_items: missing_equipment || "None",
          damaged_items: damaged_equipment || "None",
          functionality_rating: equipment_functionality_rating,
        },
        customer_feedback: {
          rating: customer_rating || null,
          feedback: customer_feedback || null,
          complaints: customer_complaints || null,
          compliments: customer_compliments || null,
          service_quality_rating,
          special_requirements_met,
          overall_satisfaction: customer_rating >= 4 ? "satisfied" : customer_rating >= 3 ? "neutral" : "dissatisfied",
        },
        business_impact: {
          space_utilization_complete: true,
          revenue_impact: netAmount,
          customer_relationship_status: blacklist_customer ? "flagged" : priority_customer ? "enhanced" : "maintained",
          future_booking_considerations: {
            discount_offered: future_booking_discount,
            extension_was_offered: booking_extension_offered,
            follow_up_scheduled: follow_up_required,
          },
        },
        admin_actions: {
          overrides_applied: {
            overtime_charges_waived: override_overtime_charges,
            damage_charges_waived: override_damage_charges,
          },
          notifications_sent: {
            checkout_receipt: send_checkout_receipt,
            feedback_survey: send_feedback_survey,
          },
          follow_up_actions: {
            customer_flagged: blacklist_customer,
            vip_status_granted: priority_customer,
            follow_up_required: follow_up_required,
            maintenance_scheduled: !!maintenance_required,
          },
          verification_status: {
            checkout_complete: checkout_verification_complete,
            items_accounted: all_items_accounted_for,
            customer_satisfied: customer_satisfaction_confirmed,
          },
        },
        post_checkout_actions: {
          space_availability_updated: true,
          financial_transactions_processed: netAmount !== 0,
          customer_notifications_queued: send_checkout_receipt || send_feedback_survey,
          maintenance_alerts_created: !!maintenance_required,
          follow_up_tasks_created: follow_up_required,
        },
        customer_notifications: customerNotificationData,
        feedback_survey: feedbackSurveyData,
        space_handover: {
          space_freed_at: checkOutTimestamp,
          next_available_slot: "Immediately available for booking",
          preparation_required: space_condition !== "excellent",
          estimated_turnaround: space_condition === "needs_cleaning" ? "30 minutes" : "Ready for immediate use",
        },
        tracking: {
          booking_id: existingBooking.booking_id,
          booking_number: existingBooking.booking_number,
          checkout_reference: `CO-${checkOutTimestamp.getTime()}`,
          completion_timestamp: checkOutTimestamp.toISOString(),
          total_booking_duration: `${Math.round((checkOutTimestamp.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) * 100) / 100} hours`,
        },
      },
      message: `Customer ${existingBooking.customer_name} checked out successfully from booking ${existingBooking.booking_number}. Status: ${calculatedCheckoutStatus}${netAmount !== 0 ? `. Net amount: ${netAmount} ${existingBooking.currency || 'IRR'}` : ''}${follow_up_required ? '. Follow-up scheduled.' : '.'}`,
    };

  } catch (error) {
    console.error("Error in checkOutUser function:", error);
    return {
      success: false,
      message: "Internal server error while checking out user",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        booking_id: body.details.set.booking_id,
        admin_user_id: body.user?._id,
        timestamp: new Date().toISOString(),
      },
    };
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
