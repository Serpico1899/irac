import { number, object, optional, string } from "@deps";
import {  selectStruct  } from "@app";

export const getsValidator = () => {
	return object({
		set: object({
			page: number(),
			limit: number(),
			name: optional(string()),
		}),
		get: selectStruct("tag", 2),
	});
};
