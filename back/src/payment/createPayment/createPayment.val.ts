import { object, string, number, optional } from "@deps";

export const createPaymentValidator = () => {
  return object({
    amount: number(),
    description: string(),
    mobile: optional(string()),
    email: optional(string()),
    order_id: optional(string()),
    metadata: optional(object({})),
  });
};
