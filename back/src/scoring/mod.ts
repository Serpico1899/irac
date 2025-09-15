import { addPointsSetup } from "./addPoints/mod.ts";
import { getUserScoreSetup } from "./getUserScore/mod.ts";
import { getLeaderboardSetup } from "./getLeaderboard/mod.ts";
import { processDailyLoginSetup } from "./processDailyLogin/mod.ts";
import { getUserAchievementsSetup } from "./getUserAchievements/mod.ts";

export const scoringSetup = () => {
  addPointsSetup();
  getUserScoreSetup();
  getLeaderboardSetup();
  processDailyLoginSetup();
  getUserAchievementsSetup();
};
