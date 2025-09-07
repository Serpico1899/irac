import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const getTransactionsFn: ActFn = async (body) => {
  const {
    set: { user_id, page, limit, type, status },
  } = body.details;

  // Get transaction history using the service
  const result = await WalletService.getTransactionHistory(
    user_id,
    page || 1,
    limit || 20,
    type,
    status
  );

  return {
    success: true,
    data: result,
  };
};
