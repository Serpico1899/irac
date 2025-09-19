import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { deleteBookingFn } from "./deleteBooking.fn.ts";
import { deleteBookingValidator } from "./deleteBooking.val.ts";

export const deleteBookingSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "deleteBooking",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: deleteBookingValidator(),
    fn: deleteBookingFn,
  });
