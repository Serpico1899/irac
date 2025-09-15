import { coreApp } from "../../../mod.ts";
import { getReferralStatsValidator } from "./getReferralStats.val.ts";
import { getReferralStatsFn } from "./getReferralStats.fn.ts";
import { grantAccess, setTokens, setUser } from "@lib";

export const getReferralStatsSetup = () =>
  coreApp.acts.setAct({
    schema: "referral",
    actName: "getReferralStats",
    preAct: [
      setTokens,
      setUser,
      grantAccess({
        levels: ["Manager", "Editor", "Ordinary"],
      }),
    ],
    validator: getReferralStatsValidator(),
    fn: getReferralStatsFn,
  });
