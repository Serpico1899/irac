import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const adjustBalanceFn: ActFn = async (body) => {
  const {
    set: { user_id, new_balance, reason, notes },
    user,
  } = body.details;

  if (new_balance < 0) {
    return {
      success: false,
      message: "New balance cannot be negative",
    };
  }

  try {
    // Process the balance adjustment
    const result = await WalletService.adjustBalance(
      user_id,
      new_balance,
      reason,
      user._id, // Admin user ID
      notes
    );

    return {
      success: true,
      data: result,
      message: `Successfully adjusted wallet balance to ${new_balance} IRR`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to adjust wallet balance",
    };
  }
};
