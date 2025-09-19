import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { updateBookingFn } from "./updateBooking.fn.ts";
import { updateBookingValidator } from "./updateBooking.val.ts";

export const updateBookingSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "updateBooking",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: updateBookingValidator(),
    fn: updateBookingFn,
    validationRunType: "create",
  });
