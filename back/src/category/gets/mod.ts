import {  coreApp  } from "@app";
import { getsFn } from "./gets.fn.ts";
import { getsValidator } from "./gets.val.ts";

export const getsSetup = () =>
	coreApp.acts.setAct({
		schema: "category",
		fn: getsFn,
		actName: "gets",
		validator: getsValidator(),
	});
