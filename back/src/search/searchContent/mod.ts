import { coreApp } from "../../mod.ts";
import searchContentHandler from "./searchContent.fn.ts";
import { searchContentValidator } from "./searchContent.val.ts";

export const searchContentSetup = () =>
  coreApp.acts.setAct({
    schema: "search",
    actName: "searchContent",
    validator: searchContentValidator,
    fn: searchContentHandler,
  });
