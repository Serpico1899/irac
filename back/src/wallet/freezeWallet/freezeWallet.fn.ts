import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const freezeWalletFn: ActFn = async (body) => {
  const {
    set: { user_id, reason, notes },
    user,
  } = body.details;

  try {
    // Freeze the wallet
    const result = await WalletService.freezeWallet(
      user_id,
      reason,
      user._id, // Admin user ID
      notes
    );

    return {
      success: true,
      data: result,
      message: `Successfully froze wallet for user`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to freeze wallet",
    };
  }
};
