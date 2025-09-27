import { object, string } from "@deps";
import {  selectStruct  } from "@app";

export const getValidator = () => {
	return object({
		set: object({
			_id: string(),
		}),
		get: selectStruct("tag", 2),
	});
};
