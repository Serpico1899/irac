import { coreApp } from "../../../mod.ts";
import { checkAvailabilityValidator } from "./checkAvailability.val.ts";
import { checkAvailabilityFn } from "./checkAvailability.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const checkAvailabilitySetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "checkAvailability",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: checkAvailabilityValidator(),
    fn: checkAvailabilityFn,
  });
