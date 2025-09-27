import { object } from "@deps";
import {  selectStruct  } from "@app";
import { shared_relation_pure } from "@model";

export const addValidator = () => {
	return object({
		set: object({
			...shared_relation_pure,
		}),
		get: selectStruct("tag", 1),
	});
};
