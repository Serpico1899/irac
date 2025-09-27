import {  setAct  } from "@app";
import { createPaymentValidator } from "./createPayment.val.ts";
import { createPaymentFn } from "./createPayment.fn.ts";

export const createPaymentSetup = () =>
  setAct({
    schema: "payment",
    actName: "createPayment",
    validator: createPaymentValidator(),
    fn: createPaymentFn,
  });
