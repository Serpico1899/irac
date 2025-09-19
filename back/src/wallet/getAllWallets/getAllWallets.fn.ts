import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const getAllWalletsFn: ActFn = async (body) => {
  const {
    set: {
      page,
      limit,
      status,
      search,
      sort_by,
      sort_order,
      min_balance,
      max_balance
    },
  } = body.details;

  try {
    // Get all wallets with filters
    const result = await WalletService.getAllWallets({
      page,
      limit,
      status,
      search,
      sort_by,
      sort_order,
      min_balance,
      max_balance,
    });

    return {
      success: true,
      data: result,
      message: `Retrieved ${result.wallets.length} wallets`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to retrieve wallets",
    };
  }
};
