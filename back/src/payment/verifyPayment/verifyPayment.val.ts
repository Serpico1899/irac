import { object, string, number, optional } from "@deps";

export const verifyPaymentValidator = () => {
  return object({
    authority: string(),
    amount: number(),
    status: optional(string()),
  });
};
