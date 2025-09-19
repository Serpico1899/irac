import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { getAllBookingsFn } from "./getAllBookings.fn.ts";
import { getAllBookingsValidator } from "./getAllBookings.val.ts";

export const getAllBookingsSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "getAllBookings",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: getAllBookingsValidator(),
    fn: getAllBookingsFn,
  });
