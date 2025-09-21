import { coreApp } from "../../../mod.ts";
import { verifyPhoneNumberFn } from "./act.ts";
import { verifyPhoneNumberValidator } from "./verifyPhoneNumber.val.ts";

export const verifyPhoneNumberSetup = () =>
  coreApp.acts.setAct({
    schema: "sms",
    actName: "verifyPhoneNumber",
    validator: verifyPhoneNumberValidator(),
    fn: verifyPhoneNumberFn,
  });
