import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { cancelBookingFn } from "./cancelBooking.fn.ts";
import { cancelBookingValidator } from "./cancelBooking.val.ts";

export const cancelBookingSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "cancelBooking",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: cancelBookingValidator(),
    fn: cancelBookingFn,
  });
