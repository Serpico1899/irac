import {  coreApp  } from "@app";
import searchArticlesHandler from "./searchArticles.fn.ts";
import { searchArticlesValidator } from "./searchArticles.val.ts";

export const searchArticlesSetup = () =>
  coreApp.acts.setAct({
    schema: "search",
    actName: "searchArticles",
    validator: searchArticlesValidator,
    fn: searchArticlesHandler,
  });
