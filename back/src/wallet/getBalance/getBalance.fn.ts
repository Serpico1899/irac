import { type ActFn } from "@deps";
import { WalletService } from "../service.ts";

export const getBalanceFn: ActFn = async (body) => {
  const {
    set: { user_id },
  } = body.details;

  // Get wallet balance using the service
  const balance = await WalletService.getBalance(user_id);

  return balance;
};
