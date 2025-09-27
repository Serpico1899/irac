import {  coreApp  } from "@app";
import { send2FACodeFn } from "./act.ts";
import { send2FACodeValidator } from "./send2FACode.val.ts";

export const send2FACodeSetup = () =>
  coreApp.acts.setAct({
    schema: "sms",
    actName: "send2FACode",
    validator: send2FACodeValidator(),
    fn: send2FACodeFn,
  });
