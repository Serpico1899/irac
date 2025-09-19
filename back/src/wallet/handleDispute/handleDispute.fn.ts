import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const handleDisputeFn: ActFn = async (body) => {
  const {
    set: {
      transaction_id,
      dispute_action,
      refund_amount,
      resolution_notes,
      internal_notes,
      notify_user,
      escalate
    },
    user,
  } = body.details;

  // Validate dispute action
  const validActions = ["refund", "partial_refund", "reject", "investigate"];
  if (!validActions.includes(dispute_action)) {
    return {
      success: false,
      message: "Invalid dispute action. Must be: refund, partial_refund, reject, or investigate",
    };
  }

  // Validate refund amount for partial refunds
  if (dispute_action === "partial_refund" && (!refund_amount || refund_amount <= 0)) {
    return {
      success: false,
      message: "Refund amount is required and must be positive for partial refunds",
    };
  }

  try {
    // Handle the dispute
    const result = await WalletService.handleDispute({
      transaction_id,
      dispute_action,
      refund_amount,
      resolution_notes,
      internal_notes,
      notify_user,
      escalate,
      admin_user_id: user._id,
    });

    return {
      success: true,
      data: result,
      message: `Successfully ${dispute_action === "reject" ? "rejected" : "processed"} dispute for transaction ${transaction_id}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to handle dispute",
    };
  }
};
