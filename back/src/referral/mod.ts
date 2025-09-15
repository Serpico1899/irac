import { generateReferralCodeSetup } from "./generateReferralCode/mod.ts";
import { applyReferralCodeSetup } from "./applyReferralCode/mod.ts";
import { getReferralStatsSetup } from "./getReferralStats/mod.ts";

export const referralSetup = () => {
  generateReferralCodeSetup();
  applyReferralCodeSetup();
  getReferralStatsSetup();
};
