import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { rejectBookingFn } from "./rejectBooking.fn.ts";
import { rejectBookingValidator } from "./rejectBooking.val.ts";

export const rejectBookingSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "rejectBooking",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: rejectBookingValidator(),
    fn: rejectBookingFn,
  });
