import { fileSetup } from "./file/mod.ts";
import { userSetup } from "./user/mod.ts";
import { tagSetup } from "./tag/mod.ts";
import { categorySetup } from "./category/mod.ts";

export const functionsSetup = () => {
	fileSetup();
	userSetup();
	tagSetup();
	categorySetup();
};
