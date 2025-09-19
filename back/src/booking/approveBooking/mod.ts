import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { approveBookingFn } from "./approveBooking.fn.ts";
import { approveBookingValidator } from "./approveBooking.val.ts";

export const approveBookingSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "approveBooking",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: approveBookingValidator(),
    fn: approveBookingFn,
  });
