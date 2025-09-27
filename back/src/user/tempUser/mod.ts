import {  coreApp  } from "@app";
import { tempUserFn } from "./tempUser.fn.ts";
import { tempUserValidator } from "./tempUser.val.ts";

export const tempUserSetup = () =>
	coreApp.acts.setAct({
		schema: "user",
		fn: tempUserFn,
		actName: "tempUser",
		validator: tempUserValidator(),
	});
