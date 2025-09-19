import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const unfreezeWalletFn: ActFn = async (body) => {
  const {
    set: { user_id, reason, notes },
    user,
  } = body.details;

  try {
    // Unfreeze the wallet
    const result = await WalletService.unfreezeWallet(
      user_id,
      reason,
      user._id, // Admin user ID
      notes
    );

    return {
      success: true,
      data: result,
      message: `Successfully unfroze wallet for user`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to unfreeze wallet",
    };
  }
};
