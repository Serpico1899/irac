import {  coreApp  } from "@app";
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
