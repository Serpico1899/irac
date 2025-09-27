import { type ActFn, ObjectId } from "@deps";
import {  wallet  } from "@app";
import { WalletService } from "../service.ts";

export const getWalletFn: ActFn = async (body) => {
  const {
    set: { user_id },
    get,
  } = body.details;

  // Get or create wallet for the user
  const userWallet = await WalletService.getUserWallet(user_id);

  // Use aggregation to get wallet with proper projection
  const foundedWallet = await wallet
    .aggregation({
      pipeline: [{ $match: { _id: new ObjectId(userWallet._id) } }],
      projection: get,
    })
    .toArray();

  return foundedWallet[0];
};
