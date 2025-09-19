import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const adminDepositFn: ActFn = async (body) => {
  const {
    set: { user_id, amount, reason, notes },
    user,
  } = body.details;

  if (amount <= 0) {
    return {
      success: false,
      message: "Amount must be positive",
    };
  }

  try {
    // Process the admin deposit
    const result = await WalletService.adminDeposit(
      user_id,
      amount,
      reason,
      user._id, // Admin user ID
      notes
    );

    return {
      success: true,
      data: result,
      message: `Successfully deposited ${amount} IRR to user wallet`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to process admin deposit",
    };
  }
};
