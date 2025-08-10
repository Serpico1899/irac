import { coreApp } from "../mod.ts";
import {
	createSharedRelations,
	shared_relation_pure,
} from "./utils/sharedRelaions.ts";

export const tags = () =>
	coreApp.odm.newModel(
		"tag",
		shared_relation_pure,
		createSharedRelations(),
	);
