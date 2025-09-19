import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const adminWithdrawFn: ActFn = async (body) => {
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
    // Process the admin withdrawal
    const result = await WalletService.adminWithdraw(
      user_id,
      amount,
      reason,
      user._id, // Admin user ID
      notes
    );

    return {
      success: true,
      data: result,
      message: `Successfully withdrew ${amount} IRR from user wallet`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to process admin withdrawal",
    };
  }
};
