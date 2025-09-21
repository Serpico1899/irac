import { coreApp } from "../../../mod.ts";
import { sendBookingReminderFn } from "./act.ts";
import { sendBookingReminderValidator } from "./sendBookingReminder.val.ts";

export const sendBookingReminderSetup = () =>
  coreApp.acts.setAct({
    schema: "sms",
    actName: "sendBookingReminder",
    validator: sendBookingReminderValidator(),
    fn: sendBookingReminderFn,
  });
