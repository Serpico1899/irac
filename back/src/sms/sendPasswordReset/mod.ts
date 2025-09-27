import {  coreApp  } from "@app";
import { sendPasswordResetFn } from "./act.ts";
import { sendPasswordResetValidator } from "./sendPasswordReset.val.ts";

export const sendPasswordResetSetup = () =>
  coreApp.acts.setAct({
    schema: "sms",
    actName: "sendPasswordReset",
    validator: sendPasswordResetValidator(),
    fn: sendPasswordResetFn,
  });
