import {  coreApp  } from "@app";
import getArticlesHandler from "./getArticles.fn.ts";
import { getArticlesValidator } from "./getArticles.val.ts";

export const getArticlesSetup = () =>
  coreApp.acts.setAct({
    schema: "article",
    actName: "getArticles",
    validator: getArticlesValidator,
    fn: getArticlesHandler,
  });
