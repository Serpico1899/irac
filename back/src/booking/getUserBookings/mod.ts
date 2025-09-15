import { coreApp } from "../../../mod.ts";
import { getUserBookingsValidator } from "./getUserBookings.val.ts";
import { getUserBookingsFn } from "./getUserBookings.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getUserBookingsSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "getUserBookings",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: getUserBookingsValidator(),
    fn: getUserBookingsFn,
  });
