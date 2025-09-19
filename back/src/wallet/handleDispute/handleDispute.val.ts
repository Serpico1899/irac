import { object, objectIdValidation, string, optional, number, boolean, defaulted } from "@deps";
import { selectStruct } from "../../../mod.ts";

export const handleDisputeValidator = () => {
  return object({
    set: object({
      transaction_id: string(), // Transaction ID to dispute
      dispute_action: string(), // refund, partial_refund, reject, investigate
      refund_amount: optional(number()), // Required for partial_refund
      resolution_notes: string(), // Admin resolution notes
      internal_notes: optional(string()), // Internal admin notes
      notify_user: defaulted(boolean(), true), // Send notification to user
      escalate: defaulted(boolean(), false), // Escalate to higher authority
    }),
    get: selectStruct("wallet_transaction", 2),
  });
};
