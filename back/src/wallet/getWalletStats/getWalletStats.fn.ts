import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const getWalletStatsFn: ActFn = async (body) => {
  const {
    set: {
      period,
      start_date,
      end_date,
      include_dormant
    },
  } = body.details;

  try {
    // Get comprehensive wallet statistics
    const result = await WalletService.getWalletStats({
      period,
      start_date,
      end_date,
      include_dormant: include_dormant === "true",
    });

    return {
      success: true,
      data: result,
      message: `Retrieved wallet statistics for period: ${period}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to retrieve wallet statistics",
    };
  }
};
