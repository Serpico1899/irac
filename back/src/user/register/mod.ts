import {  coreApp  } from "@app";
import { registerUserFn } from "./registerUser.fn.ts";
import { registerUserValidator } from "./registerUser.val.ts";

export const registerUserSetup = () =>
	coreApp.acts.setAct({
		schema: "user",
		actName: "registerUser",
		validationRunType: "create",
		validator: registerUserValidator(),
		fn: registerUserFn,
	});
