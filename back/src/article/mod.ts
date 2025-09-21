import { getArticlesSetup } from "./getArticles/mod.ts";
import { createArticleSetup } from "./createArticle/mod.ts";
import { updateArticleSetup } from "./updateArticle/mod.ts";
import { deleteArticleSetup } from "./deleteArticle/mod.ts";
import { getArticleSetup } from "./getArticle/mod.ts";
import { publishArticleSetup } from "./publishArticle/mod.ts";
import { archiveArticleSetup } from "./archiveArticle/mod.ts";
import { getArticleStatsSetup } from "./getArticleStats/mod.ts";

export const articleSetup = () => {
  getArticlesSetup();
  createArticleSetup();
  updateArticleSetup();
  deleteArticleSetup();
  getArticleSetup();
  publishArticleSetup();
  archiveArticleSetup();
  getArticleStatsSetup();
};
