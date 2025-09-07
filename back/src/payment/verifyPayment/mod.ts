import { setAct } from "../../../mod.ts";
import { verifyPaymentValidator } from "./verifyPayment.val.ts";
import { verifyPaymentFn } from "./verifyPayment.fn.ts";

export const verifyPaymentSetup = () =>
  setAct({
    schema: "payment",
    actName: "verifyPayment",
    validator: verifyPaymentValidator(),
    fn: verifyPaymentFn,
  });
