import { coreApp } from "../mod.ts";
import {
	createSharedRelations,
	shared_relation_pure,
} from "./utils/sharedRelaions.ts";

export const categories = () =>
	coreApp.odm.newModel(
		"category",
		shared_relation_pure,
		createSharedRelations(),
	);
