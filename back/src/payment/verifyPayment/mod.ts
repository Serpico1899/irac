import {  setAct  } from "@app";
import { verifyPaymentValidator } from "./verifyPayment.val.ts";
import { verifyPaymentFn } from "./verifyPayment.fn.ts";

export const verifyPaymentSetup = () =>
  setAct({
    schema: "payment",
    actName: "verifyPayment",
    validator: verifyPaymentValidator(),
    fn: verifyPaymentFn,
  });
