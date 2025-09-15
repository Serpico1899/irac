import { coreApp } from "../../../mod.ts";
import { createBookingValidator } from "./createBooking.val.ts";
import { createBookingFn } from "./createBooking.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const createBookingSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "createBooking",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: createBookingValidator(),
    fn: createBookingFn,
  });
