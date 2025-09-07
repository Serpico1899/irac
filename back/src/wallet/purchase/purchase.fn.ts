import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const purchaseFn: ActFn = async (body) => {
  const {
    set: { user_id, amount, order_id, description },
  } = body.details;

  // Check if user has sufficient balance first
  const hasSufficientBalance = await WalletService.hasSufficientBalance(user_id, amount);

  if (!hasSufficientBalance) {
    throw new Error("Insufficient wallet balance");
  }

  // Process the purchase
  const result = await WalletService.processPurchase(
    user_id,
    amount,
    order_id,
    description
  );

  return {
    success: true,
    data: result,
    message: `Successfully processed purchase of ${amount}`,
  };
};
