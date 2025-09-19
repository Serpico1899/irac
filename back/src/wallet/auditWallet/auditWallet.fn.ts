import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const auditWalletFn: ActFn = async (body) => {
  const {
    set: {
      user_id,
      start_date,
      end_date,
      transaction_types,
      include_suspicious,
      detailed,
      verify_balance
    },
  } = body.details;

  try {
    // Perform comprehensive wallet audit
    const result = await WalletService.auditWallet({
      user_id,
      start_date,
      end_date,
      transaction_types: transaction_types ? transaction_types.split(',').map(t => t.trim()) : undefined,
      include_suspicious,
      detailed,
      verify_balance,
    });

    return {
      success: true,
      data: result,
      message: `Completed audit for wallet ${user_id}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to audit wallet",
    };
  }
};
