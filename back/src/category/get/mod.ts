import {  coreApp  } from "@app";
import { getFn } from "./get.fn.ts";
import { getValidator } from "./get.val.ts";

export const getSetup = () =>
	coreApp.acts.setAct({
		schema: "category",
		fn: getFn,
		actName: "get",
		validator: getValidator(),
	});
