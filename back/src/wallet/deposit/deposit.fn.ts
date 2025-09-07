import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const depositFn: ActFn = async (body) => {
  const {
    set: { user_id, amount, payment_method, description, reference_id },
    user,
  } = body.details;

  // Check if this is an admin operation (manual deposit)
  const isManualDeposit = !payment_method || payment_method === "manual";
  const adminUserId = isManualDeposit && user?.level === "Manager" ? user._id : undefined;

  // Process the deposit
  const result = await WalletService.deposit(
    user_id,
    amount,
    payment_method || "manual",
    description,
    reference_id,
    adminUserId
  );

  return {
    success: true,
    data: result,
    message: `Successfully deposited ${amount} to wallet`,
  };
};
