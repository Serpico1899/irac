import { fileSetup } from "./file/mod.ts";
import { userSetup } from "./user/mod.ts";
import { tagSetup } from "./tag/mod.ts";
import { categorySetup } from "./category/mod.ts";
import { courseSetup } from "./course/mod.ts";
import { articleSetup } from "./article/mod.ts";
import "./wallet/mod.ts";

export const functionsSetup = () => {
  fileSetup();
  userSetup();
  tagSetup();
  categorySetup();
  courseSetup();
  articleSetup();
};
