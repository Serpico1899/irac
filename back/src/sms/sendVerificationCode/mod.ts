import { coreApp } from "../../../mod.ts";
import { sendVerificationCodeFn } from "./act.ts";
import { sendVerificationCodeValidator } from "./sendVerificationCode.val.ts";

export const sendVerificationCodeSetup = () =>
  coreApp.acts.setAct({
    schema: "sms",
    actName: "sendVerificationCode",
    validator: sendVerificationCodeValidator(),
    fn: sendVerificationCodeFn,
  });
