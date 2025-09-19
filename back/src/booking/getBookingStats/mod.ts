import { grantAccess, setTokens, setUser } from "@lib";
import { coreApp } from "@app";
import { getBookingStatsFn } from "./getBookingStats.fn.ts";
import { getBookingStatsValidator } from "./getBookingStats.val.ts";

export const getBookingStatsSetup = () =>
  coreApp.acts.setAct({
    schema: "booking",
    actName: "getBookingStats",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager"],
      }),
    ],
    validator: getBookingStatsValidator(),
    fn: getBookingStatsFn,
  });
