import { searchContentSetup } from "./searchContent/mod.ts";
import { getFiltersSetup } from "./getFilters/mod.ts";
import { searchCoursesSetup } from "./searchCourses/mod.ts";
import { searchArticlesSetup } from "./searchArticles/mod.ts";
import { getRecommendationsSetup } from "./getRecommendations/mod.ts";

export const searchSetup = () => {
  // Universal content search
  searchContentSetup();

  // Filter options and faceted search
  getFiltersSetup();

  // Specialized search endpoints
  searchCoursesSetup();
  searchArticlesSetup();

  // Recommendation engine
  getRecommendationsSetup();
};
